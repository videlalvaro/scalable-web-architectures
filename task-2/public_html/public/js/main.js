$(document).ready(function () {
  'use strict';

  var marginRegisterLogin = -$('body').outerHeight();

  $('#btn-show-register,#btn-show-login').click(function (event) {
    if (event) event.preventDefault();
    $.when(
      $('form.js-hidden').css('margin-top', marginRegisterLogin),
      $('form.js-visible').stop(1, 1).animate({ marginTop: marginRegisterLogin, opacity: 'hide' })
    ).done(function () {
      $('form').toggleClass('js-hidden js-visible');
      $('form.js-visible').animate({ marginTop: 0, opacity: 'show' });
    });
    return false;
  });

});