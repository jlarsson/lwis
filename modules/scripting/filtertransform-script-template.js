(function() {
  'use strict';
  if (['filter', 'transform', 'get-filter', 'get-transform'].indexOf(arguments[0].command) < 0) {
    throw new Error('Unexpected command');
  }
  if (arguments[0].command == 'get-filter') {
    try {
      return filter instanceof Function ? arguments[0].secret : null;
    } catch (e) {
      if (e instanceof ReferenceError) {
        return null;
      }
      throw e;
    }
  }
  if (arguments[0].command == 'get-transform') {
    try {
      return transform instanceof Function ? arguments[0].secret : null;
    } catch (e) {
      if (e instanceof ReferenceError) {
        return null;
      }
      throw e;
    }
  }
  $setupParams$;
  $userCode$;
  if (arguments[0].command == 'filter') {
    return arguments[0].filter.self.filter( function (item) { return filter.apply(item, this.args); }, arguments[0].filter);
  }
  if (arguments[0].command == 'transform') {
    return transform.apply(arguments[0].transform.self, arguments[0].transform.args);
  }
})($global$);
