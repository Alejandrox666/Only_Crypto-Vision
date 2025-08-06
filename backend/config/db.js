const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crypto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
    
// Exportamos la versión con promesas para usar async/await
module.exports = pool.promise();