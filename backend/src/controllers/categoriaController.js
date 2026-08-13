const pool = require('../config/db');

// Listar todas as categorias
const listarCategorias = async (req, res) => {
  try {
    const usuarioId = req.usuarioId || (req.usuario && req.usuario.id) || req.query.usuario_id;
    
    let query = 'SELECT * FROM categorias ORDER BY tipo DESC, nome ASC;';
    let params = [];

    if (usuarioId) {
      query = 'SELECT * FROM categorias WHERE usuario_id = $1 ORDER BY tipo DESC, nome ASC;';
      params = [usuarioId];
    }

    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ erro: 'Erro interno ao listar categorias.' });
  }
};

// Criar categoria
const criarCategoria = async (req, res) => {
  const { nome, tipo, cor_hex, limite_mensal } = req.body;
  const usuarioId = req.usuarioId || (req.usuario && req.usuario.id) || req.body.usuario_id;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
  }

  if (!usuarioId) {
    return res.status(400).json({ erro: 'O ID do usuário é obrigatório.' });
  }

  const tipoFormatado = (tipo || 'DESPESA').toUpperCase();

  try {
    const query = `
      INSERT INTO categorias (usuario_id, nome, tipo, cor_hex, limite_mensal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    // Categorias de ENTRADA não possuem limite de gastos
    let valorLimite = null;
    if (tipoFormatado === 'DESPESA' && limite_mensal !== undefined && limite_mensal !== null && limite_mensal !== '') {
      valorLimite = parseFloat(String(limite_mensal).replace(',', '.'));
    }

    const { rows } = await pool.query(query, [
      usuarioId,
      nome.trim(),
      tipoFormatado,
      cor_hex || null,
      valorLimite
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro detalhado ao cadastrar categoria:', error);
    return res.status(500).json({ erro: error.message || 'Erro interno ao salvar categoria.' });
  }
};

// Editar categoria
const editarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, limite_mensal } = req.body;

  const tipoFormatado = (tipo || 'DESPESA').toUpperCase();

  try {
    let valorLimite = null;
    if (tipoFormatado === 'DESPESA' && limite_mensal !== undefined && limite_mensal !== null && limite_mensal !== '') {
      valorLimite = parseFloat(String(limite_mensal).replace(',', '.'));
    }

    const query = `
      UPDATE categorias 
      SET nome = $1, tipo = $2, limite_mensal = $3
      WHERE id = $4
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [nome.trim(), tipoFormatado, valorLimite, id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao editar categoria:', error);
    return res.status(500).json({ erro: 'Erro interno ao editar categoria.' });
  }
};

// Excluir categoria
const excluirCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM categorias WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    return res.json({ mensagem: 'Categoria excluída com sucesso!' });
  } catch (error) {
    console.error('Erro detalhado ao excluir categoria:', error);

    if (error.code === '23503') {
      return res.status(400).json({ 
        erro: 'Não é possível excluir esta categoria pois existem transações vinculadas a ela.' 
      });
    }

    return res.status(500).json({ erro: error.message || 'Erro interno ao excluir categoria.' });
  }
};

module.exports = {
  listarCategorias,
  criarCategoria,
  editarCategoria,
  excluirCategoria,
};