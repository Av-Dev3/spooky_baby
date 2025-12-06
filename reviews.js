// ===== REVIEWS SECTION JAVASCRIPT =====

class ReviewsManager {
    constructor() {
        // Initialize Supabase client
        // Replace these with your actual Supabase project URL and anon key
        this.supabaseUrl = window.SUPABASE_URL || '';
        this.supabaseKey = window.SUPABASE_ANON_KEY || '';
        
        if (!this.supabaseUrl || !this.supabaseKey) {
            console.warn('⚠️ Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
            this.supabase = null;
        } else {
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
        }
        
        this.init();
    }
    
    init() {
        this.setupFormHandling();
        this.loadReviews();
    }
    
    setupFormHandling() {
        const reviewForm = document.getElementById('reviewForm');
        if (!reviewForm) return;
        
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(e);
        });
        
        // Star rating hover and click effects
        const starRating = document.querySelector('.star-rating');
        if (starRating) {
            const stars = document.querySelectorAll('.star-rating label.star');
            stars.forEach(star => {
                star.addEventListener('mouseenter', (e) => {
                    const rating = parseInt(e.target.dataset.rating);
                    this.highlightStars(rating);
                });
            });
            
            starRating.addEventListener('mouseleave', () => {
                const selectedRating = document.querySelector('.star-rating input[type="radio"]:checked');
                if (selectedRating) {
                    this.highlightStars(parseInt(selectedRating.value));
                } else {
                    this.highlightStars(0);
                }
            });
            
            // Update stars when a rating is selected
            const radioInputs = document.querySelectorAll('.star-rating input[type="radio"]');
            radioInputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.highlightStars(parseInt(input.value));
                });
            });
        }
    }
    
    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-rating label.star');
        stars.forEach((star, index) => {
            const starRating = 5 - index; // Reverse order
            if (starRating <= rating) {
                star.style.color = 'var(--accent-yellow)';
            } else {
                star.style.color = 'rgba(255, 193, 7, 0.3)';
            }
        });
    }
    
    async handleFormSubmission(e) {
        if (!this.supabase) {
            this.showMessage('Please configure Supabase credentials to submit reviews.', 'error');
            return;
        }
        
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const rating = parseInt(formData.get('rating'));
        const text = formData.get('text').trim();
        
        // Validate
        if (!name || !rating || !text) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        if (rating < 1 || rating > 5) {
            this.showMessage('Please select a valid rating.', 'error');
            return;
        }
        
        // Disable form
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Insert review into Supabase
            const { data, error } = await this.supabase
                .from('reviews')
                .insert([
                    {
                        name: name,
                        rating: rating,
                        text: text,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
            
            if (error) {
                throw error;
            }
            
            // Success
            this.showMessage('Thank you for your review! It will appear shortly.', 'success');
            form.reset();
            this.highlightStars(0);
            
            // Reload reviews
            setTimeout(() => {
                this.loadReviews();
            }, 1000);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            this.showMessage('Sorry, there was an error submitting your review. Please try again later.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async loadReviews() {
        const reviewsDisplay = document.getElementById('reviewsDisplay');
        if (!reviewsDisplay) return;
        
        if (!this.supabase) {
            reviewsDisplay.innerHTML = '<div class="reviews-empty">Reviews feature not configured. Please set up Supabase.</div>';
            return;
        }
        
        reviewsDisplay.innerHTML = '<div class="reviews-loading">Loading reviews...</div>';
        
        try {
            // Fetch reviews from Supabase, ordered by most recent first
            const { data, error } = await this.supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            if (!data || data.length === 0) {
                reviewsDisplay.innerHTML = '<div class="reviews-empty">No reviews yet. Be the first to leave a review!</div>';
                return;
            }
            
            // Display reviews
            reviewsDisplay.innerHTML = '';
            data.forEach(review => {
                const reviewCard = this.createReviewCard(review);
                reviewsDisplay.appendChild(reviewCard);
            });
            
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsDisplay.innerHTML = '<div class="reviews-empty">Sorry, there was an error loading reviews. Please try again later.</div>';
        }
    }
    
    createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const date = new Date(review.created_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Create star rating display
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<span class="star">★</span>';
            } else {
                starsHtml += '<span class="star empty">★</span>';
            }
        }
        
        card.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-name">${this.escapeHtml(review.name)}</div>
                    <div class="review-date">${formattedDate}</div>
                </div>
            </div>
            <div class="review-rating">
                ${starsHtml}
            </div>
            <div class="review-text">${this.escapeHtml(review.text)}</div>
        `;
        
        return card;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showMessage(message, type) {
        const messageEl = document.getElementById('reviewFormMessage');
        if (!messageEl) return;
        
        messageEl.textContent = message;
        messageEl.className = `review-form-message ${type}`;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageEl.className = 'review-form-message';
                messageEl.textContent = '';
            }, 5000);
        }
    }
}

// Initialize reviews manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('⭐ Reviews Manager - Initializing...');
    
    try {
        new ReviewsManager();
        console.log('✨ Reviews Manager ready!');
    } catch (error) {
        console.error('❌ Reviews Manager initialization error:', error);
    }
});

