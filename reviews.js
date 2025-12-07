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
        this.setupPhotoPreview();
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
        const photoFiles = form.querySelector('#reviewPhoto').files;
        
        // Validate
        if (!name || !rating || !text) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        if (rating < 1 || rating > 5) {
            this.showMessage('Please select a valid rating.', 'error');
            return;
        }
        
        // Validate photos if provided
        if (photoFiles && photoFiles.length > 0) {
            if (photoFiles.length > 5) {
                this.showMessage('You can upload up to 5 photos.', 'error');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            for (let i = 0; i < photoFiles.length; i++) {
                const file = photoFiles[i];
                if (file.size > 5 * 1024 * 1024) { // 5MB limit per file
                    this.showMessage(`Photo "${file.name}" is too large. Max size is 5MB per photo.`, 'error');
                    return;
                }
                if (!validTypes.includes(file.type)) {
                    this.showMessage(`Photo "${file.name}" is not a valid format. Please use JPG, PNG, or WebP.`, 'error');
                    return;
                }
            }
        }
        
        // Disable form
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            let imageUrls = [];
            
            // Upload photos to Supabase Storage if provided
            if (photoFiles && photoFiles.length > 0) {
                submitBtn.textContent = `Uploading ${photoFiles.length} photo${photoFiles.length > 1 ? 's' : ''}...`;
                
                // Upload all photos
                for (let i = 0; i < photoFiles.length; i++) {
                    const file = photoFiles[i];
                    const imageUrl = await this.uploadPhoto(file, name);
                    if (imageUrl) {
                        imageUrls.push(imageUrl);
                    }
                }
                
                if (imageUrls.length === 0 && photoFiles.length > 0) {
                    throw new Error('Failed to upload photos');
                }
            }
            
            submitBtn.textContent = 'Submitting review...';
            
            // Insert review into Supabase
            const reviewData = {
                name: name,
                rating: rating,
                text: text,
                created_at: new Date().toISOString()
            };
            
            // Store image URLs as JSON array
            if (imageUrls.length > 0) {
                reviewData.image_url = JSON.stringify(imageUrls);
            }
            
            const { data, error } = await this.supabase
                .from('reviews')
                .insert([reviewData])
                .select();
            
            if (error) {
                throw error;
            }
            
            // Success
            this.showMessage('Thank you for your review! It will appear shortly.', 'success');
            form.reset();
            this.highlightStars(0);
            this.clearPhotoPreviews();
            
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
    
    async uploadPhoto(file, userName) {
        try {
            // Create a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `review-photos/${fileName}`;
            
            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from('review-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                console.error('Upload error:', error);
                throw error;
            }
            
            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('review-photos')
                .getPublicUrl(filePath);
            
            return urlData.publicUrl;
            
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }
    
    setupPhotoPreview() {
        const photoInput = document.getElementById('reviewPhoto');
        const photoPreviewContainer = document.getElementById('photoPreviewContainer');
        const photoUploadLabel = document.querySelector('.photo-upload-label');
        
        if (!photoInput || !photoPreviewContainer) return;
        
        // Show previews when files are selected
        photoInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            if (files.length > 5) {
                this.showMessage('You can only upload up to 5 photos.', 'error');
                photoInput.value = '';
                return;
            }
            
            // Clear previous previews
            photoPreviewContainer.innerHTML = '';
            
            if (files.length > 0) {
                photoUploadLabel.style.display = 'none';
                
                files.forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const previewDiv = document.createElement('div');
                        previewDiv.className = 'photo-preview-item';
                        previewDiv.innerHTML = `
                            <img src="${e.target.result}" alt="Preview ${index + 1}" class="photo-preview-img">
                            <button type="button" class="photo-remove" data-index="${index}">×</button>
                        `;
                        photoPreviewContainer.appendChild(previewDiv);
                        
                        // Add remove button handler
                        const removeBtn = previewDiv.querySelector('.photo-remove');
                        removeBtn.addEventListener('click', () => {
                            this.removePhotoPreview(index);
                        });
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                photoUploadLabel.style.display = 'flex';
            }
        });
    }
    
    removePhotoPreview(index) {
        const photoInput = document.getElementById('reviewPhoto');
        const photoPreviewContainer = document.getElementById('photoPreviewContainer');
        const photoUploadLabel = document.querySelector('.photo-upload-label');
        
        if (!photoInput || !photoPreviewContainer) return;
        
        // Create new FileList without the removed file
        const dt = new DataTransfer();
        const files = Array.from(photoInput.files);
        files.forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });
        photoInput.files = dt.files;
        
        // Re-render previews
        photoInput.dispatchEvent(new Event('change'));
    }
    
    clearPhotoPreviews() {
        const photoInput = document.getElementById('reviewPhoto');
        const photoPreviewContainer = document.getElementById('photoPreviewContainer');
        const photoUploadLabel = document.querySelector('.photo-upload-label');
        
        if (photoInput) photoInput.value = '';
        if (photoPreviewContainer) photoPreviewContainer.innerHTML = '';
        if (photoUploadLabel) photoUploadLabel.style.display = 'flex';
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
        
        // Create image HTML if image_url exists
        let imageHtml = '';
        if (review.image_url && review.image_url.trim() !== '') {
            try {
                // Try to parse as JSON array (new format with multiple images)
                let imageUrls = [];
                try {
                    imageUrls = JSON.parse(review.image_url);
                    if (!Array.isArray(imageUrls)) {
                        // Fallback: treat as single image URL (backward compatibility)
                        imageUrls = [review.image_url];
                    }
                } catch (e) {
                    // Not JSON, treat as single image URL (backward compatibility)
                    imageUrls = [review.image_url];
                }
                
                if (imageUrls.length > 0) {
                    const imagesHtml = imageUrls.map((url, index) => `
                        <div class="review-image-wrapper">
                            <img src="${this.escapeHtml(url)}" 
                                 alt="Review photo ${index + 1} by ${this.escapeHtml(review.name)}" 
                                 class="review-image" 
                                 loading="lazy"
                                 onerror="this.style.display='none'; this.parentElement.style.display='none';">
                        </div>
                    `).join('');
                    
                    imageHtml = `<div class="review-images-container">${imagesHtml}</div>`;
                }
            } catch (e) {
                console.error('Error parsing image URLs:', e);
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
            ${imageHtml}
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

