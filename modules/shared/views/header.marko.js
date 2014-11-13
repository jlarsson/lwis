module.exports = function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne;

  return function render(data, out) {
    out.w('<div class="navbar navbar-inverse navbar-fixed-top" role="navigation"><div class="container"><div class="navbar-header"><button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".navbar-collapse"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a href="#" class="navbar-brand">lwis</a></div><div class="collapse navbar-collapse"><ul class="nav navbar-nav"><li><a href="/">Home</a></li><li><a href="/lwis/repository/index">Repository</a></li><li><a href="/lwis/upload/index">Upload files</a></li><li><a href="/lwis/publication/index">Publications</a></li></ul></div></div></div>');
  };
}