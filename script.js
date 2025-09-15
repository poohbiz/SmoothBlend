//
(function () {
  const header = document.querySelector("header");
  const btn = document.querySelector(".nav-toggle");
  const list = document.getElementById("primary-nav");

  if (!btn || !list || !header) return;

  btn.addEventListener("click", () => {
    const open = header.getAttribute("data-nav-open") === "true";
    header.setAttribute("data-nav-open", String(!open));
    btn.setAttribute("aria-expanded", String(!open));
    document.body.classList.toggle("nav-locked", !open);
  });

  list.addEventListener("click", (e) => {
    const target = e.target.closest("a");
    if (!target) return;
    header.setAttribute("data-nav-open", "false");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-locked");

    navLinks.forEach((a) => a.removeAttribute("aria-current"));
    target.setAttribute("aria-current", "page");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      header.setAttribute("data-nav-open", "false");
      btn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-locked");
    }
  });
})();

//   Function to set Header Height Variable
function setHeaderHeightVar() {
  const h = document.querySelector("header")?.offsetHeight || 72;
  document.documentElement.style.setProperty("--header-h", h + "px");
}
setHeaderHeightVar();
addEventListener("resize", setHeaderHeightVar);

//   Tracking for Current Section (Active Nav Link Highlight)
const navLinks = Array.from(
  document.querySelectorAll('.nav-links a[href^="#"]')
);
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
const ratios = new Map(sections.map((s) => [s, 0]));
const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

const io = new IntersectionObserver(
  (entries) => {
    // Update visibility map for every section that changed
    entries.forEach((en) => {
      const ratio = en.isIntersecting ? en.intersectionRatio : 0;
      ratios.set(en.target, ratio);
    });

    // Pick the section with the highest current ratio
    let best = null,
      bestRatio = 0;
    ratios.forEach((r, sec) => {
      if (r > bestRatio) {
        bestRatio = r;
        best = sec;
      }
    });

    // Flip aria-current on the matching nav link
    if (best) {
      const id = "#" + best.id;
      navLinks.forEach((a) => a.removeAttribute("aria-current"));
      const current = navLinks.find((a) => a.getAttribute("href") === id);
      if (current) current.setAttribute("aria-current", "page");
    }
  },
  {
    // Account for sticky header at the top so a section "counts"
    // a bit below the very top edge
    rootMargin: `-${
      document.querySelector("header")?.offsetHeight || 72
    }px 0px -55% 0px`,
    threshold: thresholds,
  }
);

sections.forEach((s) => io.observe(s));

const initialHash =
  location.hash && document.querySelector(location.hash) ? location.hash : null;
if (initialHash) {
  navLinks.forEach((a) => a.removeAttribute("aria-current"));
  const match = navLinks.find((a) => a.getAttribute("href") === initialHash);
  if (match) match.setAttribute("aria-current", "page");
} else if (sections[0]) {
  // No hash: mark the top-most section
  const top = sections
    .slice()
    .sort(
      (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
    )[0];
  const id = "#" + top.id;
  navLinks.forEach((a) => a.removeAttribute("aria-current"));
  const link = navLinks.find((a) => a.getAttribute("href") === id);
  if (link) link.setAttribute("aria-current", "page");
}
