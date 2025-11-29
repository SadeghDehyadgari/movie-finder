export class Pagination {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentPage = 1;
    this.totalPages = 1;
    this.onPageChange = () => {};
    this.isMobile = window.innerWidth < 768;
    this.touchStartX = 0;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.container.innerHTML = this.generatePaginationHTML();
  }

  generatePaginationHTML() {
    const prevDisabled = this.currentPage <= 1 ? "disabled" : "";
    const nextDisabled = this.currentPage >= this.totalPages ? "disabled" : "";

    if (this.isMobile) {
      return `
        <button class="page-btn arrow-btn mobile-btn" ${prevDisabled}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="m15 18-6-6 6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <span class="mobile-page-indicator">${this.currentPage} / ${this.totalPages}</span>

        <button class="page-btn arrow-btn mobile-btn" ${nextDisabled}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="m9 18 6-6-6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      `;
    }

    return `
      <button class="page-btn arrow-btn" ${prevDisabled}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="m15 18-6-6 6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      ${this.generatePageNumbers()}

      <button class="page-btn arrow-btn" ${nextDisabled}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="m9 18 6-6-6-6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
  }

  generatePageNumbers() {
    let pagesHTML = "";
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pagesHTML += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        pagesHTML += `<span class="page-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === this.currentPage ? "active" : "";
      pagesHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pagesHTML += `<span class="page-ellipsis">...</span>`;
      }
      pagesHTML += `<button class="page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
    }

    return pagesHTML;
  }

  addEventListeners() {
    this.container.addEventListener("click", (e) => {
      const button = e.target.closest(".page-btn");
      if (!button) return;

      if (button.disabled) return;

      if (button.classList.contains("arrow-btn")) {
        this.handleArrowClick(button);
      } else {
        this.handlePageClick(button);
      }
    });

    if (this.isMobile) {
      this.container.addEventListener("touchstart", (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      });

      this.container.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = this.touchStartX - touchEndX;
        const swipeThreshold = 50;

        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0 && this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
          } else if (diff < 0 && this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
          }
        }
      });
    }

    window.addEventListener("resize", () => {
      this.isMobile = window.innerWidth < 768;
      this.render();
    });
  }

  handleArrowClick(button) {
    const svgPath = button.querySelector("path")?.getAttribute("d");
    const isNext = svgPath === "m9 18 6-6-6-6";

    if (isNext && this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    } else if (!isNext && this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  handlePageClick(button) {
    const page = parseInt(button.dataset.page);
    this.goToPage(page);
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.render();
    this.onPageChange(page);
  }

  update(totalItems, itemsPerPage, currentPage = 1) {
    const maxTotalPages = 500;
    const calculatedPages = Math.ceil(totalItems / itemsPerPage);
    this.totalPages = Math.min(calculatedPages, maxTotalPages);

    this.currentPage = Math.max(1, Math.min(currentPage, this.totalPages));
    this.render();
  }
}
