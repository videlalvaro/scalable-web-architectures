/**
 * Test user is:
 *   name: Fleshgrinder
 *   mail: richard@fussenegger.info
 *   pass: pafizohufe
 *
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/app.js
 * @author Richard Fussenegger
 */
'use strict';

// Global variables / objects
var

  /**
   * @class Singleton to easily interact with the MySQL database.
   * @type MySQL
   */
  mysql = (function MySQL() {
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
    // Create the table if it does not exist yet.
    self.query('CREATE TABLE IF NOT EXISTS `users` (`id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL UNIQUE, `mail` VARCHAR(255) NOT NULL UNIQUE, `pass` VARCHAR(40) NOT NULL);');
    return self;
  })(),

  /**
   * nodejs socket.io instance.
   * @type socket.io
   */
  socketIO,

  /**
   * @link http://adamnengland.wordpress.com/2013/01/30/node-js-cluster-with-socket-io-and-express-3/
   */
  socketRedis = require('socket.io/node_modules/redis'),

  /**
   * nodejs http server instance.
   * @type http.Server
   */
  server,

  /**
   * nodejs express instance.
   * @type Express
   */
  express = require('express'),

  /**
   * Redis database for storing sessions.
   * @type Redis.storage
   */
  sessionStore = new (require('connect-redis')(express))({ client: require('redis').createClient() }),

  /**
   * The cookie key (defined by CloudFoundry).
   * @type String
   */
  cookieKey = 'jsessionid',

  /**
   * The secret key used to hash the cookie content. Change this if you intend to use this code!
   * @type String
   */
  cookieSecret = 'amqpchat',

  /**
   * Express cookie parser.
   * @type Express.cookieParser
   */
  cookieParser = express.cookieParser(cookieSecret),

  /**
   * nodejs amqp exchange instance.
   * @type amqp.exchange
   */
  chatExchange,

  /**
   * nodejs amqp instance.
   * @type amqp
   */
  rabbitConn = require('amqp').createConnection({}).on('ready', function () {
    chatExchange = this.exchange('chatExchange', { type: 'fanout' });
  });

// Express 3 requires that we instantiate a http.Server to attach socket.io to first.
(socketIO = require('socket.io').listen(
  (server = require('http').createServer(
    // Create new express app instance, configure it and start listening.
    express()
      .configure(function expressAppConfigure() {
        this
          .set('views', __dirname + '/views')
          .set('view engine', 'ejs')
          .use(express.favicon())
          .use(express.logger('dev'))
          .use(express.bodyParser())
          .use(express.methodOverride())
          .use(express.compress())
          .use(express.static(require('path').join(__dirname, 'public'), { maxAge: 2628000 }))
          .use(cookieParser)
          .use(express.session({ store: sessionStore, key: cookieKey, secret: cookieSecret }))
        ;
      })

      // Render the index page.
      .get('/', function expressAppGetIndex(req, res) {
        var oldSession;
        if (req.session && req.session.name && req.session.mail && req.session.pass) {
          oldSession = req.session;
          mysql.queryEscaped('SELECT `id` FROM `users` WHERE `name` = ? AND `mail` = ? AND `pass` = SHA1(?) LIMIT 1;', [req.session.name, req.session.mail, req.session.pass], function (result) {
            if (result.length > 0) {
              req.session.regenerate(function () {
                req.session.name = oldSession.name;
                req.session.mail = oldSession.mail;
                req.session.pass = oldSession.pass;
                res.render('index', { name: req.session.name });
              });
            } else {
              res.render('index', { name: null });
            }
          });
        } else {
          res.render('index', { name: null });
        }
      })

      // Register new user account with the given info.
      .post('/register', function expressAppPostRegister(req, res) {
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
        if (req.body.mail && req.body.pass) {
          mysql.queryEscaped('SELECT `name` FROM `users` WHERE `mail` = ? AND `pass` = SHA1(?) LIMIT 1;', [req.body.mail, req.body.pass], function (result) {
            if (result[0].name) {
              req.session.name = result[0].name;
              req.session.mail = req.body.mail;
              req.session.pass = req.body.pass;
              res.json({ success: true, name: result[0].name });
            } else {
              res.json({ error: 'Email or password is wrong, please try again!' });
            }
          });
        } else {
          res.json({ error: 'Please fill out all required fields!' });
        }
      })

      // Log the user out if currently logged in.
      .get('/logout', function expressAppPostLogout(req, res) {
        req.session.destroy();
        res.redirect('/');
      })
  ))
))
.set('store', new (require('socket.io/lib/stores/redis'))({
  redis: socketRedis,
  redisPub: socketRedis.createClient(),
  redisSub: socketRedis.createClient(),
  redisClient: socketRedis.createClient()
}))
.set('transports', ['xhr-polling'])
.set('log level', 1);

server.listen(process.env.PORT);

new (require('session.socket.io'))(socketIO, sessionStore, cookieParser, cookieKey).on('connection', function (error, socket, session) {
  if (error) console.log(error);

  socket.on('message', function (message) {
    chatExchange.publish('', { action: 'message', name: session.name, message: message.split(session.name).join('<b class="you">' + session.name + '</b>') });
  });

  socket.on('joined', function () {
    chatExchange.publish('', { action: 'system', name: session.name, message: ' joined the chat!' });
  });

  socket.on('left', function () {
    chatExchange.publish('', { action: 'system', name: session.name, message: ' left the chat!' });
  });

  rabbitConn.queue('', { exclusive: true }, function (queue) {
    // We can not chain this (poorly programmed?)!
    queue.bind('chatExchange', '');
    queue.subscribe(function (data) {
      socket.emit('chat', JSON.stringify(data));
    });
  });
});