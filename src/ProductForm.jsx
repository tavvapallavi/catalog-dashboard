import { useState } from 'react';

function validate(v) {
  const e = {};
  if (v.title.trim().length < 3) e.title = 'Enter a title of at least 3 characters.';
  if (!v.category.trim()) e.category = 'Enter a category.';
  if (!(Number(v.price) > 0)) e.price = 'Enter a price above 0.';
  if (!Number.isInteger(Number(v.stock)) || Number(v.stock) < 0) e.stock = 'Enter a whole number, 0 or more.';
  if (v.thumbnail && !/^https?:\/\//.test(v.thumbnail)) e.thumbnail = 'Image link must start with http:// or https://';
  return e;
}

export default function ProductForm({ product, onSave, onCancel }) {
  const [v, setV] = useState({ title: '', category: '', price: '', stock: '', thumbnail: '', description: '', ...product });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave({ ...v, price: Number(v.price), stock: Number(v.stock) });
  }

  const field = (k, label, props = {}) => (
    <label>
      {label}
      <input value={v[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `${k}-err` : undefined} {...props} />
      {errors[k] && <span id={`${k}-err`} className="err" role="alert">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="overlay">
      <form className="modal" onSubmit={submit} noValidate aria-label={product.id ? 'Edit product' : 'Add product'}>
        <h2>{product.id ? 'Edit product' : 'Add product'}</h2>
        {field('title', 'Title')}
        {field('category', 'Category')}
        {field('price', 'Price', { type: 'number', step: '0.01' })}
        {field('stock', 'Stock', { type: 'number' })}
        {field('thumbnail', 'Image link')}
        <label>Description<textarea rows="3" value={v.description} onChange={set('description')} /></label>
        <div className="row end">
          <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
          <button type="submit">Save product</button>
        </div>
      </form>
    </div>
  );
}
