const pool = require('../config/db');

// Listar todas as transações de um usuário (com nome da categoria)
const listarTransacoes = async (req, res) => {
  try {
    const { usuario_id } = req.query;

    if (!usuario_id) {
      return res.status(400).json({ error: 'O parâmetro usuario_id é obrigatório.' });
    }

    const query = `
      SELECT 
        t.id,
        t.descricao,
        t.valor,
        t.tipo,
        t.data,
        t.criado_em,
        c.nome AS categoria_nome,
        c.cor_hex AS categoria_cor
      FROM transacoes t
      INNER JOIN categorias c ON t.categoria_id = c.id
      WHERE t.usuario_id = $1
      ORDER BY t.data DESC, t.id DESC;
    `;

    const result = await pool.query(query, [usuario_id]);
    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};

// Criar uma nova transação
const criarTransacao = async (req, res) => {
  try {
    const { usuario_id, categoria_id, descricao, valor, tipo, data } = req.body;

    if (!usuario_id || !categoria_id || !descricao || !valor || !tipo || !data) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const query = `
      INSERT INTO transacoes (usuario_id, categoria_id, descricao, valor, tipo, data)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [usuario_id, categoria_id, descricao, valor, tipo, data];
    const result = await pool.query(query, values);

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar transação.' });
  }
};

// Deletar uma transação por ID
const deletarTransacao = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM transacoes WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    return res.json({ message: 'Transação removida com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao deletar transação.' });
  }
};

module.exports = {
  listarTransacoes,
  criarTransacao,
  deletarTransacao,
};