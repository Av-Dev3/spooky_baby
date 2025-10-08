// ===== CHECKOUT PAGE JAVASCRIPT =====

class CheckoutPage {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.displayOrderSummary();
        this.animateHero();
        this.setCurrentYear();
        this.setupFormHandling();
    }
    
    setupEventListeners() {
        // Delivery option change
        document.querySelectorAll('input[name="delivery"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const addressGroup = document.getElementById('addressGroup');
                if (e.target.value === 'delivery') {
                    addressGroup.style.display = 'block';
                    document.getElementById('address').required = true;
                } else {
                    addressGroup.style.display = 'none';
                    document.getElementById('address').required = false;
                }
            });
        });
        
        // Form submission
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });
    }
    
    loadCart() {
        const cartData = localStorage.getItem('spookyCart');
        return cartData ? JSON.parse(cartData) : [];
    }
    
    displayOrderSummary() {
        const summaryItems = document.getElementById('summaryItems');
        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryTotal = document.getElementById('summaryTotal');
        
        if (this.cart.length === 0) {
            summaryItems.innerHTML = '<p class="empty-cart-message">No items in cart</p>';
            summarySubtotal.textContent = '$0.00';
            summaryTotal.textContent = '$0.00';
            return;
        }
        
        // Display cart items
        summaryItems.innerHTML = '';
        this.cart.forEach(item => {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span class="summary-item-name">${item.name}</span>
                <span class="summary-item-quantity">x${item.quantity}</span>
                <span class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            summaryItems.appendChild(summaryItem);
        });
        
        // Calculate totals
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const total = subtotal; // No tax for now
        
        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    setupFormHandling() {
        // Pre-populate cart data in hidden field
        const cartDataField = document.getElementById('cartData');
        if (cartDataField) {
            cartDataField.value = JSON.stringify(this.cart);
        }
        
        // Add cart summary to notes if there are items
        if (this.cart.length > 0) {
            const notesField = document.getElementById('notes');
            const cartSummary = this.createCartSummary();
            notesField.value = `Cart Order:\n${cartSummary}\n\n` + notesField.value;
        }
    }
    
    createCartSummary() {
        let summary = '';
        this.cart.forEach(item => {
            summary += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        summary += `\nTotal: $${total.toFixed(2)}`;
        
        return summary;
    }
    
    handleFormSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Add cart data to form data
        formData.set('cartData', JSON.stringify(this.cart));
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        // Submit form
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                this.showSuccessMessage();
                // Clear cart after successful submission
                localStorage.removeItem('spookyCart');
                // Redirect to main page after a delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showErrorMessage();
        })
        .finally(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
    
    showSuccessMessage() {
        const messageEl = document.getElementById('formMessage');
        messageEl.innerHTML = `
            <div class="success-message">
                <h3>🎉 Order Submitted Successfully!</h3>
                <p>Thank you for your order! We'll contact you soon to coordinate pickup/delivery details.</p>
                <p>Redirecting to homepage...</p>
            </div>
        `;
        messageEl.style.display = 'block';
        messageEl.style.background = 'var(--accent-yellow)';
        messageEl.style.color = 'var(--bg-primary)';
        messageEl.style.padding = '2rem';
        messageEl.style.borderRadius = '15px';
        messageEl.style.textAlign = 'center';
        messageEl.style.marginTop = '2rem';
    }
    
    showErrorMessage() {
        const messageEl = document.getElementById('formMessage');
        messageEl.innerHTML = `
            <div class="error-message">
                <h3>❌ Error Submitting Order</h3>
                <p>There was a problem submitting your order. Please try again or contact us directly.</p>
            </div>
        `;
        messageEl.style.display = 'block';
        messageEl.style.background = 'var(--accent-pink)';
        messageEl.style.color = 'var(--bg-primary)';
        messageEl.style.padding = '2rem';
        messageEl.style.borderRadius = '15px';
        messageEl.style.textAlign = 'center';
        messageEl.style.marginTop = '2rem';
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

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Checkout Page - Initializing...');
    
    try {
        new CheckoutPage();
        console.log('✨ Checkout Page ready!');
    } catch (error) {
        console.error('❌ Checkout Page initialization error:', error);
    }
});
