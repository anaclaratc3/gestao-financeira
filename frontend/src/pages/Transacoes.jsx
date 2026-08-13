import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, FileText, ArrowUp, ArrowDown, X, Check } from 'lucide-react';
import api from '../services/api';

export default function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [data, setData] = useState(''); // Começa vazio para exibir placeholder
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtros posicionados ao LADO DIREITO
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Ordenação nas Colunas da Tabela
  const [ordemCampo, setOrdemCampo] = useState('data');
  const [ordemDirecao, setOrdemDirecao] = useState('desc');

  // Modal de Detalhes/Observação
  const [modalTransacao, setModalTransacao] = useState(null);
  const [novaObsModal, setNovaObsModal] = useState('');

  useEffect(() => {
    carregarCategorias();
    carregarTransacoes();
  }, []);

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const carregarTransacoes = async () => {
    try {
      const response = await api.get('/transacoes');
      setTransacoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const handleCriarTransacao = async (e) => {
    e.preventDefault();

    if (!descricao.trim() || !valor || !categoriaId) {
      alert('Por favor, preencha a descrição, valor e selecione uma categoria!');
      return;
    }

    setLoading(true);
    const usuarioSalvo = localStorage.getItem('usuario');
    const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    const valorTratado = parseFloat(String(valor).replace(',', '.'));
    const dataFinal = data || new Date().toISOString().split('T')[0];

    try {
      await api.post('/transacoes', {
        descricao: descricao.trim(),
        valor: valorTratado,
        categoria_id: parseInt(categoriaId),
        data: dataFinal,
        observacao: observacao.trim(),
        usuario_id: usuario?.id,
      });

      setDescricao('');
      setValor('');
      setCategoriaId('');
      setObservacao('');
      setData('');

      await carregarTransacoes();
    } catch (error) {
      console.error('Erro ao cadastrar transação:', error);
      alert(error.response?.data?.erro || 'Erro ao salvar transação.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirTransacao = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await api.delete(`/transacoes/${id}`);
      await carregarTransacoes();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert(error.response?.data?.erro || 'Erro ao excluir transação.');
    }
  };

  // Alterna a ordenação na coluna clicada
  const handleSort = (campo) => {
    if (ordemCampo === campo) {
      setOrdemDirecao(ordemDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdemCampo(campo);
      setOrdemDirecao('asc');
    }
  };

  const renderSetaOrdenacao = (campo) => {
    if (ordemCampo !== campo) return null;
    return ordemDirecao === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const handleSalvarObservacaoModal = async () => {
    if (!modalTransacao) return;

    try {
      await api.patch(`/transacoes/${modalTransacao.id}/observacao`, {
        observacao: novaObsModal,
      });
      setModalTransacao(null);
      await carregarTransacoes();
    } catch (error) {
      console.error('Erro ao atualizar observação:', error);
      alert('Erro ao salvar observação.');
    }
  };

  // Aplicação dos Filtros
  let transacoesFiltradas = transacoes.filter((t) => {
    // Normalização de tipos para compatibilidade
    const tipoNormal = t.tipo === 'RECEITA' ? 'ENTRADA' : t.tipo === 'DESPESA' ? 'SAIDA' : t.tipo;
    const filtroTipoNormal = filtroTipo === 'RECEITA' ? 'ENTRADA' : filtroTipo === 'DESPESA' ? 'SAIDA' : filtroTipo;

    const atendeTipo = filtroTipoNormal ? tipoNormal === filtroTipoNormal : true;
    const atendeCategoria = filtroCategoria ? String(t.categoria_id) === String(filtroCategoria) : true;

    let atendeData = true;
    const dataTransacao = new Date(t.data).toISOString().split('T')[0];
    if (dataInicio && dataTransacao < dataInicio) atendeData = false;
    if (dataFim && dataTransacao > dataFim) atendeData = false;

    return atendeTipo && atendeCategoria && atendeData;
  });

  // Aplicação da Ordenação por Colunas
  transacoesFiltradas.sort((a, b) => {
    let valA = a[ordemCampo];
    let valB = b[ordemCampo];

    if (ordemCampo === 'categoria_nome') {
      valA = a.categoria_nome || '';
      valB = b.categoria_nome || '';
    }

    if (ordemCampo === 'valor') {
      valA = parseFloat(a.valor);
      valB = parseFloat(b.valor);
    }

    if (ordemCampo === 'data') {
      valA = new Date(a.data);
      valB = new Date(b.data);
    }

    if (valA < valB) return ordemDirecao === 'asc' ? -1 : 1;
    if (valA > valB) return ordemDirecao === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.pageTitle}>Gestão de Transações</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Registre e acompanhe suas entradas e saídas financeiras
        </span>
      </div>

      {/* FORMULÁRIO DE NOVA TRANSAÇÃO */}
      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Nova Transação</h3>
        <form onSubmit={handleCriarTransacao} style={styles.formGrid}>
          <div style={{ flex: '2', minWidth: '180px' }}>
            <label style={styles.label}>Descrição</label>
            <input
              type="text"
              placeholder="Ex: Mercado, Salário, Luz..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={{ flex: '1', minWidth: '120px' }}>
            <label style={styles.label}>Valor (R$)</label>
            <input
              type="text"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={{ flex: '1.5', minWidth: '180px' }}>
            <label style={styles.label}>Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              style={{
                ...styles.input,
                color: categoriaId === '' ? 'var(--text-secondary)' : 'var(--text-primary)',
              }}
            >
              <option value="" disabled hidden>
                Selecione a categoria...
              </option>
              {categorias.map((cat) => {
                const isEntrada = cat.tipo === 'ENTRADA' || cat.tipo === 'RECEITA';
                return (
                  <option key={cat.id} value={cat.id} style={{ color: 'var(--text-primary)' }}>
                    {cat.nome} ({isEntrada ? 'Receita' : 'Despesa'})
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '140px' }}>
            <label style={styles.label}>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={{
                ...styles.input,
                color: data === '' ? 'var(--text-secondary)' : 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ flex: '2', minWidth: '200px' }}>
            <label style={styles.label}>Observação (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Pagamento referente ao frete"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              <Plus size={18} /> {loading ? 'Salvando...' : 'Adicionar Transação'}
            </button>
          </div>
        </form>
      </section>

      {/* LISTAGEM E FILTROS */}
      <section style={styles.card}>
        <div style={styles.headerLista}>
          <h3 style={styles.sectionTitle}>Histórico de Lançamentos</h3>

          {/* BARRA DE FILTROS ALINHADA À DIREITA */}
          <div style={styles.filtrosBarRight}>
            {/* FILTRO POR TIPO */}
            <div style={styles.filtroGroup}>
              <Filter size={15} color="var(--text-secondary)" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={styles.selectFiltro}
              >
                <option value="">Todos os Tipos</option>
                <option value="ENTRADA">Receitas (Entradas)</option>
                <option value="SAIDA">Despesas (Saídas)</option>
              </select>
            </div>

            {/* FILTRO POR CATEGORIA */}
            <div style={styles.filtroGroup}>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={styles.selectFiltro}
              >
                <option value="">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* FILTRO POR PERÍODO */}
            <div style={styles.filtroGroup}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>De:</span>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={styles.selectFiltro}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Até:</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={styles.selectFiltro}
              />
            </div>
          </div>
        </div>

        {transacoesFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '2rem 0' }}>
            Nenhuma transação encontrada com os filtros selecionados.
          </p>
        ) : (
          <div style={styles.tabelaWrapper}>
            <table style={styles.tabela}>
              <thead>
                <tr>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.thSortable} onClick={() => handleSort('descricao')}>
                    <div style={styles.thContent}>Descrição {renderSetaOrdenacao('descricao')}</div>
                  </th>
                  <th style={styles.thSortable} onClick={() => handleSort('categoria_nome')}>
                    <div style={styles.thContent}>Categoria {renderSetaOrdenacao('categoria_nome')}</div>
                  </th>
                  <th style={styles.thSortable} onClick={() => handleSort('data')}>
                    <div style={styles.thContent}>Data {renderSetaOrdenacao('data')}</div>
                  </th>
                  <th style={styles.thSortable} onClick={() => handleSort('valor')}>
                    <div style={styles.thContent}>Valor {renderSetaOrdenacao('valor')}</div>
                  </th>
                  <th style={styles.thAction}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map((t) => {
                  const isEntrada = t.tipo === 'ENTRADA' || t.tipo === 'RECEITA';
                  return (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.td}>
                        {isEntrada ? (
                          <ArrowUpCircle size={20} color="#22c55e" title="Receita (Entrada)" />
                        ) : (
                          <ArrowDownCircle size={20} color="#ef4444" title="Despesa (Saída)" />
                        )}
                      </td>
                      <td style={styles.td}>
                        <strong>{t.descricao}</strong>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.tagCategoria}>
                          {t.categoria_nome || 'Sem Categoria'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: 'bold',
                          color: isEntrada ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {isEntrada ? '+ ' : '- '}
                        R$ {Number(t.valor).toFixed(2)}
                      </td>
                      <td style={styles.tdAction}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setModalTransacao(t);
                              setNovaObsModal(t.observacao || '');
                            }}
                            style={{
                              ...styles.iconBtn,
                              color: t.observacao ? 'var(--primary)' : 'var(--text-secondary)',
                            }}
                            title={t.observacao ? 'Ver / Editar Observação' : 'Adicionar Observação'}
                          >
                            <FileText size={16} />
                          </button>

                          <button
                            onClick={() => handleExcluirTransacao(t.id)}
                            style={styles.deleteBtn}
                            title="Excluir Transação"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DE OBSERVAÇÃO E DETALHES */}
      {modalTransacao && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h4 style={{ margin: 0 }}>Detalhes do Lançamento</h4>
              <button onClick={() => setModalTransacao(null)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <p style={{ margin: '0.3rem 0' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Descrição:</strong> {modalTransacao.descricao}
              </p>
              <p style={{ margin: '0.3rem 0' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Valor:</strong> R$ {Number(modalTransacao.valor).toFixed(2)}
              </p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={styles.label}>Observação / Anotações:</label>
              <textarea
                rows={4}
                value={novaObsModal}
                onChange={(e) => setNovaObsModal(e.target.value)}
                placeholder="Digite detalhes extras sobre esta transação..."
                style={{
                  ...styles.input,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
              <button onClick={() => setModalTransacao(null)} style={styles.cancelBtn}>
                Cancelar
              </button>
              <button onClick={handleSalvarObservacaoModal} style={styles.saveBtn}>
                <Check size={16} /> Salvar Observação
              </button>
            </div>
          </div>
        </div>
      )}
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
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', padding: '0.65rem 1.2rem', height: '38px', width: '100%' },
  headerLista: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' },
  
  // ALINHAMENTO À DIREITA
  filtrosBarRight: { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 'auto' },
  
  filtroGroup: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  selectFiltro: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' },
  tabelaWrapper: { overflowX: 'auto' },
  tabela: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  thSortable: { padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' },
  thContent: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  thAction: { padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' },
  tr: { borderBottom: '1px solid var(--border-color)' },
  td: { padding: '0.75rem', fontSize: '0.9rem' },
  tdAction: { padding: '0.75rem', textAlign: 'center' },
  tagCategoria: { backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  cancelBtn: { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-primary)', cursor: 'pointer' },
  saveBtn: { padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' },
};