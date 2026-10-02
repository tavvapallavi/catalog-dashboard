import { useEffect, useMemo, useState } from 'react';
import { quality } from './quality.js';
import ProductForm from './ProductForm.jsx';

const PAGE = 10;

function Bars({ title, data }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  return (
    <section className="panel">
      <h2>{title}</h2>
      {data.map(([label, n]) => (
        <div className="bar" key={label}>
          <span>{label}</span>
          <div className="track"><div className="fill" style={{ width: `${(n / max) * 100}%` }} /></div>
          <b>{n}</b>
        </div>
      ))}
    </section>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [sort, setSort] = useState({ key: 'title', dir: 1 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [theme, setTheme] = useState('light');

  const load = () => {
    setStatus('loading');
    fetch('https://dummyjson.com/products?limit=100')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setProducts(d.products); setStatus('ready'); })
      .catch(() => setStatus('error'));
  };
  useEffect(load, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { setPage(1); }, [q, cat, issuesOnly, sort]);

  const scored = useMemo(() => products.map((p) => ({ ...p, qa: quality(p) })), [products]);
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const rows = useMemo(() => {
    const get = (p) => (sort.key === 'score' ? p.qa.score : p[sort.key]);
    return scored
      .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
      .filter((p) => !cat || p.category === cat)
      .filter((p) => !issuesOnly || p.qa.failed.length > 0)
      .sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * sort.dir);
  }, [scored, q, cat, issuesOnly, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice((page - 1) * PAGE, page * PAGE);
  const allOnPage = view.length > 0 && view.every((p) => selected.has(p.id));

  const byCategory = useMemo(() => {
    const m = {};
    products.forEach((p) => { m[p.category] = (m[p.category] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [products]);
  const withIssues = scored.filter((p) => p.qa.failed.length > 0).length;
  const avg = scored.length ? Math.round(scored.reduce((n, p) => n + p.qa.score, 0) / scored.length) : 0;

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));
  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected((s) => { const n = new Set(s); view.forEach((p) => (allOnPage ? n.delete(p.id) : n.add(p.id))); return n; });
  const remove = (ids) => {
    if (!window.confirm(`Delete ${ids.length} product(s)?`)) return;
    setProducts((ps) => ps.filter((p) => !ids.includes(p.id)));
    setSelected(new Set());
  };
  const save = (data) => {
    setProducts((ps) => (data.id ? ps.map((p) => (p.id === data.id ? { ...p, ...data } : p)) : [{ ...data, id: Date.now() }, ...ps]));
    setEditing(null);
  };
  const th = (key, label) => (
    <th aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className="ghost" onClick={() => toggleSort(key)}>{label}{sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}</button>
    </th>
  );

  return (
    <>
      <header className="top">
        <h1>Catalog Desk</h1>
        <div className="row">
          <button onClick={() => setEditing({})}>Add product</button>
          <button className="ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-pressed={theme === 'dark'}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </header>
      <main>
        {status === 'loading' && <p className="msg">Loading products…</p>}
        {status === 'error' && <p className="msg" role="alert">Couldn't load products. <button onClick={load}>Try again</button></p>}
        {status === 'ready' && (
          <>
            <div className="stats">
              {[['Products', products.length], ['Clean listings', scored.length - withIssues], ['Need fixing', withIssues], ['Average quality', `${avg}%`]].map(([label, value]) => (
                <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
            <div className="panels">
              <Bars title="Products by category" data={byCategory} />
              <Bars title="Listing quality" data={[['Clean', scored.length - withIssues], ['Has issues', withIssues]]} />
            </div>

            <div className="row wrap tools">
              <input type="search" placeholder="Search by title" aria-label="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <label className="check"><input type="checkbox" checked={issuesOnly} onChange={(e) => setIssuesOnly(e.target.checked)} /> Only listings with issues</label>
              {selected.size > 0 && <button className="danger" onClick={() => remove([...selected])}>Delete {selected.size} selected</button>}
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={toggleAll} /></th>
                    {th('title', 'Title')}{th('category', 'Category')}{th('price', 'Price')}{th('stock', 'Stock')}{th('score', 'Quality')}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {view.map((p) => (
                    <tr key={p.id}>
                      <td><input type="checkbox" aria-label={`Select ${p.title}`} checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} /></td>
                      <td className="prod">{p.thumbnail && <img src={p.thumbnail} alt="" width="36" height="36" />}{p.title}</td>
                      <td>{p.category}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>{p.stock}</td>
                      <td title={p.qa.failed.map((c) => c.label).join('\n') || 'All checks passed'}>
                        <span className={`badge ${p.qa.level}`}>{p.qa.score}%</span>
                        {p.qa.failed.length > 0 && <small> {p.qa.failed.length} issue{p.qa.failed.length > 1 ? 's' : ''}</small>}
                      </td>
                      <td className="row">
                        <button className="ghost" onClick={() => setEditing(p)}>Edit</button>
                        <button className="ghost" onClick={() => remove([p.id])}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <p className="msg">No products match these filters.</p>}

            <nav className="row pager" aria-label="Pagination">
              <button className="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {pages} ({rows.length} products)</span>
              <button className="ghost" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
            </nav>
          </>
        )}
      </main>
      {editing && <ProductForm product={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </>
  );
}
