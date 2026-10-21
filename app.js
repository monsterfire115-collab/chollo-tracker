const STORAGE_KEY = "chollo-tracker-deals";
const CATEGORY_LABELS = {
  tech: "Tecnología",
  phones: "Móviles",
  mountain: "Montaña",
  gaming: "Gaming",
  other: "Otros",
};

let deals = load();
let filter = "all";
let query = "";

const form = document.getElementById("deal-form");
const list = document.getElementById("deal-list");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const filters = document.getElementById("filters");

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

function discount(deal) {
  if (!deal.oldPrice || deal.oldPrice <= deal.price) return null;
  return Math.round((1 - deal.price / deal.oldPrice) * 100);
}

function render() {
  list.innerHTML = "";
  const visible = deals.filter((d) => {
    const matchesFilter = filter === "all" || d.category === filter;
    const haystack = `${d.title} ${d.store}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  empty.style.display = visible.length ? "none" : "block";

  for (const deal of visible) {
    const li = document.createElement("li");
    li.className = "deal";

    const info = document.createElement("div");
    info.className = "deal-info";
    const title = document.createElement("div");
    title.className = "deal-title";
    title.textContent = deal.title;
    const meta = document.createElement("div");
    meta.className = "deal-meta";
    const bits = [CATEGORY_LABELS[deal.category] || deal.category];
    if (deal.store) bits.push(deal.store);
    meta.textContent = bits.join(" · ");
    if (deal.url) {
      const link = document.createElement("a");
      link.href = deal.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = " Ver oferta";
      meta.appendChild(link);
    }
    info.append(title, meta);

    const price = document.createElement("div");
    price.className = "deal-price";
    const now = document.createElement("span");
    now.className = "now";
    now.textContent = `${deal.price.toFixed(2)} €`;
    price.appendChild(now);
    if (deal.oldPrice) {
      const was = document.createElement("span");
      was.className = "was";
      was.textContent = ` ${deal.oldPrice.toFixed(2)} €`;
      price.appendChild(was);
      const pct = discount(deal);
      if (pct) {
        const d = document.createElement("span");
        d.className = "discount";
        d.textContent = `-${pct}%`;
        price.appendChild(d);
      }
    }

    const del = document.createElement("button");
    del.className = "deal-delete";
    del.title = "Eliminar";
    del.textContent = "✕";
    del.addEventListener("click", () => {
      deals = deals.filter((d) => d.id !== deal.id);
      save();
      render();
    });

    li.append(info, price, del);
    list.appendChild(li);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const deal = {
    id: crypto.randomUUID(),
    title: document.getElementById("title").value.trim(),
    price: parseFloat(document.getElementById("price").value),
    oldPrice: parseFloat(document.getElementById("old-price").value) || null,
    store: document.getElementById("store").value.trim(),
    category: document.getElementById("category").value,
    url: document.getElementById("url").value.trim(),
    addedAt: Date.now(),
  };
  if (!deal.title || isNaN(deal.price)) return;
  deals.unshift(deal);
  save();
  form.reset();
  render();
});

search.addEventListener("input", () => {
  query = search.value.trim().toLowerCase();
  render();
});

filters.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  filter = btn.dataset.cat;
  filters.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

render();
