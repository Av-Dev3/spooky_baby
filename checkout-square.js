// Square payment for checkout page - pay 50% deposit
(function() {
  const config = typeof SQUARE_CONFIG !== 'undefined' ? SQUARE_CONFIG : {};
  const appId = config.applicationId || '';
  const locationId = config.locationId || '';
  const isConfigured = appId && locationId && !appId.includes('YOUR_') && !locationId.includes('YOUR_');

  let card = null;
  let payments = null;

  function getTotalCents() {
    const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
    return Math.round(cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) * 100);
  }

  function getDepositCents() {
    return Math.round(getTotalCents() * 0.5);
  }

  async function initSquare() {
    if (!isConfigured || typeof Square === 'undefined') return false;
    try {
      payments = Square.payments(appId, locationId);
      card = await payments.card();
      await card.attach('#checkoutSquareCardContainer');
      const btn = document.getElementById('checkoutSquarePayBtn');
      if (btn) { btn.disabled = false; }
      return true;
    } catch (err) {
      console.error('Square card init error:', err);
      return false;
    }
  }

  function isFormValid() {
    const form = document.getElementById('checkoutForm');
    if (!form) return false;
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const delivery = form.querySelector('input[name="delivery"]:checked');
    if (!name || !name.value.trim()) return false;
    if (!email || !email.value.trim()) return false;
    if (!delivery) return false;
    if (delivery.value === 'delivery') {
      const addr = form.querySelector('#address');
      if (!addr || !addr.value.trim()) return false;
    }
    return true;
  }

  async function processDepositPayment() {
    const btn = document.getElementById('checkoutSquarePayBtn');
    const msgEl = document.getElementById('checkoutSquareMessage');
    const form = document.getElementById('checkoutForm');

    if (!card || !btn) return;

    if (!isFormValid()) {
      if (msgEl) { msgEl.textContent = 'Please fill in all required fields (name, email, pickup/delivery)'; msgEl.className = 'square-payment-message error'; }
      return;
    }

    const depositCents = getDepositCents();
    if (depositCents <= 0) {
      if (msgEl) { msgEl.textContent = 'Cart is empty'; msgEl.className = 'square-payment-message error'; }
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Processing...';
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'square-payment-message'; }

    try {
      const tokenResult = await card.tokenize();
      if (tokenResult.status !== 'OK') {
        throw new Error(tokenResult.errors?.[0]?.message || 'Tokenization failed');
      }

      const res = await fetch('/.netlify/functions/square-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          amount: depositCents,
          currency: 'USD',
          locationId: locationId
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Payment failed (${res.status})`);
      }

      if (msgEl) { msgEl.textContent = 'Deposit paid! Submitting order...'; msgEl.className = 'square-payment-message success'; }

      const notesField = form.querySelector('#notes');
      const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
      const cartSummary = cart.map(i => `• ${i.name} x${i.quantity} - $${((i.price||0)*(i.quantity||1)).toFixed(2)}`).join('\n');
      const total = cart.reduce((s,i) => s + (i.price||0)*(i.quantity||1), 0);
      const depositNote = `[50% deposit of $${(depositCents/100).toFixed(2)} paid via Square. Remaining $${(total - depositCents/100).toFixed(2)} due at pickup/delivery.]`;
      if (notesField) {
        notesField.value = (notesField.value ? notesField.value + '\n\n' : '') + 'Cart:\n' + cartSummary + '\n\nTotal: $' + total.toFixed(2) + '\n\n' + depositNote;
      }

      const cartDataField = form.querySelector('#cartData');
      if (cartDataField) cartDataField.value = JSON.stringify(cart);

      localStorage.removeItem('spookyCart');
      if (form.requestSubmit) {
        form.requestSubmit();
      } else {
        form.submit();
      }
    } catch (err) {
      if (msgEl) { msgEl.textContent = err.message || 'Payment failed'; msgEl.className = 'square-payment-message error'; }
      btn.disabled = false;
      updatePayButtonAmount();
    }
  }

  function updatePayButtonAmount() {
    const btn = document.getElementById('checkoutSquarePayBtn');
    if (!btn) return;
    const depositCents = getDepositCents();
    const depositDollars = (depositCents / 100).toFixed(2);
    btn.textContent = `Pay $${depositDollars} (50% deposit) & place order`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('checkoutSquareSection');
    if (!section) return;

    if (isConfigured && getTotalCents() > 0) {
      section.style.display = 'block';
      initSquare();
      updatePayButtonAmount();
    } else {
      section.style.display = 'none';
    }

    const btn = document.getElementById('checkoutSquarePayBtn');
    if (btn) btn.addEventListener('click', processDepositPayment);
  });
})();
