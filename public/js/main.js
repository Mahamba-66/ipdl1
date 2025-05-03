document.addEventListener('DOMContentLoaded', function() {
  // Auto-dismiss alerts after 5 seconds
  setTimeout(function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);
  
  // Toggle password visibility
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const input = document.querySelector(this.getAttribute('data-target'));
      if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        input.type = 'password';
        this.innerHTML = '<i class="fas fa-eye"></i>';
      }
    });
  });
  
  // Confirm delete actions
  const deleteButtons = document.querySelectorAll('.confirm-delete');
  deleteButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
        e.preventDefault();
      }
    });
  });
  
  // Animations for cards
  const cards = document.querySelectorAll('.card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate__animated', 'animate__fadeIn');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => {
    observer.observe(card);
  });
});

// Function to copy text to clipboard
function copyToClipboard(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  
  // Show toast notification
  alert('Copié dans le presse-papiers !');
}