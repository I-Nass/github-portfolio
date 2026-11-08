/**
* PHP Email Form Validation - v3.10
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  php_email_form_submit(thisForm, action, formData);
                })
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => {
        return response.text().then(text => {
          return { ok: response.ok, status: response.status, statusText: response.statusText, text: text };
        });
      })
      .then(res => {
        thisForm.querySelector('.loading').classList.remove('d-block');

        if (res.ok) {
          let isSuccess = false;
          try {
            let data = JSON.parse(res.text);
            if (data.ok || Object.keys(data).length > 0) {
              isSuccess = true;
            }
          } catch (e) {
            if (res.text.trim() === 'OK' || res.text.trim() === '') {
              isSuccess = true;
            }
          }

          if (isSuccess || res.text.trim() === 'OK') {
            thisForm.querySelector('.sent-message').classList.add('d-block');
            thisForm.reset();
          } else {
            throw new Error(res.text ? res.text : 'Form submission failed and no error message returned from: ' + action);
          }
        } else {
          let errorMessage = `${res.status} ${res.statusText}`;
          try {
            let errorData = JSON.parse(res.text);
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors.map(err => err.message).join(', ');
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            if (res.text) {
              errorMessage = res.text;
            }
          }
          throw new Error(errorMessage);
        }
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
