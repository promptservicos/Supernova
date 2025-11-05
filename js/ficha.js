// --- Config Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCZGLqHvb1tA9D6kNvwtr5ZoicPqh8ci8I",
  authDomain: "supernova-372bf.firebaseapp.com",
  projectId: "supernova-372bf",
  storageBucket: "supernova-372bf.appspot.com",
  messagingSenderId: "835701581573",
  appId: "1:835701581573:web:95783db03c693c299332cf"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const params = new URLSearchParams(window.location.search);
const fichaId = params.get("fichaId");
const slot = params.get("slot");

const mensagem = document.getElementById("mensagem");
function showMessage(text, type = "info") {
  mensagem.textContent = text;
  mensagem.style.display = "block";
  mensagem.style.background = type === "error" ? "rgba(244,67,54,0.8)" : "rgba(0,188,212,0.8)";
  setTimeout(() => mensagem.style.display = "none", 3000);
}

// --- Tabs ---
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
});

// --- Carregar Ficha ---
auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = "index.html");
  if (!fichaId) return showMessage("Ficha não encontrada!", "error");

  const fichaRef = db.collection("fichas").doc(fichaId);
  const fichaDoc = await fichaRef.get();
  if (!fichaDoc.exists) return showMessage("Ficha não existe!", "error");

  const ficha = fichaDoc.data();
  renderFicha(ficha);

  // Inventário
  document.getElementById("addItem").addEventListener("click", async () => {
    const itemInput = document.getElementById("novoItem");
    const item = itemInput.value.trim();
    if (!item) return;
    const novosItens = [...(ficha.inventario || []), item];
    await fichaRef.update({ inventario: novosItens, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    itemInput.value = "";
    ficha.inventario = novosItens;
    renderInventario(ficha);
  });

  // Habilidades
  document.getElementById("addHabilidade").addEventListener("click", async () => {
    const habInput = document.getElementById("novaHabilidade");
    const habilidade = habInput.value.trim();
    if (!habilidade) return;
    const novasHabs = [...(ficha.habilidades || []), habilidade];
    await fichaRef.update({ habilidades: novasHabs, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    habInput.value = "";
    ficha.habilidades = novasHabs;
    renderHabilidades(ficha);
  });
});

function renderFicha(ficha) {
  document.getElementById("nomeHeroi").textContent = ficha.nome || "Sem nome";
  document.getElementById("conceitoHeroi").textContent = ficha.conceito || "";
  document.getElementById("origemHeroi").textContent = ficha.origem?.nome || "—";
  document.getElementById("arquetipoHeroi").textContent = ficha.arquetipo?.nome || "—";
  document.getElementById("vidaHeroi").textContent = ficha.pontosVida || 0;
  document.getElementById("esforcoHeroi").textContent = ficha.pontosEsforco || 0;

  const atributosUl = document.getElementById("atributosLista");
  atributosUl.innerHTML = "";
  if (ficha.atributos) {
    Object.entries(ficha.atributos).forEach(([nome, valor]) => {
      const li = document.createElement("li");
      li.textContent = `${nome.toUpperCase()}: ${valor}`;
      atributosUl.appendChild(li);
    });
  }

  const periciasUl = document.getElementById("listaPericias");
  periciasUl.innerHTML = "";
  if (ficha.pericias) {
    Object.entries(ficha.pericias).forEach(([nome, valor]) => {
      const li = document.createElement("li");
      li.textContent = `${nome}: ${valor}`;
      periciasUl.appendChild(li);
    });
  }

  renderInventario(ficha);
  renderHabilidades(ficha);
}

function renderInventario(ficha) {
  const lista = document.getElementById("inventarioLista");
  lista.innerHTML = "";
  (ficha.inventario || []).forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = item;
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.onclick = async () => {
      const novos = ficha.inventario.filter((_, idx) => idx !== i);
      await db.collection("fichas").doc(fichaId).update({ inventario: novos });
      ficha.inventario = novos;
      renderInventario(ficha);
    };
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function renderHabilidades(ficha) {
  const lista = document.getElementById("habilidadesLista");
  lista.innerHTML = "";
  (ficha.habilidades || []).forEach((hab, i) => {
    const li = document.createElement("li");
    li.textContent = hab;
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.onclick = async () => {
      const novos = ficha.habilidades.filter((_, idx) => idx !== i);
      await db.collection("fichas").doc(fichaId).update({ habilidades: novos });
      ficha.habilidades = novos;
      renderHabilidades(ficha);
    };
    li.appendChild(btn);
    lista.appendChild(li);
  });
}
