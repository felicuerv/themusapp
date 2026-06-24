const express = require('express');
const {
  createApplication,
  getApplicationsByCase
} = require('../controllers/applicationsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// POST /applications/:caseId - Postularse a un caso (abogado)
router.post('/:caseId', [
  authenticateToken,
  authorizeRoles('abogado')
], createApplication);

// GET /applications/:caseId - Obtener postulaciones de un caso (cliente/admin)
router.get('/:caseId', [
  authenticateToken,
  authorizeRoles('cliente', 'admin')
], getApplicationsByCase);

module.exports = router;
