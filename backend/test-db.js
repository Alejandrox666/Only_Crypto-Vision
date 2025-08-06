require('dotenv').config();
const db = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa. Resultado:', rows[0].result);
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testConnection();