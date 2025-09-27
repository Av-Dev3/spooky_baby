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
        }
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
        const customSelect = document.getElementById('customSelect');
        const trigger = customSelect?.querySelector('.custom-select-trigger');
        const options = customSelect?.querySelector('.custom-select-options');
        const hiddenInput = document.getElementById('item');
        const selectText = customSelect?.querySelector('.custom-select-text');
        
        console.log('Custom dropdown elements:', { customSelect, trigger, options, hiddenInput, selectText });
        
        if (!customSelect || !trigger || !options || !hiddenInput) {
            console.error('Custom dropdown elements not found');
            return;
        }
        
        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Dropdown trigger clicked');
            
            // Auto-select first option when opening (if nothing is selected)
            if (!hiddenInput.value && options.children.length > 0) {
                const firstOption = options.children[0];
                const value = firstOption.getAttribute('data-value');
                const text = firstOption.textContent;
                
                hiddenInput.value = value;
                selectText.textContent = text;
                firstOption.classList.add('selected');
            }
            
            const isOpen = customSelect.classList.contains('open');
            customSelect.classList.toggle('open');
            
            // Position dropdown options dynamically
            if (customSelect.classList.contains('open')) {
                const triggerRect = trigger.getBoundingClientRect();
                options.style.position = 'fixed';
                options.style.top = `${triggerRect.bottom}px`;
                options.style.left = `${triggerRect.left}px`;
                options.style.width = `${triggerRect.width}px`;
                options.style.zIndex = '999999';
                console.log('Dropdown positioned at:', {
                    top: triggerRect.bottom,
                    left: triggerRect.left,
                    width: triggerRect.width
                });
            }
            
            console.log('Dropdown open state:', customSelect.classList.contains('open'));
            console.log('Options element:', options);
            console.log('Options visibility:', getComputedStyle(options).visibility);
            console.log('Options opacity:', getComputedStyle(options).opacity);
            
            // Close other dropdowns if any
            document.querySelectorAll('.custom-select').forEach(select => {
                if (select !== customSelect) {
                    select.classList.remove('open');
                }
            });
        });
        
        // Handle option selection
        options.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            console.log('Option clicked:', option);
            if (!option || option.classList.contains('disabled')) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            console.log('Selected option:', { value, text });
            
            // Update hidden input
            hiddenInput.value = value;
            console.log('Hidden input value set to:', hiddenInput.value);
            
            // Update display text
            selectText.textContent = text;
            
            // Update selected state
            options.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Close dropdown
            customSelect.classList.remove('open');
            
            // Trigger change event to update flavor dropdown
            const changeEvent = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(changeEvent);
            console.log('Change event dispatched for item selection');
            
            // Trigger validation if needed
            if (hiddenInput.checkValidity) {
                hiddenInput.checkValidity();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });
        
        // Reposition dropdown on window resize
        window.addEventListener('resize', () => {
            if (customSelect.classList.contains('open')) {
                const triggerRect = trigger.getBoundingClientRect();
                options.style.top = `${triggerRect.bottom}px`;
                options.style.left = `${triggerRect.left}px`;
                options.style.width = `${triggerRect.width}px`;
            }
        });
        
        // Keyboard navigation
        customSelect.addEventListener('keydown', (e) => {
            const isOpen = customSelect.classList.contains('open');
            const optionElements = Array.from(options.querySelectorAll('.custom-option:not(.disabled)'));
            const currentSelected = options.querySelector('.custom-option.selected');
            let currentIndex = currentSelected ? optionElements.indexOf(currentSelected) : -1;
            
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (!isOpen) {
                        customSelect.classList.add('open');
                    } else if (currentIndex >= 0) {
                        optionElements[currentIndex].click();
                    }
                    break;
                    
                case 'Escape':
                    customSelect.classList.remove('open');
                    trigger.focus();
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (!isOpen) {
                        customSelect.classList.add('open');
                    } else {
                        currentIndex = Math.min(currentIndex + 1, optionElements.length - 1);
                        this.highlightOption(optionElements[currentIndex]);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (isOpen) {
                        currentIndex = Math.max(currentIndex - 1, 0);
                        this.highlightOption(optionElements[currentIndex]);
                    }
                    break;
            }
        });
    },

    initFlavorDropdown() {
        const flavorSelect = document.getElementById('flavorSelect');
        const flavorTrigger = flavorSelect?.querySelector('.custom-select-trigger');
        const flavorOptions = document.getElementById('flavorOptions');
        const flavorInput = document.getElementById('flavor');
        const flavorText = flavorTrigger?.querySelector('.custom-select-text');
        const flavorGroup = document.getElementById('flavorGroup');
        
        if (!flavorSelect || !flavorTrigger || !flavorOptions || !flavorInput) {
            console.error('Flavor dropdown elements not found');
            return;
        }

        // Flavor data based on menu items (custom requests don't need flavors)
        const flavorData = {
            'cupcakes': [
                { value: 'lemon-burst', text: 'Lemon Burst' },
                { value: 'orange-cranberry', text: 'Orange Cranberry' },
                { value: 'key-lime-pie', text: 'Key Lime Pie' },
                { value: 'chocolate-crunch', text: 'Chocolate Crunch' },
                { value: 'cherry', text: 'Cherry' },
                { value: 'grape', text: 'Grape' },
                { value: 'orange', text: 'Orange' },
                { value: 'strawberry', text: 'Strawberry' }
            ],
            'cake-pops': [
                { value: 'vanilla-bean', text: 'Vanilla Bean' },
                { value: 'rich-chocolate', text: 'Rich Chocolate' },
                { value: 'red-velvet', text: 'Red Velvet' },
                { value: 'pumpkin-spice', text: 'Pumpkin Spice' },
                { value: 'caramel-apple', text: 'Caramel Apple' },
                { value: 'gingerbread', text: 'Gingerbread' }
            ],
            'cakes': [
                { value: 'custom-cakes', text: 'Custom Cakes' }
            ],
            'seasonal': [
                { value: 'ghostly-meringues', text: 'Ghostly Meringues' },
                { value: 'spiderweb-brownies', text: 'Spiderweb Brownies' },
                { value: 'witchs-brew-cookies', text: 'Witch\'s Brew Cookies' },
                { value: 'custom-cakes', text: 'Custom Cakes' },
                { value: 'party-platters', text: 'Party Platters' },
                { value: 'event-favors', text: 'Event Favors' }
            ]
            // Note: 'custom' is intentionally excluded - no flavor dropdown for custom requests
        };

        // Listen for item selection changes
        const itemInput = document.getElementById('item');
        itemInput.addEventListener('change', () => {
            const selectedItem = itemInput.value;
            console.log('Item changed to:', selectedItem);
            this.updateFlavorOptions(flavorData, selectedItem, flavorOptions, flavorGroup, flavorText, flavorInput);
        });

        // Toggle flavor dropdown
        flavorTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            flavorSelect.classList.toggle('open');
        });

        // Handle flavor option selection
        flavorOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            flavorInput.value = value;
            flavorText.textContent = text;
            
            // Update selected state
            flavorOptions.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            // Close dropdown
            flavorSelect.classList.remove('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!flavorSelect.contains(e.target)) {
                flavorSelect.classList.remove('open');
            }
        });
    },

    updateFlavorOptions(flavorData, selectedItem, flavorOptions, flavorGroup, flavorText, flavorInput) {
        console.log('updateFlavorOptions called with:', selectedItem);
        console.log('Available flavor data:', flavorData);
        
        // Clear existing options
        flavorOptions.innerHTML = '';
        
        // Reset flavor selection
        flavorInput.value = '';
        flavorText.textContent = 'Select a flavor...';
        
        if (selectedItem && flavorData[selectedItem]) {
            console.log('Showing flavor group for:', selectedItem);
            console.log('Flavors available:', flavorData[selectedItem]);
            
            // Show flavor group with animation
            flavorGroup.style.display = 'block';
            setTimeout(() => {
                flavorGroup.classList.add('show');
                console.log('Flavor group should now be visible');
            }, 10);
            
            // Add flavor options
            flavorData[selectedItem].forEach(flavor => {
                const option = document.createElement('div');
                option.className = 'custom-option';
                option.setAttribute('data-value', flavor.value);
                option.textContent = flavor.text;
                flavorOptions.appendChild(option);
            });
            
            console.log('Added', flavorData[selectedItem].length, 'flavor options');
        } else {
            console.log('Hiding flavor group');
            // Hide flavor group with animation
            flavorGroup.classList.remove('show');
            setTimeout(() => {
                flavorGroup.style.display = 'none';
            }, 300);
        }
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
    }
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

// ===== INSTAGRAM FEED =====
const instagramFeed = {
    init() {
        // Instagram embed is now handled by the HTML and Instagram's embed.js script
        console.log('Instagram embed initialized - using official Instagram embed');
        this.initializeEmbed();
    },

    initializeEmbed() {
        // The Instagram embed script will automatically process the blockquote
        // and replace it with the actual Instagram content
        console.log('Instagram embed will load your real posts automatically');
        
        // Optional: Add any custom styling or interactions here
        this.addCustomStyling();
    },

    addCustomStyling() {
        // Add any custom styling or interactions for the Instagram embed
        const embedContainer = document.querySelector('.instagram-embed-container');
        if (embedContainer) {
            // Add any custom classes or styling here if needed
            embedContainer.classList.add('instagram-embed-loaded');
        }
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
        instagramFeed.init();
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
