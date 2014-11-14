(function ($) {
  'use strict';

  function LazyImages(element, options) {
    this.lazyImages = $('img.lazy', element).get();
    this.bindEvents();
    this.loadVisibleImages();
  }

  LazyImages.prototype.bindEvents = function (){
    $(window).scroll(this.loadVisibleImages.bind(this));
    $(window).resize(this.loadVisibleImages.bind(this));
  };
  LazyImages.prototype.loadVisibleImages = function (){
    var i = 0;
    var q = this.lazyImages;
    while (i < q.length){
      var img = q[i];
      var rect = img.getBoundingClientRect();
      var visible = (rect.top >= 0) && (rect.left >= 0) && (rect.top <= (window.innerHeight|| document.documentElement.clientHeight));
      if (visible){
        q.splice(i,1);
        $(img).attr('src', $(img).attr('data-src'));
      }
      else{
        i = i+1;
      }
    }
  };

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('lwis.lazyimages');
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


  $.fn.lazyimages.noConflict = function () {
    $.fn.lazyimages = old;
    return this;
  };

  $(function () {
    $('[data-lazy="images"]').each(function () {
      var $lazy = $(this)
      Plugin.call($lazy, $lazy.data());
    });
  });

})(jQuery);
