import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Elementos DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const btnShowLogin = document.getElementById('btn-show-login');
const btnShowRegister = document.getElementById('btn-show-register');
const loadingDiv = document.getElementById('loading');

// Alternância de Abas
btnShowLogin.onclick = () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    btnShowLogin.classList.add('active');
    btnShowRegister.classList.remove('active');
};

btnShowRegister.onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    btnShowRegister.classList.add('active');
    btnShowLogin.classList.remove('active');
};

// --- REGISTRO COM NOVA ESTRUTURA DE CLASSES ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorMsg = document.getElementById('reg-error');

    errorMsg.textContent = '';
    setLoading(true);

    try {
        // 1. Criar Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Criar Documento no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            username: username,
            email: email,
            createdAt: new Date(),
            moedas: 0,
            highScore: 0,
            classes: {
                // CLASSE PADRÃO (Inicial - Liberada)
                padrao: {
                    padrao: true 
                },
                // CLASSE MAGO (Bloqueada inicialmente)
                mage: {
                    thunder: false,
                    ice: false,
                    fire: false
                },
                // CLASSE ASSASSINO (Vazia/Bloqueada)
                assassin: {} 
            }
        });

        window.location.href = 'menu.html';

    } catch (error) {
        console.error("Erro no registro:", error);
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = "Email já cadastrado.";
        } else if (error.code === 'auth/weak-password') {
            errorMsg.textContent = "Senha muito fraca (min 6).";
        } else {
            errorMsg.textContent = "Erro: " + error.message;
        }
        setLoading(false);
    }
});

// --- LOGIN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    errorMsg.textContent = '';
    setLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Verificação de integridade
        const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
        
        if (userDoc.exists()) {
            window.location.href = 'menu.html';
        } else {
            // Fallback de recuperação se o usuário existe no Auth mas não no Banco
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                username: "Recuperado",
                email: email,
                moedas: 0,
                classes: { padrao: { padrao: true } }
            });
            window.location.href = 'menu.html';
        }

    } catch (error) {
        console.error(error);
        if(error.code === 'auth/invalid-credential') errorMsg.textContent = "Dados incorretos.";
        else errorMsg.textContent = "Erro ao entrar.";
        setLoading(false);
    }
});

// Check se já logado (Opcional: auto-redirecionar)
onAuthStateChanged(auth, (user) => {
    // if (user) window.location.href = 'menu.html'; 
});

function setLoading(state) {
    loadingDiv.style.display = state ? 'flex' : 'none';
    loginForm.style.opacity = state ? '0.5' : '1';
    registerForm.style.opacity = state ? '0.5' : '1';
}