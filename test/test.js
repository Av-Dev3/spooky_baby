// Cart Test Page - Menu with working Add to Cart, Bundle config modal

function getItemIconHtml(item) {
  const base = (typeof window !== 'undefined' && window.location.pathname.includes('test')) ? '../' : '';
  if (item.image) {
    return `<img src="${base}${item.image}" alt="${(item.name || '').replace(/"/g, '&quot;')}" class="item-icon-img" onerror="this.style.display='none';var s=this.nextElementSibling;if(s)s.style.display='block';"><span class="item-icon-fallback" style="display:none">${item.icon || '🍬'}</span>`;
  }
  return `<span class="item-icon-emoji">${item.icon || '🍬'}</span>`;
}

// Parse pricing string into [{ label, price }] for buttons
function parsePricingOptions(pricingStr) {
    if (!pricingStr || /contact|custom|seasonal|availability|edition|time/i.test(pricingStr)) return [];
    const options = [];
    const segments = pricingStr.split(/\s*·\s*/);
    for (const seg of segments) {
        const trimmed = seg.trim();
        if (!trimmed || trimmed.includes('+$')) continue; // Skip add-on pricing
        // "6-Pack: $20" or "Individual: $3" or "Dozen: $35"
        const colonMatch = trimmed.match(/([^:]+):\s*\$(\d+)/);
        if (colonMatch) {
            options.push({ label: colonMatch[1].trim(), price: parseInt(colonMatch[2], 10) });
            continue;
        }
        // "$4 each" or "$36/dozen"
        const eachMatch = trimmed.match(/\$(\d+)\s*\/?\s*(each|dozen)/i);
        if (eachMatch) {
            const unit = eachMatch[2].toLowerCase() === 'dozen' ? 'Dozen' : 'Each';
            options.push({ label: unit, price: parseInt(eachMatch[1], 10) });
            continue;
        }
        // "$45" or "$120" standalone
        const simpleMatch = trimmed.match(/\$(\d+)/);
        if (simpleMatch && !trimmed.includes('+')) {
            options.push({ label: 'Add', price: parseInt(simpleMatch[1], 10) });
        }
    }
    return options;
}

const BOX_RULES = {
    'Treat Box': { price: 65, choicesCount: 2, maxOptionNum: 7 },
    'Party Box': { price: 95, choicesCount: 3, maxOptionNum: 8 },
    'Dessert Table': { price: 130, choicesCount: 4, maxOptionNum: 8 }
};

function getByTheDozenOptions() {
    const cat = MENU_DATA?.spookyBabyBundles;
    const opts = cat?.sublines?.[1]?.items?.[0]?.options;
    return opts || [
        { name: 'Dipped Oreos', optionNum: 1 }, { name: 'Dipped Rice Krispies', optionNum: 2 },
        { name: 'Dipped Pretzel Rods', optionNum: 3 }, { name: 'Dipped Caramel Pretzel Rods', optionNum: 4 },
        { name: 'Chocolate Strawberries', optionNum: 5 }, { name: 'Cake Pops', optionNum: 6 },
        { name: 'Cupcakes', optionNum: 7 }, { name: 'Cake-sicles', optionNum: 8 }
    ];
}

function buildTestMenu() {
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
                div.className = 'twopanel-item twopanel-item--bundle twopanel-item--options-card twopanel-item--baby-dozen';
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
                a.href = '../index.html#order';
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
            div.innerHTML = `
                <div class="item-icon">${getItemIconHtml(item)}</div>
                <div class="item-name">${item.name}</div>
                ${desc ? `<div class="item-desc">${desc}</div>` : ''}
                <div class="item-price">${pricing || ''}</div>
                <div class="item-actions"></div>
            `;
            const actions = div.querySelector('.item-actions');

            const addOrderBtn = () => {
                const a = document.createElement('a');
                a.href = '../index.html#order';
                a.className = 'btn btn-pink add-to-cart-btn';
                a.textContent = 'Order';
                actions.appendChild(a);
            };

            const isSpookyBabyBox = key === 'spookyBabyBundles' && layoutRole === 'box' && BOX_RULES[item.name];
            if (isSpookyBabyBox) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-yellow add-to-cart-btn';
                btn.textContent = 'Add to Cart';
                btn.addEventListener('click', () => openBundleModal(item));
                actions.appendChild(btn);
                addOrderBtn();
            } else if (item.cart && typeof window.addToCart === 'function') {
                item.cart.forEach(c => {
                    const label = c.name.includes('6-Pack') ? '6-Pack' : c.name.includes('Dozen') ? 'Dozen' : 'Add';
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-yellow add-to-cart-btn';
                    btn.textContent = 'Add ' + label;
                    btn.addEventListener('click', () => addToCartAndRefresh({
                        name: c.name,
                        description: item.desc || '',
                        price: c.price,
                        icon: item.icon,
                        category: key
                    }));
                    actions.appendChild(btn);
                });
                addOrderBtn();
            } else {
                const priceOptions = parsePricingOptions(item.pricing);
                if (priceOptions.length > 0) {
                    priceOptions.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'btn btn-yellow add-to-cart-btn';
                        btn.textContent = opt.label === 'Add' ? 'Add to Cart' : `Add ${opt.label}`;
                        btn.addEventListener('click', () => addToCartAndRefresh({
                            name: `${item.name} (${opt.label})`,
                            description: item.desc || '',
                            price: opt.price,
                            icon: item.icon,
                            category: key
                        }));
                        actions.appendChild(btn);
                    });
                }
                addOrderBtn();
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

function addToCartAndRefresh(item) {
    if (typeof window.addToCart === 'function') {
        window.addToCart(item);
    }
    refreshCartPanel();
}

function refreshCartPanel() {
    const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
    const empty = document.getElementById('cartEmpty');
    const list = document.getElementById('cartItemsList');
    const countEl = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotal');

    if (cart.length === 0) {
        empty.style.display = 'block';
        list.style.display = 'none';
        countEl.textContent = '0 items';
        totalEl.textContent = '$0.00';
        return;
    }

    empty.style.display = 'none';
    list.style.display = 'block';
    const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    countEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    let total = 0;
    list.innerHTML = cart.map(item => {
        const qty = item.quantity || 1;
        const sub = (item.price || 0) * qty;
        total += sub;
        return `
            <div class="cart-panel-item">
                <div>
                    <div class="cart-panel-item-name">${item.icon || '🍬'} ${item.name}</div>
                    ${item.description ? `<div class="cart-panel-item-desc">${item.description}</div>` : ''}
                </div>
                <div class="cart-panel-item-qty">${qty} × $${(item.price || 0).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    totalEl.textContent = `$${total.toFixed(2)}`;
}

function openBundleModal(boxItem) {
    const rules = BOX_RULES[boxItem.name];
    if (!rules) return;

    const modal = document.getElementById('bundleModal');
    const title = document.getElementById('bundleModalTitle');
    const boxInfo = document.getElementById('bundleBoxInfo');
    const pickLabel = document.getElementById('bundlePickLabel');
    const optionsContainer = document.getElementById('bundleOptions');
    const errorEl = document.getElementById('bundleModalError');

    title.textContent = boxItem.name;
    boxInfo.textContent = `${boxItem.icon} ${boxItem.name} — $${rules.price}`;
    pickLabel.textContent = `Pick ${rules.choicesCount} items`;
    errorEl.style.display = 'none';

    const allOptions = getByTheDozenOptions();
    const allowed = allOptions.filter(o => o.optionNum <= rules.maxOptionNum);
    optionsContainer.innerHTML = allowed.map(o => `
        <label class="bundle-option" data-value="${o.name}">
            <input type="checkbox" class="bundle-option-cb" value="${o.name}">
            <span>${o.name}</span>
        </label>
    `).join('');

    modal.classList.add('open');
    modal._config = { boxItem, rules };
}

function closeBundleModal() {
    document.getElementById('bundleModal').classList.remove('open');
}

function addBundleToCart() {
    const modal = document.getElementById('bundleModal');
    const config = modal._config;
    if (!config) return;

    const { boxItem, rules } = config;
    const checkboxes = modal.querySelectorAll('.bundle-option-cb:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    const errorEl = document.getElementById('bundleModalError');

    if (selected.length !== rules.choicesCount) {
        errorEl.textContent = `Please select exactly ${rules.choicesCount} items`;
        errorEl.style.display = 'block';
        return;
    }

    const description = `Includes: ${selected.join(', ')}`;
    const name = `${boxItem.name} (${selected.join(', ')})`;
    addToCartAndRefresh({
        name,
        description,
        price: rules.price,
        icon: boxItem.icon,
        category: 'spookyBabyBundles'
    });
    closeBundleModal();
}

document.addEventListener('DOMContentLoaded', () => {
    buildTestMenu();
    refreshCartPanel();

    document.getElementById('bundleModalClose')?.addEventListener('click', closeBundleModal);
    document.querySelector('.bundle-modal-backdrop')?.addEventListener('click', closeBundleModal);
    document.getElementById('bundleModalAdd')?.addEventListener('click', addBundleToCart);

    document.getElementById('bundleOptions')?.addEventListener('change', (e) => {
        if (!e.target.classList.contains('bundle-option-cb')) return;
        const modal = document.getElementById('bundleModal');
        const config = modal._config;
        if (!config) return;
        const checked = modal.querySelectorAll('.bundle-option-cb:checked').length;
        modal.querySelectorAll('.bundle-option').forEach(opt => {
            const cb = opt.querySelector('.bundle-option-cb');
            const isChecked = cb.checked;
            if (checked >= config.rules.choicesCount && !isChecked) {
                opt.classList.add('disabled');
                cb.disabled = true;
            } else {
                opt.classList.remove('disabled');
                cb.disabled = false;
            }
        });
    });
});
