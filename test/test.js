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

function buildTabs() {
  const bar = document.getElementById('tabsBar');
  const content = document.getElementById('tabsContent');
  if (!bar || !content) return;

  const keys = Object.keys(MENU_DATA);
  keys.forEach((key, idx) => {
    const cat = MENU_DATA[key];
    const btn = document.createElement('button');
    btn.textContent = `${cat.icon} ${cat.title}`;
    btn.dataset.category = key;
    bar.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'tabs-panel' + (idx === 0 ? ' active' : '');
    panel.dataset.category = key;
    const grid = document.createElement('div');
    grid.className = 'tabs-grid';
    if (cat.sublines) {
      cat.sublines.forEach(sl => {
        sl.items.forEach(i => {
          const item = document.createElement('div');
          item.className = 'tabs-grid-item';
          item.innerHTML = `<span class="item-name">${i.icon} ${i.name}</span><span class="item-pricing">${i.pricing}</span>`;
          grid.appendChild(item);
        });
      });
    } else if (cat.items) {
      cat.items.forEach(i => {
        const item = document.createElement('div');
        item.className = 'tabs-grid-item';
        item.innerHTML = `<span class="item-name">${i.icon} ${i.name}</span><span class="item-pricing">${i.pricing}</span>`;
        grid.appendChild(item);
      });
    }
    if (cat.note) {
      const note = document.createElement('div');
      note.className = 'tabs-grid-item accordion-note';
      note.textContent = cat.note;
      note.style.marginTop = '0.5rem';
      grid.appendChild(note);
    }
    panel.appendChild(grid);
    content.appendChild(panel);
  });
}

function buildScrollSidebar() {
  const sidebar = document.getElementById('scrollSidebar');
  const main = document.getElementById('scrollMain');
  if (!sidebar || !main) return;

  const keys = Object.keys(MENU_DATA);
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
  buildTabs();
  buildScrollSidebar();
  buildBento();

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

  // Tabs click handlers
  const tabsBar = document.getElementById('tabsBar');
  const tabsContent = document.getElementById('tabsContent');
  if (tabsBar) {
    tabsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const cat = btn.dataset.category;
      tabsBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabsContent.querySelectorAll('.tabs-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.category === cat);
      });
    });
  }

  // Scroll sidebar anchor clicks
  document.getElementById('scrollSidebar')?.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !a.hash) return;
    e.preventDefault();
    const target = document.querySelector(a.hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
