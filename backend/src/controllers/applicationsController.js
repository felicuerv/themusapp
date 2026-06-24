const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Crear postulación a un caso
const createApplication = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { mensaje } = req.body;
    const lawyerId = req.user.id;

    // Verificar que el caso existe y está abierto
    const caseCheck = await pool.query(
      'SELECT * FROM cases WHERE id = $1',
      [caseId]
    );

    if (caseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    if (caseCheck.rows[0].estado !== 'abierto') {
      return res.status(400).json({ error: 'Este caso no está abierto para postulaciones' });
    }

    // Verificar que no se haya postulado antes
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE case_id = $1 AND lawyer_id = $2',
      [caseId, lawyerId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ error: 'Ya te has postulado a este caso' });
    }

    const result = await pool.query(
      'INSERT INTO applications (case_id, lawyer_id, mensaje) VALUES ($1, $2, $3) RETURNING *',
      [caseId, lawyerId, mensaje]
    );

    res.status(201).json({
      message: 'Postulación enviada exitosamente',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear postulación:', error);
    res.status(500).json({ error: 'Error al crear postulación' });
  }
};

// Obtener postulaciones de un caso
const getApplicationsByCase = async (req, res) => {
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

    // Solo el dueño del caso o admin pueden ver las postulaciones
    if (req.user.rol !== 'admin' && caseData.client_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a estas postulaciones' });
    }

    const result = await pool.query(
      `SELECT a.*,
        u.nombre as lawyer_nombre,
        u.email as lawyer_email,
        lp.matricula, lp.especialidades, lp.verificado
       FROM applications a
       JOIN users u ON a.lawyer_id = u.id
       JOIN lawyer_profiles lp ON u.id = lp.user_id
       WHERE a.case_id = $1
       ORDER BY a.fecha DESC`,
      [caseId]
    );

    res.json({ applications: result.rows });

  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    res.status(500).json({ error: 'Error al obtener postulaciones' });
  }
};

module.exports = {
  createApplication,
  getApplicationsByCase
};
