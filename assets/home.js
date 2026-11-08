const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroEyebrow = hero.querySelector(".eyebrow");
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#primary-navigation");
    const committeeDialog = document.querySelector("#committee-dialog");
    const committeeTitle = document.querySelector("#dialog-title");
    const committeeLevel = document.querySelector("#dialog-level");
    const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sectionLinks = navLinks
      .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
      .filter(({ section }) => section);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const committees = {
      hrc: { name: "Human Rights Council", level: "Beginner" },
      ga: { name: "General Assembly", level: "Beginner" },
      disec: { name: "Disarmament and International Security Committee", level: "Intermediate" },
      "arab-league": { name: "Arab League", level: "Intermediate" },
      sc: { name: "Security Council", level: "Advanced" },
      legco: { name: "Legislative Council of the Hong Kong Special Administrative Region", level: "Mixed" }
    };

    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
      navigation.classList.toggle("open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      }
    });

    document.addEventListener("click", (event) => {
      if (!navigation.classList.contains("open") || event.target.closest(".site-header")) return;
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        menuToggle.focus();
      }
    });

    let scrollUpdateScheduled = false;
    const updateScrollState = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
      document.documentElement.classList.toggle("is-past-hero", window.scrollY > 24);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      siteHeader.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
      scrollUpdateScheduled = false;
    };

    window.addEventListener("scroll", () => {
      if (scrollUpdateScheduled) return;
      scrollUpdateScheduled = true;
      window.requestAnimationFrame(updateScrollState);
    }, { passive: true });
    updateScrollState();

    if ("IntersectionObserver" in window) {
      const visibleSections = new Map();
      const sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleSections.set(entry.target, entry.intersectionRatio);
          else visibleSections.delete(entry.target);
        }

        const activeSection = [...visibleSections.entries()]
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        if (!activeSection) return;
        for (const { link, section } of sectionLinks) {
          if (section === activeSection) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        }
      }, { rootMargin: "-18% 0px -64% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75] });
      sectionLinks.forEach(({ section }) => sectionObserver.observe(section));

      if (!prefersReducedMotion.matches) {
        const revealItems = document.querySelectorAll(
          ".section-heading, .action-card, .board-card, .level-group, .resource-card, .gallery-tile, .about-copy"
        );
        const revealObserver = new IntersectionObserver((entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
        revealItems.forEach((item) => {
          item.classList.add("reveal-item");
          revealObserver.observe(item);
        });
        document.documentElement.classList.add("reveal-ready");
      }
    }

    document.querySelectorAll("[data-committee]").forEach((button) => {
      button.addEventListener("click", () => {
        const committee = committees[button.dataset.committee];
        if (!committee) return;
        committeeTitle.textContent = committee.name;
        committeeLevel.textContent = `${committee.level} committee`;
        committeeDialog.showModal();
      });
    });

    document.querySelector("[data-close-dialog]").addEventListener("click", () => committeeDialog.close());
    committeeDialog.addEventListener("click", (event) => {
      if (event.target === committeeDialog) committeeDialog.close();
    });