const pool = require('../config/database');

// Verificar abogado
const verifyLawyer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE lawyer_profiles
       SET verificado = true, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    res.json({
      message: 'Abogado verificado exitosamente',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error al verificar abogado:', error);
    res.status(500).json({ error: 'Error al verificar abogado' });
  }
};

// Actualizar estado de caso (admin)
const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await pool.query(
      'UPDATE cases SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    res.json({
      message: 'Estado del caso actualizado exitosamente',
      case: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar caso:', error);
    res.status(500).json({ error: 'Error al actualizar caso' });
  }
};

// Obtener todos los casos (admin)
const getAllCases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        u.nombre as client_nombre,
        u.email as client_email,
        (SELECT COUNT(*) FROM applications WHERE case_id = c.id) as applications_count
       FROM cases c
       JOIN users u ON c.client_id = u.id
       ORDER BY c.created_at DESC`
    );

    res.json({ cases: result.rows });

  } catch (error) {
    console.error('Error al obtener casos:', error);
    res.status(500).json({ error: 'Error al obtener casos' });
  }
};

module.exports = {
  verifyLawyer,
  updateCaseStatus,
  getAllCases
};
