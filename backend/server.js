require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // <- Añade este paquete
const app = express();

// Configuración mejorada de logs
app.use(morgan('dev')); // Logs detallados de cada petición
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware para loggear errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(), err.stack);
  res.status(500).send('Error interno del servidor');
});

// Importa rutas
const authRoutes = require('./routes/auth');

// Usa rutas con logging
app.use('/api/auth', (req, res, next) => {
  console.log(`[PETICIÓN] ${req.method} ${req.path}`);
  console.log('[BODY]', req.body); // Log del cuerpo de la petición
  next();
}, authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[INICIO] Servidor en http://localhost:${PORT} a las ${new Date().toLocaleTimeString()}`);
  console.log('[CONFIG] DB_HOST:', process.env.DB_HOST);
  console.log('[CONFIG] JWT_SECRET:', process.env.JWT_SECRET ? '*** configurado ***' : 'NO configurado');
});