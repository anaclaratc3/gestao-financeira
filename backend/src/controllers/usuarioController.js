const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastrar novo usuário
const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha com fator de custo (salt) 10
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// Login do usuário
const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];

    // Compara a senha informada com a hash salva
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gera o token de acesso (JWT) com validade de 1 dia
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'secreto_temporario',
      { expiresIn: '1d' }
    );

    return res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao realizar login.' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};