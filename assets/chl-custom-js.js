document.addEventListener('DOMContentLoaded', function () {
  // Search overlay elements
  const searchOverlay = document.getElementById('search-overlay');
  const searchModal = document.getElementById('search-modal');
  const searchModalInput = document.getElementById('search-modal-input');
  const searchModalClose = document.getElementById('search-modal-close');
  const searchModalResults = document.getElementById('search-modal-results');
  const searchModalPopular = document.getElementById('search-modal-popular');

  // Original search elements
  const collapsedBtn = document.getElementById('search-collapsed');
  const expandedInput = document.getElementById('search-expanded');
  const expandedDiv = document.getElementById('search-expanded');
  const closeSearch = document.getElementById('close-search');
  const modalTrigger = document.querySelector('.header__icon'); // assumed ID
  const inlineInput = expandedDiv ? expandedDiv.querySelector('input') : null;
  const modalInput = document.getElementById('Search-In-Modal');

  // Search overlay functionality
  function openSearchOverlay() {
    if (searchOverlay && searchModal) {
      // Remove hidden class first
      searchOverlay.classList.remove('hidden');
      searchModal.classList.remove('hidden');
      
      // Force reflow to ensure the element is visible before animation
      searchModal.offsetHeight;
      
      // Remove any existing animation classes and add the new one
      searchModal.classList.remove('fade-in-from-header');
      requestAnimationFrame(() => {
        searchModal.classList.add('fade-in-from-header');
      });
      
      document.body.style.overflow = 'hidden';
      
      // Focus on search input after animation
      setTimeout(() => {
        if (searchModalInput) {
          searchModalInput.focus();
        }
      }, 300);
    }
  }

  function closeSearchOverlay() {
    if (searchOverlay && searchModal) {
      // Remove animation class first
      searchModal.classList.remove('fade-in-from-header');
      
      searchOverlay.classList.add('hidden');
      searchModal.classList.add('hidden');
      document.body.style.overflow = '';
      
      // Clear search input and results
      if (searchModalInput) {
        searchModalInput.value = '';
      }
      if (searchModalResults) {
        searchModalResults.classList.add('hidden');
        searchModalResults.innerHTML = '';
      }
      if (searchModalPopular) {
        searchModalPopular.classList.remove('hidden');
      }
    }
  }

  // Event listeners for search overlay
  if (collapsedBtn) {
    collapsedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Check if we're on desktop/tablet (768px and up)
      if (window.innerWidth >= 768) {
        openSearchOverlay();
      } else {
        // Original mobile behavior
        collapsedBtn.classList.add('hidden');
        if (expandedInput) {
          expandedInput.classList.add('flex');
          expandedInput.classList.remove('hidden');
        }
      }
    });
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', closeSearchOverlay);
  }

  // Prevent modal from closing when clicking inside it
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (searchModalClose) {
    searchModalClose.addEventListener('click', closeSearchOverlay);
  }

  // Close overlay with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
      closeSearchOverlay();
    }
  });

  // Search functionality for overlay
  if (searchModalInput) {
    let searchController;
    
    searchModalInput.addEventListener('input', async (event) => {
      const query = event.target.value.trim();

      if (searchController) searchController.abort();
      searchController = new AbortController();

      if (query.length < 2) {
        if (searchModalResults) {
          searchModalResults.classList.add('hidden');
          searchModalResults.innerHTML = '';
        }
        if (searchModalPopular) {
          searchModalPopular.classList.remove('hidden');
        }
        return;
      }

      // Show loading state
      if (searchModalResults) {
        searchModalResults.innerHTML = `
          <div class="p-6">
            <div class="flex items-center justify-center py-8">
              <svg class="animate-spin h-6 w-6 text-muted-foreground" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span class="ml-2 text-muted-foreground">Searching...</span>
            </div>
          </div>
        `;
        searchModalResults.classList.remove('hidden');
        if (searchModalPopular) {
          searchModalPopular.classList.add('hidden');
        }
      }

      try {
        const res = await fetch(
          `/search/suggest?q=${encodeURIComponent(query)}&resources[type]=product,page,article&section_id=predictive-search`,
          {
            signal: searchController.signal,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        if (searchModalResults) {
          if (data.resources.results.products.length > 0) {
            searchModalResults.innerHTML = `
              <div class="p-6">
                <h3 class="text-xs uppercase tracking-wider text-muted-foreground mb-4">Products</h3>
                <div class="space-y-3">
                  ${data.resources.results.products.map(product => `
                    <a href="${product.url}" class="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors">
                      <img src="${product.image}" alt="${product.title}" class="w-12 h-12 object-cover rounded-md mr-4" />
                      <div class="flex-1">
                        <h4 class="font-medium text-sm">${product.title}</h4>
                        <p class="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </a>
                  `).join('')}
                </div>
              </div>
            `;
          } else {
            searchModalResults.innerHTML = `
              <div class="p-6">
                <div class="text-center py-8">
                  <p class="text-muted-foreground">No products found for "${query}"</p>
                </div>
              </div>
            `;
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && searchModalResults) {
          searchModalResults.innerHTML = `
            <div class="p-6">
              <div class="text-center py-8">
                <p class="text-red-500">Something went wrong. Please try again.</p>
              </div>
            </div>
          `;
        }
      }
    });
  }

  // Popular search buttons functionality
  if (searchModalPopular) {
    const popularButtons = searchModalPopular.querySelectorAll('button');
    popularButtons.forEach(button => {
      button.addEventListener('click', () => {
        const searchTerm = button.textContent.trim();
        if (searchModalInput) {
          searchModalInput.value = searchTerm;
          // Trigger search
          const inputEvent = new Event('input', { bubbles: true });
          searchModalInput.dispatchEvent(inputEvent);
        }
      });
    });
  }

  // Original mobile search functionality (keep for mobile devices)
  if (closeSearch) {

    closeSearch.addEventListener('click', () => {
      expandedInput.classList.add('hidden');
      collapsedBtn.classList.remove('hidden');
      expandedInput.classList.remove('flex');
    });
  }
  if (inlineInput && modalInput) {
    inlineInput.addEventListener('input', () => {
      modalInput.value = inlineInput.value;

      // If the modal has an input event listener, dispatch it
      const inputEvent = new Event('input', { bubbles: true });
      modalInput.dispatchEvent(inputEvent);
    });
  }
  // const input = document.getElementById("custom-search-input");
  // const resultsContainer = document.getElementById("predictive-search-results");
  function setupPredictiveSearch() {
    searchButtonClicked = false;
    const searchButton = document.getElementById('search-button');
    console.log('searchButton', searchButton); // Check again

    if (searchButton) {
      searchButton.addEventListener('click', () => {
        searchButtonClicked = true;
        console.log('Search button clicked:', searchButtonClicked);
      });
    } else {
      console.warn('Search button not found');
    }

    const input = Array.from(document.querySelectorAll('#custom-search-input')).find((el) => el.offsetParent !== null);

    // Select the first visible predictive results container
    const resultsContainer = document.getElementById('predictive-search-results');
    const resultsWrapper = document.getElementById('predictive-search-wrapper');
    console.log('input', input, resultsContainer);
    if (!input || !resultsContainer) return;

    let controller;

    input.addEventListener('input', async (event) => {
      const query = event.target.value.trim();

      if (controller) controller.abort(); // cancel previous request
      controller = new AbortController();

      if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
      }
      resultsContainer.innerHTML = `
    <div class="px-4 py-3 text-sm text-gray-500">
      <svg class="inline-block animate-spin mr-2 h-4 w-4 text-gray-400" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Loading...
    </div>
  `;
      resultsWrapper.classList.remove('hidden');
      try {
        const res = await fetch(
          `/search/suggest?q=${encodeURIComponent(
            query
          )}&resources[type]=product,page,article&section_id=predictive-search`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        resultsContainer.innerHTML =
          data.resources.results.products.length !== 0
            ? data.resources.results.products
                .map(
                  (product) => `
          <div class="suggestion">
            <a href="${product.url}">
              <img src="${product.image}" alt="${product.title}" width="40" />
              <span>${product.title}</span>
            </a>
          </div>
        `
                )
                .join('')
            : `
    <div class="px-4 py-3 text-sm text-gray-500">
      No results found.
    </div>
  `;
      } catch (err) {
        if (err.name !== 'AbortError') {
          resultsContainer.innerHTML = `
        <div class="px-4 py-3 text-sm text-red-500">
          Something went wrong.
        </div>
      `;
        }
      }
    });

    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!searchButtonClicked) {
          resultsContainer.classList.add('hidden');
          resultsWrapper.classList.add('hidden');
        }
      }, 150);
    });

    input.addEventListener('focus', () => {
      // if (resultsContainer.innerHTML.trim() !== "") {
      resultsContainer.classList.remove('hidden');
      setTimeout(() => {
        setupPredictiveSearch();
      }, 200);
      resultsWrapper.classList.remove('hidden');
      // }
    });
  }
  ['search-collapsed', 'mobile-nav-handler', 'search-button'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', () => {
        setTimeout(() => {
          setupPredictiveSearch();
        }, 200);
      });
    }
  });
  let removedSearchResults = null; // Variable to store the removed element

  // Handle removal of the predictive search results when mobile nav is clicked
  document.getElementById('mobile-nav-handler')?.addEventListener('click', () => {
    const firstResultsContainer = document.querySelector('#predictive-search-results');
    if (firstResultsContainer) {
      removedSearchResults = firstResultsContainer; // Memorize the removed element
      firstResultsContainer.remove(); // Remove from DOM
    }
  });

  // Handle putting it back when search-collapsed is clicked
  document.getElementById('search-collapsed')?.addEventListener('click', () => {
    if (removedSearchResults) {
      // Re-insert it back into the DOM (wherever you want to place it, e.g., inside a container)
      const parentElement = document.getElementById('predictive-search-wrapper');
      if (parentElement) {
        parentElement.appendChild(removedSearchResults); // Insert it back at the end of the parent
      }
      removedSearchResults = null; // Clear the memorized reference
    }
  });

  //accordion
  const accordionButtons = document.querySelectorAll('.accordion-item button[data-state]');

  accordionButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      const content = item.querySelector('div[role="region"]');
      const isOpen = item.getAttribute('data-state') === 'open';

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach((div) => {
        div.setAttribute('data-state', 'closed');
        const btn = div.querySelector('button[data-state]');
        const header = div.querySelector('h3[data-state]');
        const contentDiv = div.querySelector('div[role="region"]');

        if (btn) btn.setAttribute('data-state', 'closed');
        if (header) header.setAttribute('data-state', 'closed');
        if (contentDiv) {
          contentDiv.setAttribute('data-state', 'closed');
          // contentDiv.style.height = '0px';
          // contentDiv.style.removeProperty('--radix-collapsible-content-height');
        }
      });

      // Open the clicked item if it wasn't already open
      if (!isOpen && content) {
        item.setAttribute('data-state', 'open');
        this.setAttribute('data-state', 'open');
        this.parentElement.setAttribute('data-state', 'open');
        content.setAttribute('data-state', 'open');

        // Calculate the content's natural height
        const contentHeight = content.scrollHeight; // Use scrollHeight for dynamic height
        content.style.setProperty('--radix-collapsible-content-height', `${contentHeight}px`);
        // content.style.height = `${contentHeight}px`;
      }
    });
  });
  const filterButtons = document.querySelectorAll('button[data-state].filter-product-category');

  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      console.group('item', item);
      const content = this.nextElementSibling;
      const isOpen = item.getAttribute('data-state') === 'open';
      console.log('content', content);
      // Close all accordion items
      document.querySelectorAll('.accordion-content').forEach((div) => {
        content.setAttribute('data-state', 'closed');
        const btn = div.querySelector('button[data-state]');
        const header = div.querySelector('h3[data-state]');
        const contentDiv = div.querySelector('div[role="region"]');

        if (btn) btn.setAttribute('data-state', 'closed');
        if (header) header.setAttribute('data-state', 'closed');
        if (isOpen) item.setAttribute('data-state', 'closed');
        if (contentDiv) {
          content.setAttribute('data-state', 'closed');
          // contentDiv.style.height = '0px';
          // contentDiv.style.removeProperty('--radix-collapsible-content-height');
        }
      });
      console.log('isOpen', isOpen, content);
      // Open the clicked item if it wasn't already open
      if (!isOpen) {
        item.setAttribute('data-state', 'open');
        this.setAttribute('data-state', 'open');
        this.parentElement.setAttribute('data-state', 'open');
        content.setAttribute('data-state', 'open');

        // Calculate the content's natural height
        const contentHeight = content.scrollHeight; // Use scrollHeight for dynamic height
        content.style.setProperty('--radix-accordion-content-height', `${contentHeight}px`);
        // content.style.height = `${contentHeight}px`;
      }
    });
  });
  const buttons = document.querySelectorAll('[role="checkbox"]');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isChecked = btn.getAttribute('aria-checked') === 'true';

      if (isChecked) {
        btn.setAttribute('aria-checked', 'false');
        btn.setAttribute('data-state', 'unchecked');

        // Remove the checkmark span if it exists
        const indicator = btn.querySelector("[data-state='checked']");
        if (indicator) {
          indicator.remove();
        }
      } else {
        btn.setAttribute('aria-checked', 'true');
        btn.setAttribute('data-state', 'checked');

        // Insert the checkmark span
        btn.innerHTML = `
          <span data-state="checked" class="flex items-center justify-center text-current" style="pointer-events: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check h-4 w-4">
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
          </span>
        `;
      }
    });
  });

  const checkboxes = document.querySelectorAll('[role="checkbox"]');
  const resetButton = document.getElementById('filter-reset-all');

  resetButton?.addEventListener('click', () => {
    checkboxes.forEach((btn) => {
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('data-state', 'unchecked');

      // Remove the checkmark span if it exists
      const indicator = btn.querySelector("[data-state='checked']");
      if (indicator) indicator.remove();
    });
  });
});
