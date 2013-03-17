/**
 * @link https://github.com/videlalvaro/rabbitpubsub/blob/master/routes/index.js
 * @author Richard Fussenegger
 */

/**
 * Generate full title for usage in <code>&lt;title&gt;</code> element.
 *
 * @param {String} title
 * @returns {String}
 */
function getTitle(title) {
  return title ? title + " | " : "" + "AMQPChat";
}

exports = {
  /**
   * Render index page.
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  index: function routesIndex(req, res) {
    try {
      // Save user from previous session (if exists).
      var user = req.session.user;

      // Regenerate session and store user from previous session (if exists).
      res.session.regenerate(function (error) {
        req.session.user = user;
        res.render("index", { title: getTitle(), user: user });
      });
    } catch (e) {
      res.render("index", { title: getTitle() });
    }
  },

  /**
   * Render user profile page if logged in.
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  user: function routesUser(req, res) {
    res.render("user", { title: getTitle("User") });
  },

  /**
   * Render login page.
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  login: function routesLogin(req, res) {
    req.session.user = req.body.user;
    //res.json({ error: "" });
    res.render("login", { title: getTitle("Login") });
  },

  /**
   * Render logout page.
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  logout: function routesLogout(req, res) {
    req.session.destroy();
    //res.redirect("/");
    res.render("logout", { title: getTitle("Logout") });
  },


  /**
   * Render forgot password page.
   *
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @returns {void}
   */
  password: function routesPassword(req, res) {
    res.render("password", { title: getTitle("Password") });
  }
};