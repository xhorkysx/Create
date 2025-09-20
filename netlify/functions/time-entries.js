const { neon } = require('@netlify/neon');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Funkce pro ověření JWT tokenu
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid token provided');
  }
  
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET);
}

exports.handler = async (event, context) => {
  const sql = neon();

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Ověření autentifikace pro všechny operace kromě OPTIONS
  let userId;
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const decoded = verifyToken(authHeader);
    userId = decoded.userId;
  } catch (error) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing token' })
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Načtení časových záznamů pro konkrétního uživatele
        const entries = await sql`
          SELECT 
            id,
            date,
            hours,
            hourly_rate,
            earnings,
            is_holiday,
            is_vacation,
            created_at,
            updated_at
          FROM time_entries 
          WHERE user_id = ${userId}
          ORDER BY date DESC, created_at DESC
        `;

        const formattedEntries = entries.map(entry => ({
          id: entry.id.toString(),
          date: entry.date,
          hours: parseFloat(entry.hours),
          hourlyRate: parseFloat(entry.hourly_rate),
          earnings: parseFloat(entry.earnings),
          isHoliday: entry.is_holiday,
          isVacation: entry.is_vacation
        }));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify(formattedEntries)
        };

      case 'POST':
        // Přidání nového záznamu
        const newEntry = JSON.parse(event.body);
        const { date, hours, hourlyRate, isHoliday, isVacation } = newEntry;
        const earnings = hours * hourlyRate;

        const result = await sql`
          INSERT INTO time_entries (user_id, date, hours, hourly_rate, earnings, is_holiday, is_vacation)
          VALUES (${userId}, ${date}, ${hours}, ${hourlyRate}, ${earnings}, ${isHoliday || false}, ${isVacation || false})
          RETURNING id
        `;

        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ 
            message: 'Time entry created successfully',
            id: result[0].id.toString()
          })
        };

      case 'PUT':
        // Aktualizace záznamu
        const updateData = JSON.parse(event.body);
        const { id, date: updateDate, hours: updateHours, hourlyRate: updateHourlyRate, isHoliday: updateIsHoliday, isVacation: updateIsVacation } = updateData;
        const updateEarnings = updateHours * updateHourlyRate;

        // Ověření, že záznam patří uživateli
        const existingEntry = await sql`
          SELECT id FROM time_entries WHERE id = ${id} AND user_id = ${userId}
        `;

        if (existingEntry.length === 0) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Time entry not found or access denied' })
          };
        }

        await sql`
          UPDATE time_entries 
          SET 
            date = ${updateDate},
            hours = ${updateHours},
            hourly_rate = ${updateHourlyRate},
            earnings = ${updateEarnings},
            is_holiday = ${updateIsHoliday || false},
            is_vacation = ${updateIsVacation || false},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id} AND user_id = ${userId}
        `;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Time entry updated successfully' })
        };

      case 'DELETE':
        // Smazání záznamu
        const deleteId = event.queryStringParameters?.id;
        
        if (!deleteId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing id parameter' })
          };
        }

        // Ověření, že záznam patří uživateli
        const entryToDelete = await sql`
          SELECT id FROM time_entries WHERE id = ${deleteId} AND user_id = ${userId}
        `;

        if (entryToDelete.length === 0) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Time entry not found or access denied' })
          };
        }

        await sql`
          DELETE FROM time_entries 
          WHERE id = ${deleteId} AND user_id = ${userId}
        `;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Time entry deleted successfully' })
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Time entries API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
