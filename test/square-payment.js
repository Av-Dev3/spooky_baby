// Square payment integration for test page
(function() {
  const config = typeof SQUARE_CONFIG !== 'undefined' ? SQUARE_CONFIG : {};
  const appId = config.applicationId || '';
  const locationId = config.locationId || '';
  const isConfigured = appId && locationId && !appId.includes('YOUR_') && !locationId.includes('YOUR_');

  let card = null;
  let payments = null;

  async function initSquare() {
    if (!isConfigured || typeof Square === 'undefined') return false;
    try {
      payments = Square.payments(appId, locationId);
      card = await payments.card();
      await card.attach('#squareCardContainer');
      document.getElementById('squarePayBtn').disabled = false;
      return true;
    } catch (err) {
      console.error('Square card init error:', err);
      return false;
    }
  }

  async function processPayment() {
    const btn = document.getElementById('squarePayBtn');
    const msgEl = document.getElementById('squarePaymentMessage');
    if (!card || !btn) return;

    const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
    const totalCents = Math.round(cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) * 100);
    if (totalCents <= 0) {
      msgEl.textContent = 'Cart is empty';
      msgEl.className = 'square-payment-message error';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Processing...';
    msgEl.textContent = '';
    msgEl.className = 'square-payment-message';

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
          amount: totalCents,
          currency: 'USD',
          locationId: locationId
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Payment failed (${res.status})`);
      }

      msgEl.textContent = 'Payment successful!';
      msgEl.className = 'square-payment-message success';
      localStorage.removeItem('spookyCart');
      if (typeof refreshCartPanel === 'function') refreshCartPanel();
      btn.textContent = 'Pay with Card';

      setTimeout(() => {
        document.getElementById('squarePaymentSection').style.display = 'none';
        msgEl.textContent = '';
      }, 3000);
    } catch (err) {
      msgEl.textContent = err.message || 'Payment failed';
      msgEl.className = 'square-payment-message error';
      btn.disabled = false;
      btn.textContent = 'Pay with Card';
    }
  }

  function showOrHideSquareSection() {
    const section = document.getElementById('squarePaymentSection');
    const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
    const hasItems = cart.length > 0 && cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) > 0;
    const msgEl = document.getElementById('squarePaymentMessage');
    const cardContainer = document.getElementById('squareCardContainer');
    const payBtn = document.getElementById('squarePayBtn');

    if (!section) return;

    if (isConfigured) {
      section.style.display = 'block';
      if (hasItems) {
        if (msgEl) msgEl.textContent = '';
        if (payBtn) payBtn.style.display = 'block';
        if (cardContainer) cardContainer.style.display = 'block';
        if (!card) initSquare();
      } else {
        if (msgEl) { msgEl.textContent = 'Add items to cart to pay with Square'; msgEl.className = 'square-payment-message'; }
        if (payBtn) { payBtn.style.display = 'none'; payBtn.disabled = true; }
        if (cardContainer) cardContainer.style.display = 'none';
      }
    } else {
      section.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('squarePayBtn');
    if (btn) btn.addEventListener('click', processPayment);

    showOrHideSquareSection();
  });

  window.squareShowOrHide = showOrHideSquareSection;
})();
