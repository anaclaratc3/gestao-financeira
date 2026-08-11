const express = require('express');
const router = express.Router();
const { listarCategorias, criarCategoria } = require('../controllers/categoriaController');

// GET /api/categorias -> Lista as categorias
router.get('/', listarCategorias);

// POST /api/categorias -> Cria uma nova categoria
router.post('/', criarCategoria);

module.exports = router;