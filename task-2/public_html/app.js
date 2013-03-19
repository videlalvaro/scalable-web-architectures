/**
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/app.js
 * @author Richard Fussenegger
 */

/**
 * @class Helper object to render EJS views of the app.
 * @type EJSHelper
 */
var ejsHelper = (function EJSHelper() {
  'use strict';

  var

    /**
     * The name of the app.
     *
     * @private
     * @type String
     */
    _name = 'AMQPChat',

    /**
     * The string to use as title separator.
     *
     * @private
     * @type String
     */
    _titleSeparator = ' | ',

    /**
     * Set alert messages to be displayed to the user, the object consists of two offsets:
     * <ul>
     *   <li><b>message:</b> The message to display.</li>
     *   <li><b>type:</b> The type of message, possible values are <em>warning</em>, <em>error</em>, <em>success</em>
     *   and <em>info</em>.</li>
     * </ul>
     *
     * @private
     * @see EJSHelper.setAlert()
     * @type null|Object
     */
    _alert = null,

    /**
     * @public
     * @type EJSHelper
     */
    self = {

      /**
       * Generate the title for usage in the <code>&lt;title%gt;</code>-element.
       *
       * @syntax EJSHelper.getTitle(title = "")
       * @public
       * @function
       * @param {String} title
       *   The title of the page, defaults to empty string.
       * @returns {String}
       *   The title formatted for usage in the <code>&lt;title&gt;</code>-element.
       */
      getTitle: function EJSHelperGetTitle(title) {
        return (title ? title + _titleSeparator : '') + _name;
      },

      /**
       * Helper function for rendering the EJS views.
       *
       * @syntax EJSHelper.render(res, view, options = {})
       * @public
       * @function
       * @param {http.ServerResponse} res
       *   The <code>http.ServerResponse</code> object with which we should respond the rendered view.
       * @param {String} view
       *   The name of the view.
       * @param {Object} options
       *   Options to pass to the view, predefined offsets are:
       *   <ul>
       *     <li><b>view:</b> The name of the view (can not be altered).</li>
       *     <li><b>title:</b> The title of the page (passed to <code>EJSHelper.getTitle</code>).</li>
       *     <li><b>alert:</b> Alert message to display to the user (use <code>EJSHelper.setAlert</code> to set alert
       *     message).</li>
       *     <li><b>options:</b> The complete options object as passed to this function.</li>
       *   </ul>
       * @returns {EJSHelper}
       */
      render: function EJSHelperRender(res, view, options) {
        options = options || {};
        res.render(view, {
          view: view,
          title: self.getTitle(options.title || null),
          alert: _alert,
          options: options
        });
        // Always reset any alert after rendering!
        _alert = null;
        return self;
      },

      /**
       * Set alert message to display to the user.
       *
       * @syntax EJSHelper.setAlert(message, type = "warning")
       * @public
       * @function
       * @param {String} message
       *   The message to display.
       * @param {String} type
       *   The type of message, possible values are <em>warning</em>, <em>error</em>, <em>success</em> and
       *   <em>info</em>. Defaults to <em>warning</em>.
       * @returns {EJSHelper}
       */
      setAlert: function EJSHelperSetAlert(message, type) {
        if (!message) return;
        type = type || 'warning';
        _alert = { message: message, type: type };
        return self;
      }

    };

  return self;
})();

(express = require('express'))()
  .configure(function expressAppConfigure() {
    this
      .set('port', process.env.PORT)
      .set('views', __dirname + '/views')
      .set('view engine', 'ejs')
      .use(express.logger('dev'))
      .use(express.bodyParser())
      .use(express.methodOverride())
      .use(express.static(require('path').join(__dirname, 'public')))
    ;
  })
  .get('/', function expressAppGetIndex(req, res) {
    var user;
    try {
      user = req.session.user;
      ejsHelper.render(res, 'index');
    } catch (e) {
      res.redirect('/user');
    }
  })
  .get('/user', function expressAppGetUser(req, res) {
    if (req.session && req.session.user) {
      // @todo Render user profile page.
    } else {
      ejsHelper.render(res, 'login', { title: 'Login' });
    }
  })
  .post('/user/register', function expressAppPostUserRegister(req, res) {
    res.json(req.body);
  })
  .post('/user/login', function expressAppPostUserLogin(req, res) {
    res.json(req.body);
  })
  .post('/user/logout', function expressAppPostUserLogout(req, res) {
    res.json({});
  })
  .listen()
;