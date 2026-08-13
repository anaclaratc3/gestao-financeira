const express = require('express');
const router = express.Router();
const { 
  listarTransacoes, 
  criarTransacao, 
  atualizarObservacao,
  excluirTransacao 
} = require('../controllers/transacaoController');

router.get('/', listarTransacoes);
router.post('/', criarTransacao);
router.patch('/:id/observacao', atualizarObservacao);
router.delete('/:id', excluirTransacao);

module.exports = router;