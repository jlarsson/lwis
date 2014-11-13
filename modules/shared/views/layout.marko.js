module.exports = function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      __header_marko = __helpers.l(require.resolve("./header.marko")),
      __footer_marko = __helpers.l(require.resolve("./footer.marko")),
      marko_node_modules_marko_layout_placeholder_tag = require("marko/node_modules/marko-layout/placeholder-tag"),
      _tag = __helpers.t;

  return function render(data, out) {
    out.w('<!DOCTYPE html> <html><head><meta charset="utf-8"><title>');
    _tag(out,
      marko_node_modules_marko_layout_placeholder_tag,
      {
        "name": "title",
        "content": data.layoutContent
      });

    out.w('</title><meta name="description" content=""><meta name="keywords" content=""><link rel="stylesheet" href="/css/styles.min.css">');
    _tag(out,
      marko_node_modules_marko_layout_placeholder_tag,
      {
        "name": "script",
        "content": data.layoutContent
      });

    out.w('</head><body>');
    __helpers.i(out, __header_marko, {});

    out.w('<div class="container">');
    _tag(out,
      marko_node_modules_marko_layout_placeholder_tag,
      {
        "name": "content",
        "content": data.layoutContent
      });

    out.w('</div>');
    __helpers.i(out, __footer_marko, {});

    out.w('<script type="text/javascript" src="/js/scripts.min.js"></script>');
    _tag(out,
      marko_node_modules_marko_layout_placeholder_tag,
      {
        "name": "script",
        "content": data.layoutContent
      });

    out.w('</body></html>');
  };
}