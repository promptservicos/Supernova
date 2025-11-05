import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzdrAtJoBUONdyHsEPrzWDTH9FMg1xW78",
  authDomain: "supernova-372bf.firebaseapp.com",
  projectId: "supernova-372bf",
  storageBucket: "supernova-372bf.firebasestorage.app",
  messagingSenderId: "917055386010",
  appId: "1:917055386010:web:3f27d9173e3dd7fbdf8a23"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const seletorFicha = document.getElementById("seletor-ficha");
const fichaDados = document.getElementById("ficha-dados");

let fichaAtual = null;
let idFichaAtual = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "index.html");

  const userDoc = await getDoc(doc(db, "usuarios", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    await preencherSeletor(data);
  }
});

async function preencherSeletor(data) {
  const fichasAtivas = [];
  for (const slot of ["ficha1", "ficha2", "ficha3"]) {
    if (data[slot] && data[slot] !== false) {
      const fichaRef = await getDoc(doc(db, "fichas", data[slot]));
      if (fichaRef.exists()) {
        const ficha = fichaRef.data();
        const opt = document.createElement("option");
        opt.value = data[slot];
        opt.textContent = ficha.alterEgo || ficha.nome || slot;
        seletorFicha.appendChild(opt);
      }
    }
  }
}

seletorFicha.addEventListener("change", async () => {
  const id = seletorFicha.value;
  if (!id) return;
  idFichaAtual = id;
  const fichaSnap = await getDoc(doc(db, "fichas", id));
  if (fichaSnap.exists()) {
    fichaAtual = fichaSnap.data();
    await exibirFicha(fichaAtual);
  }
});

async function exibirFicha(ficha) {
  fichaDados.classList.remove("hidden");

  document.getElementById("nome-heroi").textContent = ficha.nome || "-";
  document.getElementById("alter-ego").textContent = ficha.alterEgo || "-";
  document.getElementById("arquetipo").textContent = ficha.arquetipo || "-";

  document.getElementById("hp-max").textContent = ficha.hpMax || 10;
  document.getElementById("pe-max").textContent = ficha.peMax || 10;

  const hpInput = document.getElementById("hp-atual");
  const peInput = document.getElementById("pe-atual");

  hpInput.value = ficha.hpAtual || ficha.hpMax || 10;
  peInput.value = ficha.peAtual || ficha.peMax || 10;

  hpInput.addEventListener("change", () => atualizarValor("hpAtual", hpInput.value));
  peInput.addEventListener("change", () => atualizarValor("peAtual", peInput.value));

  const defesa = ficha.defesa ?? 10;
  const bloqueio = ficha.bloqueio ?? 0;
  const reflexos = (ficha.pericias && ficha.pericias.Reflexos) || 0;
  const esquiva = defesa + reflexos;

  document.getElementById("defesa").textContent = defesa;
  document.getElementById("bloqueio").textContent = bloqueio;
  document.getElementById("esquiva").textContent = esquiva;

  // Exibe perícias
  const perDiv = document.getElementById("pericias");
  perDiv.innerHTML = "";
  const perSnap = await getDocs(collection(db, "pericias"));

  perSnap.forEach(docP => {
    const nome = docP.id;
    const valor = ficha.pericias?.[nome] ?? 0;
    const linha = document.createElement("p");
    linha.textContent = `${nome}: ${valor}`;
    perDiv.appendChild(linha);
  });

  carregarCards("habilidades", ficha.habilidades || []);
  carregarCards("inventario", ficha.inventario || []);
}

async function atualizarValor(campo, valor) {
  if (!idFichaAtual) return;
  const fichaRef = doc(db, "fichas", idFichaAtual);
  await updateDoc(fichaRef, { [campo]: Number(valor) });
}

// Abas
document.querySelectorAll(".abas button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".abas button").forEach(b => b.classList.remove("ativa"));
    document.querySelectorAll(".conteudo-aba").forEach(c => c.removeAttribute("data-ativa"));
    btn.classList.add("ativa");
    document.getElementById(btn.dataset.aba).setAttribute("data-ativa", true);
  });
});

// Adicionar habilidade/item
document.getElementById("add-habilidade").addEventListener("click", () => adicionarCard("habilidades"));
document.getElementById("add-item").addEventListener("click", () => adicionarCard("inventario"));

async function adicionarCard(tipo) {
  const input = document.getElementById(`novo-${tipo === "habilidades" ? "habilidade" : "item"}`);
  const valor = input.value.trim();
  if (!valor) return;
  input.value = "";

  const lista = fichaAtual[tipo] || [];
  lista.push(valor);
  fichaAtual[tipo] = lista;

  const fichaRef = doc(db, "fichas", idFichaAtual);
  await updateDoc(fichaRef, { [tipo]: lista });

  carregarCards(tipo, lista);
}

function carregarCards(tipo, lista) {
  const area = document.getElementById(`lista-${tipo}`);
  area.innerHTML = "";
  lista.forEach(nome => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = nome;
    area.appendChild(card);
  });
}
