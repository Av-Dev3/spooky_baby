// ===== CONFIGURATION =====
const CONFIG = {
    FORMSPREE_ID: 'xovkawkn', // Your Formspree ID
    EMAIL_FALLBACK: 'spookybabysweets@gmail.com'
};

// ===== DOM ELEMENTS =====
const elements = {
    navLinks: document.querySelectorAll('.nav-link'),
    orderForm: document.getElementById('orderForm'),
    formMessage: document.getElementById('formMessage'),
    currentYear: document.getElementById('currentYear'),
    header: document.getElementById('header')
};

// ===== UTILITIES =====
const utils = {
    showMessage(element, message, type = 'info') {
        if (!element) return;
        
        element.textContent = message;
        element.className = `form-message ${type}`;
        element.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ===== SMOOTH SCROLLING =====
const smoothScroll = {
    init() {
        // Handle navigation clicks
        elements.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
    },

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        // Skip if it's an external link
        if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
            return; // Let the browser handle external links
        }
        
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = elements.header ? elements.header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }
};

// ===== ACTIVE NAVIGATION =====
const activeNav = {
    init() {
        this.updateActiveNav();
        window.addEventListener('scroll', utils.throttle(this.updateActiveNav.bind(this), 100));
        this.enhanceNavLinks();
    },

    updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink && scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                elements.navLinks.forEach(link => link.classList.remove('active'));
                // Add active class to current nav link
                navLink.classList.add('active');
            }
        });
    },

    enhanceNavLinks() {
        elements.navLinks.forEach((link, index) => {
            // Add staggered entrance animation
            link.style.animationDelay = `${index * 0.1}s`;
            
            // Add magnetic effect
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0) scale(1)';
            });
            
            // Add ripple effect on click
            link.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = link.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(246, 182, 207, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                link.style.position = 'relative';
                link.style.overflow = 'hidden';
                link.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
};

// ===== FORM HANDLING =====
const formHandler = {
    init() {
        if (elements.orderForm) {
            elements.orderForm.addEventListener('submit', this.handleSubmit.bind(this));
            this.initAddAnotherItem();
        }
    },
    
    initAddAnotherItem() {
        const addAnotherBtn = document.getElementById('addAnotherItem');
        if (addAnotherBtn) {
            addAnotherBtn.addEventListener('click', this.addAnotherItem.bind(this));
        }
    },
    
    addAnotherItem() {
        // Create a new item section
        const form = document.getElementById('orderForm');
        const notesGroup = document.querySelector('#notes').closest('.form-group');
        
        // Create new item group
        const newItemGroup = document.createElement('div');
        newItemGroup.className = 'form-group additional-item';
        newItemGroup.innerHTML = `
            <div class="additional-item-header">
                <h4 style="color: var(--accent-pink); font-family: var(--font-heading); margin-bottom: 1rem;">Additional Item</h4>
                <button type="button" class="remove-item-btn" style="background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px; float: right;">×</button>
            </div>
            
            <div class="form-group">
                <label class="form-label">Item</label>
                <div class="custom-dropdown">
                    <div class="custom-dropdown-trigger">
                        <span class="dropdown-text">Select an item...</span>
                        <span class="dropdown-arrow">👻</span>
                    </div>
                    <div class="custom-dropdown-options">
                        <div class="custom-option" data-value="">Select an item...</div>
                        <div class="custom-option" data-value="cupcakes">🧁 Cupcakes</div>
                        <div class="custom-option" data-value="cake-pops">🍭 Cake Pops</div>
                        <div class="custom-option" data-value="cakecicles">🍰 Cakecicles</div>
                        <div class="custom-option" data-value="cakes">🎂 Cakes</div>
                        <div class="custom-option" data-value="seasonal">🎃 Seasonal & Specialty</div>
                        <div class="custom-option" data-value="custom">✨ Custom Request</div>
                    </div>
                </div>
                <input type="hidden" name="additional_items[]" value="">
            </div>

            <div class="form-group additional-flavor-group" style="display: none;">
                <label class="form-label">Flavor</label>
                <div class="custom-dropdown">
                    <div class="custom-dropdown-trigger">
                        <span class="dropdown-text">Select a flavor...</span>
                        <span class="dropdown-arrow">✨</span>
                    </div>
                    <div class="custom-dropdown-options">
                        <div class="custom-option" data-value="">Select a flavor...</div>
                    </div>
                </div>
                <input type="hidden" name="additional_flavors[]" value="">
            </div>
            
            <div class="form-group">
                <label class="form-label">Amount</label>
                <input type="number" name="additional_amounts[]" class="form-input" min="1" required>
            </div>
        `;
        
        // Insert before notes group
        form.insertBefore(newItemGroup, notesGroup);
        
        // Initialize dropdowns for the new item
        this.initAdditionalItemDropdowns(newItemGroup);
        
        // Add remove functionality
        const removeBtn = newItemGroup.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', () => {
            newItemGroup.remove();
        });
    },
    
    initAdditionalItemDropdowns(itemGroup) {
        const itemDropdown = itemGroup.querySelector('.custom-dropdown');
        const itemTrigger = itemDropdown.querySelector('.custom-dropdown-trigger');
        const itemOptions = itemDropdown.querySelector('.custom-dropdown-options');
        const itemInput = itemGroup.querySelector('input[name="additional_items[]"]');
        const flavorGroup = itemGroup.querySelector('.additional-flavor-group');
        const flavorDropdown = flavorGroup.querySelector('.custom-dropdown');
        const flavorTrigger = flavorDropdown.querySelector('.custom-dropdown-trigger');
        const flavorOptions = flavorDropdown.querySelector('.custom-dropdown-options');
        const flavorInput = itemGroup.querySelector('input[name="additional_flavors[]"]');
        
        // Item dropdown functionality
        itemTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            itemDropdown.classList.toggle('open');
        });
        
        itemOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            itemTrigger.querySelector('.dropdown-text').textContent = text;
            itemInput.value = value;
            
            itemOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            itemDropdown.classList.remove('open');
            
            // Handle flavor dropdown visibility
            const customFlavorGroup = document.getElementById('customFlavorGroup');
            
            if (value && value !== 'custom') {
                flavorGroup.style.display = 'block';
                if (customFlavorGroup) customFlavorGroup.style.display = 'none';
                this.updateFlavorOptions(value, flavorOptions);
            } else {
                flavorGroup.style.display = 'none';
                if (customFlavorGroup) customFlavorGroup.style.display = 'none';
                flavorInput.value = '';
                flavorTrigger.querySelector('.dropdown-text').textContent = 'Select a flavor...';
                // Clear custom flavor as well
                const customFlavorInput = document.getElementById('customFlavor');
                const customFlavorTrigger = document.getElementById('customFlavorTrigger');
                if (customFlavorInput) customFlavorInput.value = '';
                if (customFlavorTrigger) customFlavorTrigger.querySelector('.dropdown-text').textContent = 'Select your custom flavor...';
            }
        });
        
        // Flavor dropdown functionality
        flavorTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            flavorDropdown.classList.toggle('open');
        });
        
        flavorOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            flavorTrigger.querySelector('.dropdown-text').textContent = text;
            flavorInput.value = value;
            
            flavorOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            flavorDropdown.classList.remove('open');
            
            // Handle custom flavor dropdown visibility
            const customFlavorGroup = document.getElementById('customFlavorGroup');
            console.log('Flavor selected:', value, 'Custom flavor group:', customFlavorGroup);
            
            if (value === 'pick-your-own-flavor') {
                if (customFlavorGroup) {
                    console.log('Showing custom flavor group');
                    customFlavorGroup.style.display = 'block';
                    this.updateCustomFlavorOptions();
                } else {
                    console.error('Custom flavor group not found');
                }
            } else {
                if (customFlavorGroup) {
                    console.log('Hiding custom flavor group');
                    customFlavorGroup.style.display = 'none';
                    // Clear custom flavor selection
                    const customFlavorInput = document.getElementById('customFlavor');
                    const customFlavorTrigger = document.getElementById('customFlavorTrigger');
                    if (customFlavorInput) customFlavorInput.value = '';
                    if (customFlavorTrigger) customFlavorTrigger.querySelector('.dropdown-text').textContent = 'Select your custom flavor...';
                }
            }
        });
    },
    
    updateFlavorOptions(selectedItem, flavorOptions) {
        // Clear existing options
        flavorOptions.innerHTML = '<div class="custom-option" data-value="">Select a flavor...</div>';
        
        // Use the same flavor data as the main form
        const flavorData = {
            'cupcakes': [
                { value: 'lemon-burst', text: '🍋 Lemon Burst' },
                { value: 'orange-cranberry', text: '🍊 Orange Cranberry' },
                { value: 'key-lime-pie', text: '🥧 Key Lime Pie' },
                { value: 'chocolate-crunch', text: '🍫 Chocolate Crunch' },
                { value: 'cherry-bomb', text: '🍒 Cherry Bomb' },
                { value: 'blue-razz-pop', text: '💙 Blue Razz Pop' },
                { value: 'watermelon-splash', text: '🍉 Watermelon Splash' },
                { value: 'rainbow-variety-pack', text: '🌈 Rainbow Variety Pack' },
                { value: 'pick-your-own-flavor', text: '✨ Pick Your Own Flavor' }
            ],
            'cake-pops': [
                { value: 'red-velvet-bliss', text: '❤️ Red Velvet Bliss' },
                { value: 'birthday-confetti', text: '🎉 Birthday Confetti' },
                { value: 'spooky-pop', text: '👻 Spooky Pop' },
                { value: 'cookies-cream-dream', text: '🍪 Cookies & Cream Dream' }
            ],
            'cakes': [
                { value: 'custom-cakes', text: '🎂 Custom Cakes' }
            ],
            'seasonal': [
                { value: 'pumpkin-butterscotch-bundts', text: '🎃 Pumpkin Butterscotch Bundts' },
                { value: 'peppermint-mocha-pops', text: '🍃 Peppermint Mocha Pops' },
                { value: 'breakable-hearts', text: '💔 Breakable Hearts' },
                { value: 'dubai-chocolate-bars', text: '🇦🇪 Dubai Chocolate Bars' },
                { value: 'chocolate-dipped-strawberries', text: '🍓 Chocolate-Dipped Strawberries' },
                { value: 'seasonal-variety-packs', text: '🎁 Seasonal Variety Packs' }
            ]
        };
        
        if (selectedItem && flavorData[selectedItem]) {
            flavorData[selectedItem].forEach(flavor => {
                const option = document.createElement('div');
                option.className = 'custom-option';
                option.setAttribute('data-value', flavor.value);
                option.textContent = flavor.text;
                flavorOptions.appendChild(option);
            });
        }
    },
    
    updateCustomFlavorOptions() {
        const customFlavorOptions = document.getElementById('customFlavorOptions');
        const customFlavorTrigger = document.getElementById('customFlavorTrigger');
        const customFlavorInput = document.getElementById('customFlavor');
        const customFlavorDropdown = document.getElementById('customFlavorDropdown');
        
        if (!customFlavorOptions || !customFlavorTrigger || !customFlavorInput || !customFlavorDropdown) {
            console.error('Custom flavor elements not found');
            return;
        }
        
        // Clear existing options
        customFlavorOptions.innerHTML = '<div class="custom-option" data-value="">Select your custom flavor...</div>';
        
        // Custom flavor options
        const customFlavors = [
            { value: 'cherry', text: '🍒 Cherry' },
            { value: 'grape', text: '🍇 Grape' },
            { value: 'lemon-lime', text: '🍋 Lemon‑Lime' },
            { value: 'orange', text: '🍊 Orange' },
            { value: 'raspberry', text: '🫐 Raspberry' },
            { value: 'strawberry', text: '🍓 Strawberry' },
            { value: 'tropical-punch', text: '🌴 Tropical Punch' },
            { value: 'lemonade', text: '🍋 Lemonade' },
            { value: 'pink-lemonade', text: '🌸 Pink Lemonade' },
            { value: 'black-cherry', text: '🖤 Black Cherry' },
            { value: 'mixed-berry', text: '🫐 Mixed Berry' },
            { value: 'watermelon', text: '🍉 Watermelon' },
            { value: 'peach-mango', text: '🥭 Peach Mango' },
            { value: 'green-apple', text: '🍏 Green Apple' },
            { value: 'strawberry-kiwi', text: '🥝 Strawberry Kiwi' },
            { value: 'blue-raspberry-lemonade', text: '💙 Blue Raspberry Lemonade' },
            { value: 'sharkleberry-fin', text: '🦈 Sharkleberry Fin' },
            { value: 'jamaica', text: '🌺 Jamaica (Agua Fresca)' },
            { value: 'pina-pineapple', text: '🍍 Piña‑Pineapple (Agua Fresca)' }
        ];
        
        customFlavors.forEach(flavor => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.setAttribute('data-value', flavor.value);
            option.textContent = flavor.text;
            customFlavorOptions.appendChild(option);
        });
        
        // Remove existing event listeners to prevent duplicates
        const newTrigger = customFlavorTrigger.cloneNode(true);
        customFlavorTrigger.parentNode.replaceChild(newTrigger, customFlavorTrigger);
        
        const newOptions = customFlavorOptions.cloneNode(true);
        customFlavorOptions.parentNode.replaceChild(newOptions, customFlavorOptions);
        
        // Add custom flavor dropdown functionality
        newTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customFlavorDropdown.classList.toggle('open');
        });
        
        newOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            newTrigger.querySelector('.dropdown-text').textContent = text;
            customFlavorInput.value = value;
            
            newOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            customFlavorDropdown.classList.remove('open');
        });
        
        console.log('Custom flavor dropdown initialized');
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(elements.orderForm);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!this.validateForm(data)) {
            return;
        }

        // Show loading state
        const submitButton = elements.orderForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // Try Formspree first
            if (await this.submitToFormspree(data)) {
                this.showSuccessMessage();
                elements.orderForm.reset();
            } else {
                // Fallback to mailto
                this.submitViaMailto(data);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage();
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    },

    validateForm(data) {
        const requiredFields = ['name', 'email', 'item'];
        
        // Check if flavor field is visible and add it to required fields
        const flavorGroup = document.getElementById('flavorGroup');
        if (flavorGroup && flavorGroup.style.display !== 'none') {
            requiredFields.push('flavor');
        }
        
        // Check if custom flavor field is visible and add it to required fields
        const customFlavorGroup = document.getElementById('customFlavorGroup');
        if (customFlavorGroup && customFlavorGroup.style.display !== 'none') {
            requiredFields.push('customFlavor');
        }
        
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
        
        if (missingFields.length > 0) {
            utils.showMessage(
                elements.formMessage,
                `Please fill in all required fields: ${missingFields.join(', ')}`,
                'error'
            );
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            utils.showMessage(
                elements.formMessage,
                'Please enter a valid email address',
                'error'
            );
            return false;
        }
        
        return true;
    },

    async submitToFormspree(data) {
        if (!CONFIG.FORMSPREE_ID || CONFIG.FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
            return false;
        }

        try {
            const response = await fetch(`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('Formspree error:', error);
            return false;
        }
    },

    submitViaMailto(data) {
        const subject = `New Order from ${data.name}`;
        const body = `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Item: ${data.item}
Quantity: ${data.quantity || 'Not specified'}
Special Instructions: ${data.details || 'None'}

This order was submitted via the website contact form.
        `.trim();

        const mailtoUrl = `mailto:${CONFIG.EMAIL_FALLBACK}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        
        utils.showMessage(
            elements.formMessage,
            'Opening your email client to send the order...',
            'info'
        );
    },

    showSuccessMessage() {
        utils.showMessage(
            elements.formMessage,
            'Thank you! Your order has been submitted successfully. We\'ll get back to you soon!',
            'success'
        );
    },

    showErrorMessage() {
        utils.showMessage(
            elements.formMessage,
            'Sorry, there was an error submitting your order. Please try again or contact us directly.',
            'error'
        );
    }
};

// ===== CUSTOM DROPDOWN =====
const customDropdown = {
    init() {
        this.initItemDropdown();
        this.initFlavorDropdown();
    },

    initItemDropdown() {
        const itemDropdown = document.getElementById('itemDropdown');
        const itemTrigger = document.getElementById('itemTrigger');
        const itemOptions = document.getElementById('itemOptions');
        const itemInput = document.getElementById('item');
        
        if (!itemDropdown || !itemTrigger || !itemOptions || !itemInput) {
            console.error('Custom dropdown elements not found');
            return;
        }
        
        // Toggle dropdown
        itemTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            itemDropdown.classList.toggle('open');
            
            // Add/remove dropdown-open class to form group for z-index
            const formGroup = itemDropdown.closest('.form-group');
            if (itemDropdown.classList.contains('open')) {
                formGroup.classList.add('dropdown-open');
            } else {
                formGroup.classList.remove('dropdown-open');
            }
            
            // Close other dropdowns
            const flavorDropdown = document.getElementById('flavorDropdown');
            if (flavorDropdown) {
                flavorDropdown.classList.remove('open');
                const flavorFormGroup = flavorDropdown.closest('.form-group');
                if (flavorFormGroup) {
                    flavorFormGroup.classList.remove('dropdown-open');
                }
            }
        });
        
        // Handle option selection
        itemOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            // Update the trigger text and hidden input
            const dropdownText = itemTrigger.querySelector('.dropdown-text');
            dropdownText.textContent = text;
            itemInput.value = value;
            
            // Update selected state
            itemOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Close dropdown
            itemDropdown.classList.remove('open');
            const formGroup = itemDropdown.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('dropdown-open');
            }
            
            // Handle flavor dropdown visibility
            const flavorGroup = document.getElementById('flavorGroup');
            if (value && value !== 'custom') {
                // Show flavor dropdown and populate options
                flavorGroup.style.display = 'block';
                setTimeout(() => {
                    flavorGroup.classList.add('show');
                }, 10);
                updateFlavorOptions(value);
            } else {
                // Hide flavor dropdown
                flavorGroup.classList.remove('show');
                setTimeout(() => {
                    flavorGroup.style.display = 'none';
                }, 400);
                const flavorInput = document.getElementById('flavor');
                flavorInput.value = '';
                // Reset flavor dropdown text
                const flavorTrigger = document.getElementById('flavorTrigger');
                if (flavorTrigger) {
                    const flavorDropdownText = flavorTrigger.querySelector('.dropdown-text');
                    if (flavorDropdownText) {
                        flavorDropdownText.textContent = 'Select a flavor...';
                    }
                }
            }
        });
    },

    initFlavorDropdown() {
        const flavorDropdown = document.getElementById('flavorDropdown');
        const flavorTrigger = document.getElementById('flavorTrigger');
        const flavorOptions = document.getElementById('flavorOptions');
        const flavorInput = document.getElementById('flavor');
        
        if (!flavorDropdown || !flavorTrigger || !flavorOptions || !flavorInput) {
            console.log('Flavor dropdown elements not found - will be initialized when needed');
            return;
        }
        
        // Toggle flavor dropdown
        flavorTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            flavorDropdown.classList.toggle('open');
            
            // Add/remove dropdown-open class to form group for z-index
            const formGroup = flavorDropdown.closest('.form-group');
            if (flavorDropdown.classList.contains('open')) {
                formGroup.classList.add('dropdown-open');
            } else {
                formGroup.classList.remove('dropdown-open');
            }
            
            // Close item dropdown
            const itemDropdown = document.getElementById('itemDropdown');
            if (itemDropdown) {
                itemDropdown.classList.remove('open');
                const itemFormGroup = itemDropdown.closest('.form-group');
                if (itemFormGroup) {
                    itemFormGroup.classList.remove('dropdown-open');
                }
            }
        });
        
        // Handle flavor option selection
        flavorOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            // Update the trigger text and hidden input
            const dropdownText = flavorTrigger.querySelector('.dropdown-text');
            dropdownText.textContent = text;
            flavorInput.value = value;
            
            // Update selected state
            flavorOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Close dropdown
            flavorDropdown.classList.remove('open');
            const formGroup = flavorDropdown.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('dropdown-open');
            }
            
            // Handle custom flavor dropdown visibility
            const customFlavorGroup = document.getElementById('customFlavorGroup');
            console.log('Flavor selected in form:', value, 'Custom flavor group:', customFlavorGroup);
            
            if (value === 'pick-your-own-flavor') {
                if (customFlavorGroup) {
                    console.log('Showing custom flavor group in form');
                    customFlavorGroup.style.display = 'block';
                    this.initCustomFlavorDropdown();
                } else {
                    console.error('Custom flavor group not found in form');
                }
            } else {
                if (customFlavorGroup) {
                    console.log('Hiding custom flavor group in form');
                    customFlavorGroup.style.display = 'none';
                    // Clear custom flavor selection
                    const customFlavorInput = document.getElementById('customFlavor');
                    const customFlavorTrigger = document.getElementById('customFlavorTrigger');
                    if (customFlavorInput) customFlavorInput.value = '';
                    if (customFlavorTrigger) customFlavorTrigger.querySelector('.dropdown-text').textContent = 'Select your custom flavor...';
                }
            }
        });
        
        console.log('Flavor dropdown initialized');
    },

    initCustomFlavorDropdown() {
        const customFlavorDropdown = document.getElementById('customFlavorDropdown');
        const customFlavorTrigger = document.getElementById('customFlavorTrigger');
        const customFlavorOptions = document.getElementById('customFlavorOptions');
        const customFlavorInput = document.getElementById('customFlavor');
        
        if (!customFlavorDropdown || !customFlavorTrigger || !customFlavorOptions || !customFlavorInput) {
            console.error('Custom flavor elements not found');
            return;
        }
        
        // Clear existing options
        customFlavorOptions.innerHTML = '<div class="custom-option" data-value="">Select your custom flavor...</div>';
        
        // Custom flavor options
        const customFlavors = [
            { value: 'cherry', text: '🍒 Cherry' },
            { value: 'grape', text: '🍇 Grape' },
            { value: 'lemon-lime', text: '🍋 Lemon‑Lime' },
            { value: 'orange', text: '🍊 Orange' },
            { value: 'raspberry', text: '🫐 Raspberry' },
            { value: 'strawberry', text: '🍓 Strawberry' },
            { value: 'tropical-punch', text: '🌴 Tropical Punch' },
            { value: 'lemonade', text: '🍋 Lemonade' },
            { value: 'pink-lemonade', text: '🌸 Pink Lemonade' },
            { value: 'black-cherry', text: '🖤 Black Cherry' },
            { value: 'mixed-berry', text: '🫐 Mixed Berry' },
            { value: 'watermelon', text: '🍉 Watermelon' },
            { value: 'peach-mango', text: '🥭 Peach Mango' },
            { value: 'green-apple', text: '🍏 Green Apple' },
            { value: 'strawberry-kiwi', text: '🥝 Strawberry Kiwi' },
            { value: 'blue-raspberry-lemonade', text: '💙 Blue Raspberry Lemonade' },
            { value: 'sharkleberry-fin', text: '🦈 Sharkleberry Fin' },
            { value: 'jamaica', text: '🌺 Jamaica (Agua Fresca)' },
            { value: 'pina-pineapple', text: '🍍 Piña‑Pineapple (Agua Fresca)' }
        ];
        
        customFlavors.forEach(flavor => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.setAttribute('data-value', flavor.value);
            option.textContent = flavor.text;
            customFlavorOptions.appendChild(option);
        });
        
        // Remove existing event listeners to prevent duplicates
        const newTrigger = customFlavorTrigger.cloneNode(true);
        customFlavorTrigger.parentNode.replaceChild(newTrigger, customFlavorTrigger);
        
        const newOptions = customFlavorOptions.cloneNode(true);
        customFlavorOptions.parentNode.replaceChild(newOptions, customFlavorOptions);
        
        // Add custom flavor dropdown functionality
        newTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customFlavorDropdown.classList.toggle('open');
            const formGroup = customFlavorDropdown.closest('.form-group');
            if (formGroup) {
                formGroup.classList.toggle('dropdown-open');
            }
        });
        
        newOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            newTrigger.querySelector('.dropdown-text').textContent = text;
            customFlavorInput.value = value;
            
            newOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            customFlavorDropdown.classList.remove('open');
            const formGroup = customFlavorDropdown.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('dropdown-open');
            }
        });
        
        console.log('Custom flavor dropdown initialized');
    },

    highlightOption(option) {
        // Remove highlight from all options
        document.querySelectorAll('.custom-option').forEach(opt => {
            opt.classList.remove('highlighted');
        });
        
        // Add highlight to current option
        if (option) {
            option.classList.add('highlighted');
            option.scrollIntoView({ block: 'nearest' });
        }
    }
};

// ===== CARD INTERACTIONS =====
const cardInteractions = {
    init() {
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
            card.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        });
        
        // Initialize mobile swipe menu
        this.initMobileSwipeMenu();
        
        // Initialize menu item popups
        this.initMenuItemPopups();
    },
    
    initMobileSwipeMenu() {
        const swipeMenu = document.getElementById('mobileSwipeMenu');
        if (!swipeMenu) {
            console.log('Mobile swipe menu not found - skipping initialization');
            return;
        }
        
        
        this.createSwipeMenu();
        this.initSwipeGestures();
    },
    
    createSwipeMenu() {
        const swipeTrack = document.getElementById('swipeTrack');
        const swipeIndicators = document.getElementById('swipeIndicators');
        
        if (!swipeTrack || !swipeIndicators) {
            console.log('Swipe menu elements not found - skipping menu creation');
            return;
        }
        
        // Clear existing content
        swipeTrack.innerHTML = '';
        swipeIndicators.innerHTML = '';
        
        // Get existing desktop menu cards
        const desktopCards = document.querySelectorAll('.menu-card');
        
        if (desktopCards.length === 0) {
            console.log('No desktop menu cards found');
            return;
        }
        
        // Clone and add desktop cards to swipe track
        desktopCards.forEach((card, index) => {
            const swipeItem = card.cloneNode(true);
            swipeItem.className = 'swipe-item';
            swipeItem.classList.add('menu-card'); // Keep the original menu-card class
            if (index === 0) swipeItem.classList.add('active');
            
            // Remove any existing scroll animations
            swipeItem.classList.remove('scroll-animate-stagger');
            
            swipeTrack.appendChild(swipeItem);
            
            // Create indicator dot
            const dot = document.createElement('div');
            dot.className = 'swipe-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            swipeIndicators.appendChild(dot);
        });
        
        // Add swipe hint
        const swipeHint = document.createElement('div');
        swipeHint.className = 'swipe-hint';
        swipeHint.textContent = '👆 Swipe left or right to explore our menu';
        swipeIndicators.parentNode.appendChild(swipeHint);
    },
    
    initSwipeGestures() {
        const swipeTrack = document.getElementById('swipeTrack');
        const swipeLeft = document.getElementById('swipeLeft');
        const swipeRight = document.getElementById('swipeRight');
        
        if (!swipeTrack) {
            console.log('Swipe track not found - skipping gesture initialization');
            return;
        }
        
        let currentIndex = 0;
        const totalItems = swipeTrack.children.length;
        
        // Touch event handlers
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        swipeTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = false;
        });
        
        swipeTrack.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Only prevent default if this is clearly a horizontal swipe
            // Allow vertical scrolling to continue normally
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
                isDragging = true;
                e.preventDefault();
                
                // Add visual feedback during swipe
                const progress = Math.min(Math.abs(diffX) / 100, 1);
                swipeTrack.style.opacity = 1 - (progress * 0.1);
            }
            // If it's more vertical than horizontal, don't prevent default to allow page scrolling
        });
        
        swipeTrack.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            // Reset visual feedback
            swipeTrack.style.opacity = '1';
            startX = 0;
            startY = 0;
            isDragging = false;
        });
        
        // Arrow button handlers
        if (swipeLeft) {
            swipeLeft.addEventListener('click', () => this.prevSlide());
        }
        
        if (swipeRight) {
            swipeRight.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
        
        // Mouse wheel support for desktop
        swipeTrack.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaX > 0) {
                this.nextSlide();
            } else if (e.deltaX < 0) {
                this.prevSlide();
            }
        });
        
        // Store methods for external access
        this.goToSlide = (index) => {
            currentIndex = Math.max(0, Math.min(index, totalItems - 1));
            this.updateSwipeMenu();
        };
        
        this.nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalItems;
            this.updateSwipeMenu();
        };
        
        this.prevSlide = () => {
            currentIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
            this.updateSwipeMenu();
        };
        
        this.updateSwipeMenu = () => {
            const swipeTrack = document.getElementById('swipeTrack');
            const swipeIndicators = document.getElementById('swipeIndicators');
            
            if (!swipeTrack || !swipeIndicators) return;
            
            // Update track position
            swipeTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update active states
            Array.from(swipeTrack.children).forEach((item, index) => {
                item.classList.toggle('active', index === currentIndex);
            });
            
            Array.from(swipeIndicators.children).forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            
            // Update arrow states
            const swipeLeft = document.getElementById('swipeLeft');
            const swipeRight = document.getElementById('swipeRight');
            
            if (swipeLeft) swipeLeft.disabled = currentIndex === 0;
            if (swipeRight) swipeRight.disabled = currentIndex === totalItems - 1;
        };
    },
    

    handleMouseEnter(e) {
        const card = e.currentTarget;
        // Let CSS handle the hover animation for smoother transitions
        card.classList.add('hovered');
    },

    handleMouseLeave(e) {
        const card = e.currentTarget;
        // Let CSS handle the hover animation for smoother transitions
        card.classList.remove('hovered');
    },
    
    initMenuItemPopups() {
        const popup = document.getElementById('menuItemPopup');
        const popupClose = document.getElementById('popupClose');
        const popupOverlay = document.getElementById('popupOverlay');
        const popupOrderBtn = document.getElementById('popupOrderBtn');
        
        if (!popup || !popupClose || !popupOverlay) {
            console.log('Popup elements not found - skipping popup initialization');
            return;
        }
        
        // Close popup handlers
        popupClose.addEventListener('click', () => this.closePopup());
        popupOverlay.addEventListener('click', () => this.closePopup());
        
        // Order button handler
        if (popupOrderBtn) {
            popupOrderBtn.addEventListener('click', () => this.handleOrderClick());
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('active')) {
                this.closePopup();
            }
        });
        
        // Make menu items clickable
        this.makeMenuItemsClickable();
    },
    
    makeMenuItemsClickable() {
        // Make flavor list items clickable
        const flavorItems = document.querySelectorAll('.flavor-list li');
        console.log('Found flavor items:', flavorItems.length);
        
        flavorItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const itemText = item.textContent.trim();
                console.log('Clicked flavor item:', itemText);
                this.showMenuItemPopup(itemText);
            });
        });
    },
    
    showMenuItemPopup(itemName) {
        console.log('showMenuItemPopup called with:', itemName);
        
        // Close giveaway popup if it exists
        const giveawayModal = document.getElementById('giveaway-modal');
        if (giveawayModal) {
            console.log('Closing giveaway popup');
            giveawayModal.remove();
            localStorage.setItem('giveaway-popup-seen', 'true');
        }
        
        // Remove any existing menu popup
        const existingPopup = document.getElementById('menuItemPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Get menu item data
        const menuData = this.getMenuItemData(itemName);
        
        // Create popup using the EXACT same approach as giveaway popup
        const modal = document.createElement('div');
        modal.id = 'menuItemPopup';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.85) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 999999 !important;
            padding: 1rem !important;
        `;
        
        // Create content - use EXACT same positioning as gallery
        const content = document.createElement('div');
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = (window.innerHeight / 2) + window.scrollY;
        
        content.style.cssText = `
            background: white !important;
            border-radius: 20px !important;
            padding: 1.5rem !important;
            max-width: 600px !important;
            width: 90% !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            position: absolute !important;
            left: ${viewportCenterX}px !important;
            top: ${viewportCenterY}px !important;
            transform: translate(-50%, -50%) !important;
            border: 3px solid #F6B6CF !important;
            box-sizing: border-box !important;
            z-index: 1000000 !important;
        `;
        
        content.innerHTML = `
            <button id="menuPopupClose" style="position: absolute; top: 0.5rem; right: 0.5rem; background: #F6B6CF; color: white; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 2rem; cursor: pointer; font-weight: bold; display: block; text-align: center; padding: 0; margin: 0; z-index: 10;">×</button>
            <div style="text-align: center; margin-bottom: 2rem;">
                ${menuData.image ? 
                    `<img src="${menuData.image}" alt="${menuData.title}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 20px; margin-bottom: 1rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">` : 
                    `<div style="font-size: 4rem; margin-bottom: 1rem;">${menuData.icon}</div>`
                }
                <h2 style="font-family: 'Chewy', cursive; color: #F6B6CF; font-size: 2rem; margin: 0;">${menuData.title}</h2>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Description</h3>
                <p style="color: #333; line-height: 1.6;">${menuData.description}</p>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Tasting Notes</h3>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${menuData.flavors.map(flavor => `<span style="background: #F6B6CF; color: white; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 600;">${flavor}</span>`).join('')}
                </div>
            </div>
            ${menuData.availableFlavors ? `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Available Flavors</h3>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; border-left: 4px solid #F6B6CF;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                            ${menuData.availableFlavors.slice(0, -1).map(flavor => `
                                <div style="background: white; padding: 0.5rem; border-radius: 8px; text-align: center; font-weight: 600; color: #333; border: 2px solid #F6B6CF; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    ${flavor}
                                </div>
                            `).join('')}
                        </div>
                        <div style="background: linear-gradient(135deg, #F6B6CF, #F7D56A); color: white; padding: 0.75rem; border-radius: 8px; text-align: center; font-weight: 600; font-style: italic;">
                            ${menuData.availableFlavors[menuData.availableFlavors.length - 1]}
                        </div>
                    </div>
                </div>
            ` : ''}
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Pricing</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${menuData.pricing.map(price => `
                        <div style="display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(246, 182, 207, 0.1); border-radius: 12px; border: 1px solid rgba(246, 182, 207, 0.3);">
                            <span style="font-weight: 600; color: #333;">${price.quantity}</span>
                            <span style="font-weight: 700; color: #F7D56A;">${price.price}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${menuData.specialNotes ? `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Special Notes</h3>
                    <p style="color: #333; line-height: 1.6; font-style: italic;">${menuData.specialNotes}</p>
                </div>
            ` : ''}
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Add click handlers
        const closeBtn = document.getElementById('menuPopupClose');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.remove();
            document.body.style.overflow = '';
        });
        
        // Also make it clickable on mousedown
        closeBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        console.log(`${menuData.title} popup created and shown!`);
    },
    
    getMenuItemData(itemName) {
        const menuData = {
            'cupcakes': {
                icon: '🧁',
                title: 'Cupcakes',
                description: 'Handcrafted cupcakes with premium ingredients and creative flavor combinations. Our cupcakes feature moist, tender cake bases topped with smooth, flavorful buttercream and decorative touches.',
                flavors: ['Lemon Burst', 'Orange Cranberry', 'Key Lime Pie', 'Chocolate Crunch', 'Cherry Bomb', 'Blue Razz Pop', 'Watermelon Splash', 'Rainbow Variety'],
                pricing: [
                    { quantity: 'Half Dozen', price: '$12' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'More flavors and rotating seasonal options available!'
            },
            'cake-pops': {
                icon: '🍭',
                title: 'Cake Pops',
                description: 'Perfect bite-sized treats made from crumbled cake mixed with frosting, shaped into balls, and dipped in premium chocolate. Each pop is hand-decorated with attention to detail.',
                flavors: ['Red Velvet Bliss', 'Birthday Confetti', 'Spooky Pop', 'Cookies & Cream Dream'],
                pricing: [
                    { quantity: '10 Pops', price: '$12' },
                    { quantity: '20 Pops', price: '$25' },
                    { quantity: '40 Pops', price: '$45' },
                    { quantity: '60+ Pops', price: '$60+' }
                ],
                specialNotes: 'Custom pricing available for events and large orders!'
            },
            'cakecicles': {
                icon: '🍰',
                title: 'Cakecicles',
                description: 'Our newest creation! Cakecicles are a delightful fusion of cake and popsicle, perfect for summer treats and special occasions.',
                flavors: ['Coming Soon'],
                pricing: [
                    { quantity: 'Pricing', price: 'TBD' }
                ],
                specialNotes: 'Stay tuned for our exciting new Cakecicles line!'
            },
            'cakes': {
                icon: '🎂',
                title: 'Custom Cakes',
                description: 'Beautiful custom cakes designed specifically for your special occasions. From birthday celebrations to weddings, we create stunning cakes that taste as good as they look.',
                flavors: ['Custom Flavors Available'],
                pricing: [
                    { quantity: 'Starting Price', price: '$75' }
                ],
                specialNotes: 'Custom designs and flavors available! Contact us to discuss your vision.'
            },
            'seasonal': {
                icon: '🎃',
                title: 'Seasonal & Specialty',
                description: 'Limited-time seasonal treats and specialty items that celebrate the flavors of each season. From holiday favorites to unique creations, these items are available for a limited time.',
                flavors: ['Pumpkin Butterscotch Bundts', 'Peppermint Mocha Pops', 'Breakable Hearts', 'Dubai Chocolate Bars', 'Chocolate-Dipped Strawberries', 'Seasonal Variety Packs'],
                pricing: [
                    { quantity: 'Prices', price: 'Vary by Item' }
                ],
                specialNotes: 'Requests open for custom seasonal creations!'
            }
        };
        
        // Handle individual flavor clicks
        if (itemName === 'Lemon Burst') {
            return {
                icon: '🍋',
                image: 'assets/lemon_burst.png',
                title: 'Lemon Burst Cupcake',
                description: 'Bright, buttery lemon cake made with fresh zest and juice, topped with smooth lemon buttercream, a candied lemon slice, and a sprig of rosemary.',
                flavors: ['Tangy', 'Fresh', 'Elegant'],
                pricing: [
                    { quantity: '6-Pack', price: '$20' },
                    { quantity: 'Dozen', price: '$35' }
                ],
                specialNotes: 'Made with real lemon zest and juice for authentic citrus flavor.'
            };
        }
        
        if (itemName === 'Orange Cranberry') {
            return {
                icon: '🍊',
                title: 'Orange Cranberry Cupcake',
                description: 'A citrus-cranberry cake bursting with orange zest, real orange juice, and tart dried cranberries. Topped with orange buttercream, sugared cranberries, and a glossy candied orange half-slice.',
                flavors: ['Fruity', 'Sweet-Tart', 'Festive'],
                pricing: [
                    { quantity: '6-Pack', price: '$20' },
                    { quantity: 'Dozen', price: '$35' }
                ],
                specialNotes: 'Perfect blend of citrus and tart cranberry flavors.'
            };
        }
        
        if (itemName === 'Key Lime Pie') {
            return {
                icon: '🥧',
                title: 'Key Lime Pie Cupcake',
                description: 'A smooth, tangy lime cupcake inspired by classic key lime pie. Finished with key lime buttercream, graham-cracker crumble, whipped cream swirl, and a candied lime slice.',
                flavors: ['Tart', 'Creamy', 'Tropical'],
                pricing: [
                    { quantity: '6-Pack', price: '$20' },
                    { quantity: 'Dozen', price: '$35' }
                ],
                specialNotes: 'Classic key lime pie flavors in cupcake form.'
            };
        }
        
        if (itemName === 'Chocolate Crunch') {
            return {
                icon: '🍫',
                title: 'Chocolate Crunch Cupcake',
                description: 'Rich chocolate cake blended with melted chocolate, crisped rice, and a hint of coffee for depth. Topped with chocolate buttercream, drizzle of homemade chocolate syrup, sprinkle of crunch, and a Hershey square.',
                flavors: ['Decadent', 'Crunchy', 'Fudgy'],
                pricing: [
                    { quantity: '6-Pack', price: '$25' },
                    { quantity: 'Dozen', price: '$45' }
                ],
                specialNotes: 'Rich chocolate indulgence with satisfying crunch.'
            };
        }
        
        if (itemName === 'Rainbow Variety Pack') {
            return {
                icon: '🌈',
                title: 'Rainbow Variety Pack',
                description: 'A colorful 6- or 12-pack featuring all the Fruit Blast flavors — Cherry Bomb, Blue Razz Pop, Watermelon Splash, and surprise limited-edition flavors! A party in every box.',
                flavors: ['Mixed Flavors', 'Vibrant Colors', 'Party Perfect'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Perfect for parties and celebrations with a mix of all our Fruit Blast flavors!'
            };
        }
        
        if (itemName === 'Red Velvet Bliss') {
            return {
                icon: '❤️',
                title: 'Red Velvet Bliss Cake Pop',
                description: 'Classic red velvet cake blended with smooth cream cheese–flavored frosting, dipped in creamy white chocolate, and sprinkled with red velvet crumbs for a timeless, elegant look.',
                flavors: ['Sweet Cream', 'Velvety', 'Southern Classic'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'A timeless classic with elegant cream cheese frosting.'
            };
        }
        
        if (itemName === 'Birthday Confetti') {
            return {
                icon: '🎉',
                title: 'Birthday Confetti Cake Pop',
                description: 'Colorful Funfetti cake mixed with fluffy vanilla frosting, dipped in creamy white chocolate, and topped with bright rainbow sprinkles — every bite is a party!',
                flavors: ['Sweet', 'Buttery', 'Fun'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Perfect for birthday celebrations and special occasions!'
            };
        }
        
        if (itemName === 'Chocolate Fudge') {
            return {
                icon: '🍫',
                title: 'Chocolate Fudge Cake Pop',
                description: 'Rich, fudgy chocolate cake blended with chocolate frosting, dipped in dark chocolate coating, and topped with a dusting of chocolate cake crumbs for a bold, melt-in-your-mouth treat.',
                flavors: ['Deep Cocoa', 'Silky', 'Indulgent'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Rich chocolate indulgence in every bite.'
            };
        }
        
        if (itemName === 'Cookies & Cream Dream') {
            return {
                icon: '🍪',
                title: 'Cookies & Cream Dream Cake Pop',
                description: 'Vanilla cake mixed with crushed chocolate sandwich cookies and vanilla frosting, dipped in smooth vanilla chocolate coating, and topped with Oreo crumbs for a creamy, crunchy finish.',
                flavors: ['Creamy', 'Crunchy', 'Classic Cookies & Cream'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'The perfect blend of creamy and crunchy textures.'
            };
        }
        
        if (itemName === 'Specialty Shapes (Ghosts, Pumpkins, etc.)') {
            return {
                icon: '👻',
                title: 'Specialty Shapes Cake Pops',
                description: 'Themed cake pops hand-shaped and custom-decorated for holidays and special events.',
                flavors: ['Custom Shaped', 'Holiday Themed', 'Special Occasion'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Perfect for Halloween, holidays, and special celebrations!'
            };
        }
        
        if (itemName === 'Red Velvet Bliss Cakesicle') {
            return {
                icon: '🍰',
                title: 'Red Velvet Bliss Cakesicle',
                description: 'Rich red velvet cake blended with cream cheese–flavored frosting, dipped in white chocolate, and topped with red cake crumbs.',
                flavors: ['Rich', 'Creamy', 'Classic'],
                pricing: [
                    { quantity: 'Each', price: '$4' },
                    { quantity: 'Dozen', price: '$36' }
                ],
                specialNotes: 'A classic red velvet flavor in cakesicle form.'
            };
        }
        
        if (itemName === 'Chocolate Fudge Cakesicle') {
            return {
                icon: '🍫',
                title: 'Chocolate Fudge Cakesicle',
                description: 'Dark chocolate cake mixed with chocolate frosting, dipped in fudge coating, topped with cocoa crumbs.',
                flavors: ['Rich', 'Fudgy', 'Decadent'],
                pricing: [
                    { quantity: 'Each', price: '$4' },
                    { quantity: 'Dozen', price: '$36' }
                ],
                specialNotes: 'Rich chocolate indulgence in every bite.'
            };
        }
        
        if (itemName === 'Cookies & Cream Dream Cakesicle') {
            return {
                icon: '🍪',
                title: 'Cookies & Cream Dream Cakesicle',
                description: 'Vanilla cake blended with crushed Oreos and frosting, coated in white chocolate, topped with cookie crumbs.',
                flavors: ['Creamy', 'Crunchy', 'Classic'],
                pricing: [
                    { quantity: 'Each', price: '$4' },
                    { quantity: 'Dozen', price: '$36' }
                ],
                specialNotes: 'The perfect blend of creamy and crunchy textures.'
            };
        }
        
        if (itemName === 'Birthday Confetti Cakesicle') {
            return {
                icon: '🎉',
                title: 'Birthday Confetti Cakesicle',
                description: 'Funfetti cake mixed with vanilla frosting, dipped in white chocolate, and finished with rainbow sprinkles.',
                flavors: ['Sweet', 'Colorful', 'Fun'],
                pricing: [
                    { quantity: 'Each', price: '$4' },
                    { quantity: 'Dozen', price: '$36' }
                ],
                specialNotes: 'Perfect for birthday celebrations!'
            };
        }
        
        if (itemName === 'Custom / Party Design Cakesicles') {
            return {
                icon: '💕',
                title: 'Custom / Party Design Cakesicles',
                description: 'Choose your flavor, color palette, or theme — includes colored drizzle, multiple sets, or molded shapes.',
                flavors: ['Custom Flavors', 'Themed Designs', 'Party Perfect'],
                pricing: [
                    { quantity: 'Starting at', price: '$3 each' },
                    { quantity: 'Party Packs', price: '$55-$90' }
                ],
                specialNotes: 'Add-ons: +$0.25–$1.00 each for detailing. Party Packs: $55–$90 depending on quantity and designs.'
            };
        }
        
        if (itemName === 'Custom Cakes') {
            return {
                icon: '🎂',
                title: 'Custom Cakes by Spooky Sweets',
                description: 'Your dream cake, made from scratch! Choose your size, flavor, and style — from simple buttercream designs to full themed creations. Every cake is handcrafted and completely customizable.',
                flavors: ['Vanilla Bean', 'Funfetti', 'Chocolate Fudge', 'Red Velvet', 'Cookies & Cream', 'Lemon Burst', 'Strawberry Shortcake', 'Orange Cranberry', 'Key Lime', 'Custom Request Flavors'],
                pricing: [
                    { quantity: '6" Cakes', price: 'Starting at $45' },
                    { quantity: 'Prices vary by', price: 'Size, flavor & design' }
                ],
                specialNotes: 'All cakes include 2 layers, filled and frosted in buttercream. Customize with buttercream, cream cheese, or whipped frosting, fondant or chocolate glaze, drip designs, shimmer, glitter effects, molded toppers, hand-piped flowers, ombré styles, multi-tier, sculpted, or character cakes.'
            };
        }
        
        if (itemName === 'Cherry Bomb') {
            return {
                icon: '🍒',
                title: 'Cherry Bomb Cupcake',
                description: 'Classic white cake bursting with cherry Kool-Aid flavor and topped with fluffy cherry-tinted frosting. Bright pink and bold in flavor — the ultimate nostalgic treat.',
                flavors: ['Sweet', 'Tart', 'Nostalgic'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Bold cherry Kool-Aid flavor that brings back childhood memories.'
            };
        }
        
        if (itemName === 'Blue Razz Pop') {
            return {
                icon: '💙',
                title: 'Blue Razz Pop Cupcake',
                description: 'Electric blue cupcakes made with blue-raspberry Kool-Aid for a sweet-tangy punch, finished with matching whipped frosting and a sparkle of edible glitter.',
                flavors: ['Tart', 'Sweet', 'Fun'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Electric blue color with a fun, tangy blue-raspberry flavor that pops!'
            };
        }
        
        if (itemName === 'Watermelon Splash') {
            return {
                icon: '🍉',
                title: 'Watermelon Splash Cupcake',
                description: 'Juicy and refreshing, this cupcake tastes like a bite of summer. Made with watermelon Kool-Aid and topped with pink-green whipped frosting.',
                flavors: ['Fruity', 'Refreshing', 'Summer Vibes'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Perfect summer treat that captures the essence of fresh watermelon!'
            };
        }
        
        if (itemName === 'Rainbow Variety Pack') {
            return {
                icon: '🌈',
                title: 'Rainbow Variety Pack Cupcakes',
                description: 'Can\'t choose just one? Get a colorful assortment of our Kool-Aid Fruit Blast cupcakes! Each pack features a mix of Cherry Bomb, Blue Razz Pop, and Watermelon Splash for a rainbow of fruity flavors.',
                flavors: ['Variety', 'Colorful', 'Fun'],
                pricing: [
                    { quantity: '6-Pack (2 of each)', price: '$14' },
                    { quantity: 'Dozen (4 of each)', price: '$25' }
                ],
                specialNotes: 'Perfect for parties or when you want to try all the flavors!'
            };
        }
        
        if (itemName === 'Pick Your Own Flavor') {
            return {
                icon: '✨',
                title: 'Pick Your Own Flavor Cupcake',
                description: 'Can\'t decide? Choose your favorite flavor for a custom batch — mix any Kool-Aid flavor into our vanilla cake base and whipped frosting for your perfect combo!',
                flavors: ['Customizable', 'Fun', 'Personal'],
                pricing: [
                    { quantity: '6-Pack', price: '$14' },
                    { quantity: 'Dozen', price: '$25' }
                ],
                specialNotes: 'Create your perfect flavor combination!',
                availableFlavors: [
                    'Cherry',
                    'Grape', 
                    'Lemon‑Lime',
                    'Orange',
                    'Raspberry',
                    'Strawberry',
                    'Tropical Punch',
                    'Lemonade',
                    'Pink Lemonade',
                    'Black Cherry',
                    'Mixed Berry',
                    'Watermelon',
                    'Peach Mango',
                    'Green Apple',
                    'Strawberry Kiwi',
                    'Blue Raspberry Lemonade',
                    'Sharkleberry Fin',
                    'Pink Lemonade',
                    'Plus specialty "Agua Frescas" flavors (e.g. Jamaica, Piña‑Pineapple etc.)'
                ]
            };
        }
        
        return menuData[itemName] || {
            icon: '🧁',
            title: itemName,
            description: 'Delicious handmade treat with premium ingredients.',
            flavors: ['Coming Soon'],
            pricing: [
                { quantity: 'Price', price: 'TBD' }
            ],
            specialNotes: 'More details coming soon!'
        };
    },
    
    populateLemonBurstPopup() {
        // Popup is already populated with Lemon Burst data in HTML
        // This method can be used to update content if needed
        console.log('Showing Lemon Burst Cupcake popup');
    },
    
    populateGenericPopup(itemName) {
        const popupIcon = document.getElementById('popupIcon');
        const popupTitle = document.getElementById('popupTitle');
        const popupDescription = document.getElementById('popupDescription');
        const popupTastingNotes = document.getElementById('popupTastingNotes');
        const popupIngredients = document.getElementById('popupIngredients');
        const popupPricing = document.getElementById('popupPricing');
        
        if (popupIcon) popupIcon.textContent = '🧁';
        if (popupTitle) popupTitle.textContent = itemName;
        if (popupDescription) {
            popupDescription.innerHTML = `
                <h4>Description</h4>
                <p>More details coming soon for ${itemName}!</p>
            `;
        }
        if (popupTastingNotes) {
            popupTastingNotes.innerHTML = `
                <h4>Tasting Notes</h4>
                <div class="tasting-tags">
                    <span class="tasting-tag">Coming Soon</span>
                </div>
            `;
        }
        if (popupIngredients) {
            popupIngredients.innerHTML = `
                <h4>Ingredients</h4>
                <p>Full ingredient list coming soon!</p>
            `;
        }
        if (popupPricing) {
            popupPricing.innerHTML = `
                <h4>Pricing</h4>
                <div class="price-options">
                    <div class="price-option">
                        <span class="price-quantity">Single</span>
                        <span class="price-amount">TBD</span>
                    </div>
                </div>
            `;
        }
    },
    
    closePopup() {
        const popup = document.getElementById('menuItemPopup');
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    handleOrderClick() {
        // Scroll to order form
        const orderSection = document.getElementById('order');
        if (orderSection) {
            orderSection.scrollIntoView({ behavior: 'smooth' });
        }
        this.closePopup();
    },
    
};

// ===== SCROLL ANIMATIONS =====
const scrollAnimations = {
    init() {
        this.initParallax();
        this.initScrollAnimations();
        this.initHeroAnimations();
        this.addSparkleEffect();
    },

    initParallax() {
        // Disabled parallax for better scroll performance
        // const hero = document.querySelector('.hero');
        // if (!hero) return;
        console.log('Parallax disabled for better scroll performance');
    },

    resetHeroOnScroll() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        // If we're back near the top, reset transform
        if (scrolled < 50) {
            hero.style.transform = 'translate3d(0, 0, 0)';
        }
    },

    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-animate-stagger');
        
        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Simplified animation triggering for better performance
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    },

    initHeroAnimations() {
        // Check if hero animations should play (once per session)
        const hasPlayed = sessionStorage.getItem('heroAnimationsPlayed');
        if (hasPlayed) return;

        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        // Animate words in headline
        const headlineWords = document.querySelectorAll('.word-animate');
        headlineWords.forEach((word, index) => {
            const delay = word.dataset.delay || index * 100;
            setTimeout(() => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            }, delay);
        });

        // Animate buttons
        const buttons = document.querySelectorAll('.hero-btn-animate');
        buttons.forEach((button, index) => {
            const delay = button.dataset.delay || 1000 + (index * 200);
            // Ensure buttons are visible immediately, then animate
            button.style.opacity = '1';
            button.style.transform = 'translateY(0) scale(1)';
            // Add a subtle entrance animation
            setTimeout(() => {
                button.style.animation = 'heroButtonReveal 0.6s ease-out forwards';
            }, delay);
        });

        // Mark as played
        sessionStorage.setItem('heroAnimationsPlayed', 'true');
    },

    addSparkleEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Remove existing sparkles
        const existingSparkles = hero.querySelectorAll('.sparkle');
        existingSparkles.forEach(sparkle => sparkle.remove());

        // Add sparkle CSS if not already added
        if (!document.querySelector('#sparkle-styles')) {
            const style = document.createElement('style');
            style.id = 'sparkle-styles';
            style.textContent = `
                .sparkle {
                    position: absolute;
                    width: 6px;
                    height: 6px;
                    background: radial-gradient(circle, #F6B6CF 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 2;
                    box-shadow: 0 0 8px rgba(246, 182, 207, 0.6);
                    animation: sparkleFloat 6s ease-in-out infinite;
                    will-change: transform, opacity;
                }
                
                @keyframes sparkleFloat {
                    0%, 100% { 
                        opacity: 0.2; 
                        transform: translateY(0) scale(0.5); 
                    }
                    50% { 
                        opacity: 0.8; 
                        transform: translateY(-20px) scale(1); 
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Create fewer, more optimized sparkles
        const sparkleCount = 8; // Reduced from 15
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            // Random position within hero bounds
            const heroRect = hero.getBoundingClientRect();
            const x = Math.random() * (heroRect.width - 20);
            const y = Math.random() * (heroRect.height - 20);
            
            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;
            sparkle.style.animationDelay = `${Math.random() * 6}s`;
            sparkle.style.animationDuration = `${4 + Math.random() * 4}s`;
            
            hero.appendChild(sparkle);
        }

        // Less frequent sparkle replacement for better performance
        setInterval(() => {
            const currentSparkles = hero.querySelectorAll('.sparkle');
            if (currentSparkles.length < sparkleCount) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                
                const heroRect = hero.getBoundingClientRect();
                const x = Math.random() * (heroRect.width - 20);
                const y = Math.random() * (heroRect.height - 20);
                
                sparkle.style.left = `${x}px`;
                sparkle.style.top = `${y}px`;
                sparkle.style.animationDelay = `${Math.random() * 6}s`;
                sparkle.style.animationDuration = `${4 + Math.random() * 4}s`;
                
                hero.appendChild(sparkle);
            }
        }, 5000); // Reduced frequency from 2s to 5s
    }
};

// ===== PHOTO GALLERY =====
const photoGallery = {
    init() {
        // Photo gallery is now handled by drive-gallery.js
        console.log('Photo gallery initialized - using Google Drive integration');
    }
};

// ===== YEAR UPDATE =====
const yearUpdate = {
    init() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
};

// ===== ACCESSIBILITY =====
const accessibility = {
    init() {
        this.initKeyboardNavigation();
        this.initFocusManagement();
        this.initReducedMotion();
    },

    initKeyboardNavigation() {
        // Add keyboard support for custom elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    initFocusManagement() {
        // Improve focus visibility
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--accent-pink)';
                element.style.outlineOffset = '2px';
            });

            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
    },

    initReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition', 'none');
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        }
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧁 Spooky Baby Sweets - Initializing...');
    
    try {
        // Initialize all modules
        smoothScroll.init();
        activeNav.init();
        formHandler.init();
        customDropdown.init();
        cardInteractions.init();
        scrollAnimations.init();
        photoGallery.init();
        yearUpdate.init();
        accessibility.init();
        
        // Update year
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
        
        console.log('✨ All systems ready! Welcome to Spooky Baby Sweets!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// Add the updateFlavorOptions function for custom dropdowns
function updateFlavorOptions(selectedItem) {
    console.log('updateFlavorOptions called with:', selectedItem);
    
    const flavorOptions = document.getElementById('flavorOptions');
    const flavorGroup = document.getElementById('flavorGroup');
    
    if (!flavorOptions || !flavorGroup) {
        console.error('Flavor elements not found');
        return;
    }
    
    // Clear existing options (keep the first placeholder option)
    flavorOptions.innerHTML = '<div class="custom-option" data-value="">Select a flavor...</div>';
    
    // Flavor data based on menu items from HTML with emojis
    const flavorData = {
        'cupcakes': [
            // Gourmet Heritage Line
            { value: 'lemon-burst', text: '🍋 Lemon Burst' },
            { value: 'orange-cranberry', text: '🍊 Orange Cranberry' },
            { value: 'key-lime-pie', text: '🥧 Key Lime Pie' },
            { value: 'chocolate-crunch', text: '🍫 Chocolate Crunch' },
            // Kool Aid Fruit Blast Line
            { value: 'cherry-bomb', text: '🍒 Cherry Bomb' },
            { value: 'blue-razz-pop', text: '💙 Blue Razz Pop' },
            { value: 'watermelon-splash', text: '🍉 Watermelon Splash' },
            { value: 'rainbow-variety-pack', text: '🌈 Rainbow Variety Pack' },
            { value: 'pick-your-own-flavor', text: '✨ Pick Your Own Flavor' }
        ],
        'cake-pops': [
            { value: 'red-velvet-bliss', text: '❤️ Red Velvet Bliss' },
            { value: 'birthday-confetti', text: '🎉 Birthday Confetti' },
            { value: 'chocolate-fudge', text: '🍫 Chocolate Fudge' },
            { value: 'cookies-cream-dream', text: '🍪 Cookies & Cream Dream' },
            { value: 'specialty-shapes', text: '👻 Specialty Shapes (Ghosts, Pumpkins, etc.)' }
        ],
        'cakecicles': [
            { value: 'red-velvet-bliss-cakesicle', text: '🍰 Red Velvet Bliss Cakesicle' },
            { value: 'chocolate-fudge-cakesicle', text: '🍫 Chocolate Fudge Cakesicle' },
            { value: 'cookies-cream-dream-cakesicle', text: '🍪 Cookies & Cream Dream Cakesicle' },
            { value: 'birthday-confetti-cakesicle', text: '🎉 Birthday Confetti Cakesicle' },
            { value: 'custom-party-design-cakesicles', text: '💕 Custom / Party Design Cakesicles' }
        ],
        'cakes': [
            { value: 'custom-cakes', text: '🎂 Custom Cakes' }
        ],
        'seasonal': [
            { value: 'pumpkin-butterscotch-bundts', text: '🎃 Pumpkin Butterscotch Bundts' },
            { value: 'peppermint-mocha-pops', text: '🍃 Peppermint Mocha Pops' },
            { value: 'breakable-hearts', text: '💔 Breakable Hearts' },
            { value: 'dubai-chocolate-bars', text: '🇦🇪 Dubai Chocolate Bars' },
            { value: 'chocolate-dipped-strawberries', text: '🍓 Chocolate-Dipped Strawberries' },
            { value: 'seasonal-variety-packs', text: '🎁 Seasonal Variety Packs' }
        ]
    };
    
    if (selectedItem && flavorData[selectedItem]) {
        console.log('Adding flavor options for:', selectedItem);
        
        // Add flavor options to the custom dropdown
        flavorData[selectedItem].forEach(flavor => {
            const option = document.createElement('div');
            option.className = 'custom-option';
            option.setAttribute('data-value', flavor.value);
            option.textContent = flavor.text;
            flavorOptions.appendChild(option);
        });
        
        console.log('Flavor options added successfully');
    } else {
        console.log('No flavor data for:', selectedItem);
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const itemDropdown = document.getElementById('itemDropdown');
    const flavorDropdown = document.getElementById('flavorDropdown');
    
    if (itemDropdown && !itemDropdown.contains(e.target)) {
        itemDropdown.classList.remove('open');
        const itemFormGroup = itemDropdown.closest('.form-group');
        if (itemFormGroup) {
            itemFormGroup.classList.remove('dropdown-open');
        }
    }
    
    if (flavorDropdown && !flavorDropdown.contains(e.target)) {
        flavorDropdown.classList.remove('open');
        const flavorFormGroup = flavorDropdown.closest('.form-group');
        if (flavorFormGroup) {
            flavorFormGroup.classList.remove('dropdown-open');
        }
    }
});

// ===== GIVEAWAY FUNCTIONALITY =====
const giveaway = {
    // Check if user has seen the popup before
    hasSeenPopup() {
        return localStorage.getItem('giveaway-popup-seen') === 'true';
    },
    
    // Mark popup as seen
    markPopupSeen() {
        localStorage.setItem('giveaway-popup-seen', 'true');
    },
    
    // Check if banner should be hidden
    isBannerHidden() {
        return localStorage.getItem('giveaway-banner-hidden') === 'true';
    },
    
    // Hide banner
    hideBanner() {
        localStorage.setItem('giveaway-banner-hidden', 'true');
    },
    
    // Show popup
    showPopup() {
        console.log('Creating proper modal popup');
        
        // Check if popup already exists
        if (document.getElementById('giveaway-modal')) {
            console.log('Popup already exists, not creating another');
            return;
        }
        
        // Create the modal popup
        const modal = document.createElement('div');
        modal.id = 'giveaway-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.9) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 100000 !important;
            font-family: Arial, sans-serif !important;
        `;
        
        // Add background click handler
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.remove();
                localStorage.setItem('giveaway-popup-seen', 'true');
            }
        };
        
        modal.innerHTML = `
            <div onclick="event.stopPropagation();" style="
                background: linear-gradient(135deg, #F6B6CF, #F7D56A) !important;
                color: #1F1F1F !important;
                padding: 2rem !important;
                border-radius: 20px !important;
                text-align: center !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                position: relative !important;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
                margin: 1rem !important;
            ">
                <button onclick="event.preventDefault(); event.stopPropagation(); document.getElementById('giveaway-modal').remove(); localStorage.setItem('giveaway-popup-seen', 'true');" style="
                    position: absolute !important;
                    top: 1rem !important;
                    right: 1rem !important;
                    background: #1F1F1F !important;
                    color: #F6B6CF !important;
                    border: none !important;
                    border-radius: 50% !important;
                    width: 40px !important;
                    height: 40px !important;
                    cursor: pointer !important;
                    font-size: 20px !important;
                    font-weight: bold !important;
                ">×</button>
                
                <h2 style="
                    font-family: 'Chewy', cursive !important;
                    font-size: 2rem !important;
                    margin-bottom: 1.5rem !important;
                    color: #1F1F1F !important;
                    line-height: 1.2 !important;
                ">🎉 Instagram Giveaway! 🎉</h2>
                
                <p style="
                    font-size: 1.1rem !important;
                    margin-bottom: 1rem !important;
                    color: #1F1F1F !important;
                    font-weight: 600 !important;
                    line-height: 1.4 !important;
                ">We're celebrating 100 followers on Instagram with a special giveaway!</p>
                
                <p style="
                    font-size: 1rem !important;
                    margin-bottom: 2rem !important;
                    color: #1F1F1F !important;
                    line-height: 1.4 !important;
                ">Follow us for a chance to win free cupcakes and cake pops!</p>
                
                <div style="
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 1rem !important;
                    justify-content: center !important;
                    align-items: center !important;
                ">
                    <a href="https://www.instagram.com/spookybabysweets/" target="_blank" rel="noopener noreferrer" style="
                        background: #1F1F1F !important;
                        color: #F6B6CF !important;
                        padding: 1rem 2rem !important;
                        border-radius: 25px !important;
                        text-decoration: none !important;
                        font-weight: 600 !important;
                        font-size: 1rem !important;
                        display: inline-block !important;
                        width: 100% !important;
                        max-width: 250px !important;
                        text-align: center !important;
                    ">Follow on Instagram</a>
                    <button onclick="event.preventDefault(); event.stopPropagation(); document.getElementById('giveaway-modal').remove(); localStorage.setItem('giveaway-popup-seen', 'true');" style="
                        background: #F7D56A !important;
                        color: #1F1F1F !important;
                        padding: 1rem 2rem !important;
                        border-radius: 25px !important;
                        border: none !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        font-size: 1rem !important;
                        width: 100% !important;
                        max-width: 250px !important;
                    ">Maybe Later</button>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modal);
        
        console.log('MODAL POPUP CREATED - should be visible now!');
    },
    
    // Hide popup
    hidePopup() {
        const popup = document.getElementById('giveawayPopup');
        if (popup) {
            popup.classList.remove('show');
            document.body.style.overflow = '';
        }
    },
    
    // Hide banner
    hideBannerElement() {
        const banner = document.getElementById('giveawayBanner');
        if (banner) {
            banner.style.display = 'none';
        }
    },
    
    // Initialize giveaway features
    init() {
        console.log('Giveaway init started');
        
        // Set up event listeners first
        this.setupEventListeners();
        
        // Show popup for first-time visitors
        if (!this.hasSeenPopup()) {
            console.log('First time visitor - showing popup');
            setTimeout(() => {
                console.log('Attempting to show popup');
                this.showPopup();
            }, 2000);
        } else {
            console.log('Returning visitor - popup already seen');
        }
        
        console.log('Banner should be visible');
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Popup close button
        const popupClose = document.getElementById('popupClose');
        if (popupClose) {
            popupClose.addEventListener('click', () => {
                this.hidePopup();
                this.markPopupSeen();
            });
        }
        
        // Popup "Maybe Later" button
        const popupLater = document.getElementById('popupLater');
        if (popupLater) {
            popupLater.addEventListener('click', () => {
                this.hidePopup();
                this.markPopupSeen();
            });
        }
        
        // Close popup when clicking outside
        const popup = document.getElementById('giveawayPopup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hidePopup();
                    this.markPopupSeen();
                }
            });
        }
        
        // Close popup with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const popup = document.getElementById('giveawayPopup');
                if (popup && popup.classList.contains('show')) {
                    this.hidePopup();
                    this.markPopupSeen();
                }
            }
        });
    }
};

// ===== HERO CAROUSEL =====
const heroCarousel = {
    currentSlide: 0,
    slides: [],
    indicators: [],
    intervalId: null,
    autoSwipeInterval: 4000, // 4 seconds
    isPaused: false,

    init() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.hero-indicator');
        
        if (this.slides.length === 0) {
            // Retry once if slides aren't found yet
            setTimeout(() => {
                this.init();
            }, 50);
            return;
        }
        
        // Ensure first slide is active immediately
        if (this.slides.length > 0) {
            this.goToSlide(0);
        }
        
        // Set up indicator click handlers
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
                // Restart auto-swipe after manual navigation
                this.startAutoSwipe();
            });
        });
        
        // Pause on hover
        const heroCarouselElement = document.querySelector('.hero-carousel');
        if (heroCarouselElement) {
            heroCarouselElement.addEventListener('mouseenter', () => {
                this.isPaused = true;
                this.stopAutoSwipe();
            });
            
            heroCarouselElement.addEventListener('mouseleave', () => {
                this.isPaused = false;
                this.startAutoSwipe();
            });
        }
        
        // Pause when page is not visible (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoSwipe();
            } else if (!this.isPaused) {
                this.startAutoSwipe();
            }
        });
        
        // Start auto-swipe immediately
        this.startAutoSwipe();
    },

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        // Remove active class from all slides and indicators
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
    },

    nextSlide() {
        if (this.slides.length === 0) return;
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    },

    startAutoSwipe() {
        // Don't start if paused or no slides
        if (this.isPaused || this.slides.length === 0) return;
        
        // Clear any existing interval first
        this.stopAutoSwipe();
        
        // Start new interval
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.autoSwipeInterval);
    },

    stopAutoSwipe() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// Try to initialize carousel immediately if DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeAll();
    });
} else {
    // DOM is already ready, initialize immediately
    initializeAll();
}

function initializeAll() {
    console.log('Initializing features');
    
    // For testing - clear localStorage to simulate first visit
    localStorage.removeItem('giveaway-popup-seen');
    
    giveaway.init();
    
    // Initialize hero carousel immediately
    heroCarousel.init();
}

// Also initialize carousel on window load as backup
window.addEventListener('load', () => {
    // Re-initialize carousel if it hasn't started properly
    if (heroCarousel.slides.length === 0 || !heroCarousel.intervalId) {
        console.log('Re-initializing hero carousel on window load');
        heroCarousel.init();
    }
});

