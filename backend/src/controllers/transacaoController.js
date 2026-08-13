const pool = require('../config/db');

// Listar transações
const listarTransacoes = async (req, res) => {
  try {
    const usuarioId = req.usuarioId || (req.usuario && req.usuario.id) || req.query.usuario_id;

    let query = `
      SELECT t.*, c.nome AS categoria_nome, c.tipo AS categoria_tipo
      FROM transacoes t
      LEFT JOIN categorias c ON t.categoria_id = c.id
      ORDER BY t.data DESC, t.id DESC;
    `;
    let params = [];

    if (usuarioId) {
      query = `
        SELECT t.*, c.nome AS categoria_nome, c.tipo AS categoria_tipo
        FROM transacoes t
        LEFT JOIN categorias c ON t.categoria_id = c.id
        WHERE t.usuario_id = $1
        ORDER BY t.data DESC, t.id DESC;
      `;
      params = [usuarioId];
    }

    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    return res.status(500).json({ erro: 'Erro interno ao listar transações.' });
  }
};

// Criar transação
const criarTransacao = async (req, res) => {
  const { descricao, valor, categoria_id, data, observacao } = req.body;
  const usuarioId = req.usuarioId || (req.usuario && req.usuario.id) || req.body.usuario_id;

  if (!descricao || !valor || !categoria_id) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  if (!usuarioId) {
    return res.status(400).json({ erro: 'O ID do usuário é obrigatório.' });
  }

  try {
    const catResult = await pool.query('SELECT tipo FROM categorias WHERE id = $1', [categoria_id]);
    if (catResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Categoria selecionada não existe.' });
    }

    let tipoDefinido = catResult.rows[0].tipo.toUpperCase();
    
    // Normaliza para ENTRADA / SAIDA no momento do insert da transacao
    if (tipoDefinido === 'RECEITA') tipoDefinido = 'ENTRADA';
    if (tipoDefinido === 'DESPESA') tipoDefinido = 'SAIDA';

    const query = `
      INSERT INTO transacoes (usuario_id, categoria_id, descricao, valor, tipo, data, observacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const valorNumerico = parseFloat(String(valor).replace(',', '.'));
    const dataFinal = data || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(query, [
      usuarioId,
      parseInt(categoria_id),
      descricao.trim(),
      valorNumerico,
      tipoDefinido,
      dataFinal,
      observacao ? observacao.trim() : null
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return res.status(500).json({ erro: error.message || 'Erro interno ao salvar transação.' });
  }
};

// Atualizar Observação
const atualizarObservacao = async (req, res) => {
  const { id } = req.params;
  const { observacao } = req.body;

  try {
    const query = `
      UPDATE transacoes 
      SET observacao = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [observacao ? observacao.trim() : null, id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar observação:', error);
    return res.status(500).json({ erro: 'Erro ao salvar observação.' });
  }
};

// Excluir transação
const excluirTransacao = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM transacoes WHERE id = $1 RETURNING *;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }

    return res.json({ mensagem: 'Transação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return res.status(500).json({ erro: 'Erro interno ao excluir transação.' });
  }
};

module.exports = {
  listarTransacoes,
  criarTransacao,
  atualizarObservacao,
  excluirTransacao,
};