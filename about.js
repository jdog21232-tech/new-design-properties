// About page: story photos open a little larger in a lightbox.
const lb = document.getElementById("lightbox");
const big = lb.querySelector("img"), cap = lb.querySelector("p");
document.querySelectorAll(".zoom").forEach(b => b.addEventListener("click", () => {
  big.src = b.dataset.full; big.alt = b.querySelector("img").alt;
  cap.textContent = b.closest(".a-card").querySelector("h2").textContent;
  if (lb.showModal) lb.showModal(); else window.open(b.dataset.full, "_blank");
}));
lb.querySelector(".lb-close").addEventListener("click", () => lb.close());
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
