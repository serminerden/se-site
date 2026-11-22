/* Site-wide helper script: copy protection on paper and cover pages.
   (Read counters will be reintroduced later with a new counting service.) */
(function () {
    "use strict";

    function protectPaperPage() {
        var block = function (e) { e.preventDefault(); };
        document.addEventListener("contextmenu", block);
        document.addEventListener("copy", block);
        document.addEventListener("cut", block);
        document.addEventListener("dragstart", block);
        document.addEventListener("selectstart", block);
        document.addEventListener("keydown", function (e) {
            var k = (e.key || "").toLowerCase();
            if ((e.ctrlKey || e.metaKey) && (k === "c" || k === "x")) {
                e.preventDefault();
            }
        });
    }

    function init() {
        var path = location.pathname;
        var isPaperPage = /^\/papers\/[^/]+\.html?$/i.test(path);
        var isCoverPage = /^\/covers\/[^/]+\.html?$/i.test(path);

        if (isPaperPage || isCoverPage) {
            protectPaperPage();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
