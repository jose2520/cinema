import "@/style.css";
import { router, navigateTo } from "@/router/router";
import { createIcons, icons } from "lucide";

document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }

  const app = document.querySelector("#app");

  app.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      navigateTo(nav.dataset.nav);
    }
  });

  const observer = new MutationObserver(() => {
    observer.disconnect();
    try { createIcons({ icons }); } catch (e) { console.error("Lucide:", e); }
    observer.observe(app, { childList: true, subtree: true });
  });
  observer.observe(app, { childList: true, subtree: true });

  router();
});
