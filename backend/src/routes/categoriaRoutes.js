const express = require('express');
const router = express.Router();
const { 
  listarCategorias, 
  criarCategoria, 
  editarCategoria,
  excluirCategoria 
} = require('../controllers/categoriaController');

router.get('/', listarCategorias);
router.post('/', criarCategoria);
router.put('/:id', editarCategoria);
router.delete('/:id', excluirCategoria);

module.exports = router;