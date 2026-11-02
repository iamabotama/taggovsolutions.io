'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
const contactDialog = document.querySelector('#contact-dialog');
const contactForm = document.querySelector('#contact-form');
const emailInput = document.querySelector('#contact-email');
const details = document.querySelector('#contact-details');
const emailError = document.querySelector('#email-error');
const detailsError = document.querySelector('#details-error');
const emailHint = document.querySelector('#email-hint');
const submitButton = document.querySelector('#contact-submit');
const completed = document.querySelector('#contact-complete');
const serviceSelect = document.querySelector('#contact-service');
let detailsRevealed = false;
let pendingService = '';
const dialogTriggers = new WeakMap();

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeNavigation();
});
window.matchMedia('(min-width: 1051px)').addEventListener('change', closeNavigation);

function resetContact() {
  contactForm.reset();
  contactForm.hidden = false;
  completed.hidden = true;
  details.hidden = true;
  detailsRevealed = false;
  pendingService = '';
  emailError.hidden = true;
  detailsError.hidden = true;
  emailInput.removeAttribute('aria-invalid');
  emailHint.textContent = 'Your next step appears when the email is complete.';
  submitButton.innerHTML = 'Continue <span aria-hidden="true">→</span>';
}

function revealDetails() {
  if (detailsRevealed) return;
  details.hidden = false;
  detailsRevealed = true;
  emailHint.textContent = 'Email complete. Tell us about your mission below.';
  submitButton.innerHTML = 'Complete demo <span aria-hidden="true">→</span>';
  if (pendingService) serviceSelect.value = pendingService;
}

function openDialog(dialog, trigger, service = '') {
  document.querySelectorAll('dialog[open]').forEach(other => other.close());
  closeNavigation();
  if (dialog === contactDialog) {
    resetContact();
    pendingService = service;
  }
  dialogTriggers.set(dialog, trigger);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  if (dialog === contactDialog) emailInput.focus({ preventScroll: true });
}

document.querySelectorAll('[data-open]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const dialog = document.getElementById(trigger.dataset.open);
    if (dialog) openDialog(dialog, trigger);
  });
});
document.querySelectorAll('[data-service]').forEach(trigger => {
  trigger.addEventListener('click', () => openDialog(contactDialog, trigger, trigger.dataset.service));
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.close-dialog, .close-dialog-action').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog === contactDialog) resetContact();
    if (!document.querySelector('dialog[open]')) document.body.style.overflow = '';
    const trigger = dialogTriggers.get(dialog);
    if (trigger && !document.querySelector('dialog[open]')) {
      const visibleTarget = trigger.getClientRects().length ? trigger : menuButton;
      visibleTarget.focus({ preventScroll: true });
    }
  });
});

emailInput.addEventListener('input', () => {
  emailError.hidden = true;
  emailInput.removeAttribute('aria-invalid');
  if (emailInput.value.trim() && emailInput.checkValidity()) revealDetails();
});

contactForm.addEventListener('submit', event => {
  // This is intentionally local-only: no request, storage, or form navigation.
  event.preventDefault();
  if (!emailInput.value.trim() || !emailInput.checkValidity()) {
    emailError.hidden = false;
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.focus();
    return;
  }
  if (!detailsRevealed) {
    revealDetails();
    document.querySelector('#contact-name').focus();
    return;
  }
  const requiredFields = [
    document.querySelector('#contact-name'),
    serviceSelect,
    document.querySelector('#contact-message')
  ];
  const invalid = requiredFields.find(field => !field.value.trim() || !field.checkValidity());
  if (invalid) {
    detailsError.hidden = false;
    invalid.focus();
    return;
  }
  contactForm.reset();
  pendingService = '';
  contactForm.hidden = true;
  completed.hidden = false;
  completed.focus();
});

details.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => { detailsError.hidden = true; });
});
document.querySelector('#restart-contact').addEventListener('click', () => {
  resetContact();
  emailInput.focus();
});
document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
