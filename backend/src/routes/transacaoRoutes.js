const express = require('express');
const router = express.Router();
const {
  listarTransacoes,
  criarTransacao,
  deletarTransacao,
} = require('../controllers/transacaoController');

// GET /api/transacoes -> Lista as transações de um usuário
router.get('/', listarTransacoes);

// POST /api/transacoes -> Cadastra uma nova transação
router.post('/', criarTransacao);

// DELETE /api/transacoes/:id -> Remove uma transação pelo ID
router.delete('/:id', deletarTransacao);

module.exports = router;