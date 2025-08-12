require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // <- Añade este paquete
const app = express();

// Configuración mejorada de logs
app.use(morgan('dev')); // Logs detallados de cada petición
app.use(express.json());
app.use(cors());




// Middleware para loggear errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(), err.stack);
  res.status(500).send('Error interno del servidor');
});

// Importa rutas
const authRoutes = require('./routes/auth');
const registerRoutes = require('./routes/registerRoutes');
const cryptos = require('./routes/crypto');

// Usa rutas con logging
app.use('/api/auth', (req, res, next) => {
  console.log(`[PETICIÓN] ${req.method} ${req.path}`);
  console.log('[BODY]', req.body); // Log del cuerpo de la petición
  next();
}, authRoutes);


app.use('/api/auth', (req, res, next) => {
  console.log(`[PETICIÓN REGISTER] ${req.method} ${req.path}`);
  console.log('[BODY]', req.body);
  next();
}, registerRoutes);

app.use('/api/crypto', (req, res, next) => {
  console.log(`[PETICIÓN REGISTER] ${req.method} ${req.path}`);
  console.log('[BODY]', req.body);
  next();
}, cryptos);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`[INICIO] Servidor en http://localhost:${PORT} a las ${new Date().toLocaleTimeString()}`);
  console.log('[CONFIG] DB_HOST:', process.env.DB_HOST);
  console.log('[CONFIG] JWT_SECRET:', process.env.JWT_SECRET ? '*** configurado ***' : 'NO configurado');
});