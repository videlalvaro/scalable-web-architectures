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
  return (title ? title + " | " : "") + "AMQPChat";
}

/**
 * Generate the navbar.
 *
 * @param {String} active
 * @returns {Array}
 */
function getNavbar(active) {
  var points = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About" },
    { href: "/user", text: "User" }
  ];

  for (var i = 0; i < points.length; i++) {
    points[i].active = points[i].text === active || points[i].href === active ? ' class="active"' : "";
  }

  return points;
}

/**
 * Render index page.
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @returns {void}
 */
exports.index = function routesIndex(req, res) {
  try {
    // Save user from previous session (if exists).
    var user = req.session.user;

    // Regenerate session and store user from previous session (if exists).
    res.session.regenerate(function (error) {
      req.session.user = user;
      res.render("index", { title: getTitle(), navbar: getNavbar("/"), user: user });
    });
  } catch (e) {
    res.render("signin", { title: getTitle("Signin") });
  }
};