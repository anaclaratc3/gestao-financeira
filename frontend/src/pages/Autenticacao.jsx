    import { useState } from 'react';
import { Wallet, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import api from '../services/api';

export default function Autenticacao({ onLoginSuccess, theme, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      if (isLogin) {
        const response = await api.post('/usuarios/login', { email, senha });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        onLoginSuccess(response.data.usuario);
      } else {
        await api.post('/usuarios/registrar', { nome, email, senha });
        setMensagem('Conta criada com sucesso! Faça login para continuar.');
        setIsLogin(true);
        setSenha('');
      }
    } catch (error) {
      setMensagem(error.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={toggleTheme} style={styles.themeToggle}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        {theme === 'light' ? 'Escuro' : 'Claro'}
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <Wallet size={36} color="var(--primary)" />
          <h1 style={styles.title}>Gestão Financeira</h1>
        </div>

        <p style={styles.subtitle}>
          {isLogin ? 'Acesse sua conta para continuar' : 'Crie sua conta gratuitamente'}
        </p>

        {mensagem && (
          <div style={{ ...styles.alert, backgroundColor: mensagem.includes('sucesso') ? '#10b98120' : '#ef444420' }}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div>
              <label style={styles.label}>Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                required
                style={styles.input}
              />
            </div>
          )}

          <div>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={carregando} style={styles.submitBtn}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {carregando ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>{isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMensagem('');
            }}
            style={styles.switchBtn}
          >
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.5rem',
    margin: 0,
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  alert: {
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};