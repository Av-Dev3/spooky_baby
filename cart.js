// ===== CART PAGE JAVASCRIPT =====

class CartPage {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.displayCart();
        this.animateHero();
        this.setCurrentYear();
    }
    
    setupEventListeners() {
        // Clear cart button
        document.getElementById('clearCart')?.addEventListener('click', () => {
            this.clearCart();
        });
        
        // Checkout button
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.proceedToCheckout();
        });
    }
    
    loadCart() {
        const cartData = localStorage.getItem('spookyCart');
        return cartData ? JSON.parse(cartData) : [];
    }
    
    saveCart() {
        localStorage.setItem('spookyCart', JSON.stringify(this.cart));
    }
    
    displayCart() {
        const emptyCart = document.getElementById('emptyCart');
        const cartItems = document.getElementById('cartItems');
        const cartItemsList = document.getElementById('cartItemsList');
        
        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
            return;
        }
        
        emptyCart.style.display = 'none';
        cartItems.style.display = 'block';
        
        // Clear existing items
        cartItemsList.innerHTML = '';
        
        // Display cart items
        this.cart.forEach((item, index) => {
            const cartItem = this.createCartItem(item, index);
            cartItemsList.appendChild(cartItem);
        });
        
        this.updateTotals();
    }
    
    createCartItem(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-icon">${item.icon}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-description">${item.description}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="cartPage.updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartPage.updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="cartPage.removeItem(${index})" title="Remove item">🗑️</button>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        return cartItem;
    }
    
    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.removeItem(index);
            return;
        }
        
        this.saveCart();
        this.displayCart();
    }
    
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.displayCart();
    }
    
    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.displayCart();
        }
    }
    
    updateTotals() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const total = subtotal; // No tax for now
        
        document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    }
    
    proceedToCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Create order summary
        const orderSummary = this.createOrderSummary();
        
        // Store in localStorage for the order form
        localStorage.setItem('cartOrder', JSON.stringify({
            summary: orderSummary,
            cart: this.cart,
            timestamp: new Date().toISOString()
        }));
        
        // Redirect to order page
        window.location.href = 'index.html#order';
    }
    
    createOrderSummary() {
        let summary = 'Cart Order:\n\n';
        
        this.cart.forEach(item => {
            summary += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        summary += `\nTotal: $${total.toFixed(2)}`;
        
        return summary;
    }
    
    animateHero() {
        // Animate hero elements
        const words = document.querySelectorAll('.word-animate');
        words.forEach((word, index) => {
            const delay = word.dataset.delay || index * 100;
            setTimeout(() => {
                word.classList.add('animate');
            }, delay);
        });
    }
    
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Global cart functions for menu page - moved outside DOMContentLoaded
window.addToCart = function(item) {
    const cart = JSON.parse(localStorage.getItem('spookyCart') || '[]');
    
    // Check if item already exists
    const existingItem = cart.find(cartItem => 
        cartItem.name === item.name && cartItem.price === item.price
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    localStorage.setItem('spookyCart', JSON.stringify(cart));
    
    // Show success message
    window.showCartMessage(`${item.name} added to cart! 🛒`, 'success');
};

// Global function for cart messages
window.showCartMessage = function(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `cart-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--accent-yellow)' : type === 'error' ? '#ff6b6b' : 'var(--accent-pink)'};
        color: var(--bg-primary);
        padding: 1rem 2rem;
        border-radius: 25px;
        font-weight: 600;
        z-index: 10000;
        animation: messageSlide 0.3s ease-out;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'messageSlideOut 0.3s ease-out';
        setTimeout(() => {
            messageEl.remove();
        }, 300);
    }, 3000);
};

// Add CSS animations (only if not already added)
if (!document.getElementById('cart-animations')) {
    const style = document.createElement('style');
    style.id = 'cart-animations';
    style.textContent = `
        @keyframes messageSlide {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes messageSlideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize cart page when DOM is loaded (only on cart page)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize CartPage if we're on the cart page
    if (window.location.pathname.includes('cart.html') || window.location.pathname === '/cart') {
        console.log('🛒 Cart Page - Initializing...');
        
        try {
            window.cartPage = new CartPage();
            console.log('✨ Cart Page ready!');
        } catch (error) {
            console.error('❌ Cart Page initialization error:', error);
        }
    } else {
        console.log('🛒 Cart functions loaded (menu page)');
    }
});
