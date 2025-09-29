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

console.log('=== DRIVE GALLERY SCRIPT LOADED ===');

class DriveGallery {
  constructor(containerId, options = {}) {
    console.log('=== DRIVE GALLERY CONSTRUCTOR CALLED ===');
    console.log('Container ID:', containerId);
    console.log('Options:', options);
    
    this.container = document.getElementById(containerId);
    console.log('Container element:', this.container);
    
    if (!this.container) {
      console.error(`❌ Gallery container with id "${containerId}" not found`);
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
    console.log('DriveGallery init called');
    console.log('Container:', this.container);
    console.log('Config:', this.config);
    
    this.createGalleryHTML();
    this.bindEvents();
    this.loadPhotos();
    
    console.log('DriveGallery initialization complete');
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
    // Create overlay backdrop
    const overlay = document.createElement('div');
    overlay.id = 'imageOverlay';
    overlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    
    // Create enlarged image container
    const container = document.createElement('div');
    container.id = 'enlargedContainer';
    container.style.cssText = `
      position: fixed;
      z-index: 1000000;
      display: none;
      transition: all 0.3s ease;
    `;
    
    container.innerHTML = `
      <img id="enlargedImg" style="display: block; max-width: 90vw; max-height: 90vh; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
      <button id="closeBtn" style="position: absolute; top: -40px; right: -40px; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 24px;">×</button>
      <button id="prevBtn" style="position: absolute; left: -60px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 30px;">‹</button>
      <button id="nextBtn" style="position: absolute; right: -60px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; font-size: 30px;">›</button>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    this.overlay = overlay;
    this.lightbox = container;
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
    document.addEventListener('click', (e) => {
      // Only handle clicks when lightbox is actually open
      if (!this.lightboxOpen) return;
      
      if (e.target.id === 'imageOverlay' || e.target.id === 'closeBtn') {
        e.stopPropagation();
        this.closeLightbox();
      }
      if (e.target.id === 'prevBtn') {
        e.stopPropagation();
        this.previousImage();
      }
      if (e.target.id === 'nextBtn') {
        e.stopPropagation();
        this.nextImage();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!this.lightboxOpen) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.previousImage();
      if (e.key === 'ArrowRight') this.nextImage();
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
        e.stopPropagation();
        console.log('=== PHOTO CLICKED ===');
        console.log('Photo clicked, index:', index, 'Total images:', this.currentImages.length);
        console.log('Photo data:', this.currentImages[index]);
        console.log('Grid image src:', photoDiv.querySelector('img').src);
        console.log('enableLightbox:', this.config.enableLightbox);
        console.log('lightbox element exists:', !!this.lightbox);
        this.openLightbox(index);
      });
      photoDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Photo key pressed, index:', index);
          this.openLightbox(index);
        }
      });
    } else {
      console.log('Lightbox disabled in config');
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
    if (!this.config.enableLightbox || !this.lightbox) return;
    if (index < 0 || index >= this.currentImages.length) return;
    
    // Get the clicked image position
    const clickedImg = this.grid.querySelector(`[data-index="${index}"] img`);
    if (!clickedImg) return;
    
    const rect = clickedImg.getBoundingClientRect();
    
    this.lightboxIndex = index;
    
    // Show overlay (but make it non-clickable during animation)
    this.overlay.style.display = 'block';
    this.overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      this.overlay.style.opacity = '1';
      // Enable clicks after animation
      setTimeout(() => {
        this.overlay.style.pointerEvents = 'auto';
        this.lightboxOpen = true;
      }, 300);
    }, 10);
    
    // Position enlarged image at clicked image location
    this.lightbox.style.display = 'block';
    this.lightbox.style.left = rect.left + 'px';
    this.lightbox.style.top = rect.top + 'px';
    this.lightbox.style.width = rect.width + 'px';
    this.lightbox.style.height = rect.height + 'px';
    
    // Update content
    this.updateLightboxContent();
    
    // Animate to center of viewport
    setTimeout(() => {
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      this.lightbox.style.left = viewportCenterX + 'px';
      this.lightbox.style.top = viewportCenterY + 'px';
      this.lightbox.style.transform = 'translate(-50%, -50%)';
      this.lightbox.style.width = 'auto';
      this.lightbox.style.height = 'auto';
    }, 10);
    
    document.body.style.overflow = 'hidden';
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
    this.overlay.style.opacity = '0';
    this.lightbox.style.opacity = '0';
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.lightbox.style.display = 'none';
      this.lightbox.style.opacity = '1';
    }, 300);
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
    const image = document.getElementById('enlargedImg');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!image || !this.currentImages[this.lightboxIndex]) return;

    const photo = this.currentImages[this.lightboxIndex];
    const gridImage = this.grid.querySelector(`[data-index="${this.lightboxIndex}"] img`);
    
    // Use large version of image
    let imageSrc = photo.src;
    if (gridImage && gridImage.src && gridImage.src.includes('googleusercontent.com')) {
      imageSrc = gridImage.src.replace(/=s\d+$/, '=s2048');
    }
    
    image.src = imageSrc;
    image.alt = photo.caption;
    
    // Update button states
    if (prevBtn) prevBtn.style.display = this.lightboxIndex === 0 ? 'none' : 'block';
    if (nextBtn) nextBtn.style.display = this.lightboxIndex === this.currentImages.length - 1 ? 'none' : 'block';
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
  console.log('=== DOM LOADED ===');
  console.log('Looking for driveGallery element...');
  const galleryElement = document.getElementById('driveGallery');
  console.log('Gallery element found:', galleryElement);
  
  if (!galleryElement) {
    console.error('❌ Gallery element with ID "driveGallery" not found!');
    return;
  }
  
  // Wait a bit for any other scripts to load
  setTimeout(() => {
    console.log('=== CREATING GALLERY ===');
    try {
    const gallery = new DriveGallery('driveGallery', {
      limit: 24, // Adjust this to change number of photos loaded
      columns: {
        mobile: 2,
        tablet: 3,
        desktop: 4
      },
      enableLazyLoading: true,
      enableLightbox: true  // Simple enlarge enabled
    });
      console.log('✅ DriveGallery instance created:', gallery);
    
    // Test if clicks work at all
    document.addEventListener('click', (e) => {
      console.log('=== ANY CLICK DETECTED ===');
      console.log('Target:', e.target);
      console.log('Target class:', e.target.className);
      console.log('Target ID:', e.target.id);
      console.log('Target parent:', e.target.parentElement);
      console.log('Target parent class:', e.target.parentElement?.className);
    });
    
    } catch (error) {
      console.error('❌ Error creating gallery:', error);
    }

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
