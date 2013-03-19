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

  $('#form-login').submit(function (event) {
    if (event) event.preventDefault();
    $.post('/user/login', { email: $('#login-email').val(), password: $('#login-password').val() }, function (res) {
      console.log(res);
    });
    return false;
  });

  $('#form-register').submit(function (event) {
    if (event) event.preventDefault();
    $.post('/user/register', { name: $('#register-name').val(), email: $('#register-email').val() }, function (res) {
      console.log(res);
    });
    return false;
  });

  $('.alert').alert();
  $('*[data-toggle="tooltip"]').tooltip();

});