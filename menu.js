// ===== MENU PAGE - Two-Panel Menu =====

function getItemIconHtml(item) {
  const base = (typeof window !== 'undefined' && window.location.pathname.includes('test')) ? '../' : '';
  if (item.image) {
    const fallback = (item.icon || '🍬').replace(/'/g, "\\'");
    return `<img src="${base}${item.image}" alt="${(item.name || '').replace(/"/g, '&quot;')}" class="item-icon-img" onerror="this.style.display='none';var s=this.nextElementSibling;if(s)s.style.display='block';"><span class="item-icon-fallback" style="display:none">${item.icon || '🍬'}</span>`;
  }
  return `<span class="item-icon-emoji">${item.icon || '🍬'}</span>`;
}

function buildTwoPanel() {
  const sidebar = document.getElementById('twopanelSidebar');
  const content = document.getElementById('twopanelContent');
  if (!sidebar || !content || typeof MENU_DATA === 'undefined') return;

  const keys = Object.keys(MENU_DATA);
  let activeKey = keys[0];

  function showCategory(key) {
    activeKey = key;
    sidebar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.key === key));

    const cat = MENU_DATA[key];
    const grid = document.createElement('div');
    grid.className = 'twopanel-items' + (key === 'spookyBabyBundles' ? ' twopanel-items--baby' : '');

    const addItem = (item, layoutRole = null) => {
      if (item.options) {
        const div = document.createElement('div');
        div.className = 'twopanel-item twopanel-item--bundle twopanel-item--options-card' + (key === 'spookyBabyBundles' ? ' twopanel-item--baby-dozen' : '');
        const optsHtml = item.options.map(o => {
          const label = (o.optionNum != null ? `Option ${o.optionNum} — ` : '') + o.name;
          return `<div class="option-line"><span class="option-label">${o.icon} ${label}</span><span class="option-price">${o.pricing || ''}</span></div>`;
        }).join('');
        div.innerHTML = `
          <div class="item-icon">${getItemIconHtml(item)}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-options-list">${optsHtml}</div>
          <div class="item-actions"></div>
        `;
        const a = document.createElement('a');
        const isHome = !window.location.pathname.includes('menu.html') && window.location.pathname !== '/menu';
        a.href = isHome ? '#order' : 'index.html#order';
        a.className = 'btn btn-pink add-to-cart-btn';
        a.textContent = 'Order';
        div.querySelector('.item-actions').appendChild(a);
        grid.appendChild(div);
        return;
      }
      const div = document.createElement('div');
      const isBundleSection = key === 'spookyBundles' || key === 'spookyBabyBundles';
      let extraClass = isBundleSection ? ' twopanel-item--bundle' : '';
      if (layoutRole) extraClass += ' twopanel-item--baby-' + layoutRole;
      div.className = 'twopanel-item' + extraClass;
      const formatBundleText = (s) => (isBundleSection && s) ? s.replace(/ · /g, '<br>') : (s || '');
      const desc = item.desc ? formatBundleText(item.desc) : '';
      const pricing = item.pricing ? formatBundleText(item.pricing) : '';
      div.innerHTML = `<div class="item-icon">${getItemIconHtml(item)}</div><div class="item-name">${item.name}</div>${desc ? `<div class="item-desc">${desc}</div>` : ''}<div class="item-price">${pricing || ''}</div><div class="item-actions"></div>`;
      const actions = div.querySelector('.item-actions');

      if (item.cart && typeof addToCart === 'function') {
        item.cart.forEach(c => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-yellow add-to-cart-btn';
          btn.textContent = c.name.includes('6-Pack') ? 'Add 6-Pack' : 'Add Dozen';
          btn.addEventListener('click', () => addToCart({
            name: c.name,
            description: item.desc || '',
            price: c.price,
            icon: item.icon,
            category: key
          }));
          actions.appendChild(btn);
        });
      } else {
        const a = document.createElement('a');
        const isHome = !window.location.pathname.includes('menu.html') && window.location.pathname !== '/menu';
        a.href = isHome ? '#order' : 'index.html#order';
        a.className = 'btn btn-pink add-to-cart-btn';
        a.textContent = 'Order';
        actions.appendChild(a);
      }
      grid.appendChild(div);
    };

    if (cat.sublines) {
      cat.sublines.forEach((sl, slIdx) => {
        const subH = document.createElement('div');
        subH.className = 'twopanel-subline';
        subH.textContent = sl.name;
        grid.appendChild(subH);
        const role = key === 'spookyBabyBundles' ? (slIdx === 0 ? 'box' : 'dozen') : null;
        sl.items.forEach(i => addItem(i, role));
      });
    }
    if (cat.items) {
      cat.items.forEach(i => addItem(i, key === 'spookyBabyBundles' ? 'upgrades' : null));
    }
    if (cat.note) {
      const n = document.createElement('div');
      n.className = 'twopanel-note';
      n.textContent = cat.note;
      grid.appendChild(n);
    }

    content.innerHTML = '';
    content.appendChild(grid);
  }

  keys.forEach(key => {
    const cat = MENU_DATA[key];
    const btn = document.createElement('button');
    btn.textContent = `${cat.icon} ${cat.title}`;
    btn.dataset.key = key;
    btn.classList.toggle('active', key === activeKey);
    btn.addEventListener('click', () => showCategory(key));
    sidebar.appendChild(btn);
  });

  showCategory(activeKey);
}

// Hero animation & year
function animateHero() {
  const words = document.querySelectorAll('.word-animate');
  words.forEach((word, i) => {
    const delay = word.dataset.delay || i * 100;
    setTimeout(() => word.classList.add('animate'), delay);
  });
  document.querySelectorAll('.hero-btn-animate').forEach((btn, i) => {
    setTimeout(() => btn.classList.add('animate'), (btn.dataset.delay || 1200) + i * 100);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildTwoPanel();
  animateHero();
  const y = document.getElementById('currentYear');
  if (y) y.textContent = new Date().getFullYear();
});
