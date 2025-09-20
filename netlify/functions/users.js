const { neon } = require('@netlify/neon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

  // Ověření autentifikace a admin oprávnění
  let currentUser;
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const decoded = verifyToken(authHeader);
    currentUser = decoded;
    
    // Získání aktuálních informací o uživateli z databáze
    const users = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    if (users[0].role !== 'admin') {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({ error: 'Forbidden', message: 'Admin privileges required' })
      };
    }
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
        // Načtení všech uživatelů
        const users = await sql`
          SELECT 
            id,
            username,
            email,
            role,
            created_at
          FROM users 
          ORDER BY created_at DESC
        `;

        const formattedUsers = users.map(user => ({
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        }));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ users: formattedUsers })
        };

      case 'DELETE':
        // Smazání uživatele
        const { userId } = JSON.parse(event.body);
        
        if (!userId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing userId parameter' })
          };
        }

        // Kontrola, že se uživatel nepokouší smazat sám sebe
        if (userId === currentUser.userId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Cannot delete your own account' })
          };
        }

        // Ověření, že uživatel existuje
        const userToDelete = await sql`
          SELECT id FROM users WHERE id = ${userId}
        `;

        if (userToDelete.length === 0) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'User not found' })
          };
        }

        // Smazání uživatele (cascade delete smaže i jeho záznamy)
        await sql`
          DELETE FROM users WHERE id = ${userId}
        `;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'User deleted successfully' })
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
    console.error('Users API error:', error);
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
