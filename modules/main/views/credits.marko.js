module.exports = function create(__helpers) {
  var str = __helpers.s,
      empty = __helpers.e,
      notEmpty = __helpers.ne,
      ______shared_views_layout_marko = __helpers.l(require.resolve("../../shared/views/layout.marko")),
      marko_node_modules_marko_layout_use_tag = require("marko/node_modules/marko-layout/use-tag"),
      _tag = __helpers.t,
      marko_node_modules_marko_layout_put_tag = require("marko/node_modules/marko-layout/put-tag"),
      escapeXml = __helpers.x,
      forEach = __helpers.f,
      attr = __helpers.a,
      escapeXmlAttr = __helpers.xa;

  return function render(data, out) {
    _tag(out,
      marko_node_modules_marko_layout_use_tag,
      {
        "template": ______shared_views_layout_marko
      },
      function(_layout) {
        _tag(out,
          marko_node_modules_marko_layout_put_tag,
          {
            "into": "title",
            "layout": _layout
          },
          function(out) {
            out.w(escapeXml(data.title));
          });
        _tag(out,
          marko_node_modules_marko_layout_put_tag,
          {
            "into": "content",
            "layout": _layout
          },
          function(out) {
            out.w('<h3>Software and licenses</h3><table class="table table-condensed table-striped table-hover"><tr><th>Name</th><th>Versions</th><th>Repository</th><th>Licenses</th></tr>');

            forEach(data.credits, function(credit) {
              out.w('<tr><td>' +
                escapeXml(credit.name) +
                '<br><small>' +
                escapeXml(credit.description) +
                '</small></td><td>');

              forEach(credit.versions, function(v) {
                out.w(escapeXml(v) +
                  '<br>');
              });

              out.w('</td><td>');

              forEach(credit.repositories, function(r) {
                out.w('<a' +
                  attr("href", r) +
                  '>' +
                  escapeXml(r) +
                  '</a><br>');
              });

              out.w('</td><td>');

              forEach(credit.licenses, function(l) {
                out.w('<a href="http://opensource.org/licenses/' +
                  escapeXmlAttr(l) +
                  '"><a' +
                  attr("href", l) +
                  '>' +
                  escapeXml(l) +
                  '</a><br></a>');
              });

              out.w('</td></tr>');
            });

            out.w('</table>');
          });
      });
  };
}