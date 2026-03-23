// Test page - Product menu demos (populated from menu-data.js)

function getAllMenuItems() {
  const items = [];
  const cats = MENU_DATA;
  for (const key of Object.keys(cats)) {
    const cat = cats[key];
    if (cat.sublines) {
      cat.sublines.forEach(sl => sl.items.forEach(i => items.push({ ...i, category: cat.title, icon: i.icon || cat.icon })));
    }
    if (cat.items) {
      cat.items.forEach(i => items.push({ ...i, category: cat.title, icon: i.icon || cat.icon }));
    }
  }
  return items;
}

function buildAccordion() {
  const container = document.getElementById('accordionMenu');
  if (!container) return;
  const keys = Object.keys(MENU_DATA);
  let first = true;
  keys.forEach(key => {
    const cat = MENU_DATA[key];
    const btn = document.createElement('button');
    btn.className = 'accordion-trigger' + (first ? ' active' : '');
    btn.textContent = `${cat.icon} ${cat.title}`;
    const content = document.createElement('div');
    content.className = 'accordion-content' + (first ? ' open' : '');
    const ul = document.createElement('ul');
    if (cat.sublines) {
      cat.sublines.forEach(sl => {
        sl.items.forEach(i => {
          const li = document.createElement('li');
          li.textContent = `${i.name} — ${i.pricing}`;
          ul.appendChild(li);
        });
      });
    } else if (cat.items) {
      cat.items.forEach(i => {
        const li = document.createElement('li');
        li.textContent = `${i.name} — ${i.pricing}`;
        ul.appendChild(li);
      });
    } else if (cat.desc) {
      const li = document.createElement('li');
      li.textContent = cat.desc;
      ul.appendChild(li);
    }
    if (cat.note) {
      const li = document.createElement('li');
      li.className = 'accordion-note';
      li.textContent = cat.note;
      ul.appendChild(li);
    }
    content.appendChild(ul);
    container.appendChild(btn);
    container.appendChild(content);
    first = false;
  });
}

function getPopularItems() {
  const items = getAllMenuItems();
  return items.slice(0, 6);
}

function buildTwoPanel() {
  const sidebar = document.getElementById('twopanelSidebar');
  const content = document.getElementById('twopanelContent');
  if (!sidebar || !content) return;

  const keys = Object.keys(MENU_DATA);
  let activeKey = keys[0];

  function showCategory(key) {
    activeKey = key;
    sidebar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.key === key));
    const cat = MENU_DATA[key];
    const grid = document.createElement('div');
    grid.className = 'twopanel-items';
    const addItem = (icon, name, pricing) => {
      const div = document.createElement('div');
      div.className = 'twopanel-item';
      div.innerHTML = `<div class="item-icon">${icon}</div><div class="item-name">${name}</div><div class="item-price">${pricing}</div>`;
      grid.appendChild(div);
    };
    if (cat.sublines) {
      cat.sublines.forEach(sl => sl.items.forEach(i => addItem(i.icon, i.name, i.pricing)));
    }
    if (cat.items) cat.items.forEach(i => addItem(i.icon, i.name, i.pricing));
    if (cat.note) {
      const n = document.createElement('div');
      n.className = 'accordion-note';
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

function buildFeatured() {
  const featSection = document.getElementById('featuredSection');
  const featCats = document.getElementById('featuredCategories');
  if (!featSection || !featCats) return;

  const popular = getPopularItems();
  featSection.innerHTML = `<div class="featured-label">✨ Popular picks</div><div class="featured-grid" id="featuredGrid"></div>`;
  const grid = document.getElementById('featuredGrid');
  popular.forEach(i => {
    const card = document.createElement('div');
    card.className = 'featured-card';
    card.innerHTML = `<div class="card-icon">${i.icon}</div><div class="card-name">${i.name}</div><div class="card-price">${i.pricing}</div>`;
    grid.appendChild(card);
  });

  const keys = Object.keys(MENU_DATA);
  keys.forEach(key => {
    const cat = MENU_DATA[key];
    const wrap = document.createElement('div');
    wrap.className = 'featured-cat';
    const header = document.createElement('button');
    header.className = 'featured-cat-header';
    header.innerHTML = `<span>${cat.icon} ${cat.title}</span><span class="cat-arrow">▾</span>`;
    const body = document.createElement('div');
    body.className = 'featured-cat-body';
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'featured-cat-items';
    const items = [];
    if (cat.sublines) cat.sublines.forEach(sl => items.push(...sl.items));
    if (cat.items) items.push(...cat.items);
    items.forEach(i => {
      const span = document.createElement('span');
      span.className = 'featured-cat-item';
      span.innerHTML = `<span class="item-name">${i.icon} ${i.name}</span> — <span class="item-price">${i.pricing}</span>`;
      itemsDiv.appendChild(span);
    });
    body.appendChild(itemsDiv);
    wrap.appendChild(header);
    wrap.appendChild(body);
    header.addEventListener('click', () => wrap.classList.toggle('open'));
    featCats.appendChild(wrap);
  });
}

function buildExpandableRows() {
  const container = document.getElementById('expandableRows');
  if (!container) return;

  const keys = Object.keys(MENU_DATA);
  keys.forEach(key => {
    const cat = MENU_DATA[key];
    const title = document.createElement('div');
    title.className = 'rows-section-title';
    title.textContent = `${cat.icon} ${cat.title}`;
    container.appendChild(title);

    const items = [];
    if (cat.sublines) cat.sublines.forEach(sl => items.push(...sl.items));
    if (cat.items) items.push(...cat.items);

    items.forEach(i => {
      const row = document.createElement('div');
      row.className = 'expandable-row';
      row.innerHTML = `
        <button class="row-trigger" type="button">
          <span class="row-icon">${i.icon}</span>
          <div class="row-main">
            <div class="row-name">${i.name}</div>
            <div class="row-price">${i.pricing}</div>
          </div>
          <span class="row-chevron">▾</span>
        </button>
        <div class="row-detail">
          <div class="row-desc">${i.desc || ''}</div>
          <button class="row-add" type="button">Add to cart</button>
        </div>
      `;
      const trigger = row.querySelector('.row-trigger');
      trigger.addEventListener('click', () => {
        row.classList.toggle('open');
      });
      container.appendChild(row);
    });
  });
}

function _deadCode() { if (1) return;
  const keys = [];
  keys.forEach((key, idx) => {
    const cat = MENU_DATA[key];
    const a = document.createElement('a');
    a.href = `#scroll-${key}`;
    a.textContent = `${cat.icon} ${cat.title}`;
    a.dataset.category = key;
    sidebar.appendChild(a);

    const section = document.createElement('div');
    section.id = `scroll-${key}`;
    section.className = 'scroll-section';
    const h4 = document.createElement('h4');
    h4.textContent = `${cat.icon} ${cat.title}`;
    section.appendChild(h4);
    const ul = document.createElement('ul');
    if (cat.sublines) {
      cat.sublines.forEach(sl => {
        sl.items.forEach(i => {
          const li = document.createElement('li');
          li.innerHTML = `<span>${i.name}</span><span class="item-price">${i.pricing}</span>`;
          ul.appendChild(li);
        });
      });
    } else if (cat.items) {
      cat.items.forEach(i => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${i.name}</span><span class="item-price">${i.pricing}</span>`;
        ul.appendChild(li);
      });
    }
    if (cat.note) {
      const li = document.createElement('li');
      li.className = 'accordion-note';
      li.textContent = cat.note;
      ul.appendChild(li);
    }
    section.appendChild(ul);
    main.appendChild(section);
  });

  main.addEventListener('scroll', () => {
    const sections = main.querySelectorAll('.scroll-section');
    let activeId = '';
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 100) activeId = s.id;
    });
    sidebar.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${activeId}`);
    });
  });
}

function buildBento() {
  const container = document.getElementById('bentoGrid');
  if (!container) return;

  const keys = Object.keys(MENU_DATA);
  keys.forEach((key, idx) => {
    const cat = MENU_DATA[key];
    const catCard = document.createElement('div');
    catCard.className = 'bento-category' + (idx === 0 ? ' large' : '');
    catCard.textContent = `${cat.icon} ${cat.title}`;
    container.appendChild(catCard);

    const items = [];
    if (cat.sublines) cat.sublines.forEach(sl => items.push(...sl.items));
    else if (cat.items) items.push(...cat.items);

    items.slice(0, idx === 0 ? 6 : 3).forEach(i => {
      const item = document.createElement('div');
      item.className = 'bento-item';
      item.innerHTML = `<div class="bento-name">${i.icon} ${i.name}</div><div class="bento-price">${i.pricing}</div>`;
      container.appendChild(item);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildAccordion();
  buildTwoPanel();
  buildFeatured();
  buildExpandableRows();

  // Accordion click handlers
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const wasActive = trigger.classList.contains('active');
      const content = trigger.nextElementSibling;

      document.querySelectorAll('.accordion-trigger').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));

      if (!wasActive) {
        trigger.classList.add('active');
        content?.classList.add('open');
      }
    });
  });
});
