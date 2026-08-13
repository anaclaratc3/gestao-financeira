const express = require('express');
const router = express.Router();
const { 
  listarCategorias, 
  criarCategoria, 
  excluirCategoria 
} = require('../controllers/categoriaController');

router.get('/', listarCategorias);
router.post('/', criarCategoria);
router.delete('/:id', excluirCategoria);

module.exports = router;