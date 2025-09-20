const { neon } = require('@netlify/neon');

exports.handler = async (event, context) => {
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
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

    // Přidání user_id sloupce do existující tabulky (pokud neexistuje)
    await sql`
      ALTER TABLE time_entries 
      ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
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

    // Vytvoření tabulky pro uživatele
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      { type: 'documents', name: 'ADR průkaz' },
      { type: 'documents', name: 'Řidičský průkaz' },
      { type: 'documents', name: 'Občanský průkaz' },
      { type: 'documents', name: 'Karta do tachografu' },
      // Interní
      { type: 'internal', name: 'Compliance' },
      { type: 'internal', name: 'Hesla do PC' },
      { type: 'internal', name: 'Kybernetická bezpečnost' },
      { type: 'internal', name: 'Zdravotní prohlídka' },
      // Střediska
      { type: 'centers', name: 'Střelice' },
      { type: 'centers', name: 'Loukov' },
      { type: 'centers', name: 'Šlapánov' },
      { type: 'centers', name: 'Klobouky' },
      { type: 'centers', name: 'Cerekvice' },
      { type: 'centers', name: 'Sedlnice' },
      { type: 'centers', name: 'Smyslov' },
      { type: 'centers', name: 'Mstětice' }
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

    // Vytvoření výchozího administrátorského účtu (heslo: admin123)
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    
    await sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@company.com', ${adminPasswordHash}, 'admin')
      ON CONFLICT (username) DO NOTHING
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
        tables: ['users', 'time_entries', 'driver_documents', 'app_settings']
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
