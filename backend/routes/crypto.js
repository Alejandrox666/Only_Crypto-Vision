const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/portfolio/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [saldo] = await db.query("SELECT balance FROM saldos WHERE user_id = ?", [userId]);
    const [portafolio] = await db.query("SELECT crypto_symbol, cantidad FROM portafolio WHERE user_id = ?", [userId]);

    // Añade este console.log para depuración
    console.log("Saldo raw:", saldo, "Portafolio raw:", portafolio);

    res.json({
      balance: saldo.length ? Number(saldo[0].balance) : 0, // Asegura que sea número
      portfolio: portafolio,
    });
  } catch (error) {
    console.error("Error en /portfolio:", error);
    res.status(500).json({ 
      balance: 0, // Asegura número en errores
      portfolio: [] 
    });
  }
});

// Agregar fondos a la cuenta
router.post('/addFunds', async (req, res) => {
  const { userId, amount } = req.body;
  
  if (!userId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar si el usuario ya tiene un registro de saldo
    const [saldoRows] = await conn.query("SELECT * FROM saldos WHERE user_id = ? FOR UPDATE", [userId]);

    if (saldoRows.length === 0) {
      // Si no existe, crear un nuevo registro
      await conn.query("INSERT INTO saldos (user_id, balance) VALUES (?, ?)", [userId, amount]);
    } else {
      // Si existe, actualizar el saldo
      await conn.query("UPDATE saldos SET balance = balance + ? WHERE user_id = ?", [amount, userId]);
    }

    await conn.commit();
    res.json({ message: "Fondos agregados exitosamente", newBalance: saldoRows.length ? Number(saldoRows[0].balance) + Number(amount) : amount });
  } catch (error) {
    await conn.rollback();
    console.error("Error al agregar fondos:", error);
    res.status(500).json({ error: "Error al procesar la transacción" });
  } finally {
    conn.release();
  }
});
// Comprar criptomoneda
router.post('/buy', async (req, res) => {
  console.log('Iniciando compra - Body recibido:', req.body); // Log del request
  const { userId, symbol, price } = req.body;

  const conn = await db.getConnection();
  console.log('Conexión a BD obtenida'); // Log de conexión

  try {
    await conn.beginTransaction();
    console.log('Transacción iniciada');

    // 1. Verificar saldo
    console.log(`Verificando saldo para usuario ${userId}`);
    const [saldoRows] = await conn.query("SELECT balance FROM saldos WHERE user_id = ? FOR UPDATE", [userId]);
    
    if (!saldoRows.length) {
      console.error('Usuario no tiene registro de saldo');
      await conn.rollback();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    if (saldoRows[0].balance < price) {
      console.error(`Saldo insuficiente. Disponible: ${saldoRows[0].balance}, Requerido: ${price}`);
      await conn.rollback();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // 2. Restar saldo
    console.log(`Descontando ${price} del saldo`);
    await conn.query("UPDATE saldos SET balance = balance - ? WHERE user_id = ?", [price, userId]);

    // 3. Actualizar portafolio
    console.log(`Actualizando portafolio con ${symbol} para usuario ${userId}`);
    await conn.query(`
      INSERT INTO portafolio (user_id, crypto_symbol, cantidad)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE cantidad = cantidad + 1
    `, [userId, symbol]);

    await conn.commit();
    console.log('Compra completada con éxito');
    res.json({ message: "Compra realizada con éxito" });

  } catch (error) {
    console.error('Error en la compra:', error.message); // Log detallado del error
    await conn.rollback();
    res.status(500).json({ 
      error: "Error al procesar la compra",
      detalle: error.message // Opcional: enviar detalle al cliente
    });
  } finally {
    conn.release();
    console.log('Conexión liberada'); // Log de liberación
  }
});

// Vender criptomoneda
router.post('/sell', async (req, res) => {
  const { userId, symbol, price } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar cantidad suficiente
    const [portafolioRows] = await conn.query("SELECT cantidad FROM portafolio WHERE user_id = ? AND crypto_symbol = ? FOR UPDATE", [userId, symbol]);
    if (!portafolioRows.length || portafolioRows[0].cantidad <= 0) {
      await conn.rollback();
      return res.status(400).json({ error: "No tienes esta criptomoneda para vender" });
    }

    // Sumar saldo
    await conn.query("UPDATE saldos SET balance = balance + ? WHERE user_id = ?", [price, userId]);

    // Restar del portafolio
    await conn.query("UPDATE portafolio SET cantidad = cantidad - 1 WHERE user_id = ? AND crypto_symbol = ?", [userId, symbol]);

    await conn.commit();
    res.json({ message: "Venta realizada con éxito" });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
