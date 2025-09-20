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

  // Ověření autentifikace
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
        // Načtení všech zpráv od vedení
        const messages = await sql`
          SELECT 
            id,
            title,
            content,
            type,
            date,
            author,
            is_read,
            created_at,
            updated_at
          FROM management_messages 
          ORDER BY created_at DESC
        `;

        const formattedMessages = messages.map(message => ({
          id: message.id.toString(),
          title: message.title,
          content: message.content,
          type: message.type,
          date: message.date,
          author: message.author,
          isRead: message.is_read,
          createdAt: message.created_at,
          updatedAt: message.updated_at
        }));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ messages: formattedMessages })
        };

      case 'POST':
        // Ověření admin oprávnění pro vytváření zpráv
        const userInfo = await sql`
          SELECT role FROM users WHERE id = ${currentUser.userId}
        `;
        
        if (userInfo[0].role !== 'admin') {
          return {
            statusCode: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Forbidden', message: 'Admin privileges required' })
          };
        }

        // Vytvoření nové zprávy
        const { title, content, type, author } = JSON.parse(event.body);
        
        if (!title || !content || !type || !author) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }

        const newMessage = await sql`
          INSERT INTO management_messages (title, content, type, author, date, is_read, created_at, updated_at)
          VALUES (${title}, ${content}, ${type}, ${author}, ${new Date().toISOString().split('T')[0]}, false, NOW(), NOW())
          RETURNING id, title, content, type, date, author, is_read, created_at, updated_at
        `;

        const formattedNewMessage = {
          id: newMessage[0].id.toString(),
          title: newMessage[0].title,
          content: newMessage[0].content,
          type: newMessage[0].type,
          date: newMessage[0].date,
          author: newMessage[0].author,
          isRead: newMessage[0].is_read,
          createdAt: newMessage[0].created_at,
          updatedAt: newMessage[0].updated_at
        };

        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ 
            message: 'Zpráva byla úspěšně vytvořena',
            data: formattedNewMessage
          })
        };

      case 'PUT':
        // Ověření admin oprávnění pro úpravu zpráv
        const userInfoForUpdate = await sql`
          SELECT role FROM users WHERE id = ${currentUser.userId}
        `;
        
        if (userInfoForUpdate[0].role !== 'admin') {
          return {
            statusCode: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Forbidden', message: 'Admin privileges required' })
          };
        }

        // Úprava zprávy
        const { messageId, ...updateData } = JSON.parse(event.body);
        
        if (!messageId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing messageId' })
          };
        }

        // Kontrola, zda zpráva existuje
        const existingMessage = await sql`
          SELECT id FROM management_messages WHERE id = ${messageId}
        `;

        if (existingMessage.length === 0) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Message not found' })
          };
        }

        // Sestavení SQL dotazu pro update
        const updateFields = [];
        const updateValues = [];
        
        if (updateData.title !== undefined) {
          updateFields.push('title');
          updateValues.push(updateData.title);
        }
        if (updateData.content !== undefined) {
          updateFields.push('content');
          updateValues.push(updateData.content);
        }
        if (updateData.type !== undefined) {
          updateFields.push('type');
          updateValues.push(updateData.type);
        }
        if (updateData.author !== undefined) {
          updateFields.push('author');
          updateValues.push(updateData.author);
        }
        if (updateData.isRead !== undefined) {
          updateFields.push('is_read');
          updateValues.push(updateData.isRead);
        }

        if (updateFields.length === 0) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'No fields to update' })
          };
        }

        updateFields.push('updated_at');
        updateValues.push('NOW()');

        const setClause = updateFields.map((field, index) => 
          field === 'updated_at' ? `${field} = NOW()` : `${field} = $${index + 1}`
        ).join(', ');

        const updateQuery = `
          UPDATE management_messages 
          SET ${setClause}
          WHERE id = $${updateFields.length + 1}
          RETURNING id, title, content, type, date, author, is_read, created_at, updated_at
        `;

        const updatedMessage = await sql.unsafe(updateQuery, [...updateValues, messageId]);

        const formattedUpdatedMessage = {
          id: updatedMessage[0].id.toString(),
          title: updatedMessage[0].title,
          content: updatedMessage[0].content,
          type: updatedMessage[0].type,
          date: updatedMessage[0].date,
          author: updatedMessage[0].author,
          isRead: updatedMessage[0].is_read,
          createdAt: updatedMessage[0].created_at,
          updatedAt: updatedMessage[0].updated_at
        };

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ 
            message: 'Zpráva byla úspěšně aktualizována',
            data: formattedUpdatedMessage
          })
        };

      case 'DELETE':
        // Ověření admin oprávnění pro mazání zpráv
        const userInfoForDelete = await sql`
          SELECT role FROM users WHERE id = ${currentUser.userId}
        `;
        
        if (userInfoForDelete[0].role !== 'admin') {
          return {
            statusCode: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Forbidden', message: 'Admin privileges required' })
          };
        }

        // Smazání zprávy
        const { messageId: deleteMessageId } = JSON.parse(event.body);
        
        if (!deleteMessageId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing messageId' })
          };
        }

        // Kontrola, zda zpráva existuje
        const messageToDelete = await sql`
          SELECT id FROM management_messages WHERE id = ${deleteMessageId}
        `;

        if (messageToDelete.length === 0) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Message not found' })
          };
        }

        await sql`
          DELETE FROM management_messages WHERE id = ${deleteMessageId}
        `;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Zpráva byla úspěšně smazána' })
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
    console.error('Messages API error:', error);
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
