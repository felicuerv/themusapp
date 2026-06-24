const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener perfil de abogado por ID
const getLawyerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.created_at,
        lp.matricula, lp.especialidades, lp.bio, lp.verificado, lp.ciudad
       FROM users u
       JOIN lawyer_profiles lp ON u.id = lp.user_id
       WHERE u.id = $1 AND u.rol = 'abogado'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Abogado no encontrado' });
    }

    res.json({ lawyer: result.rows[0] });

  } catch (error) {
    console.error('Error al obtener perfil de abogado:', error);
    res.status(500).json({ error: 'Error al obtener perfil de abogado' });
  }
};

// Actualizar perfil de abogado
const updateLawyerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { matricula, especialidades, bio, ciudad } = req.body;

    // Verificar que sea el mismo usuario o admin
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }

    const result = await pool.query(
      `UPDATE lawyer_profiles
       SET matricula = COALESCE($1, matricula),
           especialidades = COALESCE($2, especialidades),
           bio = COALESCE($3, bio),
           ciudad = COALESCE($4, ciudad),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [matricula, especialidades, bio, ciudad, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil de abogado no encontrado' });
    }

    res.json({
      message: 'Perfil actualizado exitosamente',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Listar todos los abogados (para admin)
const getAllLawyers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.created_at,
        lp.matricula, lp.especialidades, lp.bio, lp.verificado, lp.ciudad
       FROM users u
       JOIN lawyer_profiles lp ON u.id = lp.user_id
       WHERE u.rol = 'abogado'
       ORDER BY u.created_at DESC`
    );

    res.json({ lawyers: result.rows });

  } catch (error) {
    console.error('Error al obtener abogados:', error);
    res.status(500).json({ error: 'Error al obtener abogados' });
  }
};

module.exports = {
  getLawyerProfile,
  updateLawyerProfile,
  getAllLawyers
};
