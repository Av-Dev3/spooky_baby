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

function getItemsByBand() {
  const bands = {
    quick: { title: 'Quick bites ($3–4 each)', items: [] },
    shareable: { title: 'Shareable (6-packs & dozens)', items: [] },
    custom: { title: 'Custom & seasonal', items: [] }
  };
  const items = getAllMenuItems();
  items.forEach(i => {
    const p = (i.pricing || '').toLowerCase();
    if (p.includes('$3') || p.includes('individual') || p.includes('$4 each')) {
      bands.quick.items.push(i);
    } else if (p.includes('6-pack') || p.includes('dozen') || p.includes('$18') || p.includes('$20') || p.includes('$30') || p.includes('$32') || p.includes('$35') || p.includes('$36')) {
      bands.shareable.items.push(i);
    } else {
      bands.custom.items.push(i);
    }
  });
  return bands;
}

function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  const prev = document.getElementById('carouselPrev');
  const next = document.getElementById('carouselNext');
  if (!track) return;

  const keys = Object.keys(MENU_DATA);
  keys.forEach((key, idx) => {
    const cat = MENU_DATA[key];
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const h4 = document.createElement('h4');
    h4.textContent = `${cat.icon} ${cat.title}`;
    slide.appendChild(h4);
    const ul = document.createElement('ul');
    if (cat.sublines) {
      cat.sublines.forEach(sl => sl.items.forEach(i => {
        const li = document.createElement('li');
        li.textContent = `${i.name} — ${i.pricing}`;
        ul.appendChild(li);
      }));
    } else if (cat.items) {
      cat.items.forEach(i => {
        const li = document.createElement('li');
        li.textContent = `${i.name} — ${i.pricing}`;
        ul.appendChild(li);
      });
    }
    if (cat.note) {
      const li = document.createElement('li');
      li.className = 'accordion-note';
      li.textContent = cat.note;
      ul.appendChild(li);
    }
    slide.appendChild(ul);
    track.appendChild(slide);
  });

  let idx = 0;
  const update = () => {
    track.style.transform = `translateX(-${idx * 100}%)`;
  };
  prev?.addEventListener('click', () => {
    idx = Math.max(0, idx - 1);
    update();
  });
  next?.addEventListener('click', () => {
    idx = Math.min(keys.length - 1, idx + 1);
    update();
  });
}

function buildPriceBands() {
  const container = document.getElementById('pricebands');
  if (!container) return;
  const bands = getItemsByBand();
  ['quick', 'shareable', 'custom'].forEach(key => {
    const band = bands[key];
    if (band.items.length === 0) return;
    const div = document.createElement('div');
    div.className = 'priceband';
    div.innerHTML = `<div class="priceband-header">${band.title}</div><ul class="priceband-items"></ul>`;
    const ul = div.querySelector('ul');
    band.items.forEach(i => {
      const li = document.createElement('li');
      li.textContent = `${i.icon} ${i.name} — ${i.pricing}`;
      ul.appendChild(li);
    });
    container.appendChild(div);
  });
}

function buildTable() {
  const table = document.getElementById('menuTable');
  if (!table) return;

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Item</th><th>Price</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  const keys = Object.keys(MENU_DATA);
  keys.forEach(key => {
    const cat = MENU_DATA[key];
    const catRow = document.createElement('tr');
    catRow.className = 'category-row';
    catRow.innerHTML = `<td colspan="2">${cat.icon} ${cat.title}</td>`;
    tbody.appendChild(catRow);

    const addItem = (name, pricing) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${name}</td><td>${pricing}</td>`;
      tbody.appendChild(tr);
    };
    if (cat.sublines) {
      cat.sublines.forEach(sl => {
        sl.items.forEach(i => addItem(`${i.icon} ${i.name}`, i.pricing));
      });
    }
    if (cat.items) {
      cat.items.forEach(i => addItem(`${i.icon} ${i.name}`, i.pricing));
    }
    if (cat.note) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="2" class="accordion-note">${cat.note}</td>`;
      tbody.appendChild(tr);
    }
  });
  table.appendChild(tbody);
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
  buildCarousel();
  buildPriceBands();
  buildTable();

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
