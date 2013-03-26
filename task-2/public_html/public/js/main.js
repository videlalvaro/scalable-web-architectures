/**
 * Extend jQuery with some nice animations.
 * @param {jQuery} $
 * @returns {void}
 */
(function ($) {
  'use strict';

  /**
   * Slide up and fade out the element, also switches the CSS classes.
   * @syntax $(jQuery.Selector).slideUpFadeOut(callback = undefined)
   * @param {Function} callback Optional
   * @returns {jQuery.Object}
   */
  $.fn.slideUpFadeOut = function (callback) {
    return this.stop(true, true).animate({ marginTop: -300, opacity: 'hide' }, { complete: function () {
      if (callback) callback();
      $(this).toggleClass('js-hidden js-visible');
    }});
  };

  /**
   * Slide down and fade in the element, also switches the CSS classes.
   * @syntax $(jQuery.Selector).slideDownFadeIn(callback = undefined)
   * @param {Function} callback Optional
   * @returns {jQuery.Object}
   */
  $.fn.slideDownFadeIn = function (callback) {
    var title = this.data('title');
    document.title = (title && title !== '' ? title + ' | ' : '') + 'AMQPChat';
    return this.stop(true, true).animate({ marginTop: 0, opacity: 'show' }, { complete: function () {
      if (callback) callback();
      $(this).toggleClass('js-hidden js-visible');
    }});
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
     * <code>$('#content')</code>
     * @type jQuery.Object
     */
    $content = $('#content'),

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
   * Display an alert message to the user.
   * @param {String} message
   *   The message to display.
   * @param {String} type
   *   The type of message, possible values are <em>warning</em>, <em>error</em>, <em>success</em> and <em>info</em>.
   *   Defaults to <em>warning</em>.
   * @returns {void}
   */
  function setAlert(message, type) {
    if (!message) return;
    type = type || 'warning';
    $content.prepend(
      '<div class="alert alert-block alert-' + type + ' fade in">' +
        '<button type="button" class="close" data-dismiss="alert">×</button>' +
        '<p>' + message + '</p>' +
      '</div>'
    );
  }

  /**
   * React on click events on <code>.form-switcher</code> elements.
   * @param {Event} e
   * @returns {Boolean}
   */
  $('.form-switcher').click(function (e) {
    var $this = $(this);
    if (e) e.preventDefault();
    $.when( $('.js-visible').slideUpFadeOut() ).done(function () {
      $('#' + $this.attr('id').replace('btn-', '')).slideDownFadeIn();
    });
    return false;
  });

  /**
   * React on form submissions.
   * @param {Event} e
   * @returns {Boolean} Always false.
   */
  $('form').submit(function (e) {
    if (e) e.preventDefault();
    $('.alert').alert('close');
    return false;
  });

  /**
   * React on submit events of the <code>$formLogin</code> element.
   * @returns {void}
   */
  $formLogin.submit(function () {
    mail = $('#login-email').val();
    pass = $('#login-password').val();
    $formLogin.slideUpFadeOut(function () {
      $loading.slideDownFadeIn(function () {
        $.post('/login', { mail: mail, pass: pass }, function (res) {
          $loading.slideUpFadeOut(function () {
            if (res && res.success === true) {
              $chat.slideDownFadeIn();
            } else {
              $formLogin.slideDownFadeIn();
              setAlert(res.error, 'error');
            }
          });
        });
      });
    });
  });

  /**
   * React on submit events of the <code>$formRegister</code> element.
   * @returns {void}
   */
  $formRegister.submit(function () {
    function _registerError(message) {
      $loading.slideUpFadeOut(function () {
        setAlert(message, 'error');
        $formRegister.slideDownFadeIn();
      });
    }
    name = $('#register-name').val();
    mail = $('#register-email').val();
    $formRegister.slideUpFadeOut(function () {
      $loading.slideDownFadeIn(function () {
        $.post('/register', { name: name, mail: mail }, function (res) {
          if (res && (pass = res.pass)) {
            $.post('/login', { mail: mail, pass: pass }, function (res) {
              if (res && res.success === true) {
                $loading.slideUpFadeOut(function () {
                  $chat.slideDownFadeIn();
                  setAlert('You have successfully registered a new account. Please use your email and the following password in the future to log in.</p><p>Your password: <b>' + pass + '</b>', 'success');
                });
              } else {
                _registerError(res.error);
              }
            });
          } else {
            _registerError(res.error);
          }
        });
      });
    });
  });

  // Check which interface we should display at first.
  $loading.slideUpFadeOut(function () {
    ($('body').hasClass('view-body-login') ? $formLogin : $chat).slideDownFadeIn();
  });

  // Bind special Bootstrap jQuery extension stuff.
  $('.alert').alert();
  $('*[data-toggle="tooltip"]').tooltip();
});