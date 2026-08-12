import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Target } from 'lucide-react';
import api from '../services/api';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [limite, setLimite] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleCriarCategoria = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    try {
      await api.post('/categorias', {
        nome: nome.trim(),
        limite_mensal: limite ? parseFloat(limite) : null,
      });

      setNome('');
      setLimite('');
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirCategoria = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.pageTitle}>Gestão de Categorias</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Organize seus lançamentos e defina limites de orçamento
        </span>
      </div>

      {/* FORMULÁRIO DE NOVA CATEGORIA */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Nova Categoria</h3>
        <form onSubmit={handleCriarCategoria} style={styles.formGrid}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Nome da Categoria</label>

            <input
              type="text"
              placeholder="Ex: Alimentação, Moradia, Lazer..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Teto de Gastos Mensal (Opcional)</label>

            <input
              type="number"
              step="0.01"
              placeholder="Ex: 800.00"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              <Plus size={18} /> {loading ? 'Salvando...' : 'Adicionar Categoria'}
            </button>
          </div>
        </form>
      </section>

      {/* LISTA DE CATEGORIAS */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Categorias Cadastradas</h3>
        {categorias.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <div style={styles.gridCategorias}>
            {categorias.map((cat) => (
              <div key={cat.id} style={styles.categoriaCard}>
                <div style={styles.categoriaInfo}>
                  <div style={styles.iconTag}>
                    <Tag size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{cat.nome}</strong>
                    {cat.limite_mensal ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <Target size={14} color="var(--primary)" /> Teto: R$ {Number(cat.limite_mensal).toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Sem teto definido
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleExcluirCategoria(cat.id)}
                  style={styles.deleteBtn}
                  title="Excluir Categoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
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
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    marginBottom: '0.3rem',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
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
    padding: '0.65rem 1.2rem',
    height: '38px',
  },
  gridCategorias: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
  },
  categoriaCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
  },
  categoriaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconTag: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: '4px',
  },
};