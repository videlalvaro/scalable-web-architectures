/**
 * Global AMQPChat object, contains settings and utility methods.
 * @type Object
 */
var AMQPChat = AMQPChat || {};

/**
 * Get the name of the app.
 * @type String
 */
AMQPChat.toString = 'AMQPChat';

/**
 * @link http://www.skype-emoticons.com/
 * @type Object
 */
AMQPChat.smileys = {
  '(finger)': 'finger',
  '(bandit)': 'bandit',
  '(drunk)': 'drunk',
  '(smoking)': 'smoking',
  '(smoke)': 'smoking',
  '(ci)': 'smoking',
  '(toivo)': 'toivo',
  '(rock)': 'rock',
  '(headbang)': 'headbang',
  '(banghead)': 'headbang',
  '(bug)': 'bug',
  '(fubar)': 'fubar',
  '(poolparty)': 'poolparty',
  '(swear)': 'swear',
  '(tmi)': 'tmi',
  '(heidy)': 'heidy',
  '(mooning)': 'mooning',
  ':)': 'smile',
  ':=)': 'smile',
  ':-)': 'smile',
  ':(': 'sadsmile',
  ':=(': 'sadsmile',
  ':-(': 'sadsmile',
  ':D': 'bigsmile',
  ':=D': 'bigsmile',
  ':-D': 'bigsmile',
  ':d': 'bigsmile',
  ':=d': 'bigsmile',
  ':-d': 'bigsmile',
  '8)': 'cool',
  '8=)': 'cool',
  '8-)': 'cool',
  'B)': 'cool',
  'B=)': 'cool',
  'B-)': 'cool',
  '(cool)': 'cool',
  ':o': 'wink',
  ':=o': 'wink',
  ':-o': 'wink',
  ':O': 'wink',
  ':=O': 'wink',
  ':-O': 'wink',
  ';(': 'crying',
  ';=(': 'crying',
  ';-(': 'crying',
  '(sweat)': 'sweating',
  '(:|': 'sweating',
  ':|': 'speechless',
  ':=|': 'speechless',
  ':-|': 'speechless',
  ':*': 'kiss',
  ':=*': 'kiss',
  ':-*': 'kiss',
  ':P': 'tongueout',
  ':=P': 'tongueout',
  ':-P': 'tongueout',
  ':p': 'tongueout',
  ':=p': 'tongueout',
  ':-p': 'tongueout',
  ':$': 'blush',
  ':=$': 'blush',
  ':-$': 'blush',
  ':">': 'blush',
  '(blush)': 'blush',
  ':^)': 'wondering',
  '|)': 'sleepy',
  '|=)': 'sleepy',
  '|-)': 'sleepy',
  '(snooze)': 'sleepy',
  '|(': 'dull',
  '|=(': 'dull',
  '|-(': 'dull',
  '(inlove)': 'inlove',
  ']:)': 'evilgrin',
  '>:)': 'evilgrin',
  '(grin)': 'evilgrin',
  '(talk)': 'talk',
  '(yawn)': 'yawn',
  '|-()': 'yawn',
  '(puke)': 'puke',
  ':&': 'puke',
  ':=&': 'puke',
  ':-&': 'puke',
  '(doh)': 'doh',
  ':@': 'angry',
  ':=@': 'angry',
  ':-@': 'angry',
  'x(': 'angry',
  'x=(': 'angry',
  'x-(': 'angry',
  'X(': 'angry',
  'X=(': 'angry',
  'X-(': 'angry',
  '(wasntme)': 'wasntme',
  '(hi)': 'hi',
  '(call)': 'call',
  '(devil)': 'devil',
  '(angel)': 'angel',
  '(envy)': 'envy',
  '(wait)': 'wait',
  '(bear)': 'bear',
  '(hug)': 'bear',
  '(makeup)': 'makeup',
  '(kate)': 'makeup',
  '(giggle)': 'giggle',
  '(chuckle)': 'giggle',
  '(clap)': 'clapping',
  '(bow)': 'bow',
  '(rofl)': 'rofl',
  '(whew)': 'whew',
  '(happy)': 'happy',
  '(smirk)': 'smirk',
  '(nod)': 'nod',
  '(shake)': 'shake',
  '(punch)': 'punch',
  '(emo)': 'emo',
  '(y)': 'yes',
  '(Y)': 'yes',
  '(ok)': 'yes',
  '(n)': 'no',
  '(N)': 'no',
  '(handshake)': 'handshake'
};

/**
 * Get the <code>img</code>-element for the smiley identified by <em>code</code>.
 * @syntax AMQPChat.getSmiley(code)
 * @see AMQPChat.smileys
 * @param {String} code
 * @returns {String}
 */
AMQPChat.getSmiley = function (code) {
  return '<img src="/img/' + AMQPChat.smileys[code] + '.gif" alt="" width="19" height="19">';
};

/**
 * Extend String object with a special function to replace all occurences of special text combinations with our smileys.
 * @syntax String.replaceSmileys()
 * @returns {String}
 */
String.prototype.replaceSmileys = function () {
  var str = this + '';
  for (var code in AMQPChat.smileys) str = str.split(code).join(AMQPChat.getSmiley(code));
  return str;
};

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
    return this.stop(true, true).animate({ marginTop: -340, opacity: 'hide' }, { complete: function () {
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
    document.title = (title && title !== '' ? title + ' | ' : '') + AMQPChat.toString;
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
     * <code>$('#chat')</code>
     * @type jQuery.Object
     */
    $chat = $('#chat'),

    /**
     * <code>$('#chat-container')</code>
     * @type jQuery.Object
     */
    $chatContainer = $('#chat-container'),

    /**
     * <code>$('#chat-name')</code>
     * @type jQuery.Object
     */
    $chatName = $('#chat-name'),

    /**
     * <code>$('#chat-message')</code>
     * @type jQuery.Object
     */
    $chatMessage = $('#chat-message'),

    /**
     * <code>$('#form-chat')</code>
     * @type jQuery.Object
     */
    $formChat = $('#form-chat'),

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
    $('#content').prepend(
      '<div class="alert alert-block alert-' + type + ' fade in">' +
        '<button type="button" class="close" data-dismiss="alert">×</button>' +
        '<p>' + message + '</p>' +
      '</div>'
    );
  }

  /**
   * Start chat.
   * @returns {void}
   */
  function chatJoin() {
    var socketIO, intervalID, reconnectCount = 0;

    socketIO = io.connect('http://' + window.location.host.split(':')[0], { reconnect: false, 'try multiple transports': false });

    socketIO.emit('joined');

    socketIO.on('disconnect', function () {
      intervalID = setInterval(function () {
        reconnectCount++;
        if (reconnectCount === 5) clearInterval(intervalID);
        $.ajax('/', function () {
          socketIO.socket.reconnect();
          clearInterval(intervalID);
        });
      }, 4000);
    });

    socketIO.on('chat', function (data) {
      data = JSON.parse(data);
      if (data.action === 'message') {
        $chatContainer.append('<p><b>' + data.name + ':</b> ' + data.message.replaceSmileys() + '</p>');
      } else if (data.action === 'system') {
        $chatContainer.append('<p>' + AMQPChat.getSmiley('(hi)') + ' <em>' + data.name + data.message + '</em></p>');
      }
      $chatContainer.scrollTop($chatContainer[0].scrollHeight);
    });

    $('#logout').click(function () {
      socketIO.emit('left');
    });

    $formChat.submit(function () {
      var message = $chatMessage.val();
      if (message === '') return;
      socketIO.send(message);
      $chatMessage.val('');
    });
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
              $chatName.text(res.name);
              $chat.slideDownFadeIn(chatJoin);
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
          if (res && res.pass) {
            pass = res.pass;
            $.post('/login', { mail: mail, pass: pass }, function (res) {
              if (res && res.success === true) {
                $loading.slideUpFadeOut(function () {
                  var $registered = $('#registered');
                  $chatName.text(name);
                  $('#pass').text(pass);
                  $registered.slideDownFadeIn(chatJoin); // Start the chat right away!
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

  /**
   * If the user hits enter we want to submit the form and insert a line break if the user hits ctrl + enter. This is
   * the similar behaviour as other chat apps are doing it (e.g. Skype).
   */
  $chatMessage
    .keydown(function (e) {
      if (e.keyCode === 10 || e.keyCode === 13 && e.ctrlKey) {
        $(this).val(function (i, val) {
          return val + '\n';
        });
      }
    })
    .keypress(function (e) {
      if (e.keyCode === 10 || e.keyCode === 13 && !e.ctrlKey) {
        e.preventDefault();
        $formChat.submit();
        return false;
      }
    })
  ;

  // Check which interface we should display at first.
  $loading.slideUpFadeOut(function () {
    (name = $chatName.text()) === '' ? $formLogin.slideDownFadeIn() : $chat.slideDownFadeIn(chatJoin);
  });

  // Preload all smileys.
  for (var code in AMQPChat.smileys) {
    (new Image()).src = '/img/' + AMQPChat.smileys[code] + '.gif';
  }

  // Bind special Bootstrap jQuery extension stuff.
  $('.alert').alert();
  $('*[data-toggle="tooltip"]').tooltip();
});