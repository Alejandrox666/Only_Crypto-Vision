const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  
  // Validaciones básicas
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si el email ya existe
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );

    // Respuesta simple sin token
    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado correctamente',
      userId: result.insertId 
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

module.exports = router;