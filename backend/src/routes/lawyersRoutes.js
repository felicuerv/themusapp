const express = require('express');
const {
  getLawyerProfile,
  updateLawyerProfile,
  getAllLawyers
} = require('../controllers/lawyersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /lawyers - Obtener todos los abogados (admin)
router.get('/', [
  authenticateToken,
  authorizeRoles('admin')
], getAllLawyers);

// GET /lawyers/:id - Obtener perfil de abogado
router.get('/:id', authenticateToken, getLawyerProfile);

// PUT /lawyers/:id - Actualizar perfil de abogado
router.put('/:id', [
  authenticateToken,
  authorizeRoles('abogado', 'admin')
], updateLawyerProfile);

module.exports = router;
