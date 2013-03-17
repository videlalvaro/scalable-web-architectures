/**
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/routes/index.js
 * @author Richard Fussenegger
 */

/**
 * Get the server name from predefined variables if we are running the app on CloudFoundry, otherwise use localhost.
 */
var serverName = process.env.VCAP_APP_HOST ? process.env.VCAP_APP_HOST + ":" + process.env.VCAP_APP_PORT : "localhost:3000";

/**
 * Render the index page.
 *
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @returns {void}
 */
exports.index = function (request, response) {
  /**
   * Render the index page.
   *
   * @param {type} user
   * @function
   */
  var respond = function (user) {
    response.render("index", { title: "AMQPChat", server: serverName, user: user });
  };

  try {
    // Save user from previous session (if exists).
    var user = request.session.user;

    // Regenerate session and store user from previous session (if exists).
    request.session.regenerate(function (error) {
      request.session.user = user;
      respond(user);
    });
  } catch (e) {
    respond();
  }
};