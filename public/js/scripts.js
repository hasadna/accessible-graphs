
$(document).ready(function () {

  // windows navbar scroll
  $(window).scroll(function () {
    let scroll = $(window).scrollTop();
    if (scroll > 50) {
      $('.wonder-nav').addClass('wonder-nav-scroll');
      $('.top-bar-icon-desk').attr('src', 'assets/images/logo/s-logo-blue.svg');

      $('.nav-link').addClass('nav-link-scroll');

      $('.you-switcher').addClass('you-switcher-scroll');
      $('.you-switcher-line').addClass('you-switcher-line-scroll');

    }
    else {
      $('.wonder-nav').removeClass('wonder-nav-scroll');

      $('.nav-link').removeClass('nav-link-scroll');
      $('.top-bar-icon-desk').attr('src', 'assets/images/logo/s-logo-white.svg');

      $('.you-switcher').removeClass('you-switcher-scroll');
      $('.you-switcher-line').removeClass('you-switcher-line-scroll');
    }
  });

  // page smooth scroll on link click
  $('a[href^="#.+"]').on('click', function (event) {

    let target = $(this.getAttribute('href'));

    if (target.length) {
      // event.preventDefault();
      $('html, body').stop().animate({
        scrollTop: target.offset().top
      }, 500);
    }

  });

  // side-bar menu open
  $('.hamburger').click(function () {
    $(this).toggleClass('is-active');
    $('.side-bar').fadeToggle(50);
  });

  // side-bar menu close
  $('.side-bar-link').click(function () {

    $('.hamburger').removeClass('is-active');
    $('.side-bar').fadeToggle(50);

  });

});

/*! track-focus v 1.0.0 | Author: Jeremy Fields [jeremy.fields@vget.com], 2015 | License: MIT */
// inspired by: http://irama.org/pkg/keyboard-focus-0.3/jquery.keyboard-focus.js

(function (body) {

  let usingMouse;

  let preFocus = function (event) {
    usingMouse = (event.type === 'mousedown');
  };

  let addFocus = function (event) {
    if (usingMouse)
      event.target.classList.add('focus--mouse');
  };

  let removeFocus = function (event) {
    event.target.classList.remove('focus--mouse');
  };

  let bindEvents = function () {
    body.addEventListener('keydown', preFocus);
    body.addEventListener('mousedown', preFocus);
    body.addEventListener('focusin', addFocus);
    body.addEventListener('focusout', removeFocus);
  };

  bindEvents();

})(document.body);


// open language pop-up
$('.language-click').click(function () {

  $('#language-popup').modal('toggle');

});

// Links that opens in a new tabs accessibility and security adjusments
function addNoOpener(link) {
  let linkTypes = (link.getAttribute('rel') || '').split(' ');
  if (!linkTypes.includes('noopener')) {
    linkTypes.push('noopener');
  }
  link.setAttribute('rel', linkTypes.join(' ').trim());
}

function addNewTabMessage(link) {
  if (!link.querySelector('.screen-reader-only')) {
    link.insertAdjacentHTML('beforeend', '<span class="screen-reader-only">(opens in a new tab)</span>');
  }
}

const updateLinksAccessibility = () => {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    addNoOpener(link);
    addNewTabMessage(link);
  });
};

updateLinksAccessibility();