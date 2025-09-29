/**
 * Google Drive Photo Gallery
 * 
 * Features:
 * - Responsive masonry grid layout
 * - Lazy loading images
 * - Accessible lightbox with keyboard navigation
 * - Focus management and ARIA support
 * - Error handling and loading states
 * 
 * Configuration:
 * - Adjust GALLERY_CONFIG.limit to change number of photos
 * - Modify GALLERY_CONFIG.columns for different layouts
 * - Change API endpoint if needed
 */

class DriveGallery {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Gallery container with id "${containerId}" not found`);
      return;
    }

    // Configuration with defaults
    this.config = {
      apiEndpoint: '/.netlify/functions/drive-photos',
      limit: 24,
      columns: {
        mobile: 2,
        tablet: 3,
        desktop: 4
      },
      enableLazyLoading: true,
      enableLightbox: true,
      ...options
    };

    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.currentImages = [];
    this.lightboxIndex = -1;
    this.lightboxOpen = false;

    this.init();
  }

  init() {
    this.createGalleryHTML();
    this.bindEvents();
    this.loadPhotos();
  }

  createGalleryHTML() {
    this.container.innerHTML = `
      <div class="drive-gallery-container">
        <div class="drive-gallery-grid" id="driveGalleryGrid"></div>
        <div class="drive-gallery-loading" id="driveGalleryLoading" style="display: none;">
          <div class="loading-spinner"></div>
          <p>Loading photos...</p>
        </div>
        <div class="drive-gallery-error" id="driveGalleryError" style="display: none;">
          <p>Failed to load photos. Please try again later.</p>
          <button class="btn btn-pink" id="retryButton">Retry</button>
        </div>
        <div class="drive-gallery-load-more" id="driveGalleryLoadMore" style="display: none;">
          <button class="btn btn-yellow" id="loadMoreButton">Load More Photos</button>
        </div>
      </div>
    `;

    this.grid = document.getElementById('driveGalleryGrid');
    this.loading = document.getElementById('driveGalleryLoading');
    this.error = document.getElementById('driveGalleryError');
    this.loadMore = document.getElementById('driveGalleryLoadMore');
    
    // Create lightbox and append to body
    if (this.config.enableLightbox) {
      this.createLightbox();
    }
  }

  createLightbox() {
    // Remove existing lightbox if any
    const existingLightbox = document.getElementById('driveLightbox');
    if (existingLightbox) {
      existingLightbox.remove();
    }

    // Create new lightbox
    const lightboxHTML = this.createLightboxHTML();
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    this.lightbox = document.getElementById('driveLightbox');
    
    if (!this.lightbox) {
      console.error('Failed to create lightbox element');
    } else {
      console.log('Lightbox created successfully');
    }
  }

  createLightboxHTML() {
    return `
      <div class="drive-lightbox" id="driveLightbox" style="display: none;">
        <div class="lightbox-backdrop" id="lightboxBackdrop"></div>
        <div class="lightbox-container">
          <button class="lightbox-close" id="lightboxClose">×</button>
          <img class="lightbox-image" id="lightboxImage" alt="">
          <div class="lightbox-caption" id="lightboxCaption"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreButton');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMorePhotos());
    }

    // Retry button
    const retryBtn = document.getElementById('retryButton');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadPhotos());
    }

    // Lightbox events
    if (this.config.enableLightbox) {
      this.bindLightboxEvents();
    }

    // Intersection Observer for lazy loading
    if (this.config.enableLazyLoading) {
      this.setupLazyLoading();
    }
  }

  bindLightboxEvents() {
    // Simple click handlers
    document.addEventListener('click', (e) => {
      if (e.target.id === 'lightboxClose' || e.target.id === 'lightboxBackdrop') {
        this.closeLightbox();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightboxOpen) {
        this.closeLightbox();
      }
    });
  }

  setupLazyLoading() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.observer.unobserve(img);
        }
      });
    }, options);
  }

  async loadPhotos() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading();
    this.hideError();

    try {
      const url = new URL(this.config.apiEndpoint, window.location.origin);
      url.searchParams.set('limit', this.config.limit);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data);
        throw new Error(data.error + (data.details ? ': ' + data.details : ''));
      }

      this.currentImages = data.items || [];
      this.hasMore = !!data.nextPageToken;
      
      // Debug: Log the first image data
      if (this.currentImages.length > 0) {
        console.log('First image data:', this.currentImages[0]);
        console.log('Available URLs for first image:', {
          src: this.currentImages[0].src,
          altSrc: this.currentImages[0].altSrc,
          downloadSrc: this.currentImages[0].downloadSrc,
          webViewLink: this.currentImages[0].webViewLink,
          thumb: this.currentImages[0].thumb
        });
      }
      
      this.renderPhotos();
      this.hideLoading();

      if (this.hasMore && this.currentImages.length > 0) {
        this.showLoadMore();
      }

    } catch (error) {
      console.error('Error loading photos:', error);
      this.showError();
      this.hideLoading();
    } finally {
      this.isLoading = false;
    }
  }

  async loadMorePhotos() {
    if (this.isLoading || !this.hasMore) return;

    this.currentPage++;
    this.isLoading = true;
    this.hideLoadMore();

    try {
      const url = new URL(this.config.apiEndpoint, window.location.origin);
      url.searchParams.set('limit', this.config.limit);
      url.searchParams.set('page', this.currentPage);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data);
        throw new Error(data.error + (data.details ? ': ' + data.details : ''));
      }

      const newImages = data.items || [];
      this.currentImages = [...this.currentImages, ...newImages];
      this.hasMore = !!data.nextPageToken;
      
      this.renderPhotos(newImages);
      
      if (this.hasMore) {
        this.showLoadMore();
      }

    } catch (error) {
      console.error('Error loading more photos:', error);
      this.showError();
    } finally {
      this.isLoading = false;
    }
  }

  renderPhotos(images = this.currentImages) {
    if (!images.length) {
      this.showEmptyState();
      return;
    }

    images.forEach((photo, index) => {
      const photoElement = this.createPhotoElement(photo, this.currentImages.indexOf(photo));
      this.grid.appendChild(photoElement);
    });

    // Update grid columns based on screen size
    this.updateGridColumns();
  }

  createPhotoElement(photo, index) {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'drive-gallery-item';
    photoDiv.setAttribute('data-index', index);
    photoDiv.setAttribute('tabindex', '0');
    photoDiv.setAttribute('role', 'button');
    photoDiv.setAttribute('aria-label', `View photo: ${photo.caption}`);

    // Create image element
    const img = document.createElement('img');
    img.className = 'drive-gallery-image';
    img.alt = photo.caption;
    img.setAttribute('data-src', photo.src);
    img.setAttribute('data-thumb', photo.thumb);
    img.setAttribute('loading', 'lazy');

    // Add loading placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+';

    // Add click handler for lightbox
    if (this.config.enableLightbox) {
      photoDiv.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Photo clicked, index:', index, 'Total images:', this.currentImages.length);
        console.log('Photo data:', this.currentImages[index]);
        console.log('Grid image src:', photoDiv.querySelector('img').src);
        this.openLightbox(index);
      });
      photoDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Photo key pressed, index:', index);
          this.openLightbox(index);
        }
      });
    }

    photoDiv.appendChild(img);

    // Set up lazy loading
    if (this.config.enableLazyLoading && this.observer) {
      this.observer.observe(img);
    } else {
      this.loadImage(img);
    }

    return photoDiv;
  }

  loadImage(img) {
    const src = img.getAttribute('data-src');
    const thumb = img.getAttribute('data-thumb');

    // Load thumbnail first, then full image
    img.src = thumb;
    
    // Load full image in background
    const fullImg = new Image();
    fullImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
    };
    fullImg.src = src;
  }

  updateGridColumns() {
    const width = window.innerWidth;
    let columns;

    if (width < 768) {
      columns = this.config.columns.mobile;
    } else if (width < 1024) {
      columns = this.config.columns.tablet;
    } else {
      columns = this.config.columns.desktop;
    }

    this.grid.style.setProperty('--columns', columns);
  }

  // Lightbox methods
  openLightbox(index) {
    console.log('openLightbox called with index:', index);
    console.log('enableLightbox:', this.config.enableLightbox);
    console.log('lightbox element:', this.lightbox);
    
    if (!this.config.enableLightbox) {
      console.log('Lightbox disabled');
      return;
    }

    // Validate index
    if (index < 0 || index >= this.currentImages.length) {
      console.error('Invalid lightbox index:', index, 'Total images:', this.currentImages.length);
      return;
    }
    
    this.lightboxIndex = index;
    this.lightboxOpen = true;
    
    if (this.lightbox) {
      console.log('Showing lightbox');
      this.lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.updateLightboxContent();
    } else {
      console.error('Lightbox element not found, trying to recreate...');
      this.createLightbox();
      if (this.lightbox) {
        this.lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.updateLightboxContent();
      } else {
        console.error('Still cannot create lightbox');
      }
    }
  }

  createFallbackLightbox(index) {
    // Create a simple fallback lightbox
    const fallback = document.createElement('div');
    fallback.className = 'drive-lightbox-fallback';
    fallback.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    
    const photo = this.currentImages[index];
    console.log('Creating fallback lightbox with photo:', photo);
    
    fallback.innerHTML = `
      <div style="position: relative; max-width: 90vw; max-height: 90vh;">
        <img id="fallbackImg" src="${photo.src}" alt="${photo.caption}" style="max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.5;">
        <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -40px; right: 0; background: white; border: none; padding: 10px; cursor: pointer;">Close</button>
        <div style="color: white; text-align: center; margin-top: 10px;">${photo.caption}</div>
        <div id="fallbackError" style="color: red; text-align: center; margin-top: 10px; display: none;">Image failed to load</div>
      </div>
    `;
    
    document.body.appendChild(fallback);
    
    // Test image loading
    const fallbackImg = fallback.querySelector('#fallbackImg');
    const fallbackError = fallback.querySelector('#fallbackError');
    
    fallbackImg.onload = () => {
      fallbackImg.style.opacity = '1';
      console.log('Fallback image loaded successfully');
    };
    
    fallbackImg.onerror = () => {
      console.error('Fallback image failed to load:', photo.src);
      // Try alternative URL formats
      if (photo.altSrc) {
        console.log('Trying alternative URL in fallback:', photo.altSrc);
        fallbackImg.src = photo.altSrc;
      } else if (photo.downloadSrc) {
        console.log('Trying download URL in fallback:', photo.downloadSrc);
        fallbackImg.src = photo.downloadSrc;
      } else {
        // Fallback to manual URL construction
        const altSrc = photo.src.replace('uc?id=', 'file/d/') + '/view';
        console.log('Trying manual alternative URL in fallback:', altSrc);
        fallbackImg.src = altSrc;
      }
      
      // If all URLs fail, show error
      fallbackImg.onerror = () => {
        fallbackError.style.display = 'block';
        console.error('All image URLs failed to load');
      };
    };
    
    // Close on backdrop click
    fallback.addEventListener('click', (e) => {
      if (e.target === fallback) {
        fallback.remove();
      }
    });
  }

  closeLightbox() {
    if (!this.lightboxOpen) return;

    this.lightboxOpen = false;
    this.lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  previousImage() {
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
      this.updateLightboxContent();
    }
  }

  nextImage() {
    if (this.lightboxIndex < this.currentImages.length - 1) {
      this.lightboxIndex++;
      this.updateLightboxContent();
    }
  }

  updateLightboxContent() {
    console.log('updateLightboxContent called');
    const image = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');

    console.log('Lightbox image element:', image);
    console.log('Lightbox caption element:', caption);
    console.log('Current images:', this.currentImages);
    console.log('Lightbox index:', this.lightboxIndex);

    if (!image) {
      console.error('Lightbox image element not found');
      return;
    }
    
    if (!this.currentImages[this.lightboxIndex]) {
      console.error('Invalid lightbox index:', this.lightboxIndex, 'Total images:', this.currentImages.length);
      return;
    }

    const photo = this.currentImages[this.lightboxIndex];
    console.log('Lightbox photo:', photo);
    
    // Use the same image that's already working in the grid
    // Find the corresponding grid image and copy its src
    const gridImage = this.grid.querySelector(`[data-index="${this.lightboxIndex}"] img`);
    console.log('Grid image element:', gridImage);
    
    if (gridImage && gridImage.src) {
      console.log('Using grid image src:', gridImage.src);
      image.src = gridImage.src;
    } else {
      console.log('Using photo src:', photo.src);
      image.src = photo.src;
    }
    
    image.alt = photo.caption;
    
    if (caption) caption.textContent = photo.caption;
    
    console.log('Lightbox content updated');
  }

  loadImageWithFallbacks(imgElement, photo) {
    const urls = [
      photo.src,
      photo.altSrc,
      photo.downloadSrc,
      photo.webViewLink
    ].filter(url => url); // Remove any undefined URLs

    let currentIndex = 0;

    const tryNextUrl = () => {
      if (currentIndex >= urls.length) {
        console.error('All image URLs failed to load');
        imgElement.style.opacity = '1';
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
        return;
      }

      const currentUrl = urls[currentIndex];
      console.log(`Trying image URL ${currentIndex + 1}/${urls.length}:`, currentUrl);

      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      
      testImg.onload = () => {
        console.log('Image loaded successfully:', currentUrl);
        imgElement.src = currentUrl;
        imgElement.style.opacity = '1';
      };
      
      testImg.onerror = () => {
        console.warn('Failed to load image:', currentUrl);
        currentIndex++;
        tryNextUrl();
      };
      
      testImg.src = currentUrl;
    };

    tryNextUrl();
  }

  trapFocus() {
    const focusableElements = this.lightbox.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.lightbox.addEventListener('keydown', this.handleFocusTrap);

    firstElement.focus();
  }

  handleFocusTrap = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = this.lightbox.querySelectorAll(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // UI state methods
  showLoading() {
    if (this.loading) this.loading.style.display = 'flex';
  }

  hideLoading() {
    if (this.loading) this.loading.style.display = 'none';
  }

  showError() {
    if (this.error) this.error.style.display = 'block';
  }

  hideError() {
    if (this.error) this.error.style.display = 'none';
  }

  showLoadMore() {
    if (this.loadMore) this.loadMore.style.display = 'block';
  }

  hideLoadMore() {
    if (this.loadMore) this.loadMore.style.display = 'none';
  }

  showEmptyState() {
    this.grid.innerHTML = `
      <div class="drive-gallery-empty">
        <p>No photos found. Check back later for new content!</p>
      </div>
    `;
  }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for any other scripts to load
  setTimeout(() => {
    const gallery = new DriveGallery('driveGallery', {
      limit: 24, // Adjust this to change number of photos loaded
      columns: {
        mobile: 2,
        tablet: 3,
        desktop: 4
      }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (gallery && gallery.updateGridColumns) {
          gallery.updateGridColumns();
        }
      }, 250);
    });
  }, 100);
});

// Export for potential external use
window.DriveGallery = DriveGallery;
