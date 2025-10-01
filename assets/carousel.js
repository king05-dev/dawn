class Carousel {
  constructor(element) {
    this.carousel = element;
    this.container = this.carousel.querySelector('[data-carousel-container]');
    this.slides = this.carousel.querySelectorAll('[data-carousel-slide]');
    
    // Look for buttons in parent container if not found in carousel
    const parentContainer = this.carousel.closest('section') || document;
    this.prevButton = parentContainer.querySelector('[data-carousel-prev]');
    this.nextButton = parentContainer.querySelector('[data-carousel-next]');
    this.indicators = parentContainer.querySelectorAll('[data-carousel-indicator]');
    
    this.currentIndex = 0;
    this.slideWidth = 0;
    this.slidesPerView = 1;
    this.gap = 24; // 1.5rem in pixels
    
    console.log('Carousel initialized:', {
      container: this.container,
      slides: this.slides.length,
      prevButton: this.prevButton,
      nextButton: this.nextButton,
      indicators: this.indicators.length
    });
    
    this.init();
  }

  init() {
    this.calculateDimensions();
    this.bindEvents();
    this.updateCarousel();
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.calculateDimensions();
      this.updateCarousel();
    });
  }

  calculateDimensions() {
    if (!this.container || !this.slides.length) return;
    
    const containerWidth = this.container.offsetWidth;
    
    // Calculate slides per view based on breakpoints
    if (window.innerWidth >= 1024) {
      this.slidesPerView = 3; // lg: 33.333%
    } else if (window.innerWidth >= 640) {
      this.slidesPerView = 2; // sm: 50%
    } else {
      this.slidesPerView = 1; // mobile: 100%
    }
    
    this.slideWidth = (containerWidth - (this.gap * (this.slidesPerView - 1))) / this.slidesPerView;
    this.maxIndex = Math.max(0, this.slides.length - this.slidesPerView);
  }

  updateCarousel() {
    if (!this.container) return;
    
    // Calculate transform value
    const translateX = -(this.currentIndex * (this.slideWidth + this.gap));
    this.container.style.transform = `translate3d(${translateX}px, 0px, 0px)`;
    
    // Update button states
    this.updateButtons();
    this.updateIndicators();
  }

  updateButtons() {
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0;
      this.prevButton.classList.toggle('opacity-50', this.currentIndex === 0);
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex >= this.maxIndex;
      this.nextButton.classList.toggle('opacity-50', this.currentIndex >= this.maxIndex);
    }
  }

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      const isActive = index === this.currentIndex;
      indicator.classList.toggle('bg-primary', isActive);
      indicator.classList.toggle('bg-muted', !isActive);
      indicator.setAttribute('aria-selected', isActive);
    });
  }

  next() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }

  goTo(index) {
    if (index >= 0 && index <= this.maxIndex) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  }

  bindEvents() {
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prev());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.next());
    }
    
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goTo(index));
    });

    // Touch/swipe support
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      // Only prevent default if horizontal swipe is more significant than vertical
      if (diffX > diffY) {
        e.preventDefault();
      }
    }, { passive: false });

    this.container.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);
      
      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
        if (diffX > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
      
      isDragging = false;
    }, { passive: true });

    // Mouse drag support
    let mouseStartX = 0;
    let isMouseDragging = false;

    this.container.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      isMouseDragging = true;
      this.container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isMouseDragging) return;
      e.preventDefault();
    });

    document.addEventListener('mouseup', (e) => {
      if (!isMouseDragging) return;
      
      const endX = e.clientX;
      const diff = mouseStartX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
      
      isMouseDragging = false;
      this.container.style.cursor = 'grab';
    });
  }
}

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(carousel => new Carousel(carousel));
});

// Export for manual initialization
window.Carousel = Carousel;
