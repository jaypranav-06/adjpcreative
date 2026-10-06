/* CONTACT FORM — frontend validation */
(function () {
  const form = document.querySelector('#contactForm');
  const successMsg = document.querySelector('.ct-success');
  const msgField = document.querySelector('#message');
  const charCount = document.querySelector('.ct-char-count');

  if (!form) return;

  // Live character count
  if (msgField && charCount) {
    msgField.addEventListener('input', function () {
      const len = msgField.value.length;
      charCount.textContent = len + ' / 500';
      charCount.style.color = len > 0 && len < 20 ? '#e05454' : '#777F7A';
    });
  }

  // Clear error on input
  form.querySelectorAll('.ct-input').forEach(function (field) {
    field.addEventListener('input', function () {
      clearError(field);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      /* Scroll first invalid field into view on mobile */
      var firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
      }
      return;
    }

    var submitBtn = form.querySelector('.ct-submit-btn');
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    var payload = {
      name:    (document.querySelector('#name')    || {}).value || '',
      email:   (document.querySelector('#email')   || {}).value || '',
      service: (document.querySelector('#service') || {}).value || '',
      message: (document.querySelector('#message') || {}).value || '',
    };

    fetch('/send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ok) {
          form.style.display = 'none';
          var privacyNote = document.querySelector('.ct-privacy');
          if (privacyNote) privacyNote.style.display = 'none';
          if (successMsg) {
            successMsg.classList.add('visible');
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          showSubmitError('Something went wrong. Please email us directly at hello@adjpcreative.com');
          if (submitBtn) { submitBtn.classList.remove('is-loading'); submitBtn.disabled = false; }
        }
      })
      .catch(function () {
        showSubmitError('Could not send message. Please email us directly at hello@adjpcreative.com');
        if (submitBtn) { submitBtn.classList.remove('is-loading'); submitBtn.disabled = false; }
      });
  });

  function validate() {
    let valid = true;
    clearAllErrors();

    const name = document.querySelector('#name');
    const email = document.querySelector('#email');
    const message = document.querySelector('#message');

    if (name && !name.value.trim()) {
      showError(name, 'Please enter your name.');
      valid = false;
    }

    if (email) {
      if (!email.value.trim()) {
        showError(email, 'Please enter your email address.');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        valid = false;
      }
    }

    if (message) {
      if (!message.value.trim()) {
        showError(message, 'Please enter your message.');
        valid = false;
      } else if (message.value.trim().length < 20) {
        showError(message, 'Message must be at least 20 characters.');
        valid = false;
      }
    }

    return valid;
  }

  function showSubmitError(msg) {
    var existing = form.querySelector('.ct-submit-error');
    if (existing) existing.remove();
    var el = document.createElement('p');
    el.className = 'ct-submit-error';
    el.style.cssText = 'color:#e05454;margin-top:1rem;font-size:0.9rem;';
    el.textContent = msg;
    form.appendChild(el);
  }

  function showError(field, msg) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    const err = document.createElement('span');
    err.className = 'ct-field-error';
    err.textContent = msg;
    field.parentNode.appendChild(err);
  }

  function clearError(field) {
    field.classList.remove('is-invalid');
    if (field.value.trim()) field.classList.add('is-valid');
    const err = field.parentNode.querySelector('.ct-field-error');
    if (err) err.remove();
  }

  function clearAllErrors() {
    form.querySelectorAll('.ct-field-error').forEach(function (e) { e.remove(); });
    form.querySelectorAll('.ct-input').forEach(function (f) {
      f.classList.remove('is-invalid', 'is-valid');
    });
  }
})();
