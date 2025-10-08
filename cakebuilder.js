// ===== CAKE BUILDER JAVASCRIPT =====

class CakeBuilder {
    constructor() {
        this.cake = {
            flavor: null,
            frosting: null,
            toppings: [],
            decorations: [],
            basePrice: 0
        };
        
        this.prices = {
            flavors: {
                'vanilla': 0,
                'chocolate': 5,
                'red-velvet': 8,
                'lemon': 6,
                'strawberry': 7,
                'funfetti': 4
            },
            frostings: {
                'vanilla-buttercream': 0,
                'chocolate-buttercream': 3,
                'cream-cheese': 5,
                'whipped-cream': 2
            },
            toppings: {
                'sprinkles': 2,
                'chocolate-chips': 3,
                'strawberries': 8,
                'cherries': 4,
                'nuts': 5,
                'coconut': 3,
                'oreos': 4,
                'edible-glitter': 6
            },
            decorations: {
                'drip': 10,
                'flowers': 15,
                'writing': 8,
                'ribbon': 5
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCakeDisplay();
        this.updatePrice();
        this.animateHero();
    }
    
    setupEventListeners() {
        // Flavor selection
        document.querySelectorAll('.flavor-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectFlavor(e.currentTarget.dataset.flavor, e.currentTarget.dataset.color);
            });
        });
        
        // Frosting selection
        document.querySelectorAll('.frosting-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectFrosting(e.currentTarget.dataset.frosting, e.currentTarget.dataset.color);
            });
        });
        
        // Toppings selection
        document.querySelectorAll('.topping-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.toggleTopping(e.currentTarget.dataset.topping, e.currentTarget.dataset.icon);
            });
        });
        
        // Decorations selection
        document.querySelectorAll('.decoration-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.toggleDecoration(e.currentTarget.dataset.decoration, e.currentTarget.dataset.icon);
            });
        });
        
        // Action buttons
        document.getElementById('resetCake')?.addEventListener('click', () => {
            this.resetCake();
        });
        
        document.getElementById('saveCake')?.addEventListener('click', () => {
            this.saveCake();
        });
        
        document.getElementById('orderCake')?.addEventListener('click', () => {
            this.orderCake();
        });
    }
    
    selectFlavor(flavor, color) {
        // Remove previous selection
        document.querySelectorAll('.flavor-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        event.currentTarget.classList.add('selected');
        
        // Update cake
        this.cake.flavor = flavor;
        this.updateCakeLayers(color);
        this.updateCakeInfo();
        this.updatePrice();
        this.animateCake();
    }
    
    selectFrosting(frosting, color) {
        // Remove previous selection
        document.querySelectorAll('.frosting-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        event.currentTarget.classList.add('selected');
        
        // Update cake
        this.cake.frosting = frosting;
        this.updateCakeFrosting(color);
        this.updateCakeInfo();
        this.updatePrice();
        this.animateCake();
    }
    
    toggleTopping(topping, icon) {
        const option = event.currentTarget;
        const isSelected = option.classList.contains('selected');
        
        if (isSelected) {
            // Remove topping
            option.classList.remove('selected');
            this.cake.toppings = this.cake.toppings.filter(t => t !== topping);
        } else {
            // Add topping
            option.classList.add('selected');
            this.cake.toppings.push(topping);
        }
        
        this.updateCakeToppings();
        this.updateCakeInfo();
        this.updatePrice();
        this.animateCake();
    }
    
    toggleDecoration(decoration, icon) {
        const option = event.currentTarget;
        const isSelected = option.classList.contains('selected');
        
        if (isSelected) {
            // Remove decoration
            option.classList.remove('selected');
            this.cake.decorations = this.cake.decorations.filter(d => d !== decoration);
        } else {
            // Add decoration
            option.classList.add('selected');
            this.cake.decorations.push(decoration);
        }
        
        this.updateCakeDecorations();
        this.updateCakeInfo();
        this.updatePrice();
        this.animateCake();
    }
    
    updateCakeLayers(color) {
        const layers = document.querySelectorAll('.cake-layer');
        layers.forEach(layer => {
            layer.style.background = `linear-gradient(135deg, ${color} 0%, ${this.lightenColor(color, 20)} 100%)`;
        });
    }
    
    updateCakeFrosting(color) {
        const frosting = document.getElementById('cakeFrosting');
        frosting.style.background = `linear-gradient(135deg, ${color} 0%, ${this.lightenColor(color, 20)} 100%)`;
        frosting.classList.add('visible');
    }
    
    updateCakeToppings() {
        const toppingsContainer = document.getElementById('cakeToppings');
        toppingsContainer.innerHTML = '';
        
        this.cake.toppings.forEach((topping, index) => {
            const toppingElement = document.createElement('div');
            toppingElement.className = 'topping-item';
            toppingElement.style.left = `${Math.random() * 80 + 10}%`;
            toppingElement.style.top = `${Math.random() * 60 + 20}%`;
            toppingElement.style.animationDelay = `${index * 0.1}s`;
            
            // Get icon for topping
            const icon = this.getToppingIcon(topping);
            toppingElement.textContent = icon;
            
            toppingsContainer.appendChild(toppingElement);
        });
    }
    
    updateCakeDecorations() {
        const decorationsContainer = document.getElementById('cakeDecoration');
        decorationsContainer.innerHTML = '';
        
        this.cake.decorations.forEach((decoration, index) => {
            const decorationElement = document.createElement('div');
            decorationElement.className = 'decoration-item';
            decorationElement.style.animationDelay = `${index * 0.2}s`;
            
            // Get icon for decoration
            const icon = this.getDecorationIcon(decoration);
            decorationElement.textContent = icon;
            
            decorationsContainer.appendChild(decorationElement);
        });
    }
    
    getToppingIcon(topping) {
        const icons = {
            'sprinkles': '✨',
            'chocolate-chips': '🍫',
            'strawberries': '🍓',
            'cherries': '🍒',
            'nuts': '🥜',
            'coconut': '🥥',
            'oreos': '🍪',
            'edible-glitter': '✨'
        };
        return icons[topping] || '✨';
    }
    
    getDecorationIcon(decoration) {
        const icons = {
            'drip': '💧',
            'flowers': '🌸',
            'writing': '✍️',
            'ribbon': '🎀'
        };
        return icons[decoration] || '✨';
    }
    
    updateCakeInfo() {
        const cakeName = document.getElementById('cakeName');
        const cakeDescription = document.getElementById('cakeDescription');
        
        if (this.cake.flavor) {
            const flavorName = this.getFlavorName(this.cake.flavor);
            const frostingName = this.cake.frosting ? this.getFrostingName(this.cake.frosting) : '';
            const toppingsText = this.cake.toppings.length > 0 ? ` with ${this.cake.toppings.join(', ')}` : '';
            const decorationsText = this.cake.decorations.length > 0 ? ` and ${this.cake.decorations.join(', ')} decorations` : '';
            
            cakeName.textContent = `${flavorName} ${frostingName ? frostingName + ' ' : ''}Cake${decorationsText}`;
            cakeDescription.textContent = `A delicious ${flavorName.toLowerCase()} cake${frostingName ? ' with ' + frostingName.toLowerCase() + ' frosting' : ''}${toppingsText}${decorationsText}. Perfect for any celebration!`;
        } else {
            cakeName.textContent = 'Your Custom Cake';
            cakeDescription.textContent = 'Start building by selecting your base flavor!';
        }
    }
    
    getFlavorName(flavor) {
        const names = {
            'vanilla': 'Vanilla Bean',
            'chocolate': 'Chocolate Fudge',
            'red-velvet': 'Red Velvet',
            'lemon': 'Lemon Burst',
            'strawberry': 'Strawberry',
            'funfetti': 'Funfetti'
        };
        return names[flavor] || flavor;
    }
    
    getFrostingName(frosting) {
        const names = {
            'vanilla-buttercream': 'Vanilla Buttercream',
            'chocolate-buttercream': 'Chocolate Buttercream',
            'cream-cheese': 'Cream Cheese',
            'whipped-cream': 'Whipped Cream'
        };
        return names[frosting] || frosting;
    }
    
    updatePrice() {
        let totalPrice = 0;
        
        // Base price
        totalPrice += 25;
        
        // Flavor price
        if (this.cake.flavor && this.prices.flavors[this.cake.flavor]) {
            totalPrice += this.prices.flavors[this.cake.flavor];
        }
        
        // Frosting price
        if (this.cake.frosting && this.prices.frostings[this.cake.frosting]) {
            totalPrice += this.prices.frostings[this.cake.frosting];
        }
        
        // Toppings price
        this.cake.toppings.forEach(topping => {
            if (this.prices.toppings[topping]) {
                totalPrice += this.prices.toppings[topping];
            }
        });
        
        // Decorations price
        this.cake.decorations.forEach(decoration => {
            if (this.prices.decorations[decoration]) {
                totalPrice += this.prices.decorations[decoration];
            }
        });
        
        this.cake.basePrice = totalPrice;
        
        const priceElement = document.getElementById('cakePrice');
        if (priceElement) {
            priceElement.textContent = `$${totalPrice}`;
        }
    }
    
    animateCake() {
        const cakeContainer = document.querySelector('.cake-container');
        cakeContainer.classList.add('loading');
        
        setTimeout(() => {
            cakeContainer.classList.remove('loading');
            cakeContainer.classList.add('success');
            
            setTimeout(() => {
                cakeContainer.classList.remove('success');
            }, 1000);
        }, 300);
    }
    
    animateHero() {
        // Animate hero elements
        const words = document.querySelectorAll('.word-animate');
        words.forEach((word, index) => {
            const delay = word.dataset.delay || index * 100;
            setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            }, delay);
        });
    }
    
    resetCake() {
        // Reset cake object
        this.cake = {
            flavor: null,
            frosting: null,
            toppings: [],
            decorations: [],
            basePrice: 0
        };
        
        // Reset UI
        document.querySelectorAll('.flavor-option, .frosting-option, .topping-option, .decoration-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Reset cake display
        const layers = document.querySelectorAll('.cake-layer');
        layers.forEach(layer => {
            layer.style.background = 'linear-gradient(135deg, #F5F5DC 0%, #E6E6FA 100%)';
        });
        
        const frosting = document.getElementById('cakeFrosting');
        frosting.classList.remove('visible');
        frosting.style.background = '';
        
        document.getElementById('cakeToppings').innerHTML = '';
        document.getElementById('cakeDecoration').innerHTML = '';
        
        this.updateCakeInfo();
        this.updatePrice();
        this.animateCake();
    }
    
    saveCake() {
        if (!this.cake.flavor) {
            alert('Please select a flavor first!');
            return;
        }
        
        const cakeData = {
            ...this.cake,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('savedCake', JSON.stringify(cakeData));
        
        // Show success message
        this.showMessage('Cake design saved! 🎂', 'success');
    }
    
    orderCake() {
        if (!this.cake.flavor) {
            alert('Please select a flavor first!');
            return;
        }
        
        // Create order data
        const orderData = {
            type: 'Custom Cake',
            flavor: this.cake.flavor,
            frosting: this.cake.frosting,
            toppings: this.cake.toppings,
            decorations: this.cake.decorations,
            price: this.cake.basePrice,
            timestamp: new Date().toISOString()
        };
        
        // Redirect to order page with data
        const orderUrl = `index.html#order?cake=${encodeURIComponent(JSON.stringify(orderData))}`;
        window.location.href = orderUrl;
    }
    
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `cake-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-yellow)' : 'var(--accent-pink)'};
            color: var(--bg-primary);
            padding: 1rem 2rem;
            border-radius: 25px;
            font-weight: 600;
            z-index: 10000;
            animation: messageSlide 0.3s ease-out;
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'messageSlideOut 0.3s ease-out';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 3000);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// Add CSS animations
const style = document.createElement('style');
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

// Initialize cake builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧁 Cake Builder - Initializing...');
    
    try {
        new CakeBuilder();
        console.log('✨ Cake Builder ready!');
    } catch (error) {
        console.error('❌ Cake Builder initialization error:', error);
    }
});

// Handle order data from URL parameters
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cakeData = urlParams.get('cake');
    
    if (cakeData) {
        try {
            const orderData = JSON.parse(decodeURIComponent(cakeData));
            console.log('Received cake order data:', orderData);
            
            // You can use this data to pre-populate the order form
            // or show a confirmation message
            if (orderData.type === 'Custom Cake') {
                alert(`Custom ${orderData.flavor} cake order received! Price: $${orderData.price}`);
            }
        } catch (error) {
            console.error('Error parsing cake order data:', error);
        }
    }
});
