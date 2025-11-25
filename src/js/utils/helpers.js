export class Helpers {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static showLoading(element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
  }

  static showError(element, message) {
    element.innerHTML = `<div class="error">${message}</div>`;
  }

  static formatRating(rating) {
    return rating && rating !== "N/A" ? rating : "N/A";
  }

  static sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }
}
