$(document).ready(function () {
  $('#btn-show-register,#btn-show-login').click(function (event) {
    if (event) event.preventDefault();
    $.when(
      $('form.js-visible').stop(1, 1).animate({ marginTop: -300, opacity: 'hide' })
    ).done(function () {
      $('form').toggleClass('js-hidden js-visible');
      $('form.js-visible').animate({ marginTop: 0, opacity: 'show' });
    });
    return false;
  });
});