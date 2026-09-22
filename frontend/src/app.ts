type PageName = `${string}.html` | "";

const currentPage = getCurrentPage();

function getCurrentPage(): PageName {
  return (window.location.pathname.split("/").pop() || "index.html").toLowerCase() as PageName;
}

function pageFromHref(href: string | null): string {
  return String(href || "")
    .split("#")[0]
    .split("?")[0]
    .split("/")
    .pop()
    ?.toLowerCase() || "";
}

function pageHomeFor(file: string): string {
  if (file === "fr.html" || file.endsWith("-fr.html")) return "fr.html";
  if (file === "en.html" || file.endsWith("-en.html")) return "en.html";
  return "index.html";
}

function normalizeLanguageLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>(".church-lang-switch a, .nav-lang-row a").forEach((link) => {
    const targetPage = pageFromHref(link.getAttribute("href"));
    if (!targetPage) return;

    link.classList.remove("lang-disabled");
    link.removeAttribute("aria-disabled");
    link.removeAttribute("title");
  });
}

const BACK_BUTTON_LABELS: Record<string, { text: string; ariaLabel: string }> = {
  ru: { text: "Назад", ariaLabel: "Вернуться назад" },
  fr: { text: "Retour", ariaLabel: "Revenir en arrière" },
  en: { text: "Back", ariaLabel: "Go back" }
};

function addBackButton(): void {
  if (["index.html", "fr.html", "en.html", "admin.html"].includes(currentPage)) return;

  const main = document.querySelector("main");
  if (!main || document.querySelector(".page-back")) return;

  const language = document.documentElement.lang;
  const labels = BACK_BUTTON_LABELS[language] || BACK_BUTTON_LABELS.ru;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "page-back";
  button.textContent = labels.text;
  button.setAttribute("aria-label", labels.ariaLabel);
  button.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = pageHomeFor(currentPage);
    }
  });

  main.insertBefore(button, main.firstElementChild);
}

function setupHeroSlideshow(): void {
  const slides = Array.from(document.querySelectorAll<HTMLElement>(".hero-slide"));
  if (slides.length < 2) return;

  let current = 0;
  window.setInterval(() => {
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5000);
}

function setupMobileMenu(): void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const nav = document.querySelector<HTMLElement>(".main-nav");
  if (!header || !nav) return;

  const button = document.createElement("button");
  button.className = "hamburger-btn";
  button.setAttribute("aria-label", document.documentElement.lang === "ru" ? "Меню" : "Menu");
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = "<span></span><span></span><span></span>";
  header.appendChild(button);

  const langSwitch = document.querySelector<HTMLElement>(".church-lang-switch");
  if (langSwitch) {
    const langRow = langSwitch.cloneNode(true) as HTMLElement;
    langRow.className = "nav-lang-row";
    nav.appendChild(langRow);
  }

  const syncHeaderHeight = (): void => {
    document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
  };

  const closeMenu = (): void => {
    nav.classList.remove("nav-open");
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  };

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    syncHeaderHeight();
    const isOpen = nav.classList.toggle("nav-open");
    button.classList.toggle("is-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !header.contains(event.target)) closeMenu();
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });
}

normalizeLanguageLinks();
addBackButton();
setupHeroSlideshow();
setupMobileMenu();
