// ===== CAKE BUILDER JAVASCRIPT =====

class CakeBuilder {
    constructor() {
        this.cake = {
            flavor: null,
            flavorColor: null,
            frosting: null,
            frostingColor: null,
            size: null,
            sizePrice: 0,
            toppings: [],
            customMessage: '',
            basePrice: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updatePrice();
        this.animateHero();
    }
    
    setupEventListeners() {
        // Flavor selection
        document.querySelectorAll('.flavor-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.selectFlavor(button.dataset.flavor, button.dataset.color, button);
            });
        });
        
        // Frosting selection
        document.querySelectorAll('.frosting-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.selectFrosting(button.dataset.frosting, button.dataset.color, button);
            });
        });
        
        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.selectSize(button.dataset.size, parseInt(button.dataset.price), button);
            });
        });
        
        // Toppings selection
        document.querySelectorAll('.topping-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const button = e.currentTarget;
                this.toggleTopping(button.dataset.topping, parseInt(button.dataset.price), button);
            });
        });
        
        // Custom message
        const messageInput = document.getElementById('customMessage');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                this.cake.customMessage = e.target.value;
                this.updateCakeInfo();
            });
        }
        
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
    
    selectFlavor(flavor, color, button) {
        // Remove previous selection
        document.querySelectorAll('.flavor-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        button.classList.add('selected');
        
        // Update cake
        this.cake.flavor = flavor;
        this.cake.flavorColor = color;
        this.updateCakeLayers(color);
        this.updateCakeInfo();
        this.updatePrice();
    }
    
    selectFrosting(frosting, color, button) {
        // Remove previous selection
        document.querySelectorAll('.frosting-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        button.classList.add('selected');
        
        // Update cake
        this.cake.frosting = frosting;
        this.cake.frostingColor = color;
        this.updateCakeFrosting(color);
        this.updateCakeInfo();
        this.updatePrice();
    }
    
    selectSize(size, price, button) {
        // Remove previous selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        button.classList.add('selected');
        
        // Update cake
        this.cake.size = size;
        this.cake.sizePrice = price;
        this.updateCakeSize(size);
        this.updateCakeInfo();
        this.updatePrice();
    }
    
    toggleTopping(topping, price, button) {
        const isSelected = button.classList.contains('selected');
        
        if (isSelected) {
            // Remove topping
            button.classList.remove('selected');
            this.cake.toppings = this.cake.toppings.filter(t => t.name !== topping);
        } else {
            // Add topping
            button.classList.add('selected');
            this.cake.toppings.push({ name: topping, price: price });
        }
        
        this.updateCakeToppings();
        this.updateCakeInfo();
        this.updatePrice();
    }
    
    updateCakeLayers(color) {
        // Update all cake layer colors
        const layers = document.querySelectorAll('.cake-layer-side, .cake-layer-top');
        const bottomLayers = document.querySelectorAll('.cake-layer-bottom');
        
        layers.forEach(layer => {
            layer.style.fill = color;
            layer.style.transition = 'fill 0.6s ease';
        });
        
        // Make bottom layers slightly darker
        const darkerColor = this.darkenColor(color, 20);
        bottomLayers.forEach(layer => {
            layer.style.fill = darkerColor;
            layer.style.transition = 'fill 0.6s ease';
        });
    }
    
    updateCakeFrosting(color) {
        const frostingLayer = document.getElementById('frostingLayer');
        const frostingPaths = frostingLayer.querySelectorAll('path');
        
        frostingPaths.forEach(path => {
            path.style.fill = color;
            path.style.opacity = '0.95';
        });
        
        frostingLayer.classList.add('visible');
    }
    
    updateCakeSize(size) {
        // Update SVG viewBox or scale based on size
        const svg = document.getElementById('cakeSvg');
        if (svg) {
            svg.style.transform = size === '10-inch' ? 'scale(1.1)' : 
                                  size === '6-inch' ? 'scale(0.9)' : 
                                  'scale(1)';
            svg.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }
    }
    
    updateCakeToppings() {
        const toppingsContainer = document.getElementById('toppingsContainer');
        toppingsContainer.innerHTML = '';
        
        if (this.cake.toppings.length === 0) return;
        
        // Add visual indicators for toppings
        this.cake.toppings.forEach((topping, index) => {
            const icon = this.getToppingIcon(topping.name);
            
            // Add multiple icons scattered on the cake
            for (let i = 0; i < 5; i++) {
                const x = 140 + Math.random() * 120;
                const y = 240 + (index * 20) + Math.random() * 40;
                
                const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textElement.setAttribute('x', x);
                textElement.setAttribute('y', y);
                textElement.setAttribute('font-size', '12');
                textElement.setAttribute('opacity', '0');
                textElement.textContent = icon;
                
                toppingsContainer.appendChild(textElement);
                
                // Animate appearance
                setTimeout(() => {
                    textElement.style.transition = 'opacity 0.6s ease';
                    textElement.setAttribute('opacity', '1');
                }, i * 100);
            }
        });
    }
    
    getToppingIcon(topping) {
        const icons = {
            'sprinkles': '✨',
            'fresh-fruit': '🍓',
            'chocolate-drip': '🍫',
            'fondant': '🎀',
            'edible-flowers': '🌸',
            'shimmer': '✨',
            'hand-piped-flowers': '🌺',
            'ombre': '🌈'
        };
        return icons[topping] || '✨';
    }
    
    updateCakeInfo() {
        const cakeName = document.getElementById('cakeName');
        const cakeDescription = document.getElementById('cakeDescription');
        
        if (!this.cake.flavor && !this.cake.size) {
            cakeName.textContent = 'Your Custom Cake';
            cakeDescription.textContent = 'Start building by selecting your base flavor and size!';
            return;
        }
        
        const flavorName = this.getFlavorName(this.cake.flavor);
        const frostingName = this.cake.frosting ? this.getFrostingName(this.cake.frosting) : '';
        const sizeName = this.cake.size ? this.getSizeName(this.cake.size) : '';
        
        let name = '';
        if (this.cake.size) {
            name += `${sizeName} `;
        }
        if (this.cake.flavor) {
            name += `${flavorName}`;
        }
        if (this.cake.frosting) {
            name += ` with ${frostingName}`;
        }
        name += ' Cake';
        
        cakeName.textContent = name;
        
        let description = `A delicious ${sizeName || 'custom'} ${flavorName || ''} cake`;
        if (this.cake.frosting) {
            description += ` with ${frostingName.toLowerCase()} frosting`;
        }
        if (this.cake.toppings.length > 0) {
            const toppingNames = this.cake.toppings.map(t => t.name.replace(/-/g, ' ')).join(', ');
            description += `, featuring ${toppingNames}`;
        }
        if (this.cake.customMessage) {
            description += `. Custom message: "${this.cake.customMessage}"`;
        }
        description += '. Perfect for any celebration!';
        
        cakeDescription.textContent = description;
    }
    
    getFlavorName(flavor) {
        const names = {
            'vanilla-bean': 'Vanilla Bean',
            'funfetti': 'Funfetti',
            'chocolate-fudge': 'Chocolate Fudge',
            'red-velvet': 'Red Velvet',
            'cookies-cream': 'Cookies & Cream',
            'lemon-burst': 'Lemon Burst',
            'strawberry-shortcake': 'Strawberry Shortcake',
            'orange-cranberry': 'Orange Cranberry',
            'key-lime': 'Key Lime'
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
    
    getSizeName(size) {
        const names = {
            '6-inch': '6"',
            '8-inch': '8"',
            '10-inch': '10"'
        };
        return names[size] || size;
    }
    
    updatePrice() {
        let totalPrice = this.cake.sizePrice;
        
        // Add toppings prices
        this.cake.toppings.forEach(topping => {
            totalPrice += topping.price;
        });
        
        this.cake.basePrice = totalPrice;
        
        const priceElement = document.getElementById('cakePrice');
        if (priceElement) {
            if (totalPrice === 0) {
                priceElement.textContent = 'Starting at $45';
            } else {
                priceElement.textContent = `$${totalPrice}`;
            }
        }
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
            flavorColor: null,
            frosting: null,
            frostingColor: null,
            size: null,
            sizePrice: 0,
            toppings: [],
            customMessage: '',
            basePrice: 0
        };
        
        // Reset UI
        document.querySelectorAll('.flavor-option, .frosting-option, .size-option, .topping-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Reset cake visual
        const defaultColor = '#F5F5DC';
        this.updateCakeLayers(defaultColor);
        
        // Hide frosting
        const frostingLayer = document.getElementById('frostingLayer');
        const frostingPaths = frostingLayer.querySelectorAll('path');
        frostingPaths.forEach(path => {
            path.style.opacity = '0';
        });
        frostingLayer.classList.remove('visible');
        
        // Clear toppings
        document.getElementById('toppingsContainer').innerHTML = '';
        
        // Reset SVG size
        const svg = document.getElementById('cakeSvg');
        if (svg) {
            svg.style.transform = 'scale(1)';
        }
        
        // Clear custom message
        const messageInput = document.getElementById('customMessage');
        if (messageInput) {
            messageInput.value = '';
        }
        
        this.updateCakeInfo();
        this.updatePrice();
        
        this.showMessage('Cake builder reset! Start fresh 🎂', 'info');
    }
    
    saveCake() {
        if (!this.cake.flavor || !this.cake.size) {
            this.showMessage('Please select a flavor and size first!', 'error');
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
        if (!this.cake.flavor || !this.cake.size) {
            this.showMessage('Please select a flavor and size first!', 'error');
            return;
        }
        
        // Create order summary
        const flavorName = this.getFlavorName(this.cake.flavor);
        const frostingName = this.cake.frosting ? this.getFrostingName(this.cake.frosting) : 'None selected';
        const sizeName = this.getSizeName(this.cake.size);
        const toppingsList = this.cake.toppings.length > 0 
            ? this.cake.toppings.map(t => t.name.replace(/-/g, ' ')).join(', ')
            : 'None';
        
        const orderSummary = `
Custom Cake Order:
- Size: ${sizeName}
- Flavor: ${flavorName}
- Frosting: ${frostingName}
- Toppings/Decorations: ${toppingsList}
${this.cake.customMessage ? `- Custom Message: "${this.cake.customMessage}"` : ''}
- Total Price: $${this.cake.basePrice}

Ready to order this custom cake!
        `;
        
        // Store in localStorage for the order page
        localStorage.setItem('customCakeOrder', JSON.stringify({
            summary: orderSummary,
            details: this.cake,
            timestamp: new Date().toISOString()
        }));
        
        // Redirect to order page
        window.location.href = 'index.html#order';
    }
    
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `cake-message ${type}`;
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
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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