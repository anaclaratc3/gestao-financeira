import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Target, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState(''); // Começa vazio para o placeholder "Selecione"
  const [limite, setLimite] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado de Edição
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editLimite, setEditLimite] = useState('');

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
    if (!nome.trim() || !tipo) {
      alert('Por favor, preencha o nome e selecione o tipo da categoria!');
      return;
    }

    setLoading(true);

    const usuarioSalvo = localStorage.getItem('usuario');
    const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    const limiteFormatado = (tipo === 'DESPESA' && limite) ? parseFloat(String(limite).replace(',', '.')) : null;

    try {
      await api.post('/categorias', {
        nome: nome.trim(),
        tipo,
        limite_mensal: limiteFormatado,
        usuario_id: usuario?.id,
      });

      setNome('');
      setTipo('');
      setLimite('');
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert(error.response?.data?.erro || 'Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarEdicao = (cat) => {
    setCategoriaEditando(cat.id);
    setEditNome(cat.nome);
    setEditTipo(cat.tipo);
    setEditLimite(cat.limite_mensal ? String(cat.limite_mensal) : '');
  };

  const handleSalvarEdicao = async (id) => {
    try {
      const limiteFormatado = (editTipo === 'DESPESA' && editLimite) ? parseFloat(String(editLimite).replace(',', '.')) : null;
      await api.put(`/categorias/${id}`, {
        nome: editNome,
        tipo: editTipo,
        limite_mensal: limiteFormatado,
      });

      setCategoriaEditando(null);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      alert(error.response?.data?.erro || 'Erro ao atualizar categoria.');
    }
  };

  const handleExcluirCategoria = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await api.delete(`/categorias/${id}`);
      await carregarCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert(error.response?.data?.erro || 'Erro ao excluir categoria.');
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.pageTitle}>Gestão de Categorias</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Organize seus lançamentos por tipo e defina limites mensais de orçamento
        </span>
      </div>

      {/* FORMULÁRIO DE NOVA CATEGORIA */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Nova Categoria</h3>
        <form onSubmit={handleCriarCategoria} style={styles.formGrid}>
          <div style={{ flex: 1.5, minWidth: '180px' }}>
            <label style={styles.label}>Nome da Categoria</label>
            <input
              type="text"
              placeholder="Ex: Alimentação, Salário..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={styles.label}>Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
              style={{
                ...styles.input,
                color: tipo === '' ? 'var(--text-secondary)' : 'var(--text-primary)',
              }}
            >
              <option value="" disabled hidden>
                Selecione o tipo...
              </option>
              <option value="DESPESA" style={{ color: 'var(--text-primary)' }}>Despesa (Saída)</option>
              <option value="RECEITA" style={{ color: 'var(--text-primary)' }}>Receita (Entrada)</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={styles.label}>
              Limite Mensal {tipo === 'RECEITA' || tipo === 'ENTRADA' ? '(N/A para Entradas)' : '(Opcional)'}
            </label>
            <input
              type="text"
              placeholder={tipo === 'RECEITA' || tipo === 'ENTRADA' ? 'Não aplicável' : 'Ex: 800,00'}
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              disabled={tipo === 'RECEITA' || tipo === 'ENTRADA'}
              style={{
                ...styles.input,
                opacity: tipo === 'RECEITA' || tipo === 'ENTRADA' ? 0.5 : 1,
                cursor: tipo === 'RECEITA' || tipo === 'ENTRADA' ? 'not-allowed' : 'text',
              }}
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
            {categorias.map((cat) => {
              const isEntrada = cat.tipo === 'ENTRADA' || cat.tipo === 'RECEITA';
              return (
                <div key={cat.id} style={styles.categoriaCard}>
                  {categoriaEditando === cat.id ? (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        style={styles.input}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          value={editTipo}
                          onChange={(e) => setEditTipo(e.target.value)}
                          style={{ ...styles.input, flex: 1 }}
                        >
                          <option value="DESPESA">Despesa</option>
                          <option value="RECEITA">Receita</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Limite R$"
                          value={editLimite}
                          onChange={(e) => setEditLimite(e.target.value)}
                          disabled={editTipo === 'RECEITA' || editTipo === 'ENTRADA'}
                          style={{
                            ...styles.input,
                            flex: 1,
                            opacity: editTipo === 'RECEITA' || editTipo === 'ENTRADA' ? 0.5 : 1,
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.3rem' }}>
                        <button onClick={() => setCategoriaEditando(null)} style={styles.iconActionBtn}>
                          <X size={16} color="#ef4444" />
                        </button>
                        <button onClick={() => handleSalvarEdicao(cat.id)} style={styles.iconActionBtn}>
                          <Check size={16} color="#22c55e" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={styles.categoriaInfo}>
                        <div style={styles.iconTag}>
                          <Tag size={18} color={isEntrada ? '#22c55e' : '#ef4444'} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                            {cat.nome}{' '}
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isEntrada ? '#22c55e' : '#ef4444' }}>
                              ({isEntrada ? 'Receita' : 'Despesa'})
                            </span>
                          </strong>
                          {!isEntrada ? (
                            cat.limite_mensal ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                <Target size={14} color="var(--primary)" /> Limite: R$ {Number(cat.limite_mensal).toFixed(2)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Sem limite definido
                              </span>
                            )
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Entrada sem limite
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => handleIniciarEdicao(cat)} style={styles.deleteBtn} title="Editar">
                          <Edit2 size={16} color="var(--text-secondary)" />
                        </button>
                        <button onClick={() => handleExcluirCategoria(cat.id)} style={styles.deleteBtn} title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  pageTitle: { margin: 0, fontSize: '1.4rem' },
  card: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' },
  sectionTitle: { marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' },
  formGrid: { display: 'flex', flexWrap: 'wrap', gap: '1rem' },
  label: { display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' },
  input: { width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', padding: '0.65rem 1.2rem', height: '38px' },
  gridCategorias: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  categoriaCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' },
  categoriaInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  iconTag: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' },
  iconActionBtn: { background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '0.3rem' },
};