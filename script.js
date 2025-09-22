// ===== CONFIGURATION =====
const CONFIG = {
    FORMSPREE_ID: 'xovkawkn', // Your Formspree ID
    EMAIL_FALLBACK: 'orders@spookybabysweets.com'
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
            
            customSelect.classList.toggle('open');
            console.log('Dropdown open state:', customSelect.classList.contains('open'));
            
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
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(246, 182, 207, 0.3)';
    },

    handleMouseLeave(e) {
        const card = e.currentTarget;
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
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
        const hero = document.querySelector('.hero');
        if (!hero) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Smooth parallax with boundary checks
            if (scrolled < window.innerHeight) {
                hero.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
        
        // Reset hero when scrolling back to top
        window.addEventListener('scroll', this.resetHeroOnScroll.bind(this));
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
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
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
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0) scale(1)';
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
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle, #F6B6CF 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                    box-shadow: 0 0 10px rgba(246, 182, 207, 0.8);
                    animation: sparkleFloat 3s ease-in-out infinite;
                }
                
                @keyframes sparkleFloat {
                    0%, 100% { 
                        opacity: 0; 
                        transform: translateY(0) scale(0.5); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translateY(-20px) scale(1); 
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Create sparkles
        const sparkleCount = 12;
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                
                // Random position within hero bounds
                const heroRect = hero.getBoundingClientRect();
                const x = Math.random() * (heroRect.width - 20);
                const y = Math.random() * (heroRect.height - 20);
                
                sparkle.style.left = `${x}px`;
                sparkle.style.top = `${y}px`;
                sparkle.style.animationDelay = `${Math.random() * 2}s`;
                sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
                
                hero.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.remove();
                    }
                }, 4000);
            }, i * 200);
        }
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
