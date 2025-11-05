// meus-personagens.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBzdrAtJoBUONdyHsEPrzWDTH9FMg1xW78",
    authDomain: "supernova-372bf.firebaseapp.com",
    projectId: "supernova-372bf",
    storageBucket: "supernova-372bf.firebasestorage.app",
    messagingSenderId: "917055386010",
    appId: "1:917055386010:web:3f27d9173e3dd7fbdf8a23"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos DOM
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const grid = document.getElementById("characters-grid");
const msg = document.getElementById("message");

// Verificar autenticação
onAuthStateChanged(auth, async (user) => {
    if (!user) return (window.location.href = "index.html");
    userEmail.textContent = user.email;
    await carregarSlots(user.uid);
});

// Logout
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});

// Carregar slots do usuário
async function carregarSlots(uid) {
    try {
        const userRef = doc(db, "usuarios", uid);
        const snap = await getDoc(userRef);
        let data;

        if (!snap.exists()) {
            data = { ficha1: null, ficha2: null, ficha3: null, createdAt: Date.now() };
            await setDoc(userRef, data);
        } else data = snap.data();

        exibirSlots(data, uid);
    } catch (e) {
        console.error("Erro ao carregar slots:", e);
        mostrarMsg("Erro ao carregar personagens.", "error");
    }
}

// Exibir cards
function exibirSlots(data, uid) {
    grid.innerHTML = "";
    const slots = [
        { key: "ficha1", nome: "Personagem 1", page: "ficha.html" },
        { key: "ficha2", nome: "Personagem 2", page: "ficha.html" },
        { key: "ficha3", nome: "Personagem 3", page: "ficha.html" },
    ];

    slots.forEach(async (slot) => {
        const idFicha = data[slot.key];
        if (idFicha) {
            const fichaSnap = await getDoc(doc(db, "fichas", idFicha));
            if (fichaSnap.exists()) {
                grid.appendChild(cardPreenchido(fichaSnap.data(), slot, uid, idFicha));
            } else {
                await updateDoc(doc(db, "usuarios", uid), { [slot.key]: null });
                grid.appendChild(cardVazio(slot, uid));
            }
        } else {
            grid.appendChild(cardVazio(slot, uid));
        }
    });
}

// Card vazio
function cardVazio(slot, uid) {
    const card = document.createElement("div");
    card.className = "character-card card-empty";
    card.innerHTML = `
        <div class="card-icon"><i class="fas fa-user"></i></div>
        <h3>${slot.nome}</h3>
        <p>Slot vazio. Crie um novo herói!</p>
        <button class="create-btn"><i class="fas fa-plus"></i> Criar Personagem</button>
    `;
    card.querySelector(".create-btn").addEventListener("click", () => {
        window.location.href = `criarficha.html?slot=${slot.key}`;
    });
    return card;
}

// Card preenchido
function cardPreenchido(data, slot, uid, idFicha) {
    const card = document.createElement("div");
    card.className = "character-card card-filled";
    card.innerHTML = `
        <div class="character-header">
            <div class="character-avatar"><i class="fas fa-user"></i></div>
            <div class="character-info">
                <h3>${data.nome || "Sem nome"}</h3>
                <p>${data.arquetipo || "Arquétipo não definido"}</p>
            </div>
        </div>
        <div class="character-details">
            <div class="detail-item">
                <span class="detail-label">Alter ego:</span>
                <span class="detail-value">${data.alterEgo || "-"}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Arquétipo:</span>
                <span class="detail-value">${data.arquetipo || "-"}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Nível:</span>
                <span class="detail-value">${data.nivel || 1}</span>
            </div>
        </div>
        <div class="character-actions">
            <button class="action-btn view-btn"><i class="fas fa-external-link-alt"></i> Abrir</button>
            <button class="action-btn delete-btn"><i class="fas fa-trash"></i> Excluir</button>
        </div>
    `;

    // Abrir ficha
    card.querySelector(".view-btn").addEventListener("click", () => {
        window.location.href = slot.page + `?id=${idFicha}`;
    });

    // Excluir ficha
    card.querySelector(".delete-btn").addEventListener("click", async () => {
        if (!confirm("Deseja excluir este personagem?")) return;
        await deleteDoc(doc(db, "fichas", idFicha));
        await updateDoc(doc(db, "usuarios", uid), { [slot.key]: null });
        mostrarMsg("Personagem excluído!", "success");
        carregarSlots(uid);
    });

    return card;
}

// Mostrar mensagem
function mostrarMsg(texto, tipo) {
    msg.textContent = texto;
    msg.className = `message ${tipo}`;
    msg.style.display = "block";
    setTimeout(() => (msg.style.display = "none"), 4000);
}
