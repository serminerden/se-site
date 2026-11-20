/* Site-wide helper script: paper read counters + copy protection.
   Counter data lives on a free external counting service (Abacus),
   namespaced so only this site uses it. That service allows only 30
   requests per 10 seconds per visitor, so we:
     - stagger counter requests with pauses between them,
     - cache counts in the visitor's browser for 10 minutes,
     - back off if the service says "too many requests".
   All counter failures are silent: the site must work normally even
   if the counting service is unreachable. */
(function () {
    "use strict";

    var API = "https://abacus.jasoncameron.dev";
    var NS = "serminerden";
    var CACHE_KEY = "sermin-reads-cache-v1";
    var CACHE_TTL = 10 * 60 * 1000;      // 10 minutes
    var STAGGER_MS = 450;                // pace: < 30 requests / 10 s
    var backOffUntil = 0;

    function slugFromHref(href) {
        var name = String(href || "").split("?")[0].split("#")[0].split("/").pop();
        return name.replace(/\.html?$/i, "");
    }

    function getJSON(url) {
        return fetch(url).then(function (r) {
            if (r.status === 429) {
                backOffUntil = Date.now() + 10000;
                return { __rateLimited: true };
            }
            if (r.status === 404) {
                // Key not created yet: nobody has read this paper
                return { __notFound: true };
            }
            return r.json();
        });
    }

    /* ---- count cache (localStorage) ---- */

    function readCache() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function writeCache(cache) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) { /* storage unavailable: cacheless mode */ }
    }

    function cachedCount(cache, key) {
        var entry = cache[key];
        if (entry && typeof entry.n === "number" && Date.now() - entry.t < CACHE_TTL) {
            return entry.n;
        }
        return null;
    }

    function putCache(cache, key, n) {
        cache[key] = { n: n, t: Date.now() };
        writeCache(cache);
    }

    /* ---- rendering ---- */

    function showReads(card, n) {
        var span = card.querySelector(".paper-reads");
        if (!span) {
            span = document.createElement("span");
            span.className = "paper-reads";
            var meta = card.querySelector(".paper-meta");
            if (meta) {
                meta.appendChild(span);
            } else {
                var info = card.querySelector(".paper-info");
                if (info) info.appendChild(span);
            }
        }
        span.textContent = "\u2022 " + n + (n === 1 ? " read" : " reads");
    }

    /* ---- staggered fetch queue for the papers page ---- */

    var queue = [];
    var cache = {};

    function drainQueue() {
        if (Date.now() < backOffUntil) {
            setTimeout(drainQueue, backOffUntil - Date.now() + 100);
            return;
        }
        var job = queue.shift();
        if (!job) return;
        getJSON(API + "/get/" + NS + "/" + job.key).then(function (data) {
            if (data && typeof data.value === "number") {
                putCache(cache, job.key, data.value);
                showReads(job.card, data.value);
            } else if (data && data.__notFound) {
                showReads(job.card, 0);
                putCache(cache, job.key, 0);
            }
            // 429 (rate limited): retried automatically after the pause;
            // unreachable: leave as-is
        }).catch(function () { /* counter unreachable: show nothing */ });
        setTimeout(drainQueue, STAGGER_MS);
    }

    function init() {
        var path = location.pathname;
        var isPaperPage = /^\/papers\/[^/]+\.html?$/i.test(path);
        var isCoverPage = /^\/covers\/[^/]+\.html?$/i.test(path);
        var isPapersIndex = /\/papers\.html?$/i.test(path);

        if (isPaperPage) {
            // Count this visit as one read (single request: no rate-limit risk)
            try {
                fetch(API + "/hit/" + NS + "/" + slugFromHref(path)).catch(function () {});
            } catch (e) { /* ignore */ }
        }

        if (isPaperPage || isCoverPage) {
            protectPaperPage();
        }

        if (isPapersIndex) {
            cache = readCache();
            document.querySelectorAll(".paper-item").forEach(function (card) {
                var link = card.querySelector(".paper-links a.read-btn, a.read-btn");
                if (!link) return;
                var href = link.getAttribute("href");
                // Only real paper pages get counted
                if (!/^papers\/[^/]+\.html?$/i.test(href)) return;
                var key = slugFromHref(href);
                var cached = cachedCount(cache, key);
                if (cached !== null) {
                    showReads(card, cached);
                } else {
                    queue.push({ card: card, key: key });
                }
            });
            if (queue.length) {
                setTimeout(drainQueue, STAGGER_MS);
            }
        }
    }

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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
