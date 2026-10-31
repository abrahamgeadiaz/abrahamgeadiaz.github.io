(function () {
  var root = document.documentElement;

  // Theme toggle: follows the OS until the visitor picks one, then remembers it.
  var toggle = document.getElementById('theme-toggle');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
  });

  // Highlight the nav link for the section currently in view.
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var byId = {};
  links.forEach(function (link) {
    byId[link.getAttribute('href').slice(1)] = link;
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.remove('active');
          });
          byId[entry.target.id].classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // Contact form: submit in place. If fetch is unavailable the form posts normally.
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form && window.fetch && window.FormData) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';

      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          return response.json().then(function (body) {
            if (!response.ok || String(body.success) !== 'true') throw new Error('send failed');
          });
        })
        .then(function () {
          form.reset();
          status.textContent = 'Thanks, your message is on its way. I will reply soon.';
        })
        .catch(function () {
          status.className = 'form-status error';
          status.textContent = 'The message could not be sent. Please email me at abrahamgeadiaz@gmail.com instead.';
        })
        .then(function () {
          button.disabled = false;
          button.textContent = 'Send message';
        });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
