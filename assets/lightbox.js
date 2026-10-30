(function () {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<div class="lightbox-stage"><img class="lightbox-main" alt=""><div class="lightbox-strip"></div>' +
        '<p class="lightbox-hint">Tap a panel to enlarge it</p></div>';
    document.body.appendChild(overlay);
    const img = overlay.querySelector(".lightbox-main");
    const strip = overlay.querySelector(".lightbox-strip");
    const close = overlay.querySelector(".lightbox-close");
    let homeSrc = "";

    // strip = [{ src, thumb, label }]: process panels shown comic-strip style under the main image
    function open(src, steps) {
        homeSrc = src;
        img.src = src;
        strip.innerHTML = "";
        overlay.classList.toggle("has-strip", !!(steps && steps.length));
        (steps || []).forEach(function (s, i) {
            const b = document.createElement("button");
            b.className = "panel";
            b.innerHTML = '<span class="panel-num">' + (i + 1) + '</span><img src="' + s.thumb + '" alt="' + s.label +
                '"><span class="panel-cap">' + s.label + '</span>';
            b.addEventListener("click", function () {
                const active = b.classList.contains("active");
                strip.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
                if (active) {
                    img.src = homeSrc;
                } else {
                    b.classList.add("active");
                    img.src = s.src;
                }
            });
            strip.appendChild(b);
        });
        overlay.classList.add("open");
    }
    function shut() {
        overlay.classList.remove("open", "has-strip");
        img.src = "";
        strip.innerHTML = "";
    }

    document.querySelectorAll(".lightbox-trigger").forEach(function (a) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            const raw = a.getAttribute("data-strip");
            open(a.getAttribute("href"), raw ? JSON.parse(decodeURIComponent(raw)) : null);
        });
    });
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay || e.target === close) shut();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay.classList.contains("open")) shut();
    });
})();
