import { neon } from '@netlify/neon';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const sql = neon();

    // Vytvoření tabulky pro časové záznamy
    await sql`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        hours DECIMAL(5,2) NOT NULL,
        hourly_rate DECIMAL(8,2) NOT NULL,
        earnings DECIMAL(10,2) NOT NULL,
        is_holiday BOOLEAN DEFAULT FALSE,
        is_vacation BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Vytvoření tabulky pro dokumenty řidiče
    await sql`
      CREATE TABLE IF NOT EXISTS driver_documents (
        id SERIAL PRIMARY KEY,
        document_type VARCHAR(50) NOT NULL,
        document_name VARCHAR(100) NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(document_type, document_name)
      )
    `;

    // Vytvoření tabulky pro nastavení aplikace
    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Vložení výchozích dokumentů
    const defaultDocuments = [
      // Doklady
      { type: 'documents', name: 'Občanský průkaz' },
      { type: 'documents', name: 'Řidičský průkaz' },
      { type: 'documents', name: 'ADR průkaz' },
      // Interní
      { type: 'internal', name: 'Kybernetická bezpečnost' },
      { type: 'internal', name: 'Zdravotní prohlídka' },
      { type: 'internal', name: 'Compliance' },
      { type: 'internal', name: 'Hesla do PC' },
      // Střediska
      { type: 'centers', name: 'Střelice' },
      { type: 'centers', name: 'Šlapánov' },
      { type: 'centers', name: 'Loukov' },
      { type: 'centers', name: 'Sedlnice' }
    ];

    const today = new Date().toISOString().split('T')[0];
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const doc of defaultDocuments) {
      await sql`
        INSERT INTO driver_documents (document_type, document_name, issue_date, expiry_date)
        VALUES (${doc.type}, ${doc.name}, ${today}, ${oneYearFromNow})
        ON CONFLICT (document_type, document_name) DO NOTHING
      `;
    }

    // Vložení výchozího nastavení
    await sql`
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES ('default_hourly_rate', '250')
      ON CONFLICT (setting_key) DO NOTHING
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'Database initialized successfully',
        tables: ['time_entries', 'driver_documents', 'app_settings']
      })
    };

  } catch (error) {
    console.error('Database initialization error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Database initialization failed',
        details: error.message 
      })
    };
  }
};
