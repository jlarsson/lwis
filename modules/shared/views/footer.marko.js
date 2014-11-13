module.exports = function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne;

  return function render(data, out) {
    out.w('<div class="container"><div class="footer"><hr style="margin: 30px 0 10px 0;"><p>&copy;&nbsp;<a href="#">Joakim Larsson</a> 2014. This software is based on the <a href="/lwis/credits">work of others.</a></p></div></div>');
  };
}