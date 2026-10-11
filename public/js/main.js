/*****************************************
* IntersectionObserver watches elements with a class of collection-header & collection-card (div & articles)
* When the browser detects their visibility, add the in-view class onto these elements to trigger a fade-up animation
* & then stop watching these elements after the animation occurs once

Pseudocode:
* We create a variable which selects every element with a class of collection-header & collection-card
    * Collection-header is the <div> containing the <span>, <h2>, and <p>
    * Collection-card are the 3 <article> elements
* We create a variable that instantiates the IntersectionObserver object using the new keyword
    * IntersectionObserver is a browser-native API built into JavaScript that watches elements & fires a callback 
        * Think of a security camera pointed at a doorway, which reacts when something crosses the threshold
    * We iterate through the elements (div/articles) and determine if the browser detects visibility of these elements
        * The .isIntersecting() method is provided by the IntersectionObserver API
        * If these elements are visible, we add the 'in-view' class onto these elements using classList.add()
        * entry.target points to the DOM element (div/article) and is passed into the observer.unobserve()
            * unobserve() is another method provided by the intersectionObserver API
            * Calling observe.unobserve(entry.target) tells IntersectionObserver to stop watching elements, once the animation occurs once 
                * Observe these elements and, once they are visible: fire the animation once & stop observing the elements
    * The threshold & rootMargin properties are the observer's configuration options
        * Trigger animation once 12% of the element is visible
        * Shrink detection zone by 40 pixels from the bottom
* Begin watching elements by calling observer.observe(elements)
******************************************/

const revealTargets = document.querySelectorAll('.collection-header, .collection-card, .about-pull, .about-divider, .about-col, .about-col-rule, .about-signoff, .policies-header, .policies-accordion, .policies-footer, .contact-intro, .contact-form-wrap, .experience-header, .experience-step, .experience-ways, .founder-portrait-col, .founder-copy-col');
  
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
},
{
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
});
revealTargets.forEach((el) => observer.observe(el));

/*****************************************
 * Policies/FAQ accordion
******************************************/

const triggers = document.querySelectorAll('.policies-item-trigger');

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    const bodyId = trigger.getAttribute('aria-controls');
    const body = document.getElementById(bodyId);

    // Close all other open panels first
    triggers.forEach((otherTrigger) => {
      if (otherTrigger !== trigger) {
        otherTrigger.setAttribute('aria-expanded', 'false');
        const otherId = otherTrigger.getAttribute('aria-controls');
        const otherBody = document.getElementById(otherId);
        otherBody.classList.remove('open');
      }
    });

    // Toggle the clicked panel
    const newState = !isExpanded;
    trigger.setAttribute('aria-expanded', String(newState));
    body.classList.toggle('open', newState);
  });
});

/*****************************************
* Contact Form – Submission Handler & thank you state w/o page reload
******************************************/

const contactForm = document.querySelector('#contact-form');
const thankYou = document.querySelector('#contact-thankyou');

if (contactForm && thankYou) {
  const submitBtn = contactForm.querySelector('.contact-submit');
  const submitText = submitBtn.querySelector('.contact-submit-text');
  const submitLabel = submitText.textContent;
  const formError = contactForm.querySelector('.contact-form-error');
  const thankYouHeading = thankYou.querySelector('.contact-thankyou-heading');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate before proceeding — re-enables native required checking
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity(); // shows the browser's native error messages
      return;
    }

    // Disable button while submitting
    submitBtn.disabled = true;
    submitText.textContent = 'Sending…';
    formError.textContent = '';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      // fetch() only rejects on network errors, so a 404 or 500 response has to be caught here
      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      // Swap to thank-you state, then move focus to it so screen readers announce it
      contactForm.classList.add('fade-out');

      setTimeout(() => {
        contactForm.hidden = true;
        thankYou.hidden = false;
        thankYouHeading.focus();
      }, 400);
    } catch (err) {
      // On error, re-enable the button and show a message under it
      submitBtn.disabled = false;
      submitText.textContent = submitLabel;
      formError.textContent = 'Something went wrong and your inquiry wasn’t sent. Please try again or message me on Instagram.';
      console.error('Form submission error:', err);
    }
  });
}

/*****************************************
* Footer - dynamic copyright year
******************************************/
const yearEl = document.querySelector('#footer-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
} 
  

/*****************************************
* Nav
******************************************/

const navEl = document.querySelector('#nav');

const onScroll = () => {
  if (window.scrollY > 40) {
    navEl.classList.add('scrolled');
  } else {
    navEl.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const hamburger  = document.querySelector('#nav-hamburger');
const overlay    = document.querySelector('#nav-overlay');
const closeLinks = document.querySelectorAll('[data-nav-close]');

const openMenu = () => {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
};

const closeMenu = () => {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
};

hamburger.addEventListener('click', () => {
  const isOpen = overlay.classList.contains('open');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close when a nav link is tapped
closeLinks.forEach((link) => link.addEventListener('click', closeMenu));

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
});

// Close if the window widens past the menu-button breakpoint (max-width: 1080px in styles.css),
// e.g. a tablet rotated while the menu is open, where the button that closes it disappears
const wideScreen = window.matchMedia('(min-width: 1081px)');
wideScreen.addEventListener('change', (e) => {
  if (e.matches && overlay.classList.contains('open')) closeMenu();
});
