/**
 * Test user is:
 *   mail: richard@fussenegger.info
 *   pass: pafizohufe
 *
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/app.js
 * @author Richard Fussenegger
 */
var ejsHelper, mysql, express;

/**
 * @class Singleton to easily render EJS views of the app.
 * @type EJSHelper
 */
ejsHelper = (function EJSHelper() {
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
      render: function EJSHelperRender(res, options) {
        options = options || {};
        res.render('index', {
          view: options.view || 'chat',
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
        return message && (_alert = { message: message, type: (type || 'warning') }), self;
      }

    };

  return self;
})();

/**
 * @class Singleton to easily interact with the MySQL database.
 * @type MySQL
 */
mysql = (function MySQL() {
  'use strict';

  var

    /**
     * Contains the MySQL connection pool
     *
     * @private
     * @type Pool
     */
    _pool = null,

    /**
     * @public
     * @type MySQL
     */
    self = {
      /**
       * Error handling policy.
       *
       * @syntax MySQL.error(error)
       * @public
       * @function
       * @param {Object} error
       * @returns {MySQL}
       */
      error: function MySQLError(error) {
        return console.log(error), self;
      },

      /**
       * Check if an error occured, if not call the callback function with the given arguments.
       *
       * @syntax MySQL.checkError(error, callback, callbackArg = null);
       * @public
       * @function
       * @param {Object} error
       * @param {Function} callback
       * @param {mixed} callbackArg
       * @returns {MySQL}
       */
      checkError: function MySQLCheckError(error, callback, callbackArg) {
        return (error && self.error(error)) || (callback && callback((callbackArg || null))), self;
      },

      /**
       * Get MySQL connection pool.
       *
       * @syntax MySQL.getPool()
       * @public
       * @function
       * @returns {Pool}
       */
      getPool: function MySQLGetPool() {
        return _pool || (_pool = require('mysql').createPool(JSON.parse(process.env.VCAP_SERVICES)['mysql-5.1'][0].credentials));
      },

      /**
       * Get a MySQL connection from the MySQL pool.
       *
       * @syntax MySQL.getConnection(callback)
       * @public
       * @function
       * @param {Function} callback
       * @returns {MySQL}
       */
      getConnection: function MySQLGetConnection(callback) {
        self.getPool().getConnection(function _MySQLGetConnectionCallback(error, connection) {
          self.checkError(error, callback, connection);
        });
        return self;
      },

      /**
       * Execute any query against the MySQL database.
       *
       * @syntax MySQL.query(query, callback)
       * @public
       * @function
       * @param {String} query
       * @param {Function} callback
       * @returns {MySQL}
       */
      query: function MySQLQuery(query, callback) {
        if (query) {
          self.getConnection(function _GetConnectionCallback(connection) {
            connection.query(query, function _QueryCallback(error, result) {
              self.checkError(error, callback, result);
            });
          });
        }
        return self;
      },

      /**
       * Execute any query against the MySQL database but auto escape the parameters.
       *
       * @syntax MySQL.queryEscaped(query, params, callback)
       * @public
       * @function
       * @param {String} query
       * @param {Array} params
       * @param {Function} callback
       * @returns {MySQL}
       */
      queryEscaped: function MySQLQueryEscaped(query, params, callback) {
        if (query) {
          self.getConnection(function _GetConnectionCallback(connection) {
            connection.query(query, params, function _QueryCallback(error, result) {
              self.checkError(error, callback, result);
            });
          });
        }
        return self;
      }
    };

  self.query('CREATE TABLE IF NOT EXISTS `users` (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL UNIQUE, `mail` VARCHAR(255) NOT NULL UNIQUE, `pass` VARCHAR(40) NOT NULL);');

  return self;
})();

// Create new express app instance, configure it and start listening.
(express = require('express'))()
  .configure(function expressAppConfigure() {
    'use strict';
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

  // Render the index page.
  .get('/', function expressAppGetIndex(req, res) {
    'use strict';
    var user;
    try {
      user = req.session.user;
      ejsHelper.render(res);
    } catch (e) {
      ejsHelper.render(res, { view: 'login', title: 'Login' });
    }
  })

  // Register new user account with the given info.
  .post('/register', function expressAppPostRegister(req, res) {
    'use strict';
    var pass;
    if (req.body.name && req.body.mail) {
      mysql.queryEscaped('SELECT `id` FROM `users` WHERE `name` = ?', [req.body.name], function (result) {
        if (result.length > 0) {
          res.json({ error: 'The name <b>' + req.body.name + '</b> is already taken, please use another name!' });
        } else {
          mysql.queryEscaped('SELECT `id` FROM `users` WHERE `mail` = ?', [req.body.mail], function (result) {
            if (result.length > 0) {
              res.json({ error: 'The email <b>' + req.body.mail + '</b> is already taken, please use another email!' });
            } else {
              pass = require('password-generator')();
              mysql.queryEscaped('INSERT INTO `users` SET `name` = ?, `mail` = ?, `pass` = SHA1(?);', [req.body.name, req.body.mail, pass], function () {
                res.json({ pass: pass });
              });
            }
          });
        }
      });
    } else {
      res.json({ error: 'Please fill out all required fields!' });
    }
  })

  // Try to log the user in with the given info.
  .post('/login', function expressAppPostLogin(req, res) {
    'use strict';
    if (req.body.mail && req.body.pass) {
      mysql.queryEscaped('SELECT `name` FROM `users` WHERE `mail` = ? AND `pass` = SHA1(?) LIMIT 1;', [req.body.mail, req.body.pass], function (result) {
        res.json(result[0].name ? { success: true } : { error: 'Email or password is wrong, please try again!' });
      });
    } else {
      res.json({ error: 'Please fill out all required fields!' });
    }
  })

  // Log the user out if currently logged in.
  .post('/logout', function expressAppPostLogout(req, res) {
    'use strict';
    res.json({ success: true });
  })

  // Has to be the last function call (returns Server).
  .listen()
;