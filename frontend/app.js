// Schedule Skies Frontend Application

// Test backend connectivity
console.log('Schedule Skies app loaded');

// Fetch backend health check
fetch('http://localhost:3001/')
  .then(res => res.json())
  .then(data => console.log('Backend connected:', data))
  .catch(err => console.warn('Backend not available yet:', err));

// Event listener for CTA button
document.addEventListener('DOMContentLoaded', () => {
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      alert('Trip planning feature coming soon!');
    });
  }
});
