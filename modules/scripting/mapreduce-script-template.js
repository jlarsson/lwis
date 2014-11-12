(function() {
  'use strict';
  if (['get-map', 'get-reduce', 'map', 'reduce'].indexOf(arguments[0].command) < 0) {
    throw new Error('Unexpected command');
  }
  if (arguments[0].command == 'get-map') {
    try {
      return map instanceof Function ? arguments[0].secret : null;
    } catch (e) {
      if (e instanceof ReferenceError) {
        return null;
      }
      throw e;
    }
  }
  if (arguments[0].command == 'get-reduce') {
    try {
      return reduce instanceof Function ? arguments[0].secret : null;
    } catch (e) {
      if (e instanceof ReferenceError) {
        return null;
      }
      throw e;
    }
  }
  $setupParams$;
  var emit = (function(emitted) {
    return function emit(item) {
      if (item !== undefined) {
        emitted.push(item);
      }
    }
  })(arguments[0].emitted);
  $userCode$;
  if (arguments[0].command == 'map') {
    return arguments[0].map.self.forEach(map);
  }
  if (arguments[0].command == 'reduce') {
    return reduce.call(arguments[0].reduce.self, arguments[0].reduce.args);
  }
})($global$);
