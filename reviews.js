// ===== REVIEWS SECTION JAVASCRIPT =====
// Uses Netlify functions (get-reviews, submit-review) - no Supabase

class ReviewsManager {
  constructor() {
    this.apiBase = '/.netlify/functions';
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

    const starRating = document.querySelector('.star-rating');
    if (starRating) {
      const stars = document.querySelectorAll('.star-rating label.star');
      stars.forEach((star) => {
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

      const radioInputs = document.querySelectorAll('.star-rating input[type="radio"]');
      radioInputs.forEach((input) => {
        input.addEventListener('change', () => {
          this.highlightStars(parseInt(input.value));
        });
      });
    }
  }

  highlightStars(rating) {
    const stars = document.querySelectorAll('.star-rating label.star');
    stars.forEach((star, index) => {
      const starRating = 5 - index;
      if (starRating <= rating) {
        star.style.color = 'var(--accent-yellow)';
      } else {
        star.style.color = 'rgba(255, 193, 7, 0.3)';
      }
    });
  }

  async handleFormSubmission(e) {
    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const rating = parseInt(formData.get('rating'));
    const text = formData.get('text').trim();
    const photoFiles = form.querySelector('#reviewPhoto')?.files;

    if (!name || !rating || !text) {
      this.showMessage('Please fill in all required fields.', 'error');
      return;
    }

    if (rating < 1 || rating > 5) {
      this.showMessage('Please select a valid rating.', 'error');
      return;
    }

    const imageUrls = [];
    if (photoFiles && photoFiles.length > 0) {
      if (photoFiles.length > 3) {
        this.showMessage('You can upload up to 3 photos.', 'error');
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 300 * 1024;
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        if (!validTypes.includes(file.type)) {
          this.showMessage(`Photo "${file.name}" is not a valid format. Use JPG, PNG, or WebP.`, 'error');
          return;
        }
        if (file.size > maxSize) {
          this.showMessage(`Photo "${file.name}" is too large. Max 300KB per photo.`, 'error');
          return;
        }
      }
      for (let i = 0; i < photoFiles.length; i++) {
        try {
          const base64 = await this.fileToBase64(photoFiles[i]);
          imageUrls.push(base64);
        } catch (err) {
          console.error('Photo conversion error:', err);
        }
      }
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${this.apiBase}/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rating,
          text,
          image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      this.showMessage('Thank you for your review! It will appear shortly.', 'success');
      form.reset();
      this.highlightStars(0);
      this.clearPhotoPreviews();

      setTimeout(() => this.loadReviews(), 1000);
    } catch (error) {
      console.error('Error submitting review:', error);
      this.showMessage('Sorry, there was an error submitting your review. Please try again later.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  setupPhotoPreview() {
    const photoInput = document.getElementById('reviewPhoto');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoUploadLabel = document.querySelector('.photo-upload-label');

    if (!photoInput || !photoPreviewContainer) return;

    photoInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);

      if (files.length > 3) {
        this.showMessage('You can only upload up to 3 photos.', 'error');
        photoInput.value = '';
        return;
      }

      photoPreviewContainer.innerHTML = '';

      if (files.length > 0) {
        photoUploadLabel.style.display = 'none';
        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'photo-preview-item';
            previewDiv.innerHTML = `
              <img src="${ev.target.result}" alt="Preview ${index + 1}" class="photo-preview-img">
              <button type="button" class="photo-remove" data-index="${index}">×</button>
            `;
            photoPreviewContainer.appendChild(previewDiv);
            previewDiv.querySelector('.photo-remove').addEventListener('click', () => {
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
    if (!photoInput || !photoPreviewContainer) return;

    const dt = new DataTransfer();
    Array.from(photoInput.files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    photoInput.files = dt.files;
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

    reviewsDisplay.innerHTML = '<div class="reviews-loading">Loading reviews...</div>';

    try {
      const res = await fetch(`${this.apiBase}/get-reviews`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load');
      }

      const reviews = data.reviews || [];

      if (reviews.length === 0) {
        reviewsDisplay.innerHTML = '<div class="reviews-empty">No reviews yet. Be the first to leave a review!</div>';
        return;
      }

      reviewsDisplay.innerHTML = '';
      reviews.forEach((review) => {
        reviewsDisplay.appendChild(this.createReviewCard(review));
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
      day: 'numeric',
    });

    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= review.rating
        ? '<span class="star">★</span>'
        : '<span class="star empty">★</span>';
    }

    let imageHtml = '';
    if (review.image_url && review.image_url.trim() !== '') {
      try {
        let urls = [];
        try {
          urls = JSON.parse(review.image_url);
          if (!Array.isArray(urls)) urls = [review.image_url];
        } catch {
          urls = [review.image_url];
        }
        if (urls.length > 0) {
          imageHtml = `<div class="review-images-container">${urls.map((url, i) => `
            <div class="review-image-wrapper">
              <img src="${this.escapeHtml(url)}" alt="Review photo ${i + 1}" class="review-image" loading="lazy"
                onerror="this.style.display='none'; this.parentElement.style.display='none';">
            </div>
          `).join('')}</div>`;
        }
      } catch (_) {}
    }

    let responseHtml = '';
    if (review.response && review.response.trim()) {
      const responseDate = review.response_at
        ? new Date(review.response_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
      responseHtml = `
        <div class="review-response">
          <strong>Response from Spooky Baby Sweets</strong>${responseDate ? ` <span class="review-response-date">${responseDate}</span>` : ''}
          <p>${this.escapeHtml(review.response)}</p>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="review-header">
        <div>
          <div class="review-name">${this.escapeHtml(review.name)}</div>
          <div class="review-date">${formattedDate}</div>
        </div>
      </div>
      <div class="review-rating">${starsHtml}</div>
      ${imageHtml}
      <div class="review-text">${this.escapeHtml(review.text)}</div>
      ${responseHtml}
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
    if (type === 'success') {
      setTimeout(() => {
        messageEl.className = 'review-form-message';
        messageEl.textContent = '';
      }, 5000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new ReviewsManager();
  } catch (error) {
    console.error('Reviews initialization error:', error);
  }
});
