// ===== MENU PAGE JAVASCRIPT =====

class MenuPage {
    constructor() {
        this.currentCategory = 'all';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.animateHero();
        this.setupScrollAnimations();
        this.setCurrentYear();
    }
    
    setupEventListeners() {
        // Menu tab navigation
        document.querySelectorAll('.menu-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.switchCategory(category);
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.menu-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Show/hide categories
        document.querySelectorAll('.menu-category').forEach(categoryEl => {
            if (category === 'all' || categoryEl.dataset.category === category) {
                categoryEl.classList.remove('hidden');
                categoryEl.style.opacity = '1';
                categoryEl.style.transform = 'translateY(0)';
            } else {
                categoryEl.classList.add('hidden');
                categoryEl.style.opacity = '0';
                categoryEl.style.transform = 'translateY(20px)';
            }
        });
        
        this.currentCategory = category;
        
        // Scroll to the menu section
        setTimeout(() => {
            const menuSection = document.querySelector('.menu-section');
            if (menuSection) {
                menuSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
        
        // Add a subtle animation to the visible categories
        setTimeout(() => {
            document.querySelectorAll('.menu-category:not(.hidden)').forEach((categoryEl, index) => {
                categoryEl.style.transition = 'all 0.5s ease';
                setTimeout(() => {
                    categoryEl.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 50);
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
        
        // Animate hero buttons
        const buttons = document.querySelectorAll('.hero-btn-animate');
        buttons.forEach((button, index) => {
            const delay = button.dataset.delay || (index * 200) + 1000;
            setTimeout(() => {
                button.classList.add('animate');
            }, delay);
        });
    }
    
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe flavor items for scroll animations
        document.querySelectorAll('.flavor-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s ease';
            observer.observe(item);
        });
        
        // Observe category headers
        document.querySelectorAll('.category-header').forEach(header => {
            header.style.opacity = '0';
            header.style.transform = 'translateY(30px)';
            header.style.transition = 'all 0.6s ease';
            observer.observe(header);
        });
    }
    
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to flavor items
    document.querySelectorAll('.flavor-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to menu tabs
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add floating animation to flavor icons
    document.querySelectorAll('.flavor-icon').forEach(icon => {
        const delay = Math.random() * 2;
        icon.style.animationDelay = `${delay}s`;
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .menu-tab {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Initialize menu page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧁 Menu Page - Initializing...');
    
    try {
        new MenuPage();
        console.log('✨ Menu Page ready!');
    } catch (error) {
        console.error('❌ Menu Page initialization error:', error);
    }
});
