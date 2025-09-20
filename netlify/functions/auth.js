const { neon } = require('@netlify/neon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT secret - v produkci by měl být v environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { action, username, email, password, token } = JSON.parse(event.body);

    // Inicializace databáze
    const sql = neon(process.env.DATABASE_URL);

    switch (action) {
      case 'login':
        return await handleLogin(sql, username, password, headers);
      
      case 'register':
        return await handleRegister(sql, username, email, password, headers);
      
      case 'verify':
        return await handleVerify(sql, token, headers);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Neplatná akce' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Chyba serveru',
        error: error.message 
      }),
    };
  }
};

async function handleLogin(sql, username, password, headers) {
  try {
    // Vyhledání uživatele v databázi
    const users = await sql`
      SELECT id, username, email, password_hash, role, created_at 
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Neplatné přihlašovací údaje' }),
      };
    }

    const user = users[0];

    // Ověření hesla
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Neplatné přihlašovací údaje' }),
      };
    }

    // Generování JWT tokenu
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Vrácení uživatele bez hesla
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Přihlášení úspěšné',
        token,
        user: userResponse,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Chyba při přihlašování' }),
    };
  }
}

async function handleRegister(sql, username, email, password, headers) {
  try {
    // Kontrola, zda uživatel již existuje
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

    if (existingUsers.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Uživatel s tímto jménem nebo emailem již existuje' }),
      };
    }

    // Hashování hesla
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Vytvoření nového uživatele (výchozí role je 'user')
    const newUser = await sql`
      INSERT INTO users (username, email, password_hash, role, created_at)
      VALUES (${username}, ${email}, ${passwordHash}, 'user', NOW())
      RETURNING id, username, email, role, created_at
    `;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Uživatel byl úspěšně vytvořen',
        user: newUser[0],
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Chyba při registraci' }),
    };
  }
}

async function handleVerify(sql, token, headers) {
  try {
    // Ověření JWT tokenu
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Získání aktuálních informací o uživateli z databáze
    const users = await sql`
      SELECT id, username, email, role, created_at 
      FROM users 
      WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Uživatel nebyl nalezen' }),
      };
    }

    const user = users[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Token je platný',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
      }),
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Neplatný token' }),
    };
  }
}
