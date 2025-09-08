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
        // Načtení všech dokumentů
        const documents = await sql`
          SELECT 
            id,
            document_type,
            document_name,
            issue_date,
            expiry_date,
            created_at,
            updated_at
          FROM driver_documents 
          ORDER BY document_type, document_name
        `;

        // Seskupení dokumentů podle typu
        const groupedDocuments = documents.reduce((acc, doc) => {
          if (!acc[doc.document_type]) {
            acc[doc.document_type] = [];
          }
          acc[doc.document_type].push({
            id: doc.id,
            name: doc.document_name,
            issueDate: doc.issue_date,
            expiryDate: doc.expiry_date,
            daysRemaining: Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)),
            isExpired: new Date(doc.expiry_date) < new Date(),
            isExpiringSoon: false // bude se počítat v frontendu podle typu
          });
          return acc;
        }, {});

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify(groupedDocuments)
        };

      case 'PUT':
        // Aktualizace dokumentu
        const { id, issueDate, expiryDate } = JSON.parse(event.body);
        
        if (!id || !issueDate || !expiryDate) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Missing required fields' })
          };
        }

        await sql`
          UPDATE driver_documents 
          SET 
            issue_date = ${issueDate},
            expiry_date = ${expiryDate},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Document updated successfully' })
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
    console.error('Documents API error:', error);
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
