import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoriaId, setCategoriaId] = useState('');
  const [dataTransacao, setDataTransacao] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resTransacoes, resCategorias] = await Promise.all([
        api.get('/transacoes'),
        api.get('/categorias'),
      ]);
      setTransacoes(resTransacoes.data);
      setCategorias(resCategorias.data);
      if (resCategorias.data.length > 0) {
        setCategoriaId(resCategorias.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleCriarTransacao = async (e) => {
    e.preventDefault();
    if (!descricao || !valor || !categoriaId) return;

    try {
      await api.post('/transacoes', {
        descricao,
        valor: parseFloat(valor),
        tipo,
        categoria_id: categoriaId,
        data_transacao: dataTransacao,
      });

      setDescricao('');
      setValor('');
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleExcluirTransacao = async (id) => {
    if (!confirm('Deseja realmente excluir esta transação?')) return;
    try {
      await api.delete(`/transacoes/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Gerenciamento de Transações</h2>

      {/* FORMULÁRIO DE NOVA TRANSAÇÃO */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Nova Transação</h3>
        <form onSubmit={handleCriarTransacao} style={styles.formGrid}>
          <div>
            <label style={styles.label}>Descrição</label>
            <input
              type="text"
              placeholder="Ex: Supermercado"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={styles.label}>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={styles.label}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%' }}>
              <option value="despesa">Saída (Despesa)</option>
              <option value="receita">Entrada (Receita)</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              style={{ width: '100%' }}
              required
            >
              {categorias.length === 0 ? (
                <option value="">Nenhuma categoria cadastrada</option>
              ) : (
                categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label style={styles.label}>Data</label>
            <input
              type="date"
              value={dataTransacao}
              onChange={(e) => setDataTransacao(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={styles.submitBtn}>
              <Plus size={18} /> Adicionar
            </button>
          </div>
        </form>
      </section>

      {/* TABELA DE HISTÓRICO */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Histórico de Lançamentos</h3>
        {transacoes.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>
            Nenhuma transação registrada até o momento.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Descrição</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Data</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>{t.descricao}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          backgroundColor: t.tipo === 'receita' ? '#10b98120' : '#ef444420',
                          color: t.tipo === 'receita' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {t.tipo === 'receita' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 'bold',
                        color: t.tipo === 'receita' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      {new Date(t.data_transacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        onClick={() => handleExcluirTransacao(t.id)}
                        style={styles.deleteBtn}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.4rem',
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '1rem',
    fontSize: '1.1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    marginBottom: '0.3rem',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0.65rem',
    height: '38px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.75rem 0.5rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    borderBottom: '2px solid var(--border-color)',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '0.75rem 0.5rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.2rem',
  },
};