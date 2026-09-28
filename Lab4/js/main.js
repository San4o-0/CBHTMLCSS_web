/* FlowTask — landing page behaviour */

document.addEventListener('DOMContentLoaded', function () {

  /* Trial form */

  var trialForm = document.getElementById('trial-form');
  var trialStatus = document.getElementById('trial-status');
  if (trialForm && trialStatus) {
    trialForm.addEventListener('submit', function (event) {
      event.preventDefault();
      trialForm.hidden = true;
      trialStatus.textContent = 'Thanks — check your inbox, the workspace is being created.';
    });
  }

  /* FAQ accordion */

  document.querySelectorAll('.faq__q').forEach(function (question) {
    question.addEventListener('click', function () {
      var isOpen = question.parentElement.classList.toggle('is-open');
      question.setAttribute('aria-expanded', String(isOpen));
    });
  });

});
