const STORAGE_KEY = "transactions";

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];

    return data
      .map((t) => {
        if (t.status === "paid" || t.status === "unpaid") return t;
        if (t.type === "income") return { ...t, status: "paid" };
        if (t.type === "unpaid") return { ...t, status: "unpaid" };
        return null;
      })
      .filter((t) => t && t.date && t.amount)
      .map((t) => ({
        ...t,
        client: t.client || "-",
        project: t.project || t.desc || "(tanpa nama)",
        category: t.category || "Lainnya",
        notes: t.notes || "",
      }));
  } catch {
    return [];
  }
}

let transactions = load();
let activeFilter = sessionStorage.getItem("filter") || "all";

const form = document.getElementById("form");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("empty");
const filters = document.getElementById("filters");
const dateInput = document.getElementById("date");
const errorsBox = document.getElementById("errors");

const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function render() {
  const sum = (status) =>
    transactions
      .filter((t) => t.status === status)
      .reduce((s, t) => s + (t.amount || 0), 0);

  const income = sum("paid");
  const receivable = sum("unpaid");

  document.getElementById("income").textContent = rupiah(income);
  document.getElementById("receivable").textContent = rupiah(receivable);
  document.getElementById("balance").textContent = rupiah(income);

  filters.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === activeFilter);
  });

  const visible = transactions
    .filter((t) => activeFilter === "all" || t.status === activeFilter)
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.id - a.id);

  list.innerHTML = "";
  emptyMsg.hidden = visible.length > 0;

  visible.forEach((t) => {
    const li = document.createElement("li");
    li.className = "item " + t.status;

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = t.project || "(tanpa nama)";
    const client = document.createElement("small");
    client.textContent = "Klien: " + (t.client || "-");
    const meta = document.createElement("small");
    meta.textContent = `${t.category} · Ditagih ${t.date ? formatDate(t.date) : "-"}`;
    info.append(title, client, document.createElement("br"), meta);

    if (t.status === "paid" && t.paidDate) {
      const paid = document.createElement("small");
      paid.textContent = "Lunas " + formatDate(t.paidDate);
      info.append(document.createElement("br"), paid);
    }
    if (t.notes) {
      const note = document.createElement("small");
      note.className = "note";
      note.textContent = t.notes;
      info.append(document.createElement("br"), note);
    }

    const right = document.createElement("div");
    right.className = "right";

    const amount = document.createElement("span");
    amount.className = "amount";
    amount.textContent = rupiah(t.amount);

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.status === "paid" ? "Lunas" : "Belum dibayar";

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggle = document.createElement("button");
    toggle.className = "toggle";
    toggle.dataset.id = t.id;
    toggle.dataset.action = "toggle";
    toggle.textContent = t.status === "paid" ? "Batalkan lunas" : "Tandai lunas";

    const del = document.createElement("button");
    del.className = "del";
    del.dataset.id = t.id;
    del.dataset.action = "delete";
    del.setAttribute("aria-label", "Hapus tagihan");
    del.textContent = "✕";

    actions.append(toggle, del);
    right.append(amount, badge, actions);

    li.append(info, right);
    list.appendChild(li);
  });
}

function validate() {
  const errors = [];
  const fields = {
    client: document.getElementById("client"),
    project: document.getElementById("project"),
    date: dateInput,
    amount: document.getElementById("amount"),
  };

  Object.values(fields).forEach((el) => el.classList.remove("invalid"));

  const fail = (field, message) => {
    fields[field].classList.add("invalid");
    errors.push(message);
  };

  if (!fields.client.value.trim()) fail("client", "Nama klien wajib diisi.");
  if (!fields.project.value.trim()) fail("project", "Nama proyek wajib diisi.");
  if (!fields.date.value) fail("date", "Tanggal tagihan wajib diisi.");

  if (fields.amount.value === "") {
    fail("amount", "Nominal wajib diisi.");
  } else if (Number(fields.amount.value) <= 0) {
    fail("amount", "Nominal harus lebih dari 0.");
  }

  return errors;
}

function showErrors(errors) {
  errorsBox.innerHTML = "";
  errors.forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    errorsBox.appendChild(li);
  });
  errorsBox.hidden = errors.length === 0;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const errors = validate();
  showErrors(errors);
  if (errors.length > 0) return;

  const status = document.getElementById("status").value;
  const date = dateInput.value;

  transactions.push({
    id: Date.now(),
    client: document.getElementById("client").value.trim(),
    project: document.getElementById("project").value.trim(),
    amount: Number(document.getElementById("amount").value),
    status,
    category: document.getElementById("category").value,
    date,
    paidDate: status === "paid" ? date : null,
    notes: document.getElementById("notes").value.trim(),
  });

  save();
  form.reset();
  dateInput.value = today();
  render();
});

form.addEventListener("input", (e) => {
  e.target.classList.remove("invalid");
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const t = transactions.find((x) => x.id === id);
  if (!t) return;

  if (btn.dataset.action === "toggle") {
    if (t.status === "unpaid") {
      t.status = "paid";
      t.paidDate = today();
    } else {
      t.status = "unpaid";
      t.paidDate = null;
    }
    save();
    render();
  }

  if (btn.dataset.action === "delete") {
    if (confirm(`Hapus tagihan "${t.project}" untuk ${t.client} (${rupiah(t.amount)})?`)) {
      transactions = transactions.filter((x) => x.id !== id);
      save();
      render();
    }
  }
});

filters.addEventListener("click", (e) => {
  if (!e.target.dataset.filter) return;
  activeFilter = e.target.dataset.filter;
  sessionStorage.setItem("filter", activeFilter);
  render();
});

document.getElementById("clear").addEventListener("click", () => {
  if (transactions.length === 0) return;
  if (confirm("Yakin hapus SEMUA data? Tindakan ini tidak bisa dibatalkan.")) {
    transactions = [];
    save();
    render();
  }
});

dateInput.value = today();
render();