import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, readSession, saveSession } from './api.js';
import { createAuthPayload } from './auth-form.js';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' };

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark">S</span>
      <span className="brand-copy">
        <strong>ShamWEB</strong>
        <small>CONNECT | MANAGE | GROW</small>
      </span>
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { user, token } = await apiRequest(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(createAuthPayload(mode, form))
      });
      onAuthenticated({ user, token });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <header className="auth-topbar"><Brand /><span className="auth-caption">YOUR PEOPLE, IN ONE PLACE</span></header>
      <section className="auth-layout">
        <div className="auth-intro">
          <span className="eyebrow"><span className="live-dot" /> SIMPLE. SECURE. ORGANIZED.</span>
          <h1>Better teams<br />start with <span>better tools.</span></h1>
          <p>Meet your new home for team management. Keep your people organized, your details up to date, and your work moving forward.</p>
          <div className="intro-note"><span className="note-icon">✳</span><span>Made for teams that think big.<br /><strong>Built to keep things simple.</strong></span></div>
        </div>
        <section className="auth-card">
          <div className="auth-card-heading">
            <div className="mini-logo">S</div>
            <p className="eyebrow">WELCOME TO SHAMWEB</p>
            <h2>{mode === 'login' ? 'Good to see you.' : 'Let’s get started.'}</h2>
            <p className="muted">{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create your account in just a moment.'}</p>
          </div>
          <div className="auth-tabs" role="tablist">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
          </div>
          <form onSubmit={submit} className="form-stack">
            {mode === 'register' && (
              <label className="field">Full name
                <input autoComplete="name" required minLength={2} maxLength={80} placeholder="e.g. Alex Morgan" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            <label className="field">Email address
              <input autoComplete="email" type="email" required placeholder="you@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="field">Password
              <span className="password-input-wrap">
                <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} required minLength={mode === 'login' ? 1 : 8} maxLength={128} placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
              </span>
              {mode === 'login' && <span className="field-hint">Passwords are case-sensitive. Use the same password you chose when signing up.</span>}
            </label>
            {error && <div className="alert" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in to your account' : 'Create my account'} <span>→</span></button>
          </form>
          <p className="auth-footnote">By continuing, you agree to keep your account details safe.</p>
        </section>
      </section>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} ShamWEB</span><span>CONNECT&nbsp; | &nbsp;MANAGE&nbsp; | &nbsp;GROW</span></footer>
    </main>
  );
}

function Sidebar({ user, section, onSection, onLogout }) {
  return (
    <aside className="sidebar">
      <Brand />
      <div className="workspace-switch"><span className="workspace-icon">S</span><span><strong>My workspace</strong><small>Personal space</small></span><span className="chevron">⌄</span></div>
      <p className="side-label">WORKSPACE</p>
      <nav className="side-nav">
        <button className={section === 'overview' ? 'selected' : ''} onClick={() => onSection('overview')}><span className="nav-icon">▦</span> Overview</button>
        {user.role === 'admin' && <button className={section === 'people' ? 'selected' : ''} onClick={() => onSection('people')}><span className="nav-icon">♙</span> People <span className="nav-count">TEAM</span></button>}
        <button className={section === 'profile' ? 'selected' : ''} onClick={() => onSection('profile')}><span className="nav-icon">◎</span> My profile</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-spark">✳</span><strong>Here for you.</strong><p>Your people, managed in one simple place.</p></div>
        <button className="side-user" onClick={onLogout} title="Sign out">
          <span className="avatar avatar-small">{initials(user.name)}</span><span className="side-user-info"><strong>{user.name}</strong><small>{user.role === 'admin' ? 'Administrator' : 'Team member'}</small></span><span className="logout-icon">↗</span>
        </button>
      </div>
    </aside>
  );
}

function StatCard({ label, value, note, icon, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>;
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? { name: user.name, email: user.email, password: '', role: user.role } : EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const body = Object.fromEntries(Object.entries(form).filter(([key, value]) => key !== 'password' || value));
    try {
      await onSave(body);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <span className="eyebrow">{user ? 'TEAM DIRECTORY' : 'GROW YOUR TEAM'}</span>
        <h2 id="modal-title">{user ? 'Edit team member' : 'Add a team member'}</h2>
        <p className="muted">{user ? 'Update this member’s details below.' : 'Create a new account for someone on your team.'}</p>
        <form className="form-stack modal-form" onSubmit={submit}>
          <label className="field">Full name<input required minLength={2} maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="field">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="field">{user ? 'New password (optional)' : 'Temporary password'}
            <input type="password" minLength={8} maxLength={128} required={!user} placeholder={user ? 'Leave blank to keep current password' : 'At least 8 characters'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <label className="field">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="user">Team member</option><option value="admin">Administrator</option></select></label>
          {error && <div className="alert" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : user ? 'Save changes' : 'Create account'} <span>→</span></button></div>
        </form>
      </section>
    </div>
  );
}

function ConfirmModal({ user, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="confirm-icon">!</div><span className="eyebrow">PLEASE CONFIRM</span>
        <h2 id="confirm-title">Remove {user.name}?</h2>
        <p className="muted">This account will be permanently deleted. This action can’t be undone.</p>
        <div className="modal-actions"><button className="button button-quiet" onClick={onClose}>Keep account</button><button className="button button-danger" onClick={onConfirm}>Delete account</button></div>
      </section>
    </div>
  );
}

function PeopleTable({ users, busy, onEdit, onDelete, currentUser }) {
  if (busy) return <div className="table-state"><span className="spinner" /> Loading your team…</div>;
  if (!users.length) return <div className="table-state empty-state"><span className="empty-icon">♙</span><strong>No people found</strong><span>Try a different search, or add someone new to your team.</span></div>;
  return (
    <div className="table-scroll"><table className="people-table"><thead><tr><th>NAME</th><th>ROLE</th><th>JOINED</th><th>ACCOUNT</th><th aria-label="Actions" /></tr></thead>
      <tbody>{users.map((person) => <tr key={person._id}>
        <td><div className="person-cell"><span className={`avatar ${person.role === 'admin' ? 'avatar-admin' : ''}`}>{initials(person.name)}</span><span><strong>{person.name}{person._id === currentUser._id && <span className="you-label">YOU</span>}</strong><small>{person.email}</small></span></div></td>
        <td><span className={`role-pill ${person.role === 'admin' ? 'role-admin' : ''}`}><i />{person.role === 'admin' ? 'Administrator' : 'Team member'}</span></td>
        <td className="date-cell">{formatDate(person.createdAt)}</td><td><span className="account-status"><i /> Active</span></td>
        <td><div className="row-actions"><button onClick={() => onEdit(person)} aria-label={`Edit ${person.name}`} title="Edit member">✎</button><button className="delete-action" onClick={() => onDelete(person)} aria-label={`Delete ${person.name}`} title="Delete member" disabled={person._id === currentUser._id}>⌫</button></div></td>
      </tr>)}</tbody>
    </table></div>
  );
}

function Profile({ user, token, onUpdate, onLogout }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    const body = { name, email };
    if (password) body.password = password;
    try {
      const response = await apiRequest('/users/me', { token, method: 'PATCH', body: JSON.stringify(body) });
      onUpdate(response.user);
      setPassword('');
      setMessage('Your profile has been updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="profile-layout">
      <div className="profile-intro"><span className="eyebrow">YOUR ACCOUNT</span><h2>Make it yours.</h2><p className="muted">Keep your information up to date so your team knows how to reach you.</p><div className="profile-preview"><span className="avatar avatar-large">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.role === 'admin' ? 'Administrator' : 'Team member'}</small></span></div><button className="text-button" onClick={onLogout}>Sign out of your account <span>→</span></button></div>
      <form className="profile-card form-stack" onSubmit={submit}><div><span className="eyebrow">PERSONAL DETAILS</span><h3>Your profile</h3></div>
        <label className="field">Full name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="field">Change password <span className="field-hint">Leave blank to keep your current password.</span><input type="password" minLength={8} maxLength={128} placeholder="Enter a new password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {message && <div className="success-message" role="status">{message}</div>}
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="profile-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <span>→</span></button></div>
      </form>
    </section>
  );
}

function Dashboard({ user, token, onUserUpdate, onLogout }) {
  const [section, setSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, members: 0 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(undefined);
  const [deleteUser, setDeleteUser] = useState(null);
  const [toast, setToast] = useState('');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const timeout = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '8' });
      if (search) params.set('search', search);
      const [data, summary] = await Promise.all([
        apiRequest(`/users?${params}`, { token }),
        apiRequest('/users/stats', { token })
      ]);
      setUsers(data.users);
      setTotal(data.pagination.total);
      setPages(Math.max(data.pagination.pages, 1));
      setStats(summary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, search, token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const visibleUsers = users;

  async function saveUser(body) {
    const editing = modalUser !== null;
    const path = editing ? `/users/${modalUser._id}` : '/users';
    await apiRequest(path, { token, method: editing ? 'PATCH' : 'POST', body: JSON.stringify(body) });
    setToast(editing ? 'Team member updated.' : 'New team member added.');
    await loadUsers();
  }

  async function removeUser() {
    try {
      await apiRequest(`/users/${deleteUser._id}`, { token, method: 'DELETE' });
      setDeleteUser(null);
      setToast('Team member removed.');
      if (visibleUsers.length === 1 && page > 1) setPage(page - 1);
      else await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
      setDeleteUser(null);
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const currentSection = section === 'people' && !isAdmin ? 'overview' : section;
  const greetingName = user.name.split(' ')[0];

  return (
    <div className="app-shell">
      <Sidebar user={user} section={currentSection} onSection={setSection} onLogout={onLogout} />
      <main className="main-panel">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-sep">/</span><strong>{currentSection === 'people' ? 'People' : currentSection === 'profile' ? 'My profile' : 'Overview'}</strong></div><div className="topbar-right"><span className="topbar-date">YOUR SPACE, AT A GLANCE</span><span className="avatar avatar-small">{initials(user.name)}</span></div></header>
        <div className="page-content">
          {currentSection === 'profile' ? <><div className="page-heading"><div><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Your profile</h1><p>One place to keep your details current.</p></div></div><Profile user={user} token={token} onUpdate={onUserUpdate} onLogout={onLogout} /></> :
            <><div className="page-heading"><div><span className="eyebrow">{currentSection === 'people' ? 'YOUR TEAM, ALL HERE' : 'A LITTLE SPACE TO DO BIG THINGS'}</span><h1>{currentSection === 'people' ? 'People' : <>Good {getGreeting()}, {greetingName} <span className="wave">✳</span></>}</h1><p>{currentSection === 'people' ? 'Get to know everyone who makes your workspace what it is.' : 'Here’s what’s happening with your workspace today.'}</p></div>
              {isAdmin && <button className="button button-primary add-button" onClick={() => setModalUser(null)}><span className="plus">+</span> Add a person <span>→</span></button>}
            </div>
            {error && <div className="alert page-alert" role="alert">{error}<button onClick={() => { setError(''); loadUsers(); }}>Try again</button></div>}
            {isAdmin && <div className="stats-grid"><StatCard label="PEOPLE IN YOUR SPACE" value={stats.total} note="Everyone, all together" icon="♙" tone="lavender" /><StatCard label="TEAM MEMBERS" value={stats.members} note="Making things happen" icon="✳" tone="peach" /><StatCard label="ADMINISTRATORS" value={stats.admins} note="Keeping things in order" icon="◇" tone="mint" /><article className="welcome-card"><span className="welcome-doodle">S</span><div><span className="eyebrow">A NOTE FOR YOU</span><strong>Small teams.<br />Big things.</strong><p>Glad you’re here.</p></div></article></div>}
            {isAdmin ? <section className="people-card"><div className="people-card-heading"><div><span className="eyebrow">THE GOOD PEOPLE</span><h2>Your team <span className="total-pill">{total}</span></h2></div><label className="search-box"><span>⌕</span><input aria-label="Search people" placeholder="Find someone…" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /><kbd>⌘ K</kbd></label></div>
              <PeopleTable users={users} busy={loading} onEdit={setModalUser} onDelete={setDeleteUser} currentUser={user} />
              <div className="table-footer"><span>Showing <strong>{total ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, total)}</strong> of <strong>{total}</strong> people</span><div className="pagination"><button aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>←</button><span>Page <strong>{page}</strong> of <strong>{pages}</strong></span><button aria-label="Next page" disabled={page >= pages || loading} onClick={() => setPage(page + 1)}>→</button></div></div>
            </section> : <section className="member-welcome"><div className="member-avatar">{initials(user.name)}</div><span className="eyebrow">YOUR CORNER OF THE WORKSPACE</span><h2>Hey, {greetingName}.</h2><p>Your account is ready. Head to your profile to update your details, or reach out to your workspace administrator if you need a hand.</p><button className="button button-primary" onClick={() => setSection('profile')}>Update my profile <span>→</span></button></section>}
            <footer className="page-footer"><span>Made for people, by people.</span><span>SHAMWEB &nbsp;·&nbsp; CONNECT | MANAGE | GROW</span></footer>
          </>}
        </div>
      </main>
      {modalUser !== undefined && <UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSave={saveUser} />}
      {deleteUser && <ConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={removeUser} />}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [checking, setChecking] = useState(Boolean(readSession().token));

  useEffect(() => {
    const current = readSession();
    if (!current.token) {
      setChecking(false);
      return;
    }
    let active = true;
    apiRequest('/users/me', { token: current.token })
      .then(({ user }) => {
        if (!active) return;
        const freshSession = { token: current.token, user };
        saveSession(freshSession);
        setSession(freshSession);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setSession({ token: null, user: null });
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  function authenticate(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
  }

  function logout() {
    clearSession();
    setSession({ token: null, user: null });
  }

  function updateUser(user) {
    const nextSession = { ...session, user };
    saveSession(nextSession);
    setSession(nextSession);
  }

  if (checking) return <main className="loading-screen"><Brand /><span className="spinner" /><p>Getting your space ready…</p></main>;
  if (!session.token || !session.user) return <AuthScreen onAuthenticated={authenticate} />;
  return <Dashboard user={session.user} token={session.token} onUserUpdate={updateUser} onLogout={logout} />;
}
