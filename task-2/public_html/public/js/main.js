$(document).ready(function () {
  $('#btn-show-register,#btn-show-login').click(function (event) {
    if (event) event.preventDefault();
    $.when(
      $('form.js-visible').stop(1, 1).animate({ marginLeft: -300, opacity: 'hide' }, 500, 'linear')
    ).done(function () {
      $('form').toggleClass('js-hidden js-visible');
      $('form.js-visible').animate({ marginLeft: 0, opacity: 'show' }, 500, 'linear');
    });
    return false;
  });
});