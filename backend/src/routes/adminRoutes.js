const express = require('express');
const {
  verifyLawyer,
  updateCaseStatus,
  getAllCases
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren rol admin
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// PATCH /admin/lawyers/:id - Verificar abogado
router.patch('/lawyers/:id', verifyLawyer);

// PATCH /admin/cases/:id - Actualizar estado de caso
router.patch('/cases/:id', updateCaseStatus);

// GET /admin/cases - Obtener todos los casos
router.get('/cases', getAllCases);

module.exports = router;
