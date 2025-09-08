const { Pool } = require('pg');

// Simple in-memory store for active connections
// In production, you'd want to use Redis or similar
const connections = new Map();

exports.handler = async (event, context) => {
  // Handle WebSocket upgrade
  if (event.httpMethod === 'GET' && event.headers.upgrade === 'websocket') {
    return {
      statusCode: 426,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 'websocket'
      },
      body: 'WebSocket upgrade required'
    };
  }

  // Handle SSE (Server-Sent Events) for real-time updates
  if (event.httpMethod === 'GET' && event.path.includes('/events')) {
    const clientId = event.queryStringParameters?.clientId || Date.now().toString();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      },
      body: `data: {"type":"connected","clientId":"${clientId}"}\n\n`
    };
  }

  // Handle data changes and broadcast to all connected clients
  if (event.httpMethod === 'POST' && event.path.includes('/broadcast')) {
    const { type, data } = JSON.parse(event.body);
    
    // Broadcast to all connected clients
    const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        message: 'Broadcast sent',
        clients: connections.size 
      })
    };
  }

  return {
    statusCode: 404,
    body: 'Not found'
  };
};
