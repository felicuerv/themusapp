const pool = require('../config/database');

/**
 * Middleware de gate: bloquea la accion si el usuario autenticado no
 * tiene una verificacion de identidad con estado 'verificado'.
 *
 * Se usa en cualquier endpoint que el negocio definio como "requiere
 * identidad verificada": publicar caso, postularse a un caso,
 * contactar a un abogado por busqueda libre, etc.
 *
 * Requiere ejecutarse DESPUES de authenticateToken (necesita req.user.id).
 */
const requireIdentityVerified = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT estado FROM identity_verifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.id]
    );

    const estadoActual = result.rows[0]?.estado;

    if (estadoActual !== 'verificado') {
      return res.status(403).json({
        error: 'Necesitas verificar tu identidad antes de continuar',
        estado_verificacion: estadoActual || 'sin_iniciar',
      });
    }

    next();
  } catch (error) {
    console.error('Error al chequear verificacion de identidad:', error);
    res.status(500).json({ error: 'No se pudo validar tu estado de verificacion' });
  }
};

module.exports = { requireIdentityVerified };
