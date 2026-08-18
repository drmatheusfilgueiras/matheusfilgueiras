import "./styles.css";

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const rotatingWord = document.querySelector("[data-rotating-word]");
const languageList = document.querySelector("[data-language-list]");
const languagePreview = document.querySelector("[data-language-preview]");
const progressLine = document.querySelector("[data-progress-line]");

const words = ["dentista", "pesquisador", "autor", "desenhista", "criador", "design", "tecnologia", "Matheus."];
let wordIndex = 0;

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  if (progressLine) {
    const processSection = document.querySelector(".process");
    const rect = processSection.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.2)));
    progressLine.style.transform = `scaleX(${progress})`;
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

if (rotatingWord) {
  setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    rotatingWord.classList.add("is-changing");
    window.setTimeout(() => {
      rotatingWord.textContent = words[wordIndex];
      rotatingWord.classList.remove("is-changing");
    }, 240);
  }, 1850);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

if (languageList && languagePreview) {
  languageList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("mouseenter", () => updateLanguagePreview(button));
    button.addEventListener("focus", () => updateLanguagePreview(button));
  });
}

function updateLanguagePreview(button) {
  languageList.querySelectorAll("button").forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  languagePreview.innerHTML = `<strong>${button.dataset.title}</strong><p>${button.dataset.copy}</p>`;
}
