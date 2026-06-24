const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Crear un nuevo caso (solo clientes)
const createCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, tipo, urgencia } = req.body;
    const clientId = req.user.id;

    const result = await pool.query(
      'INSERT INTO cases (client_id, titulo, descripcion, tipo, urgencia) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clientId, titulo, descripcion, tipo, urgencia || 'media']
    );

    res.status(201).json({
      message: 'Caso creado exitosamente',
      case: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear caso:', error);
    res.status(500).json({ error: 'Error al crear caso' });
  }
};

// Obtener casos del cliente autenticado
const getMyCases = async (req, res) => {
  try {
    const clientId = req.user.id;

    const result = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM applications WHERE case_id = c.id) as applications_count
       FROM cases c
       WHERE c.client_id = $1
       ORDER BY c.created_at DESC`,
      [clientId]
    );

    res.json({ cases: result.rows });

  } catch (error) {
    console.error('Error al obtener casos:', error);
    res.status(500).json({ error: 'Error al obtener casos' });
  }
};

// Obtener casos abiertos (para abogados)
const getOpenCases = async (req, res) => {
  try {
    const { tipo } = req.query;

    let query = `
      SELECT c.*,
        u.nombre as client_nombre,
        (SELECT COUNT(*) FROM applications WHERE case_id = c.id) as applications_count,
        (SELECT COUNT(*) FROM applications WHERE case_id = c.id AND lawyer_id = $1) as user_applied
      FROM cases c
      JOIN users u ON c.client_id = u.id
      WHERE c.estado = 'abierto'
    `;

    const params = [req.user.id];

    if (tipo) {
      query += ' AND c.tipo = $2';
      params.push(tipo);
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ cases: result.rows });

  } catch (error) {
    console.error('Error al obtener casos abiertos:', error);
    res.status(500).json({ error: 'Error al obtener casos abiertos' });
  }
};

// Obtener un caso por ID
const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.*,
        u.nombre as client_nombre,
        u.email as client_email
       FROM cases c
       JOIN users u ON c.client_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const caseData = result.rows[0];

    // Verificar permisos
    if (req.user.rol === 'cliente' && caseData.client_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este caso' });
    }

    res.json({ case: caseData });

  } catch (error) {
    console.error('Error al obtener caso:', error);
    res.status(500).json({ error: 'Error al obtener caso' });
  }
};

// Actualizar estado de un caso
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que el caso existe y pertenece al usuario o es admin
    const caseCheck = await pool.query(
      'SELECT * FROM cases WHERE id = $1',
      [id]
    );

    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const caseData = caseCheck.rows[0];

    if (req.user.rol !== 'admin' && caseData.client_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este caso' });
    }

    const result = await pool.query(
      'UPDATE cases SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [estado, id]
    );

    res.json({
      message: 'Caso actualizado exitosamente',
      case: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar caso:', error);
    res.status(500).json({ error: 'Error al actualizar caso' });
  }
};

module.exports = {
  createCase,
  getMyCases,
  getOpenCases,
  getCaseById,
  updateCase
};
