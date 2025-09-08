import { neon } from '@netlify/neon';

export const handler = async (event, context) => {
  const sql = neon();

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Načtení všech časových záznamů
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
          INSERT INTO time_entries (date, hours, hourly_rate, earnings, is_holiday, is_vacation)
          VALUES (${date}, ${hours}, ${hourlyRate}, ${earnings}, ${isHoliday || false}, ${isVacation || false})
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
          WHERE id = ${id}
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

        await sql`
          DELETE FROM time_entries 
          WHERE id = ${deleteId}
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
