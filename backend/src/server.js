const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Teste para verificar o status da API e Conexão com o Banco
app.get('/healthcheck', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      message: 'API rodando e conectada ao banco!',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Erro no healthcheck:', error);
    res.status(500).json({ status: 'ERROR', message: 'Erro ao conectar no banco' });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});