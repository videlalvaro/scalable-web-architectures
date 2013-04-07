/**
 * Simple script for deploying the app. Run <code>node deploy.js</code> before uploading the app to Cloud Foundry.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 */
'use strict';

var

  /**
   * node.js File System module.
   * @type Object
   */
  fs = require('fs'),

  /**
   * node.js glob module.
   * @type Object
   */
  glob = require('glob'),

  /**
   * Unix timestamp (used as cache buster).
   * @type Number
   */
  cacheBuster = +new Date,

  /**
   * JS for our website.
   * @type Array
   */
  js = ['vendor/jquery-1.9.1', 'vendor/bootstrap', 'libs/socket.io', 'main'],

  /**
   * CSS for our website.
   * @type Array|String
   */
  css = ['bootstrap', 'bootstrap-responsive', 'main'];

console.log('Deleting old minified and combined files ...');
['public/css/style-*.min.css', 'public/js/script-*.min.js'].forEach(function (pattern) {
  glob.sync(pattern).forEach(function (path) {
    fs.unlinkSync(path);
  });
});

console.log('Optimizing JavaScript files ...');
for (var i = 0; i < js.length; ++i) {
  js[i] = 'public/js/' + js[i] + '.js';
}
fs.writeFileSync('public/js/script-' + cacheBuster + '.min.js', (require('uglify-js').minify(js)).code);

console.log('Optimizing CSS files ...');
for (var i = 0; i < css.length; ++i) {
  css[i] = fs.readFileSync('public/css/' + css[i] + '.css', 'utf8');
}
fs.writeFileSync('public/css/style-' + cacheBuster + '.min.css', require('csso').justDoIt(css.join('')));

console.log('Creating optimized EJS view ...');
fs.writeFileSync('views/index.ejs', fs.readFileSync('views/layout.ejs', 'utf8').split('$cacheBuster$').join(cacheBuster));

console.log('Finished!');