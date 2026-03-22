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

const revealTargets = document.querySelectorAll('.collection-header, .collection-card, .about-pull, .about-divider, .about-col, .about-col-rule, .about-signoff, .policies-header, .policies-accordion, .policies-footer, .contact-intro, .contact-form-wrap');
  
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
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.contact-submit');
    const submitText = submitBtn.querySelector('.contact-submit-text');

    // Disable button while submitting
    submitBtn.disabled = true;
    submitText.textContent = 'Sending…';

    try {
      const formData = new FormData(contactForm);
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      // Swap to thank-you state
      contactForm.style.transition = 'opacity 0.4s ease';
      contactForm.style.opacity = '0';
      
      setTimeout(() => {
        contactForm.style.display = 'none';
        contactForm.hidden = true;
        thankYou.hidden = false;
      }, 400);
    } catch (err) {
      // On error, re-enable the button with a fallback message
      submitBtn.disabled = false;
      submitText.textContent = 'Submit Inquiry';
      console.error('Form submission error:', err);
      alert('Something went wrong. Please try again or reach out directly.');
    }
  });
}