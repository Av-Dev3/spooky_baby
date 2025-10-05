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
            if (value && value !== 'custom' && value !== 'cakecicles') {
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
        });
        
        console.log('Flavor dropdown initialized');
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
            
            // Determine if this is a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                isDragging = true;
                e.preventDefault();
                
                // Add visual feedback during swipe
                const progress = Math.min(Math.abs(diffX) / 100, 1);
                swipeTrack.style.opacity = 1 - (progress * 0.1);
            }
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
                <div style="font-size: 4rem; margin-bottom: 1rem;">${menuData.icon}</div>
                <h2 style="font-family: 'Chewy', cursive; color: #F6B6CF; font-size: 2rem; margin: 0;">${menuData.title}</h2>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Description</h3>
                <p style="color: #333; line-height: 1.6;">${menuData.description}</p>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #F7D56A; font-family: 'Chewy', cursive; margin-bottom: 0.5rem;">Available Flavors</h3>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${menuData.flavors.map(flavor => `<span style="background: #F6B6CF; color: white; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 600;">${flavor}</span>`).join('')}
                </div>
            </div>
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
            { value: 'rainbow-variety-pack', text: '🌈 Rainbow Variety Pack' }
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

// Initialize giveaway functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing giveaway');
    
    // For testing - clear localStorage to simulate first visit
    localStorage.removeItem('giveaway-popup-seen');
    
    giveaway.init();
});

