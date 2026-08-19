(function () {
  // Load the softer, lower-glare academic color layer across every page.
  if (!document.querySelector('link[data-comfort-theme]')) {
    const comfortTheme = document.createElement('link');
    comfortTheme.rel = 'stylesheet';
    comfortTheme.href = 'comfort-theme.css?v=20260819-soft';
    comfortTheme.setAttribute('data-comfort-theme', 'true');
    document.head.appendChild(comfortTheme);
  }

  const navToggle = document.getElementById("navToggle");
  const mobilePanel = document.getElementById("mobilePanel");

  // Add Resume link consistently across every page.
  const desktopNav = document.querySelector(".nav-links");
  if (desktopNav && !desktopNav.querySelector('a[href="resume.html"]')) {
    const resumeLink = document.createElement("a");
    resumeLink.href = "resume.html";
    resumeLink.textContent = "Resume";
    resumeLink.setAttribute("data-nav", "");
    const contactLink = desktopNav.querySelector('a[href="contact.html"]');
    desktopNav.insertBefore(resumeLink, contactLink || null);
  }

  if (mobilePanel && !mobilePanel.querySelector('a[href="resume.html"]')) {
    const mobileResumeLink = document.createElement("a");
    mobileResumeLink.href = "resume.html";
    mobileResumeLink.textContent = "Resume";
    mobileResumeLink.setAttribute("data-nav", "");
    const mobileContactLink = mobilePanel.querySelector('a[href="contact.html"]');
    mobilePanel.insertBefore(mobileResumeLink, mobileContactLink || null);
  }

  const footerLinks = document.querySelector(".footer-links");
  if (footerLinks && !footerLinks.querySelector('a[href="resume.html"]')) {
    const footerResumeLink = document.createElement("a");
    footerResumeLink.href = "resume.html";
    footerResumeLink.textContent = "Resume";
    footerLinks.prepend(footerResumeLink);
  }

  // On the Resume page, link the original uploaded PDF.
  const path = window.location.pathname.split("/").pop() || "index.html";
  if (path === "resume.html") {
    const resumeCard = document.querySelector("main .card");
    const contactLine = resumeCard ? resumeCard.querySelector("h1 + p") : null;
    if (contactLine && !document.querySelector(".resume-pdf-actions")) {
      const actions = document.createElement("div");
      actions.className = "buttons resume-pdf-actions";

      const viewPdf = document.createElement("a");
      viewPdf.className = "btn primary";
      viewPdf.href = "Resume_Musfikur_Rahaman_PhD_Research.pdf";
      viewPdf.target = "_blank";
      viewPdf.rel = "noopener";
      viewPdf.textContent = "View Resume PDF";

      const downloadPdf = document.createElement("a");
      downloadPdf.className = "btn";
      downloadPdf.href = "Resume_Musfikur_Rahaman_PhD_Research.pdf";
      downloadPdf.setAttribute("download", "Musfikur_Rahaman_Resume.pdf");
      downloadPdf.textContent = "Download PDF";

      actions.append(viewPdf, downloadPdf);
      contactLine.insertAdjacentElement("afterend", actions);
    }
  }

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
  const allLinks = document.querySelectorAll('a[data-nav]');
  allLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });
})();
