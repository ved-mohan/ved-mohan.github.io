(function () {
    // Accessible lightbox on a native <dialog>: focus moves in and returns, background is inert,
    // Escape closes, the enlarged image is described, and process panels announce their state.
    const dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Enlarged artwork");
    dlg.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
        '<div class="lightbox-stage">' +
        '<img class="lightbox-main" alt="">' +
        '<p class="lightbox-caption" hidden></p>' +
        '<div class="lightbox-strip" role="group" aria-label="How the print was made"></div>' +
        '<button class="lightbox-back" type="button" hidden>&larr; Finished print</button>' +
        '<p class="lightbox-hint">Tap a panel to enlarge it</p>' +
        '</div>';
    document.body.appendChild(dlg);
    const img = dlg.querySelector(".lightbox-main");
    const caption = dlg.querySelector(".lightbox-caption");
    const strip = dlg.querySelector(".lightbox-strip");
    const back = dlg.querySelector(".lightbox-back");
    const closeBtn = dlg.querySelector(".lightbox-close");
    let home = { src: "", alt: "" }, opener = null;

    function show(src, alt) { img.src = src; img.alt = alt || ""; }
    function finished() {
        strip.querySelectorAll(".panel").forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
        show(home.src, home.alt);
        back.hidden = true;
    }

    function open(a) {
        opener = a;
        const thumb = a.querySelector("img");
        home = { src: a.getAttribute("href"), alt: a.getAttribute("data-alt") || (thumb ? thumb.alt : "") };
        show(home.src, home.alt);
        const cap = a.getAttribute("data-caption");
        caption.innerHTML = cap ? decodeURIComponent(cap) : "";
        caption.hidden = !cap;
        strip.innerHTML = "";
        back.hidden = true;
        const raw = a.getAttribute("data-strip");
        const steps = raw ? JSON.parse(decodeURIComponent(raw)) : [];
        dlg.classList.toggle("has-strip", steps.length > 0);
        steps.forEach(function (s, i) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "panel";
            b.setAttribute("aria-pressed", "false");
            b.setAttribute("aria-label", "Step " + (i + 1) + ": " + s.label);
            b.innerHTML = '<span class="panel-num" aria-hidden="true">' + (i + 1) + '</span><img src="' + s.thumb +
                '" alt=""><span class="panel-cap" aria-hidden="true">' + s.label + '</span>';
            b.addEventListener("click", function () {
                if (b.getAttribute("aria-pressed") === "true") return finished();
                strip.querySelectorAll(".panel").forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
                b.setAttribute("aria-pressed", "true");
                show(s.src, "Process step " + (i + 1) + ": " + s.label);
                back.hidden = false;
            });
            strip.appendChild(b);
        });
        document.documentElement.classList.add("lightbox-open");
        dlg.showModal();
        closeBtn.focus();
    }

    back.addEventListener("click", finished);
    closeBtn.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) {
        if (e.target === dlg || e.target.classList.contains("lightbox-stage")) dlg.close();
    });
    dlg.addEventListener("close", function () {
        img.src = "";
        strip.innerHTML = "";
        document.documentElement.classList.remove("lightbox-open");
        if (opener) opener.focus();
    });

    document.querySelectorAll(".lightbox-trigger").forEach(function (a) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            open(a);
        });
    });
})();
