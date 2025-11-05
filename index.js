// index.js

// Configuração do Firebase (mesmo objeto)
const firebaseConfig = {
    apiKey: "AIzaSyBzdrAtJoBUONdyHsEPrzWDTH9FMg1xW78",
    authDomain: "supernova-372bf.firebaseapp.com",
    projectId: "supernova-372bf",
    storageBucket: "supernova-372bf.firebasestorage.app",
    messagingSenderId: "917055386010",
    appId: "1:917055386010:web:3f27d9173e3dd7fbdf8a23"
};

// Inicializar Firebase (verifica se já foi inicializado)
if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const guestLogin = document.getElementById('guest-login');
    const messageDiv = document.getElementById('message');

    // Alternar entre login e registro
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        clearMessage();
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        clearMessage();
    });

    // Alternar visibilidade da senha
    function setupPasswordToggle(passwordId, toggleId) {
        const passwordInput = document.getElementById(passwordId);
        const toggleContainer = document.getElementById(toggleId);
        if (!passwordInput || !toggleContainer) return;
        const toggleIcon = toggleContainer.querySelector('i');
        
        // Só o ícone tem a hitbox, não todo o container
        toggleIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Previne que o clique se propague
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        });

        // Previne que o clique no input ative o toggle
        passwordInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Configurar toggles de senha
    setupPasswordToggle('login-password', 'login-toggle-password');
    setupPasswordToggle('register-password', 'register-toggle-password');
    setupPasswordToggle('confirm-password', 'confirm-toggle-password');

    // Mostrar mensagem
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
    }

    // Limpar mensagem
    function clearMessage() {
        messageDiv.style.display = 'none';
    }

    // Login
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        loginBtn.disabled = true;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                showMessage('Login realizado com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'meus-personagens.html';
                }, 1500);
            })
            .catch((error) => {
                let errorMessage = 'Erro ao fazer login.';
                
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Usuário não encontrado.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Senha incorreta.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'E-mail inválido.';
                }
                
                showMessage(errorMessage, 'error');
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
                loginBtn.disabled = false;
            });
    });

    // Registro
    registerBtn.addEventListener('click', () => {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }
        
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
        registerBtn.disabled = true;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Criar documento do usuário no Firestore na coleção 'usuarios'
                const user = userCredential.user;
                return db.collection('usuarios').doc(user.uid).set({
                    email: user.email,
                    ficha1: false,
                    ficha2: false,
                    ficha3: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                showMessage('Conta criada com sucesso!', 'success');
                setTimeout(() => {
                    window.location.href = 'meus-personagens.html';
                }, 1500);
            })
            .catch((error) => {
                let errorMessage = 'Erro ao criar conta.';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este e-mail já está em uso.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'E-mail inválido.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'A senha é muito fraca.';
                }
                
                showMessage(errorMessage, 'error');
                registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta';
                registerBtn.disabled = false;
            });
    });

    // Login como convidado
    guestLogin.addEventListener('click', (e) => {
        e.preventDefault();
        
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        loginBtn.disabled = true;
        
        auth.signInAnonymously()
            .then((userCredential) => {
                showMessage('Login como convidado realizado!', 'success');
                setTimeout(() => {
                    window.location.href = 'meus-personagens.html';
                }, 1500);
            })
            .catch((error) => {
                showMessage('Erro ao fazer login como convidado.', 'error');
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
                loginBtn.disabled = false;
            });
    });

    // Verificar se usuário já está logado
    auth.onAuthStateChanged((user) => {
        if (user && !user.isAnonymous) {
            // Atualizar último login
            db.collection('usuarios').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }).catch((err) => {
                // silencioso se falhar (por exemplo: usuário novo)
                // console.warn('Não foi possível atualizar lastLogin', err);
            });
        }
    });
});
