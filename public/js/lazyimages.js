(function($) {
  'use strict';

  function loadVisibleImages() {
    var q = this.lazyImages;

    if (q.length === 0){
      return;
    }

    var wh = $(window).height();
    var ww = $(window).width();

    var loaded = false;
    for (var i = 0; i < q.length; ++i){
      var img = q[i];
      var rect = img.getBoundingClientRect();

      var visible = (rect.top <= wh)
        && (rect.left <= ww)
        && (Math.max(rect.bottom, rect.top + this.minHeight) >= 0)
        && (Math.max(rect.right, rect.left + this.minWidth) >= 0);

      if (visible) {
        loaded = true;
        q[i] = null;
        $(img).attr('src', $(img).attr('data-src'));
      }
    }
    if (loaded){
      this.lazyImages =  this.lazyImages.filter(function (v){ return v; });
    }
  }

  function LazyImages(element, options) {
    this.minWidth = Number($(element).attr('data-lazy-min-width') || 0);
    this.minHeight = Number($(element).attr('data-lazy-min-height') || 0);

    this.lazyImages = $('img.lazy', element).get();
    var self = this;
    $(window).scroll(function() {
      setImmediate(function() {
        loadVisibleImages.call(self);
      })
    });
    loadVisibleImages.call(this);
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this);
      var data = $this.data('lwis.lazyimages');
      var options = typeof option == 'object' && option;
      if (!data) {
        $this.data('lwis.lazyimages', (data = new LazyImages(this, options)));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    });
  }


  var old = $.fn.lazyimages;

  $.fn.lazyimages = Plugin;
  $.fn.lazyimages.Constructor = LazyImages


  $.fn.lazyimages.noConflict = function() {
    $.fn.lazyimages = old;
    return this;
  };

  $(function() {
    $('[data-lazy="images"]').each(function() {
      var $lazy = $(this)
      Plugin.call($lazy, $lazy.data());
    });
  });

})(jQuery);
