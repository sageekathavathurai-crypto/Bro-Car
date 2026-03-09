'use strict';

let cars = JSON.parse(localStorage.getItem('brocars') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  bindScroll();
});

function toggleMob() {
  document.getElementById('mobNav')?.classList.toggle('open');
  document.getElementById('ham')?.classList.toggle('open');
}
function closeMob() {
  document.getElementById('mobNav')?.classList.remove('open');
  document.getElementById('ham')?.classList.remove('open');
}
function bindScroll() {
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    const st = document.getElementById('scrollTop');
    if (window.scrollY > 60) { nb?.classList.add('scrolled'); st?.classList.add('show'); }
    else                      { nb?.classList.remove('scrolled'); st?.classList.remove('show'); }
  });
}

/* ── Price Format (Indian) ── */
function fmtPrice(p) {
  if (!p) return 'Price on Request';
  const n = Number(p);
  if (n >= 10000000) return '\u20b9' + (n/10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '\u20b9' + (n/100000).toFixed(2) + ' L';
  return '\u20b9' + n.toLocaleString('en-IN');
}

/* ── Car Card ── */
function cardHTML(car, i) {
  const isSold = car.status === 'sold';
  const isNew  = car.cond === 'new';

  // Condition badge
  const condLabel = isNew ? 'NEW' : 'USED';
  const condClass = isNew ? 'b-new' : 'b-used';

  // Status badge — AVAILABLE green / SOLD red — big & clear
  const statusBadge = isSold
    ? '<div class="status-badge status-sold"><i class="fa-solid fa-circle-xmark"></i> SOLD</div>'
    : '<div class="status-badge status-available"><i class="fa-solid fa-circle-check"></i> AVAILABLE</div>';

  // Sold overlay
  const soldOverlay = isSold
    ? '<div class="sold-overlay"><span>SOLD</span></div>'
    : '';

  const img = car.img
    ? '<img src="' + esc(car.img) + '" alt="' + esc(car.brand) + ' ' + esc(car.name) + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
    : '';
  const noImg = '<div class="car-no-img"' + (car.img ? ' style="display:none"' : '') + '>🚘</div>';

  const specs = [
    car.km    ? '<span class="spec"><i class="fa-solid fa-gauge-high"></i>' + esc(car.km)    + '</span>' : '',
    car.trans ? '<span class="spec"><i class="fa-solid fa-gear"></i>'       + esc(car.trans) + '</span>' : '',
    car.fuel  ? '<span class="spec"><i class="fa-solid fa-gas-pump"></i>'   + esc(car.fuel)  + '</span>' : '',
    car.color ? '<span class="spec"><i class="fa-solid fa-palette"></i>'    + esc(car.color) + '</span>' : '',
  ].filter(Boolean).join('');

  const enquireBtn = isSold
    ? '<button class="btn btn-sm" style="background:#333;color:#777;cursor:not-allowed;border:1px solid #444;" disabled>Sold Out</button>'
    : '<button class="btn btn-outline-red btn-sm" onclick="enquire(\'' + esc(car.brand) + ' ' + esc(car.name) + '\')"><i class="fa-brands fa-whatsapp"></i> Enquire</button>';

  return '<div class="car-card' + (isSold ? ' card-sold' : '') + '" style="animation-delay:' + ((i%12)*.05) + 's">'
    + '<div class="car-img-wrap">'
    + img + noImg + soldOverlay
    + '<div class="year-badge">' + esc(String(car.year||'')) + '</div>'
    + '<div class="cond-badge ' + condClass + '">' + condLabel + '</div>'
    + '</div>'
    + '<div class="car-body">'
    + statusBadge
    + '<div class="car-heading"><span class="car-make">' + esc(car.brand||'') + '</span><span class="car-model">' + esc(car.name||'') + '</span></div>'
    + '<div class="car-specs">' + specs + '</div>'
    + (car.desc ? '<p style="font-size:.8rem;color:var(--silver-dk);line-height:1.6;margin-bottom:.8rem;">' + esc(car.desc.slice(0,90)) + (car.desc.length>90?'...':'') + '</p>' : '')
    + '<div class="car-footer">'
    + '<div><div class="car-price">' + (isSold ? '<span style="color:#666;font-size:1rem;">SOLD</span>' : fmtPrice(car.price)) + '</div>'
    + (!isSold ? '<div class="price-note">Negotiable</div>' : '') + '</div>'
    + enquireBtn
    + '</div></div></div>';
}

/* ── Render Inventory ── */
function renderInv() {
  const search = (document.getElementById('f-search')?.value  || '').toLowerCase();
  const cond   =  document.getElementById('f-cond')?.value    || '';
  const fuel   =  document.getElementById('f-fuel')?.value    || '';
  const trans  =  document.getElementById('f-trans')?.value   || '';
  const sort   =  document.getElementById('f-sort')?.value    || 'newest';
  const status =  document.getElementById('f-status')?.value  || '';

  let list = cars.filter(c =>
    (!search || (c.brand + ' ' + c.name).toLowerCase().includes(search)) &&
    (!cond   || c.cond   === cond)   &&
    (!fuel   || c.fuel   === fuel)   &&
    (!trans  || c.trans  === trans)  &&
    (!status || c.status === status)
  );

  if      (sort==='price-low')  list.sort((a,b)=>+a.price-+b.price);
  else if (sort==='price-high') list.sort((a,b)=>+b.price-+a.price);
  else if (sort==='year')       list.sort((a,b)=>+b.year-+a.year);
  else                          list.sort((a,b)=>b.id-a.id);

  const countEl = document.getElementById('inv-count');
  if (countEl) countEl.textContent = list.length + ' car' + (list.length!==1?'s':'');

  const grid = document.getElementById('invGrid');
  if (!grid) return;

  grid.innerHTML = list.length
    ? list.map((c,i)=>cardHTML(c,i)).join('')
    : '<div class="empty-state"><div class="ei">' + (cars.length?'🔍':'🚗') + '</div>'
      + '<p>' + (cars.length?'No cars match your search.':'No cars listed yet.') + '</p></div>';
}

/* ── Featured (Home page) ── */
function cardHTMLFeatured(car, i) {
  const isSold = car.status === 'sold';
  const img = car.img
    ? '<img src="' + esc(car.img) + '" alt="' + esc(car.brand) + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
    : '';
  const noImg = '<div class="car-no-img"' + (car.img ? ' style="display:none"' : '') + '>🚘</div>';
  const soldOverlay = isSold ? '<div class="sold-overlay"><span>SOLD</span></div>' : '';
  const specs = [
    car.km    ? '<span class="spec"><i class="fa-solid fa-gauge-high"></i>' + esc(car.km)    + '</span>' : '',
    car.trans ? '<span class="spec"><i class="fa-solid fa-gear"></i>'       + esc(car.trans) + '</span>' : '',
    car.fuel  ? '<span class="spec"><i class="fa-solid fa-gas-pump"></i>'   + esc(car.fuel)  + '</span>' : '',
  ].filter(Boolean).join('');

  const statusBadge = isSold
    ? '<div class="status-badge status-sold"><i class="fa-solid fa-circle-xmark"></i> SOLD</div>'
    : '<div class="status-badge status-available"><i class="fa-solid fa-circle-check"></i> AVAILABLE</div>';

  return '<div class="car-card' + (isSold?' card-sold':'') + '" style="animation-delay:' + (i*.07) + 's">'
    + '<div class="car-img-wrap">' + img + noImg + soldOverlay
    + '<div class="year-badge">' + esc(String(car.year||'')) + '</div>'
    + '</div>'
    + '<div class="car-body">'
    + statusBadge
    + '<div class="car-heading"><span class="car-make">' + esc(car.brand||'') + '</span><span class="car-model">' + esc(car.name||'') + '</span></div>'
    + '<div class="car-specs">' + specs + '</div>'
    + '<div class="car-footer"><div><div class="car-price">' + (isSold?'<span style="color:#666;font-size:1rem;">SOLD</span>':fmtPrice(car.price)) + '</div>'
    + (!isSold?'<div class="price-note">Negotiable</div>':'') + '</div>'
    + (!isSold?'<button class="btn btn-outline-red btn-sm" onclick="enquire(\''+esc(car.brand)+' '+esc(car.name)+'\')"><i class="fa-brands fa-whatsapp"></i> Enquire</button>':'<span style="font-size:.75rem;color:#555;font-family:var(--font-ui);letter-spacing:1px;">NOT AVAILABLE</span>')
    + '</div></div></div>';
}

/* ── Enquiry ── */
function enquire(name) {
  const msg = 'Hi Bro Cars! I am interested in the ' + name + '. Please share more details.';
  window.open('https://wa.me/+77 123 4321?text=' + encodeURIComponent(msg), '_blank');
}
function sendEnquiry() {
  const name  = document.getElementById('cf-name')?.value.trim();
  const phone = document.getElementById('cf-phone')?.value.trim();
  if (!name||!phone) { toast('Name and phone are required!','t-err'); return; }
  const lines = [
    'Hi Bro Cars! My name is ' + name + ' (' + phone + ').',
    'Interest: ' + (document.getElementById('cf-interest')?.value||''),
    document.getElementById('cf-car')?.value ? 'Car: '+document.getElementById('cf-car').value : '',
    document.getElementById('cf-msg')?.value||''
  ].filter(Boolean).join('\n');
  window.open('https://wa.me/+77 123 4321?text='+encodeURIComponent(lines),'_blank');
  toast('Opening WhatsApp...','t-ok');
}

/* ── Toast ── */
function toast(msg,cls) {
  const w=document.getElementById('toastWrap'); if(!w)return;
  const t=document.createElement('div');
  t.className='toast '+(cls||''); t.textContent=msg; w.appendChild(t);
  setTimeout(()=>{t.classList.add('t-out');setTimeout(()=>t.remove(),320);},3200);
}

/* ── XSS ── */
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}