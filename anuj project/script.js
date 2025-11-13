// Focus management
document.querySelectorAll('a,button,input').forEach(el =>
  el.addEventListener('focus', () => el.classList.add('focus'))
);

// Dark mode toggle
let isDarkMode = false;

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);

  // Update toggle button
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === 'true') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
  }

  // Add event listener to theme toggle
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);
