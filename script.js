(function () {
  const navToggle = document.getElementById("navToggle");
  const mobilePanel = document.getElementById("mobilePanel");

  // Mobile menu toggle
  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = mobilePanel.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile menu after click
    mobilePanel.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mobilePanel.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active link by current page
  const path = window.location.pathname.split("/").pop() || "index.html";
  const allLinks = document.querySelectorAll('a[data-nav]');
  allLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
})();
