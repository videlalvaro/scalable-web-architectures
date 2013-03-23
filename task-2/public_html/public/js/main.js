/**
 * Extend jQuery with some nice animations.
 * @param {jQuery} $
 * @returns {void}
 */
(function ($) {

  /**
   * Slide up and fade out the element.
   * @syntax $(jQuery.Selector).slideUpFadeOut(callback = undefined)
   * @param {Function} callback Optional
   * @returns {jQuery.Object}
   */
  $.fn.slideUpFadeOut = function (callback) {
    return this.stop(true, true).animate({ marginTop: -300, opacity: 'hide' }, { complete: callback });
  };

  /**
   * Slide down and fade in the element.
   * @syntax $(jQuery.Selector).slideDownFadeIn(callback = undefined)
   * @param {Function} callback Optional
   * @returns {jQuery.Object}
   */
  $.fn.slideDownFadeIn = function (callback) {
    return this.stop(true, true).animate({ marginTop: 0, opacity: 'show' }, { complete: callback });
  };

  /**
   * Toggle the visibility with CSS classes.
   * @returns {jQuery.Object}
   */
  $.fn.toggleVisibility = function () {
    return this.toggleClass('js-hidden js-visible');
  };

})(jQuery);

/**
 * Start front end app after document is ready.
 * @returns {void}
 */
$(window).load(function () {
  'use strict';

  var
    /**
     * The chat name of the user.
     * @type null|String
     */
    name = null,

    /**
     * The email address of the user.
     * @type null|String
     */
    mail = null,

    /**
     * The password of the user.
     * @type null|String
     */
    pass = null,

    /**
     * <code>$('#chat')</code>
     * @type jQuery.Object
     */
    $chat = $('#chat'),

    /**
     * <code>$('#form-login')</code>
     * @type jQuery.Object
     */
    $formLogin = $('#form-login'),

    /**
     * <code>$('#form-register')</code>
     * @type jQuery.Object
     */
    $formRegister = $('#form-register'),

    /**
     * <code>$('#loading')</code>
     * @type jQuery.Object
     */
    $loading = $('#loading');

  /**
   * Change the document title.
   * @param {String} title Optional
   * @returns {void}
   */
  function setTitle(title) {
    document.title = (title ? title + ' | ' : '') + 'AMQPChat';
  }

  /**
   * React on click events on <code>.form-switcher</code> elements.
   * @param {Event} e
   * @returns {Boolean}
   */
  $('.form-switcher').click(function (e) {
    if (e) e.preventDefault();
    $.when(
      $('form.js-visible').slideUpFadeOut()
    ).done(function () {
      $('form').toggleVisibility();
      $('form.js-visible').slideDownFadeIn();
    });
    return false;
  });

  /**
   * React on submit events of the <code>$formLogin</code> element.
   * @param {Event} e
   * @returns {Boolean}
   */
  $formLogin.submit(function (e) {
    setTitle('Login');
    mail = $('#login-email').val();
    pass = $('#login-password');
    if (e) e.preventDefault();
    $formLogin.slideUpFadeOut(function () {
      $loading.slideDownFadeIn(function () {
        $.post('/login', { mail: mail, pass: pass }, function (res) {
          $formLogin.slideUpFadeOut(function () {
            setTitle();
            $chat.slideDownFadeIn();
          });
        });
      });
    });
    return false;
  });

  /**
   * React on submit events of the <code>$formRegister</code> element.
   * @param {Event} e
   * @returns {Boolean}
   */
  $formRegister.submit(function (e) {
    setTitle('Register');
    name = $('#register-name').val();
    mail = $('#register-email').val();
    if (e) e.preventDefault();
    $formRegister.slideUpFadeOut(function () {
      $loading.slideDownFadeIn(function () {
        $.post('/register', { name: name, mail: mail }, function (res) {
          if (pass = res.pass) {
            $loading.slideUpFadeOut('fast', function () {
              $('#login-email').val(mail);
              $('#login-password').val(pass);
              $formLogin.submit();
            });
          }
        });
      });
    });
    return false;
  });

  // Check which interface we should display at first.
  $loading.slideUpFadeOut(function () {
    $('body').hasClass('view-body-login') ? $formLogin.toggleVisibility() : $chat.toggleVisibility();
  });

  // Bind special Bootstrap jQuery extension stuff.
  $('.alert').alert();
  $('*[data-toggle="tooltip"]').tooltip();
  $('.js-hidden').slideUpFadeOut();
});