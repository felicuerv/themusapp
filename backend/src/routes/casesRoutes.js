const express = require('express');
const { body } = require('express-validator');
const {
  createCase,
  getMyCases,
  getOpenCases,
  getCaseById,
  updateCase
} = require('../controllers/casesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// POST /cases - Crear caso (solo clientes)
router.post('/', [
  authenticateToken,
  authorizeRoles('cliente'),
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('tipo').notEmpty().withMessage('El tipo es requerido')
], createCase);

// GET /cases/mine - Obtener mis casos (cliente)
router.get('/mine', [
  authenticateToken,
  authorizeRoles('cliente')
], getMyCases);

// GET /cases/open - Obtener casos abiertos (abogado)
router.get('/open', [
  authenticateToken,
  authorizeRoles('abogado')
], getOpenCases);

// GET /cases/:id - Obtener caso por ID
router.get('/:id', authenticateToken, getCaseById);

// PATCH /cases/:id - Actualizar caso
router.patch('/:id', [
  authenticateToken,
  body('estado').isIn(['abierto', 'en_proceso', 'cerrado']).withMessage('Estado inválido')
], updateCase);

module.exports = router;
