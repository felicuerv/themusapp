const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener mensajes de un caso
const getMessagesByCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verificar que el caso existe
    const caseCheck = await pool.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const caseData = caseCheck.rows[0];

    // Verificar que el usuario tiene acceso al chat
    const hasAccess = await pool.query(
      `SELECT 1 FROM cases c
       LEFT JOIN applications a ON c.id = a.case_id
       WHERE c.id = $1 AND (c.client_id = $2 OR a.lawyer_id = $2)`,
      [caseId, req.user.id]
    );

    if (hasAccess.rows.length === 0 && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    const result = await pool.query(
      `SELECT m.*,
        u_from.nombre as from_nombre,
        u_to.nombre as to_nombre
       FROM messages m
       JOIN users u_from ON m.from_user_id = u_from.id
       JOIN users u_to ON m.to_user_id = u_to.id
       WHERE m.case_id = $1
       ORDER BY m.fecha ASC`,
      [caseId]
    );

    res.json({ messages: result.rows });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Enviar mensaje
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { caseId } = req.params;
    const { toUserId, contenido } = req.body;
    const fromUserId = req.user.id;

    // Verificar que el caso existe
    const caseCheck = await pool.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const caseData = caseCheck.rows[0];

    // Verificar que el usuario tiene acceso al chat
    const hasAccess = await pool.query(
      `SELECT 1 FROM cases c
       LEFT JOIN applications a ON c.id = a.case_id
       WHERE c.id = $1 AND (c.client_id = $2 OR a.lawyer_id = $2)`,
      [caseId, fromUserId]
    );

    if (hasAccess.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a este chat' });
    }

    // Crear mensaje
    const result = await pool.query(
      'INSERT INTO messages (case_id, from_user_id, to_user_id, contenido) VALUES ($1, $2, $3, $4) RETURNING *',
      [caseId, fromUserId, toUserId, contenido]
    );

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

module.exports = {
  getMessagesByCase,
  sendMessage
};
