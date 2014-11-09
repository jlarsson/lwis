(function ($) {
    $(function () {
        // Make sure correct navigation item is selected in header
        $('ul.nav li a[href="' + window.location.pathname + '"]').parent('li').addClass('active');

        // Setup syntaxhighlighting in <pre><code> blocks
        Rainbow.color();
    })
})(jQuery);
