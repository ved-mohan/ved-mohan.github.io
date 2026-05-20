(function () {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img>';
    document.body.appendChild(overlay);
    const img = overlay.querySelector("img");
    const close = overlay.querySelector(".lightbox-close");

    function open(src) {
        img.src = src;
        overlay.classList.add("open");
    }
    function shut() {
        overlay.classList.remove("open");
        img.src = "";
    }

    document.querySelectorAll(".lightbox-trigger").forEach(function (a) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            open(a.getAttribute("href"));
        });
    });
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay || e.target === close) shut();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay.classList.contains("open")) shut();
    });
})();
