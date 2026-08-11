const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/usuarioController');

// POST /api/usuarios/registrar -> Cria nova conta
router.post('/registrar', registrarUsuario);

// POST /api/usuarios/login -> Autentica e gera o Token JWT
router.post('/login', loginUsuario);

module.exports = router;