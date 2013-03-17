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
 * Render EJS view.
 *
 * @param {http.ServerResponse} res
 * @param {String} view
 * @param {Object} options
 * @returns {void}
 */
function render(res, view, options) {
  res.render(view, {
    view: view,
    title: getTitle(options.title | null),
    navbar: getNavbar(options.active | null),
    user: options.user | null
  });
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
      render(res, "index", { active: "/", user: user });
    });
  } catch (e) {
    render(res, "signin", { title: "Signin" });
  }
};