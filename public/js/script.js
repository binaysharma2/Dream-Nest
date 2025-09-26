(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Star rating interaction on show page review form
document.addEventListener('DOMContentLoaded', () => {
  const ratingGroup = document.querySelector('.rating-stars');
  if (!ratingGroup) return;
  const labels = ratingGroup.querySelectorAll('label');
  const inputs = ratingGroup.querySelectorAll('input[type="radio"][name="review[rating]"]');

  const updateStars = (value) => {
    labels.forEach((label) => {
      const star = label.querySelector('i');
      const v = Number(label.getAttribute('data-value'));
      if (v <= value) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid');
      } else {
        star.classList.remove('fa-solid');
        star.classList.add('fa-regular');
      }
    });
  };

  labels.forEach((label) => {
    label.addEventListener('click', () => {
      const value = Number(label.getAttribute('data-value'));
      const input = ratingGroup.querySelector(`#star${value}`);
      if (input) {
        input.checked = true;
        updateStars(value);
      }
    });
  });

  // Initialize from a checked input if present
  const checked = Array.from(inputs).find(i => i.checked);
  updateStars(checked ? Number(checked.value) : 0);
});