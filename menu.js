import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
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

// Referências DOM
const userDisplay = document.getElementById('username-display');
const coinDisplay = document.getElementById('coin-count');
const loadingOverlay = document.getElementById('loading-overlay');

// Modais
const modal = document.getElementById('selection-modal');
const modalTitle = document.getElementById('modal-title');
const grid = document.getElementById('selection-grid');
const btnBack = document.getElementById('btn-back');

// Variáveis de Estado
let userData = null;
let currentSelectionStage = 'class'; // 'class' ou 'weapon'
let selectedClass = null;

// --- DICIONÁRIO DE NOMES ---
// Mapeia os IDs internos para nomes bonitos de exibição
const DISPLAY_NAMES = {
    // Classes
    'padrao': { name: 'Aventureiro', desc: 'Classe Inicial' },
    'mage': { name: 'Mago', desc: 'Mestre Elemental' },
    'assassin': { name: 'Assassino', desc: 'Furtivo e Letal (Em Breve)' },
    
    // Armas (ID interno : Nome no Jogo)
    'padrao': 'Varinha Básica',
    'thunder': 'Feixe de Raios',
    'ice': 'Zona de Gelo',
    'fire': 'Napalm'
};

// --- AUTENTICAÇÃO E CARREGAMENTO ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docRef = doc(db, "usuarios", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                userData = docSnap.data();
                
                // Atualiza UI
                userDisplay.textContent = userData.username || "Sobrevivente";
                coinDisplay.textContent = userData.moedas || 0;
                
                // Validação de segurança dos dados: Garante que sempre exista a classe padrão
                if (!userData.classes) {
                    userData.classes = { 'padrao': { 'padrao': true } };
                }

                loadingOverlay.style.display = 'none';
            } else {
                alert("Erro: Dados do usuário não encontrados.");
                signOut(auth);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    } else {
        // Se não estiver logado, manda pro login
        window.location.href = 'index.html';
    }
});

// --- BOTÕES PRINCIPAIS ---

document.getElementById('btn-logout').onclick = () => {
    signOut(auth).then(() => window.location.href = 'index.html');
};

document.getElementById('btn-collection').onclick = () => {
    alert("Coleção em breve! Aqui você verá seus itens desbloqueados.");
};

document.getElementById('btn-upgrades').onclick = () => {
    alert("Melhorias em breve! Gaste suas moedas aqui.");
};

document.getElementById('btn-start').onclick = () => {
    openClassSelection();
};

// --- LÓGICA DE SELEÇÃO (GRID) ---

function openClassSelection() {
    modal.style.display = 'flex';
    modalTitle.textContent = "Escolha sua Classe";
    currentSelectionStage = 'class';
    btnBack.textContent = "CANCELAR"; 
    
    grid.innerHTML = ''; 

    // Itera sobre as classes que o usuário possui no mapa "classes"
    Object.keys(userData.classes).forEach(classKey => {
        const info = DISPLAY_NAMES[classKey] || { name: classKey, desc: 'Classe' };
        
        const card = document.createElement('div');
        card.className = 'grid-card';
        
        // Ícone e cor diferentes para cada classe
        let icon = 'person';
        let color = '#AAA';
        if(classKey === 'mage') { icon = 'auto_fix_high'; color = '#9C27B0'; }
        if(classKey === 'padrao') { icon = 'hiking'; color = '#4CAF50'; }
        if(classKey === 'assassin') { icon = 'visibility_off'; color = '#F44336'; }

        card.innerHTML = `
            <span class="material-icons" style="font-size:40px; margin-bottom:10px; color:${color}">${icon}</span>
            <div class="card-title">${info.name}</div>
            <div class="card-desc">${info.desc}</div>
        `;
        
        card.onclick = () => {
            // Verifica se a classe tem armas disponíveis (ex: Assassino pode estar vazio)
            if (Object.keys(userData.classes[classKey]).length === 0) {
                alert("Esta classe ainda não tem armas disponíveis!");
                return;
            }
            selectedClass = classKey;
            openWeaponSelection(classKey);
        };
        
        grid.appendChild(card);
    });
}

function openWeaponSelection(classKey) {
    modalTitle.textContent = "Escolha sua Arma Inicial";
    currentSelectionStage = 'weapon';
    btnBack.textContent = "VOLTAR"; // Agora o botão volta para classes
    
    grid.innerHTML = '';
    
    // Pega o mapa de armas dessa classe específica
    const weaponsMap = userData.classes[classKey];
    
    // Itera sobre as armas. Ex: { thunder: true, fire: false }
    Object.keys(weaponsMap).forEach(weaponKey => {
        // Só mostra se for true (desbloqueada)
        if (weaponsMap[weaponKey] === true) {
            const weaponName = DISPLAY_NAMES[weaponKey] || weaponKey.toUpperCase();
            
            const card = document.createElement('div');
            card.className = 'grid-card';
            card.innerHTML = `
                <span class="material-icons" style="font-size:40px; margin-bottom:10px; color:#00BCD4">flash_on</span>
                <div class="card-title">${weaponName}</div>
                <div class="card-desc">Arma Inicial</div>
            `;
            
            card.onclick = () => {
                startGame(classKey, weaponKey);
            };
            
            grid.appendChild(card);
        }
    });
}

function startGame(classId, weaponId) {
    // Salva a escolha para o jogo ler
    localStorage.setItem('selectedClass', classId);
    localStorage.setItem('selectedWeapon', weaponId);
    
    // Redireciona para o jogo
    window.location.href = 'jogo.html';
}

// Botão Voltar do Modal
btnBack.onclick = () => {
    if (currentSelectionStage === 'class') {
        modal.style.display = 'none'; // Fecha se estiver nas classes
    } else {
        openClassSelection(); // Volta para classes se estiver nas armas
    }
};