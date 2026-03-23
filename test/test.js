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

function buildHorizontalScroll() {
  const container = document.getElementById('horizontalScroll');
  if (!container) return;
  Object.keys(MENU_DATA).forEach(key => {
    const cat = MENU_DATA[key];
    const card = document.createElement('div');
    card.className = 'scroll-card scroll-card-expand';
    const title = document.createElement('div');
    title.className = 'scroll-card-title';
    title.textContent = `${cat.icon} ${cat.title}`;
    card.appendChild(title);
    const list = document.createElement('div');
    list.className = 'scroll-card-items';
    if (cat.sublines) {
      cat.sublines.forEach(sl => {
        sl.items.forEach(i => {
          const p = document.createElement('p');
          p.textContent = `${i.name} — ${i.pricing}`;
          list.appendChild(p);
        });
      });
    } else if (cat.items) {
      cat.items.forEach(i => {
        const p = document.createElement('p');
        p.textContent = `${i.name} — ${i.pricing}`;
        list.appendChild(p);
      });
    } else if (cat.desc) {
      const p = document.createElement('p');
      p.textContent = cat.desc;
      list.appendChild(p);
    }
    if (cat.note) {
      const p = document.createElement('p');
      p.className = 'scroll-card-note';
      p.textContent = cat.note;
      list.appendChild(p);
    }
    card.appendChild(list);
    container.appendChild(card);
  });
}

function buildChalkboard() {
  const container = document.getElementById('chalkboardMenu');
  if (!container) return;
  const h4 = document.createElement('h4');
  h4.textContent = "Spooky Baby's Sweet Menu";
  container.appendChild(h4);
  const ul = document.createElement('ul');
  ul.className = 'chalk-list';
  getAllMenuItems().forEach(i => {
    const li = document.createElement('li');
    li.textContent = `${i.icon} ${i.name} — ${i.pricing}`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
  const footer = document.createElement('p');
  footer.className = 'chalk-footer';
  footer.textContent = 'Custom orders available ✨ More flavors & seasonal items!';
  container.appendChild(footer);
}

function buildFlipCards() {
  const container = document.getElementById('flipGrid');
  if (!container) return;
  const items = getAllMenuItems();
  items.forEach(i => {
    const card = document.createElement('div');
    card.className = 'flip-card';
    const inner = document.createElement('div');
    inner.className = 'flip-inner';
    const front = document.createElement('div');
    front.className = 'flip-front';
    front.textContent = `${i.icon} ${i.name}`;
    const back = document.createElement('div');
    back.className = 'flip-back';
    const p = document.createElement('p');
    p.textContent = i.pricing;
    const desc = document.createElement('span');
    desc.className = 'flip-desc';
    desc.textContent = i.desc;
    const btn = document.createElement('button');
    btn.className = 'flip-btn';
    btn.textContent = 'Add to Cart';
    back.appendChild(p);
    back.appendChild(desc);
    back.appendChild(btn);
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildAccordion();
  buildHorizontalScroll();
  buildChalkboard();
  buildFlipCards();

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
