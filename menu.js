// ===== MENU PAGE - Two-Panel Menu =====

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
    grid.className = 'twopanel-items';

    const addItem = (item, optionsBox = false, optionNum = null) => {
      const div = document.createElement('div');
      const isBundleSection = key === 'spookyBundles' || key === 'spookyBabyBundles';
      div.className = 'twopanel-item' + (isBundleSection ? ' twopanel-item--bundle' : '') + (optionsBox ? ' twopanel-item--option' : '');
      const formatBundleText = (s) => (isBundleSection && s) ? s.replace(/ · /g, '<br>') : (s || '');
      const desc = item.desc ? formatBundleText(item.desc) : '';
      const pricing = item.pricing ? formatBundleText(item.pricing) : '';
      const displayName = (optionNum != null ? `Option ${optionNum} — ` : '') + item.name;
      div.innerHTML = `<div class="item-icon">${item.icon}</div><div class="item-name">${displayName}</div>${desc ? `<div class="item-desc">${desc}</div>` : ''}<div class="item-price">${pricing || ''}</div><div class="item-actions"></div>`;
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
      cat.sublines.forEach(sl => {
        if (sl.optionsBox) {
          const box = document.createElement('div');
          box.className = 'twopanel-options-box';
          const subH = document.createElement('div');
          subH.className = 'twopanel-subline';
          subH.textContent = sl.name;
          box.appendChild(subH);
          const optionsGrid = document.createElement('div');
          optionsGrid.className = 'twopanel-options-grid';
          sl.items.forEach(i => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'twopanel-item twopanel-item--option' + (key === 'spookyBundles' || key === 'spookyBabyBundles' ? ' twopanel-item--bundle' : '');
            const formatBundleText = (s) => ((key === 'spookyBundles' || key === 'spookyBabyBundles') && s) ? s.replace(/ · /g, '<br>') : (s || '');
            const displayName = (i.optionNum != null ? `Option ${i.optionNum} — ` : '') + i.name;
            itemDiv.innerHTML = `<div class="item-icon">${i.icon}</div><div class="item-name">${displayName}</div>${i.desc ? `<div class="item-desc">${formatBundleText(i.desc)}</div>` : ''}<div class="item-price">${formatBundleText(i.pricing) || ''}</div><div class="item-actions"></div>`;
            const actions = itemDiv.querySelector('.item-actions');
            const a = document.createElement('a');
            const isHome = !window.location.pathname.includes('menu.html') && window.location.pathname !== '/menu';
            a.href = isHome ? '#order' : 'index.html#order';
            a.className = 'btn btn-pink add-to-cart-btn';
            a.textContent = 'Order';
            actions.appendChild(a);
            optionsGrid.appendChild(itemDiv);
          });
          box.appendChild(optionsGrid);
          grid.appendChild(box);
        } else {
          const subH = document.createElement('div');
          subH.className = 'twopanel-subline';
          subH.textContent = sl.name;
          grid.appendChild(subH);
          sl.items.forEach(i => addItem(i));
        }
      });
    }
    if (cat.items) {
      cat.items.forEach(i => addItem(i));
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
