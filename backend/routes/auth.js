const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {

  
  console.log('[LOGIN] Intento de login para:', req.body.email);
  const { email, password } = req.body;
  
  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    console.log('[LOGIN] Usuario encontrado:', users.length ? 'Sí' : 'No');
    if (users.length === 0) {
      console.log('[LOGIN] Error: Email no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
     console.log('[LOGIN] Comparando contraseña para usuario ID:', user.id,user.password);
     console.log('[Contraseña proporcionada y email:', email,password);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Resultado comparación:', validPassword);
    if (!validPassword) {
      console.log('[LOGIN] Error: Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    
    
    res.json({
      
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;