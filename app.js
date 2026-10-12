if (window.pywebview) document.documentElement.classList.add('force-sidebar');
window.addEventListener('pywebviewready', () => document.documentElement.classList.add('force-sidebar'));

const storageKey = 'preco-facil-products-v1';
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const $ = (selector) => document.querySelector(selector);
let products = JSON.parse(localStorage.getItem(storageKey) || '[]');

function save() { localStorage.setItem(storageKey, JSON.stringify(products)); }
function esc(value = '') { const d = document.createElement('div'); d.textContent = value; return d.innerHTML; }
function formatPrice(value) { return money.format(Number(value || 0)); }
function dateToday() { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date()); }

function renderProducts() {
  const query = $('#search-products').value.trim().toLowerCase();
  const shown = products.filter(p => [p.name, p.code, p.category].join(' ').toLowerCase().includes(query));
  $('#product-count').textContent = products.length ? `${shown.length} de ${products.length} produto${products.length === 1 ? '' : 's'}` : '';
  $('#products-body').innerHTML = shown.map(p => `<tr><td><div class="product-name">${esc(p.name)}</div><small class="muted">${esc(p.unit)}</small></td><td>${esc(p.code || '—')}</td><td>${esc(p.category || '—')}</td><td class="price">${formatPrice(p.price)}</td><td class="row-actions"><button class="edit-btn" data-id="${p.id}">Editar</button><button class="delete-btn" data-id="${p.id}">Excluir</button></td></tr>`).join('');
  $('#empty-products').classList.toggle('hidden', products.length > 0);
  renderPrintViews();
}

function selectedIds() { return [...document.querySelectorAll('.select-product:checked')].map(i => i.value); }
function labelDimensions() {
  const preset = $('#label-size').value;
  if (preset === 'custom') return [Number($('#custom-width').value) || 50, Number($('#custom-height').value) || 30];
  return preset.split('x').map(Number);
}
function labelMarkup(p, width, height, barcode) {
  const codeLine = `<div class="label-code">${esc(p.code || p.category || p.unit)}</div>${barcode && p.code ? '<div class="barcode"></div>' : ''}`;
  if (p.wholesalePrice > 0) {
    const boxTotal = p.boxQty > 0 ? p.wholesalePrice * p.boxQty : null;
    return `<article class="label label-dual" style="width:${width}mm;height:${height}mm"><div class="label-name">${esc(p.name)}</div><div class="label-wholesale"><div class="label-wholesale-unit"><span class="tag">Atacado:</span><span class="big">${formatPrice(p.wholesalePrice)}</span></div>${boxTotal !== null ? `<div class="label-wholesale-box"><span>${formatPrice(boxTotal)}</span><small>CX C/${p.boxQty} UN</small></div>` : ''}</div><div class="label-retail"><span class="tag">Varejo: ${esc(p.unit)}</span><span class="big">${formatPrice(p.price)}</span></div>${codeLine}</article>`;
  }
  return `<article class="label" style="width:${width}mm;height:${height}mm"><div class="label-name">${esc(p.name)}</div><div class="label-price">${formatPrice(p.price)}</div>${codeLine}</article>`;
}
function renderPrintViews() {
  $('#label-products').innerHTML = products.length ? products.map(p => `<div class="selection-item"><input class="select-product" id="select-${p.id}" value="${p.id}" type="checkbox" checked><label for="select-${p.id}">${esc(p.name)}<small>${formatPrice(p.price)}${p.wholesalePrice > 0 ? ` · Atacado ${formatPrice(p.wholesalePrice)}` : ''} · ${esc(p.code || 'sem código')}</small></label></div>`).join('') : '<p class="muted" style="padding:12px">Cadastre produtos primeiro.</p>';
  renderLabels(); renderList();
}
function renderLabels() {
  const [width, height] = labelDimensions();
  const ids = selectedIds();
  const qty = Math.max(1, Number($('#label-quantity').value) || 1);
  const picks = products.filter(p => ids.includes(p.id));
  $('#labels-preview').innerHTML = picks.length ? picks.flatMap(p => Array.from({ length: qty }, () => labelMarkup(p, width, height, $('#show-barcode').checked))).join('') : '<p class="muted">Selecione produtos para visualizar as etiquetas.</p>';
}
function renderList() {
  const code = $('#list-code').checked, category = $('#list-category').checked;
  const title = esc($('#list-title').value || 'Tabela de Preços');
  const columns = `<th>Produto</th>${code ? '<th>Código</th>' : ''}${category ? '<th>Categoria</th>' : ''}<th style="text-align:right">Preço</th>`;
  const rows = products.slice().sort((a,b) => a.name.localeCompare(b.name, 'pt-BR')).map(p => `<tr><td><strong>${esc(p.name)}</strong><br><small>${esc(p.unit)}</small></td>${code ? `<td>${esc(p.code || '—')}</td>` : ''}${category ? `<td>${esc(p.category || '—')}</td>` : ''}<td class="price">${formatPrice(p.price)}</td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center;padding:20mm">Nenhum produto cadastrado</td></tr>`;
  $('#price-list-preview').innerHTML = `<div class="list-heading"><h1>${title}</h1>${$('#list-date').checked ? `<p>Emitida em ${dateToday()}</p>` : ''}</div><table class="list-table"><thead><tr>${columns}</tr></thead><tbody>${rows}</tbody></table>`;
}
function openProduct(id) {
  const p = products.find(item => item.id === id) || { id:'', name:'', code:'', category:'', price:'', unit:'UN', wholesalePrice:'', boxQty:'' };
  $('#modal-title').textContent = id ? 'Editar produto' : 'Novo produto';
  $('#product-id').value = p.id; $('#product-name').value = p.name; $('#product-code').value = p.code; $('#product-category').value = p.category; $('#product-price').value = p.price; $('#product-unit').value = p.unit;
  $('#product-wholesale-price').value = p.wholesalePrice || ''; $('#product-box-qty').value = p.boxQty || '';
  $('#product-modal').showModal(); $('#product-name').focus();
}
function printContent(html) { $('#print-root').innerHTML = html; window.print(); }

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-item,.screen').forEach(el => el.classList.remove('active'));
  button.classList.add('active'); $(`#${button.dataset.screen}`).classList.add('active');
  $('#page-title').textContent = button.textContent.trim(); $('#new-product-btn').style.visibility = button.dataset.screen === 'products' ? 'visible' : 'hidden';
}));
$('#new-product-btn').onclick = () => openProduct(); document.querySelector('.empty-add').onclick = () => openProduct();
$('#close-modal').onclick = $('#cancel-modal').onclick = () => $('#product-modal').close();
$('#product-form').addEventListener('submit', () => {
  const id = $('#product-id').value;
  const record = { id: id || crypto.randomUUID(), name: $('#product-name').value.trim(), code: $('#product-code').value.trim(), category: $('#product-category').value.trim(), price: Number($('#product-price').value), unit: $('#product-unit').value, wholesalePrice: Number($('#product-wholesale-price').value) || 0, boxQty: Number($('#product-box-qty').value) || 0 };
  products = id ? products.map(p => p.id === id ? record : p) : [...products, record]; save(); renderProducts(); $('#product-modal').close();
});
$('#products-body').onclick = (event) => { const id = event.target.dataset.id; if (!id) return; if (event.target.className === 'edit-btn') openProduct(id); if (event.target.className === 'delete-btn' && confirm('Excluir este produto?')) { products = products.filter(p => p.id !== id); save(); renderProducts(); } };
$('#search-products').addEventListener('input', renderProducts);
$('#label-size').onchange = () => { $('#custom-size').classList.toggle('hidden', $('#label-size').value !== 'custom'); renderLabels(); };
['#label-quantity','#show-barcode','#custom-width','#custom-height'].forEach(s => $(s).addEventListener('input', renderLabels));
$('#label-products').addEventListener('change', renderLabels);
['#list-title','#list-code','#list-category','#list-date'].forEach(s => $(s).addEventListener('input', renderList));
$('#print-labels').onclick = () => printContent($('#labels-preview').outerHTML);
$('#print-list').onclick = () => printContent($('#price-list-preview').outerHTML);
$('#export-btn').onclick = () => { const blob = new Blob([JSON.stringify(products, null, 2)], {type:'application/json'}); const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:`preco-facil-backup-${new Date().toISOString().slice(0,10)}.json`}); a.click(); URL.revokeObjectURL(a.href); };
$('#import-input').onchange = async (event) => { const file = event.target.files[0]; if (!file) return; try { const content = JSON.parse(await file.text()); if (!Array.isArray(content)) throw Error(); products = content.filter(p => p && p.name).map(p => ({id:p.id || crypto.randomUUID(), name:String(p.name), code:String(p.code || ''), category:String(p.category || ''), price:Number(p.price || 0), unit:p.unit || 'UN', wholesalePrice:Number(p.wholesalePrice || 0), boxQty:Number(p.boxQty || 0)})); save(); renderProducts(); alert('Dados importados com sucesso.'); } catch { alert('Este arquivo de backup não é válido.'); } event.target.value=''; };
// Proteção básica de interface: impede os atalhos mais comuns para inspeção.
// Isto não substitui controles de segurança no servidor para aplicativos publicados.
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) || (event.ctrlKey && key === 'u')) {
    event.preventDefault();
  }
});

const themeKey = 'etiqmais-theme-v1';
const themeVariantKey = 'etiqmais-theme-variant-v1';
function applyTheme(theme, variant) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-variant', variant);
  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.themeOption === theme));
}
function setTheme(theme) {
  const current = document.documentElement.getAttribute('data-theme');
  const currentVariant = document.documentElement.getAttribute('data-variant') || 'a';
  const variant = theme === 'system' && current === 'system' ? (currentVariant === 'a' ? 'b' : 'a') : 'a';
  localStorage.setItem(themeKey, theme);
  localStorage.setItem(themeVariantKey, variant);
  applyTheme(theme, variant);
}
document.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.themeOption)));
applyTheme(localStorage.getItem(themeKey) || 'system', localStorage.getItem(themeVariantKey) || 'a');

function populatePrinterSelect(select, printers) {
  const current = select.value;
  select.innerHTML = ['<option value="system">Escolher na janela de impressão</option>']
    .concat(printers.map(p => `<option value="${esc(p.name)}">${esc(p.name)}${p.default ? ' (padrão)' : ''}</option>`)).join('');
  if (printers.some(p => p.name === current)) select.value = current;
  else { const def = printers.find(p => p.default); if (def) select.value = def.name; }
}
async function loadPrinters(button) {
  const api = window.pywebview && window.pywebview.api;
  if (!api || !api.list_printers) return;
  if (button) button.classList.add('spinning');
  try {
    const printers = await api.list_printers();
    populatePrinterSelect($('#label-printer'), printers);
    populatePrinterSelect($('#list-printer'), printers);
    const hint = printers.length ? `${printers.length} impressora${printers.length === 1 ? '' : 's'} detectada${printers.length === 1 ? '' : 's'} neste computador. Confirme a escolha na janela de impressão.` : 'Nenhuma impressora detectada. Use a janela de impressão para escolher.';
    document.querySelectorAll('.printer-panel small').forEach(el => el.textContent = hint);
  } catch {}
  if (button) setTimeout(() => button.classList.remove('spinning'), 400);
}
document.querySelectorAll('[data-refresh-printer]').forEach(btn => btn.addEventListener('click', () => loadPrinters(btn)));
if (window.pywebview) loadPrinters();
window.addEventListener('pywebviewready', () => loadPrinters());

renderProducts();
