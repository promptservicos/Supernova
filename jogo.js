// Importações dos módulos
import { WEAPONS_INFO, UPGRADE_POOLS, GLOBAL_STATS_POOL } from './classes.js';
import { spawnEnemy, spawnChildTriangle, manageSpawns } from './enemies.js';

// Firebase para Desbloqueio de Classe (Tri-Force)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

let currentUser = null;
onAuthStateChanged(auth, (user) => { currentUser = user; });

// --- CONFIGURAÇÃO CANVAS ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1100;
canvas.height = 650;

const DOM = {
    damageLayer: document.getElementById('damage-layer'),
    countdown: document.getElementById('countdown-overlay'),
    skillHud: document.getElementById('skill-hud'),
    screens: {
        start: document.getElementById('start-screen'),
        weaponSelect: document.getElementById('weapon-select-screen'),
        levelUp: document.getElementById('level-up-screen'),
        chest: document.getElementById('chest-screen'),
        gameOver: document.getElementById('game-over'),
        pause: document.getElementById('pause-screen')
    },
    ui: {
        level: document.getElementById('level'),
        xpBar: document.getElementById('xp-bar'),
        healthBar: document.getElementById('health-bar'),
        hpText: document.getElementById('hp-text'),
        time: document.getElementById('time'),
        killCount: document.getElementById('kill-count'),
        coords: document.getElementById('coords'),
        upgradesContainer: document.getElementById('upgrade-options-container'),
        chestTitle: document.getElementById('chest-title'),
        chestContent: document.getElementById('chest-content'),
        closeChestBtn: document.getElementById('close-chest-button'),
        weaponSelectionContainer: document.getElementById('weapon-selection-container'),
        bossHud: document.getElementById('boss-hud'),
        bossName: document.getElementById('boss-name'),
        bossHpBar: document.getElementById('boss-hp-bar'),
        weaponDisplay: document.getElementById('weapon-display'),
        pauseStats: document.getElementById('pause-stats'),
        resumeBtn: document.getElementById('resume-button'),
        quitBtn: document.getElementById('quit-button'),
        restartBtn: document.getElementById('restart-button'),
        finalKills: document.getElementById('final-kills'),
        dashBar: document.getElementById('dash-bar'),
        dashStatus: document.getElementById('dash-status')
    }
};

let gameState = { running: false, paused: false, resumeCount: 0 };

// --- INICIALIZAÇÃO VIA MENU ---
window.onload = () => {
    const selectedWeapon = localStorage.getItem('selectedWeapon');
    if (selectedWeapon && WEAPONS_INFO[selectedWeapon]) {
        DOM.screens.start.style.display = 'none';
        DOM.screens.weaponSelect.style.display = 'none';
        startGame(selectedWeapon);
    } else {
        DOM.screens.start.style.display = 'flex';
    }
};

if(document.getElementById('btn-class-mage')) {
    document.getElementById('btn-class-mage').onclick = () => { DOM.screens.start.style.display = 'none'; showWeaponSelection(); };
}

function showWeaponSelection() {
    DOM.screens.weaponSelect.style.display = 'flex';
    DOM.ui.weaponSelectionContainer.innerHTML = '';
    Object.keys(WEAPONS_INFO).forEach(key => {
        const w = WEAPONS_INFO[key];
        const div = document.createElement('div');
        div.className = 'weapon-card';
        div.innerHTML = `<h3 style="color:${w.color}">${w.name}</h3><p>${w.desc}</p>`;
        div.onclick = () => startGame(key);
        DOM.ui.weaponSelectionContainer.appendChild(div);
    });
}

function resetToMenu() {
    window.location.href = 'menu.html';
}

function startGame(weaponKey) {
    if (!UPGRADE_POOLS[weaponKey]) {
        console.warn("Pool não encontrado para " + weaponKey + ", usando padrao.");
        weaponKey = 'padrao';
    }

    gameState = {
        running: true, paused: false, resumeCount: 0, keys: {},
        player: { 
            x: 0, y: 0, size: 20, isDamaged: false, damageTimer: 0, armorCooldown: 0,
            dash: { active: false, cooldown: 0, duration: 0 }
        },
        stats: { maxHealth: 100, health: 100, moveSpeed: 3.5, pickupRadius: 50, damageMult: 1, areaMult: 1, attackDelayMult: 1, xpMult: 1, glassCannon: false },
        weapon: { 
            type: weaponKey, level: 1, lastAttack: 0, lastShard: 0, lastStaticWave: 0,
            lightningRodCounter: 0, lastFireball: 0, lastMeteor: 0,
            upgrades: { ricochet:0, count:0, storm:0, slow:0, shard:0, freeze:0, duration:0, explosion:0, static_field:0, lightning_rod:0, cumulonimbus:0, shatter:0, pierce:0, ice_armor:0, burn:0, fireball:0, meteor:0, range:0 } 
        },
        enemies: [], projectiles: [], items: [], effects: [],
        boss: { active: false, entity: null },
        level: 1, xp: 0, xpNeeded: 20, time: 0, kills: 0,
        lastUpdate: Date.now(), lastSpawn: 0,
        freezeTimeTimer: 0
    };
    updateWeaponUI(); 
    Object.values(DOM.screens).forEach(s => s.style.display = 'none'); 
    DOM.ui.bossHud.style.display = 'none';
    gameLoop();
}

// --- GAME LOOP ---
function gameLoop() {
    if (!gameState.running || gameState.paused) {
        if(gameState.running && gameState.paused) requestAnimationFrame(gameLoop);
        return;
    }

    const now = Date.now();
    const dt = now - gameState.lastUpdate;
    gameState.lastUpdate = now;

    if (gameState.freezeTimeTimer > 0) {
        gameState.freezeTimeTimer -= dt;
    } else {
        gameState.time += dt;
        manageSpawns(gameState, canvas, (gs, cv) => spawnEnemy(gs, cv, DOM));
    }

    movePlayer(dt);
    handleWeaponLogic(now, dt);
    
    // Lógica do Boss (IA)
    if (gameState.boss.active && gameState.boss.entity) {
        handleBossLogic(gameState.boss.entity, now, dt);
    }

    moveEntities(dt);
    checkCollisions(now);
    draw(now);
    updateUI();

    gameState.effects = gameState.effects.filter(e => now - e.created < e.duration);
    if (gameState.player.isDamaged && now - gameState.player.damageTimer > 200) gameState.player.isDamaged = false;
    requestAnimationFrame(gameLoop);
}

// --- LÓGICA ESPECÍFICA DO BOSS TRI-FORCE ---
function handleBossLogic(boss, now, dt) {
    if (boss.type !== 'triforce') return;

    // Seletor de Fase
    if (now - boss.phaseTimer > 5000) {
        const phases = ['fire', 'ice', 'thunder'];
        let nextPhase = phases[Math.floor(Math.random() * phases.length)];
        if(nextPhase === boss.phase) nextPhase = phases[(phases.indexOf(nextPhase) + 1) % phases.length];
        
        boss.phase = nextPhase;
        boss.phaseTimer = now;
        boss.attackCooldown = now + 1000; 
        boss.orbs = []; 
        
        let color = '#FFF';
        if(boss.phase === 'fire') color = '#FF5722';
        if(boss.phase === 'ice') color = '#00BCD4';
        if(boss.phase === 'thunder') color = '#E040FB';
        boss.color = color;
        
        showDamageNumber(canvas.width/2, canvas.height/2 - 100, boss.phase.toUpperCase() + " MODE!");
    }

    // Ataques
    if (boss.phase === 'fire') {
        if (now > boss.attackCooldown) {
            // --- CORREÇÃO: Salva a posição alvo para verificar depois ---
            const targetX = gameState.player.x;
            const targetY = gameState.player.y;
            
            // Aviso visual (Charge)
            gameState.effects.push({ type: 'meteor_charge', x: targetX, y: targetY, size: 250, duration: 2000, created: now });
            
            setTimeout(() => {
                if(!gameState.running || boss.hp <= 0) return;
                
                // Explosão visual
                gameState.effects.push({ type: 'explosion', x: targetX, y: targetY, size: 250, duration: 600, created: Date.now(), isHostile: true });
                
                // --- CORREÇÃO: Verifica distância do jogador ATUAL em relação ao ALVO original ---
                if(Math.hypot(gameState.player.x - targetX, gameState.player.y - targetY) < 125) {
                   takePlayerDamage(30, Date.now());
                }
            }, 2000);
            
            boss.attackCooldown = now + 3000;
        }
    } 
    else if (boss.phase === 'thunder') {
        if (boss.orbs.length < 3 && now % 500 < 20) {
             boss.orbs.push({ angle: (Math.PI * 2 / 3) * boss.orbs.length, dist: 100 });
        }
        if (now > boss.attackCooldown && boss.orbs.length > 0) {
            const orb = boss.orbs.pop();
            const orbX = boss.x + Math.cos(orb.angle) * orb.dist;
            const orbY = boss.y + Math.sin(orb.angle) * orb.dist;
            
            const angleToPlayer = Math.atan2(gameState.player.y - orbY, gameState.player.x - orbX);
            
            gameState.projectiles.push({
                type: 'boss_orb', x: orbX, y: orbY,
                vx: Math.cos(angleToPlayer) * 6, vy: Math.sin(angleToPlayer) * 6,
                damage: 20, duration: 5000, created: now, hostile: true
            });
            boss.attackCooldown = now + 2000;
        }
    }
}

// --- DRAW ---
function draw(now) {
    if (gameState.freezeTimeTimer > 0) ctx.filter = 'grayscale(100%)';
    else ctx.filter = 'none';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camX = canvas.width / 2 - gameState.player.x;
    const camY = canvas.height / 2 - gameState.player.y;

    drawInfiniteGrid(camX, camY);

    ctx.save();
    ctx.translate(camX, camY);

    // Efeitos
    gameState.effects.forEach(e => {
        if(e.type === 'fire_zone') {
            ctx.fillStyle = `rgba(255, 87, 34, ${0.4 + Math.sin(now/100)*0.1})`;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size/2, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#FF5722'; ctx.stroke();
        } else if(e.type === 'ice_aura') {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'; ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (e.type === 'meteor_charge') {
            ctx.strokeStyle = '#555'; ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.arc(e.x, e.y, e.size/2, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
            const pct = (now - e.created) / e.duration;
            ctx.fillStyle = 'rgba(255, 61, 0, 0.4)';
            ctx.beginPath(); ctx.arc(e.x, e.y, (e.size/2) * pct, 0, Math.PI*2); ctx.fill();
        } else if (e.type === 'explosion') {
            const pct = (now - e.created) / e.duration;
            ctx.fillStyle = e.isHostile ? `rgba(255, 0, 0, ${1-pct})` : `rgba(255, 193, 7, ${1-pct})`;
            ctx.beginPath(); ctx.arc(e.x, e.y, (e.size || 60) * pct, 0, Math.PI*2); ctx.fill();
        }
    });

    // Itens
    gameState.items.forEach(i => {
        if (i.type === 'xp') {
            ctx.fillStyle = '#FFC107'; ctx.shadowBlur = 5; ctx.shadowColor = '#FFC107';
            ctx.beginPath(); ctx.arc(i.x, i.y, 4, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        } else if (i.type === 'chest') {
            ctx.fillStyle = i.tier === 'gold' ? '#FFD700' : (i.tier === 'silver' ? '#C0C0C0' : '#CD7F32');
            ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
            ctx.fillRect(i.x-10, i.y-10, 20, 20); ctx.strokeRect(i.x-10, i.y-10, 20, 20);
        } else if (i.type === 'powerup') {
            drawPowerupIcon(ctx, i.pType, i.x, i.y);
        }
    });

    // Jogador
    const p = gameState.player;
    ctx.fillStyle = p.isDamaged ? '#F44336' : '#4CAF50';
    ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#FFF';
    if (p.dash.active) { ctx.strokeStyle = '#00BFFF'; ctx.lineWidth = 4; }
    else if (gameState.weapon.upgrades.ice_armor > 0 && now > p.armorCooldown) { ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3; }
    ctx.stroke(); ctx.shadowBlur = 0;

    // BARRA VIDA JOGADOR
    const hpPct = Math.max(0, gameState.stats.health / gameState.stats.maxHealth);
    const barWidth = 30;
    const barHeight = 4;
    ctx.fillStyle = '#333'; 
    ctx.fillRect(p.x - barWidth/2, p.y + 15, barWidth, barHeight);
    ctx.fillStyle = hpPct > 0.5 ? '#00FF00' : (hpPct > 0.25 ? '#FF9800' : '#F44336');
    ctx.fillRect(p.x - barWidth/2, p.y + 15, barWidth * hpPct, barHeight);

    // Inimigos
    gameState.enemies.forEach(e => {
        ctx.fillStyle = e.color || '#D32F2F';
        if (e.frozenTimer > 0) ctx.fillStyle = '#81D4FA'; 
        if (e.burnTimer > 0 && Math.floor(now/100)%2===0) ctx.fillStyle = '#FF8A65'; 

        if (e.type === 'square' || e.type === 'boss') {
            const size = e.size;
            ctx.fillRect(e.x - size/2, e.y - size/2, size, size);
            if(e.type === 'boss' || e.hasChest) {
                ctx.strokeStyle = '#FFD700'; ctx.lineWidth = e.type==='boss'?3:2;
                ctx.strokeRect(e.x - size/2, e.y - size/2, size, size);
            }
        } else if (e.type === 'triangle') {
            const size = e.size;
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(angle);
            ctx.beginPath(); ctx.moveTo(size/2, 0); ctx.lineTo(-size/2, size/2); ctx.lineTo(-size/2, -size/2); ctx.closePath();
            ctx.fill(); ctx.restore();
        } else if (e.type === 'triforce') {
            // TRI-FORCE RENDER CORRIGIDO
            const size = e.size;
            ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(now / 1000);
            
            if (e.phase === 'ice') {
                ctx.fillStyle = 'rgba(0, 188, 212, 0.2)';
                ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = '#00BCD4'; ctx.lineWidth = 2; ctx.stroke();
            }

            ctx.fillStyle = e.color;
            ctx.shadowBlur = 20; ctx.shadowColor = e.color;
            ctx.beginPath();
            // Triângulo Invertido
            ctx.moveTo(-size/2, -size/2); 
            ctx.lineTo(size/2, -size/2); 
            ctx.lineTo(0, size/2); 
            ctx.closePath();
            ctx.fill();
            
            // --- CORREÇÃO: Olho Alinhado no Centroide ---
            // Centroide Y de um triangulo com base no topo (-45) e ponta no fundo (45) é -15.
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(0, -15, 12, 0, Math.PI*2); ctx.fill();
            // Pupila
            ctx.fillStyle = '#F00';
            ctx.beginPath(); ctx.arc(0, -15, 4, 0, Math.PI*2); ctx.fill();

            if (e.phase === 'thunder' && e.orbs) {
                e.orbs.forEach((orb, i) => {
                    orb.angle += 0.05;
                    const ox = Math.cos(orb.angle) * orb.dist;
                    const oy = Math.sin(orb.angle) * orb.dist;
                    
                    // --- CORREÇÃO: Orbes como Esferas Elétricas ---
                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.shadowBlur = 10; ctx.shadowColor = '#E040FB';
                    ctx.fillStyle = '#FFF'; 
                    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = '#E040FB'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    for(let j=0; j<5; j++) { // Raios saindo do orbe
                        ctx.moveTo(0,0);
                        ctx.lineTo((Math.random()-0.5)*20, (Math.random()-0.5)*20);
                    }
                    ctx.stroke();
                    ctx.restore();
                });
            }
            ctx.restore();
        }
    });

    // Projéteis
    gameState.projectiles.forEach(pj => {
        if (pj.hostile) {
            // --- CORREÇÃO: Projéteis do Boss parecem elétricos agora ---
            ctx.save();
            ctx.translate(pj.x, pj.y);
            ctx.shadowBlur = 15; ctx.shadowColor = '#E040FB';
            ctx.fillStyle = '#FFF';
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
            
            ctx.strokeStyle = '#E040FB'; ctx.lineWidth = 2;
            ctx.beginPath();
            // Desenha um anel irregular
            for(let i=0; i<=8; i++) {
                const ang = (Math.PI*2/8)*i;
                const r = 12 + Math.random()*4;
                ctx.lineTo(Math.cos(ang)*r, Math.sin(ang)*r);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        } else {
            if (pj.type === 'fireball') {
                ctx.fillStyle = '#FF5722'; ctx.shadowBlur = 10; ctx.shadowColor = '#FF5722';
                ctx.beginPath(); ctx.arc(pj.x, pj.y, 8, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
            } else if (pj.type === 'shard') {
                ctx.fillStyle = '#00FFFF';
                ctx.save(); ctx.translate(pj.x, pj.y); ctx.rotate(Math.atan2(pj.vy, pj.vx));
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-10, -5); ctx.lineTo(10, 0); ctx.lineTo(-10, 5); ctx.fill(); ctx.restore();
            } else if (pj.type === 'molotov') {
                ctx.fillStyle = '#FF5722';
                ctx.save(); ctx.translate(pj.x, pj.y); ctx.rotate(now / 100); ctx.fillRect(-4, -4, 8, 8); ctx.restore();
            } else if (pj.type === 'simple') { 
                ctx.fillStyle = '#FFF';
                ctx.shadowBlur = 5; ctx.shadowColor = '#FFF';
                ctx.beginPath(); ctx.arc(pj.x, pj.y, 5, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
            }
        }
    });

    // Efeitos (Thunder e afins)
    gameState.effects.forEach(e => {
        if (e.type.includes('thunder')) {
            ctx.strokeStyle = e.type === 'thick-thunder' ? '#E040FB' : '#FFF';
            ctx.lineWidth = e.type === 'thick-thunder' ? 4 : 2;
            ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle;
            drawJaggedLine(ctx, e.x1, e.y1, e.x2, e.y2); 
            ctx.shadowBlur = 0;
        } else if (e.type === 'storm') {
            ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(now / 200);
            ctx.strokeStyle = '#00BFFF'; ctx.lineWidth = 2; ctx.setLineDash([5,5]);
            ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.stroke(); ctx.restore();
        }
    });

    ctx.restore();
    ctx.filter = 'none';
}

function drawInfiniteGrid(offsetX, offsetY) {
    const cellSize = 50;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const startX = offsetX % cellSize;
    const startY = offsetY % cellSize;
    ctx.beginPath();
    for (let x = startX; x < canvas.width; x += cellSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
    for (let y = startY; y < canvas.height; y += cellSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();
}

function drawJaggedLine(ctx, x1, y1, x2, y2) {
    const dist = Math.hypot(x2-x1, y2-y1);
    const segments = Math.max(3, Math.floor(dist / 20));
    ctx.beginPath(); ctx.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        let px = x1 + (x2 - x1) * t;
        let py = y1 + (y2 - y1) * t;
        const offset = (Math.random() - 0.5) * 20; 
        px += offset; py += offset; 
        ctx.lineTo(px, py);
    }
    ctx.lineTo(x2, y2); ctx.stroke();
}

function drawPowerupIcon(ctx, type, x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke();
    if (type === 'potion') { 
        ctx.fillStyle = '#F44336'; ctx.fillRect(-4, -8, 8, 16); ctx.fillRect(-8, -4, 16, 8);
    } else if (type === 'magnet') { 
        ctx.strokeStyle = '#2196F3'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, -2, 6, Math.PI, 0); ctx.lineTo(6, 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-6, 6); ctx.stroke();
        ctx.fillStyle = '#EEE'; ctx.fillRect(-8, 5, 4, 3); ctx.fillRect(4, 5, 4, 3);
    } else if (type === 'bomb') { 
        ctx.fillStyle = '#EEE'; ctx.beginPath(); ctx.arc(0, 2, 7, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#FF5722'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(5, -10, 8, -8); ctx.stroke();
    } else if (type === 'clock') { 
        ctx.strokeStyle = '#FFEB3B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(4, 0); ctx.stroke();
    }
    ctx.restore();
}

// --- LOGICA ARMAS ---
function handleWeaponLogic(now, dt) {
    const w = gameState.weapon;
    const s = gameState.stats;
    const W = canvas.width; const H = canvas.height;

    if (w.type === 'padrao') { // ARMA PADRÃO (NERFADA)
        const cooldown = 1200 * s.attackDelayMult; 
        if (now - w.lastAttack > cooldown) {
            const count = 1 + (w.upgrades.count || 0);
            const targets = getMultipleNearest(gameState.player, count, 350); // Alcance 350
            targets.forEach((target, i) => {
                setTimeout(() => {
                    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x);
                    gameState.projectiles.push({
                        type: 'simple',
                        x: gameState.player.x, y: gameState.player.y,
                        vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8,
                        damage: 12 * s.damageMult * (1 + w.level * 0.1),
                        duration: 1500, pierce: (w.upgrades.pierce || 0), hitList: [], created: now
                    });
                }, i * 100);
            });
            w.lastAttack = now;
        }
    }
    else if (w.type === 'thunder') {
        const cooldown = 1200 * s.attackDelayMult;
        if (now - w.lastAttack > cooldown) {
            fireLightningSource(gameState.player, w, s, now);
            if (w.upgrades.lightning_rod > 0) {
                w.lightningRodCounter = (w.lightningRodCounter || 0) + 1;
                if (w.lightningRodCounter >= 10) {
                    w.lightningRodCounter = 0;
                    const strong = getEnemyWithHighestHP();
                    if (strong) {
                        gameState.effects.push({ type: 'thick-thunder', x1: strong.x, y1: strong.y - 300, x2: strong.x, y2: strong.y, created: now, duration: 300 }); 
                        takeEnemyDamage(strong, 100 * s.damageMult);
                        getEnemiesInRadius(strong.x, strong.y, 120).forEach(n => takeEnemyDamage(n, 50 * s.damageMult));
                    }
                }
            }
            w.lastAttack = now;
        }
        if (w.upgrades.static_field > 0) {
            const staticCd = 10000;
            if (now - (w.lastStaticWave || 0) > staticCd) {
                gameState.effects.push({ type: 'static_wave', x: gameState.player.x, y: gameState.player.y, created: now, duration: 500 });
                getEnemiesInRadius(gameState.player.x, gameState.player.y, 180).forEach(e => {
                    if (Math.random() < 0.5 && e.frozenTimer <= 0) { e.frozenTimer = 3000; showDamageNumber(e.x, e.y - 20, "PARALISIA"); }
                });
                w.lastStaticWave = now;
            }
        }
        const activeStorms = gameState.effects.filter(e => e.type === 'storm');
        if (activeStorms.length < w.upgrades.storm) {
             gameState.effects.push({ type: 'storm', x: gameState.player.x + (Math.random()-0.5)*W, y: gameState.player.y + (Math.random()-0.5)*H, vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5, duration: 99999999, created: now, lastShot: 0, kills: 0 });
        }
        activeStorms.forEach(storm => {
            const distToPlayer = Math.hypot(storm.x - gameState.player.x, storm.y - gameState.player.y);
            if (distToPlayer > 600) {
                const angleToPlayer = Math.atan2(gameState.player.y - storm.y, gameState.player.x - storm.x);
                storm.vx += Math.cos(angleToPlayer) * 0.05;
                storm.vy += Math.sin(angleToPlayer) * 0.05;
            } else {
                storm.x += storm.vx; storm.y += storm.vy;
            }
            if (now - storm.lastShot > cooldown) {
                let dmgMod = 1 + (w.upgrades.cumulonimbus > 0 && storm.kills ? storm.kills * 0.05 : 0);
                fireLightningSource(storm, w, s, now, dmgMod, storm);
                storm.lastShot = now;
            }
        });
    }
    else if (w.type === 'ice') {
        const radius = 70 * s.areaMult * (1 + w.level*0.05);
        const damage = 0.15 * s.damageMult * (1 + w.level*0.2); 
        let aura = gameState.effects.find(e => e.type === 'ice_aura');
        if(!aura) {
            aura = { type: 'ice_aura', x: gameState.player.x, y: gameState.player.y, size: radius, duration: 999999999, created: now };
            gameState.effects.push(aura);
        } else { aura.x = gameState.player.x; aura.y = gameState.player.y; aura.size = radius; }
        
        gameState.enemies.forEach(e => {
            if (Math.hypot(gameState.player.x-e.x, gameState.player.y-e.y) < radius + e.size) {
                takeEnemyDamage(e, damage);
                e.isSlowed = true;
                if (w.upgrades.freeze > 0 && Math.random() < 0.005 * w.upgrades.freeze && e.frozenTimer <= 0) e.frozenTimer = 3000;
            } else { e.isSlowed = false; }
        });
        const shardCooldown = 1000 * s.attackDelayMult;
        if (w.upgrades.shard > 0 && now - w.lastShard > shardCooldown) {
            const count = w.upgrades.shard;
            for(let i=0; i<count; i++) {
                const target = getNearestEnemy(gameState.player, 400);
                if (target) {
                    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x) + (Math.random()-0.5)*0.5;
                    gameState.projectiles.push({ type: 'shard', x: gameState.player.x, y: gameState.player.y, vx: Math.cos(angle)*7, vy: Math.sin(angle)*7, damage: 15 * s.damageMult, duration: 2000, created: now, pierce: w.upgrades.pierce || 0, hitList: [] });
                }
            }
            w.lastShard = now;
        }
    }
    else if (w.type === 'fire') {
        const cooldown = 1500 * s.attackDelayMult;
        if (now - w.lastAttack > cooldown) {
            const count = 1 + w.upgrades.count;
            for(let i=0; i<count; i++) setTimeout(() => launchMolotov(s, w), i * 100);
            w.lastAttack = now;
        }
        if (w.upgrades.fireball > 0) {
            const fbCd = 3000;
            if (now - (w.lastFireball||0) > fbCd) {
                const target = getEnemyWithHighestHP();
                if (target) {
                    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x);
                    gameState.projectiles.push({ type: 'fireball', x: gameState.player.x, y: gameState.player.y, vx: Math.cos(angle)*5, vy: Math.sin(angle)*5, damage: 40 * s.damageMult, duration: 3000, created: now });
                    w.lastFireball = now;
                }
            }
        }
        if (w.upgrades.meteor > 0) {
            const metCd = 10000;
            if (now - (w.lastMeteor||0) > metCd) {
                const mx = gameState.player.x + (Math.random()-0.5)*W; 
                const my = gameState.player.y + (Math.random()-0.5)*H; 
                const areaSize = 200 * s.areaMult;
                gameState.effects.push({ type: 'meteor_charge', x: mx, y: my, size: areaSize, duration: 3000, created: now });
                setTimeout(() => {
                    if(!gameState.running) return;
                    gameState.effects.push({ type: 'explosion', x: mx, y: my, size: areaSize, duration: 600, created: Date.now() });
                    getEnemiesInRadius(mx, my, areaSize/2).forEach(e => takeEnemyDamage(e, 200 * s.damageMult));
                }, 3000);
                w.lastMeteor = now;
            }
        }
    }
    gameState.effects.forEach(eff => {
        if (eff.type === 'fire_zone') {
            const hitboxRadius = (eff.size / 2) * 0.8;
            getEnemiesInRadius(eff.x, eff.y, hitboxRadius).forEach(e => {
                takeEnemyDamage(e, eff.damage);
                if (w.upgrades.burn > 0) { e.burnTimer = 2000; e.burnDamage = eff.damage * 0.5; }
            });
        }
    });
}

// --- UTILS COMPLEMENTARES ---
function fireLightningSource(source, w, s, now, dmgMod = 1, owner = null) {
    const count = 1 + w.upgrades.count;
    const damage = 15 * s.damageMult * (1 + w.level * 0.1) * dmgMod;
    const maxRange = 200 * (1 + (w.upgrades.range||0)*0.2); 
    let targets = getMultipleNearest(source, count, maxRange);
    targets.forEach(t => chainLightning(source, t, damage, w.upgrades.ricochet||0, now, owner));
}
function chainLightning(origin, target, damage, bounces, now, owner) {
    let currentPos = {x: origin.x, y: origin.y};
    let hitList = []; let curTarget = target;
    for (let i = 0; i <= bounces; i++) {
        if (!curTarget) break;
        takeEnemyDamage(curTarget, damage, owner);
        hitList.push(curTarget.id);
        gameState.effects.push({ type: 'thunder_line', x1: currentPos.x, y1: currentPos.y, x2: curTarget.x, y2: curTarget.y, created: now, duration: 150 }); 
        currentPos = {x: curTarget.x, y: curTarget.y};
        curTarget = getNearestEnemy(currentPos, 200, hitList);
        damage *= 0.8;
    }
}
function launchMolotov(s, w) {
    const maxDist = 250; 
    let angle = Math.random() * Math.PI * 2;
    let dist = Math.random() * maxDist;
    const tx = gameState.player.x + Math.cos(angle) * dist;
    const ty = gameState.player.y + Math.sin(angle) * dist;
    const flightDist = Math.hypot(tx - gameState.player.x, ty - gameState.player.y);
    gameState.projectiles.push({ type: 'molotov', x: gameState.player.x, y: gameState.player.y, tx, ty, vx: ((tx - gameState.player.x)/flightDist)*6, vy: ((ty - gameState.player.y)/flightDist)*6, damage: 0.5 * s.damageMult * (1 + w.level*0.2), duration: 3000 + (w.upgrades.duration * 1000), area: 50 * s.areaMult, explosion: w.upgrades.explosion });
}

function takeEnemyDamage(e, amount, owner = null) {
    e.hp -= amount;
    const screenX = canvas.width/2 + (e.x - gameState.player.x);
    const screenY = canvas.height/2 + (e.y - gameState.player.y);
    
    if (screenX > 0 && screenX < canvas.width && screenY > 0 && screenY < canvas.height) {
        showDamageNumber(screenX, screenY, Math.ceil(amount));
    }

    if (e.hp <= 0 && !e.dead) {
        e.dead = true;
        gameState.kills++;
        if (owner && owner.type === 'storm') owner.kills = (owner.kills || 0) + 1;
        
        if (e.type === 'boss' || e.type === 'triforce') {
            gameState.boss.active = false; DOM.ui.bossHud.style.display = 'none';
            spawnLoot(e.x, e.y, 'boss');
            gameState.items.push({ x: e.x + 30, y: e.y, type: 'powerup', pType: 'potion', size: 24 });
            
            if (e.type === 'triforce' && currentUser) {
                const userRef = doc(db, "usuarios", currentUser.uid);
                updateDoc(userRef, {
                    "classes.mage.thunder": true,
                    "classes.mage.ice": true,
                    "classes.mage.fire": true
                }).then(() => {
                    showDamageNumber(canvas.width/2, canvas.height/2, "NOVA CLASSE DESBLOQUEADA!");
                    setTimeout(() => alert("CLASSE MAGO DESBLOQUEADA!"), 500);
                });
            }
        } else if (e.type === 'triangle' && e.isParent) {
            spawnChildTriangle(gameState, e.x-10, e.y-10); 
            spawnChildTriangle(gameState, e.x+10, e.y+10);
        } else {
            spawnLoot(e.x, e.y, e.hasChest ? 'chest' : 'xp', e.xp);
        }
    }
}

function spawnLoot(x, y, type, xpVal) {
    if (type === 'boss') {
        const tier = Math.random() < 0.5 ? 'silver' : 'gold';
        gameState.items.push({ x, y, type: 'chest', tier, size: 24 });
    } else if (type === 'chest') {
        let tier = Math.random() < 0.6 ? 'bronze' : (Math.random() < 0.9 ? 'silver' : 'gold');
        gameState.items.push({ x, y, type: 'chest', tier, size: 24 });
    } else {
        const rnd = Math.random();
        if (rnd < 0.005) { 
            const types = ['potion', 'magnet', 'clock', 'bomb'];
            const pType = types[Math.floor(Math.random() * types.length)];
            gameState.items.push({ x, y, type: 'powerup', pType: pType, size: 24 });
        } else {
            gameState.items.push({ x, y, type: 'xp', value: xpVal, size: 8 });
        }
    }
}

function openChest(tier) {
    gameState.running = false;
    let count = tier === 'silver' ? 3 : (tier === 'gold' ? 5 : 1);
    let colorClass = `chest-tier-${tier}`;
    let title = tier === 'gold' ? "BAÚ DE OURO" : (tier === 'silver' ? "BAÚ DE PRATA" : "BAÚ DE BRONZE");
    DOM.ui.chestTitle.textContent = title;
    DOM.ui.chestTitle.className = colorClass;
    DOM.ui.chestContent.innerHTML = '';
    
    // Correção: usando a importação correta
    const chestPool = GLOBAL_STATS_POOL.filter(i => i.id !== 'glass_cannon');
    for(let i=0; i<count; i++) {
        const up = chestPool[Math.floor(Math.random() * chestPool.length)];
        applyUpgrade(up);
        const p = document.createElement('p');
        p.textContent = `> ${up.name} (${up.desc})`;
        p.style.color = '#81C784'; p.style.margin = '5px';
        DOM.ui.chestContent.appendChild(p);
    }
    DOM.screens.chest.style.display = 'flex';
}

function showDamageNumber(x, y, dmg) {
    if (dmg < 1 && typeof dmg === 'number') return;
    const el = document.createElement('div');
    el.className = 'floating-damage';
    el.textContent = typeof dmg === 'number' ? Math.floor(dmg) : dmg;
    el.style.left = x + 'px'; el.style.top = (y - 20) + 'px';
    DOM.damageLayer.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

// --- UTILS & COLISÕES ---
function getNearestEnemy(pos, maxDist=Infinity, exclude=[]) {
    let nearest = null, minDist = Infinity;
    gameState.enemies.forEach(e => { 
        if (exclude.includes(e.id)) return;
        const d = Math.hypot(pos.x-e.x, pos.y-e.y); 
        if (d < minDist && d <= maxDist) { minDist=d; nearest=e; } 
    });
    return nearest;
}
function getEnemyWithHighestHP() {
    let strongest = null; let maxHp = -1;
    gameState.enemies.forEach(e => { if (e.hp > maxHp) { maxHp = e.hp; strongest = e; } });
    return strongest;
}
function getMultipleNearest(source, count, maxRange) {
    let targets = []; let excluded = [];
    for(let i=0; i<count; i++) { let t = getNearestEnemy(source, maxRange, excluded); if(t) { targets.push(t); excluded.push(t.id); } }
    return targets;
}
function getEnemiesInRadius(x, y, r) { return gameState.enemies.filter(e => Math.hypot(e.x-x, e.y-y) < r + e.size/2); }

function levelUp() {
    gameState.level++; gameState.xp -= gameState.xpNeeded;
    gameState.xpNeeded = Math.floor(gameState.xpNeeded * 1.5);
    gameState.stats.damageMult += 0.05; gameState.weapon.level++;
    showLevelUpScreen();
}

function showLevelUpScreen() {
    gameState.running = false;
    DOM.ui.upgradesContainer.innerHTML = '';
    const pool = UPGRADE_POOLS[gameState.weapon.type];
    const options = getUniqueRandomUpgrades(pool, 3);
    options.forEach(opt => {
        const div = document.createElement('div'); div.className = 'upgrade-option';
        div.innerHTML = `<div class="rarity-${opt.rarity}" style="font-size:1.1em; font-weight:bold">${opt.name}</div>
                         <div style="font-size:0.8em; color:#aaa; margin-top:5px">${opt.rarity.toUpperCase()}</div>
                         <div style="font-size:0.9em; margin-top:5px">${opt.desc}</div>`;
        div.onclick = () => { applyUpgrade(opt); DOM.screens.levelUp.style.display = 'none'; gameState.running = true; gameState.lastUpdate = Date.now(); gameLoop(); };
        DOM.ui.upgradesContainer.appendChild(div);
    });
    DOM.screens.levelUp.style.display = 'flex';
}

function getUniqueRandomUpgrades(pool, count) {
    let available = pool.filter(u => {
        if (u.type === 'stat') return true;
        return (gameState.weapon.upgrades[u.id] || 0) < u.max;
    });
    let selected = []; let safeGuard = 0;
    while (selected.length < count && safeGuard < 50) {
        safeGuard++;
        const rnd = Math.random();
        let targetRarity = 'common';
        if (rnd < 0.01) targetRarity = 'legendary'; 
        else if (rnd < 0.05) targetRarity = 'epic';
        else if (rnd < 0.20) targetRarity = 'rare';
        else if (rnd < 0.50) targetRarity = 'uncommon';
        let candidates = available.filter(u => u.rarity === targetRarity);
        if (candidates.length === 0) candidates = available.filter(u => u.rarity !== targetRarity); 
        if (candidates.length > 0) {
            const choice = candidates[Math.floor(Math.random() * candidates.length)];
            if (!selected.includes(choice)) selected.push(choice);
        }
    }
    return selected;
}

function applyUpgrade(opt) {
    if (opt.type === 'stat') {
        if(opt.id==='dmg') gameState.stats.damageMult+=0.1;
        if(opt.id==='area') gameState.stats.areaMult+=0.15;
        if(opt.id==='rate') gameState.stats.attackDelayMult*=0.9;
        if(opt.id==='range') { if(!gameState.weapon.upgrades.range) gameState.weapon.upgrades.range=0; gameState.weapon.upgrades.range++; }
        if(opt.id==='health') { gameState.stats.maxHealth += 20; gameState.stats.health += 20; }
        if(opt.id==='pickup') gameState.stats.pickupRadius+=20;
        if(opt.id==='xp_gain') gameState.stats.xpMult+=0.2;
        if(opt.id==='glass_cannon') { gameState.stats.damageMult += 0.5; gameState.stats.glassCannon = true; }
    } else {
        if(!gameState.weapon.upgrades[opt.id]) gameState.weapon.upgrades[opt.id]=0;
        gameState.weapon.upgrades[opt.id]++;
    }
    updateWeaponUI();
}

function updateUI() {
    DOM.ui.level.textContent = gameState.level; DOM.ui.time.textContent = Math.floor(gameState.time / 1000);
    DOM.ui.killCount.textContent = gameState.kills;
    
    if (DOM.ui.coords) {
        DOM.ui.coords.textContent = `${Math.floor(gameState.player.x)}, ${Math.floor(gameState.player.y)}`;
    }
    
    DOM.ui.hpText.textContent = `${Math.ceil(gameState.stats.health)}/${gameState.stats.maxHealth}`;
    DOM.ui.xpBar.style.width = `${Math.min(100, (gameState.xp/gameState.xpNeeded)*100)}%`;
    DOM.ui.healthBar.style.width = `${Math.min(100, (gameState.stats.health/gameState.stats.maxHealth)*100)}%`;
    if(gameState.boss.active) DOM.ui.bossHpBar.style.width = `${Math.max(0, (gameState.boss.entity.hp/gameState.boss.entity.maxHp)*100)}%`;
    
    // UI Dash
    const d = gameState.player.dash;
    const now = Date.now();
    if(d.active) { 
        DOM.ui.dashBar.style.width = '0%'; DOM.ui.dashStatus.textContent = 'DASH!'; 
    } else if (now < d.cooldown) {
        const remaining = d.cooldown - now;
        const pct = 100 - (remaining / 3000 * 100);
        DOM.ui.dashBar.style.width = pct + '%'; DOM.ui.dashStatus.textContent = 'Recarregando...';
    } else {
        DOM.ui.dashBar.style.width = '100%'; DOM.ui.dashStatus.textContent = 'PRONTO [ESPAÇO]';
    }
    updateSkillHUD();
}
function updateSkillHUD() {
    DOM.skillHud.innerHTML = '';
    const w = gameState.weapon;
    const createIcon = (htmlIcon, pct, countText = '') => {
        const div = document.createElement('div');
        div.className = `skill-icon ${pct >= 100 ? 'ready' : ''}`;
        div.innerHTML = `${htmlIcon}<div class="skill-cd-overlay" style="height:${100 - pct}%"></div>${countText ? `<div class="skill-count">${countText}</div>` : ''}`;
        DOM.skillHud.appendChild(div);
    };
    if (w.upgrades.ice_armor > 0) {
        const pct = 100 - (Math.max(0, gameState.player.armorCooldown - Date.now()) / 30000 * 100);
        createIcon('<div class="icon-shield"></div>', pct);
    }
    if (w.upgrades.fireball > 0) {
        const pct = Math.min(100, ((Date.now() - (w.lastFireball||0)) / 3000) * 100);
        createIcon('<div class="icon-fire"></div>', pct);
    }
    if (w.upgrades.meteor > 0) {
        const pct = Math.min(100, ((Date.now() - (w.lastMeteor||0)) / 10000) * 100);
        createIcon('<div class="icon-meteor"></div>', pct);
    }
    if (w.upgrades.lightning_rod > 0) {
        const count = w.lightningRodCounter || 0;
        createIcon('<div class="icon-bolt"></div>', (count / 10) * 100, `${count}/10`);
    }
}
function updateWeaponUI() {
    const w = WEAPONS_INFO[gameState.weapon.type];
    DOM.ui.weaponDisplay.textContent = `${w.name} Nv.${gameState.weapon.level}`;
    DOM.ui.weaponDisplay.style.color = w.color;
}
function takePlayerDamage(amt, now) {
    if (gameState.player.dash.active) return;

    if (gameState.weapon.type === 'ice' && gameState.weapon.upgrades.ice_armor > 0) {
        if (now > gameState.player.armorCooldown) {
            gameState.player.armorCooldown = now + 30000; 
            gameState.effects.push({ type: 'explosion', x: gameState.player.x, y: gameState.player.y, size: 200, duration: 500, created: now });
            const r = 70 * gameState.stats.areaMult * (1 + gameState.weapon.level*0.1);
            getEnemiesInRadius(gameState.player.x, gameState.player.y, r).forEach(e => e.frozenTimer = 5000);
            return;
        }
    }
    if(gameState.player.isDamaged && now - gameState.player.damageTimer < 500) return;
    const scale = 1 + (gameState.time / 60000) * 0.5;
    let finalDmg = amt * scale;
    if (gameState.stats.glassCannon) finalDmg *= 2;
    gameState.stats.health -= finalDmg;
    gameState.player.isDamaged = true; gameState.player.damageTimer = now;
    if(gameState.stats.health <= 0) { 
        gameState.running=false; DOM.screens.gameOver.style.display='flex'; 
        document.getElementById('final-time').textContent=Math.floor(gameState.time/1000);
        document.getElementById('final-level').textContent=gameState.level; 
        DOM.ui.finalKills.textContent=gameState.kills;
    }
}
function movePlayer(dt) {
    let dx=0, dy=0;
    if (gameState.keys['w']||gameState.keys['ArrowUp']) dy=-1;
    if (gameState.keys['s']||gameState.keys['ArrowDown']) dy=1;
    if (gameState.keys['a']||gameState.keys['ArrowLeft']) dx=-1;
    if (gameState.keys['d']||gameState.keys['ArrowRight']) dx=1;
    if(dx&&dy){dx*=0.707;dy*=0.707;}
    
    let speed = gameState.stats.moveSpeed;
    if (gameState.player.dash.active) {
        if (Date.now() < gameState.player.dash.duration) speed *= 3;
        else gameState.player.dash.active = false;
    }
    gameState.player.x += dx * speed;
    gameState.player.y += dy * speed;
}

function moveEntities(dt) {
    gameState.enemies = gameState.enemies.filter(e => !e.dead);
    
    if (gameState.freezeTimeTimer <= 0) {
        gameState.enemies.forEach(e => {
            if (e.burnTimer > 0) { e.burnTimer -= dt; takeEnemyDamage(e, (e.burnDamage || 0.1)); }
            if (e.frozenTimer > 0) { e.frozenTimer -= dt; return; }
            let spd = e.speed;
            if (e.isSlowed) {
                const slowPower = 0.02 + (gameState.weapon.upgrades.slow || 0) * 0.01;
                spd *= (1 - Math.min(0.8, slowPower * 10));
            }
            const ang = Math.atan2(gameState.player.y - e.y, gameState.player.x - e.x);
            e.x += Math.cos(ang) * spd; e.y += Math.sin(ang) * spd;
            e.isSlowed = false;
        });
    }

    for(let i=gameState.projectiles.length-1; i>=0; i--){
        let p = gameState.projectiles[i];
        if (p.type === 'fireball') {
            p.x += p.vx; p.y += p.vy;
            let hit = false;
            for(let e of gameState.enemies) {
                if(Math.hypot(p.x-e.x, p.y-e.y) < e.size + 5) {
                    gameState.effects.push({ type: 'explosion', x: e.x, y: e.y, size: 80, duration: 600, created: Date.now() });
                    getEnemiesInRadius(e.x, e.y, 80).forEach(n => takeEnemyDamage(n, p.damage));
                    hit = true; break;
                }
            }
            if (hit || Date.now() - p.created > p.duration) gameState.projectiles.splice(i,1);
        }
        else if(p.type === 'boss_orb') { // Projéteis do CHEFE
            p.x += p.vx; p.y += p.vy;
            // Colisão com Jogador
            if (Math.hypot(p.x - gameState.player.x, p.y - gameState.player.y) < 15) {
                takePlayerDamage(p.damage, Date.now());
                gameState.effects.push({ type: 'explosion', x: p.x, y: p.y, size: 30, duration: 300, created: Date.now(), isHostile: true });
                gameState.projectiles.splice(i,1);
            }
            else if (Date.now() - p.created > p.duration) gameState.projectiles.splice(i,1);
        }
        else if(p.type === 'molotov') {
            p.x += p.vx; p.y += p.vy;
            if (Math.hypot(p.x-p.tx, p.y-p.ty) < 5) {
                gameState.effects.push({ type: 'fire_zone', x: p.tx, y: p.ty, size: p.area, damage: p.damage, created: Date.now(), duration: p.duration });
                gameState.projectiles.splice(i,1);
            }
        } 
        else if (p.type === 'shard') {
            p.x += p.vx; p.y += p.vy;
            let hit = false;
            for(let e of gameState.enemies) {
                if (p.hitList.includes(e.id)) continue;
                if(Math.hypot(p.x-e.x, p.y-e.y) < e.size) { 
                    takeEnemyDamage(e, p.damage); 
                    p.hitList.push(e.id);
                    if (p.pierce > 0) p.pierce--; else hit = true;
                    break;
                }
            }
            if(hit || Date.now() - p.created > p.duration) gameState.projectiles.splice(i,1);
        }
        else if (p.type === 'simple') { 
            p.x += p.vx; p.y += p.vy;
            let hit = false;
            for(let e of gameState.enemies) {
                if (p.hitList.includes(e.id)) continue;
                if(Math.hypot(p.x-e.x, p.y-e.y) < e.size + 5) { 
                    takeEnemyDamage(e, p.damage); 
                    p.hitList.push(e.id);
                    if (p.pierce > 0) p.pierce--; else hit = true;
                    break;
                }
            }
            if(hit || Date.now() - p.created > p.duration) gameState.projectiles.splice(i,1);
        }
    }

    gameState.items.forEach(i => {
        if (i.magnetized || (i.type!=='chest' && Math.hypot(gameState.player.x-i.x, gameState.player.y-i.y) < gameState.stats.pickupRadius)) {
            const speed = i.magnetized ? 5.0 : 4.0; 
            const angle = Math.atan2(gameState.player.y - i.y, gameState.player.x - i.x);
            i.x += Math.cos(angle) * speed; 
            i.y += Math.sin(angle) * speed;
        }
    });
}

function checkCollisions(now) {
    gameState.enemies.forEach(e => {
        const collisionMargin = e.isChild ? 15 : 0; 
        // Colisão básica
        if(Math.hypot(gameState.player.x-e.x, gameState.player.y-e.y) < (gameState.player.size/2 + e.size/2 + collisionMargin)) {
            if(e.frozenTimer <= 0 && gameState.freezeTimeTimer <= 0) takePlayerDamage(10, now);
        }
        
        // Colisão com Aura de Gelo do Chefe Tri-Force
        if(e.type === 'triforce' && e.phase === 'ice') {
             if(Math.hypot(gameState.player.x-e.x, gameState.player.y-e.y) < 150) { // Raio da aura
                 takePlayerDamage(0.5, now); // Dano contínuo rápido e baixo
             }
        }
    });
    
    for(let i=gameState.items.length-1; i>=0; i--){
        let item = gameState.items[i];
        if(Math.hypot(gameState.player.x-item.x, gameState.player.y-item.y) < gameState.player.size/2 + item.size) {
            const screenX = canvas.width/2 + (item.x - gameState.player.x);
            const screenY = canvas.height/2 + (item.y - gameState.player.y);

            if(item.type==='chest') openChest(item.tier);
            else if(item.type==='powerup') {
                showDamageNumber(screenX, screenY - 30, item.pType.toUpperCase());
                if (item.pType === 'potion') gameState.stats.health = Math.min(gameState.stats.maxHealth, gameState.stats.health + 50);
                else if (item.pType === 'magnet') gameState.items.forEach(it => it.magnetized = true);
                else if (item.pType === 'clock') { gameState.freezeTimeTimer = 5000; }
                else if (item.pType === 'bomb') {
                    gameState.effects.push({ type: 'explosion', x: gameState.player.x, y: gameState.player.y, size: 800, duration: 800, created: now });
                    gameState.enemies.forEach(e => takeEnemyDamage(e, 99999));
                }
            }
            else { 
                gameState.xp += item.value * gameState.stats.xpMult; 
                if(gameState.xp >= gameState.xpNeeded) levelUp(); 
            }
            gameState.items.splice(i,1);
        }
    }
}

// --- INPUTS ---
window.addEventListener('keydown', e => { 
    if(e.key === 'Tab') { e.preventDefault(); togglePause(); } 
    if(e.code === 'Space') {
        const now = Date.now();
        if(!gameState.player.dash.active && now > gameState.player.dash.cooldown) {
            gameState.player.dash.active = true;
            gameState.player.dash.duration = now + 200; 
            gameState.player.dash.cooldown = now + 3000; 
        }
    }
    gameState.keys[e.key] = true; 
});
window.addEventListener('keyup', e => gameState.keys[e.key] = false);
DOM.ui.closeChestBtn.onclick = () => { DOM.screens.chest.style.display='none'; gameState.running=true; gameState.lastUpdate=Date.now(); gameLoop(); };
DOM.ui.restartBtn.onclick = resetToMenu;
DOM.ui.quitBtn.onclick = resetToMenu;
DOM.ui.resumeBtn.onclick = togglePause;

// --- FUNÇÕES DE PAUSE (TAB) ---
function togglePause() {
    if (!gameState.running || gameState.resumeCount > 0) return;
    if (!gameState.paused) {
        gameState.paused = true;
        DOM.screens.pause.style.display = 'flex';
        renderPauseStats();
    } else {
        DOM.screens.pause.style.display = 'none';
        startResumeCountdown();
    }
}

function startResumeCountdown() {
    gameState.resumeCount = 3;
    DOM.countdown.style.display = 'flex';
    DOM.countdown.textContent = gameState.resumeCount;
    
    const interval = setInterval(() => {
        gameState.resumeCount--;
        if (gameState.resumeCount > 0) {
            DOM.countdown.textContent = gameState.resumeCount;
        } else {
            clearInterval(interval);
            DOM.countdown.style.display = 'none';
            gameState.paused = false;
            gameState.lastUpdate = Date.now();
            gameState.lastSpawn = Date.now() - (gameState.lastSpawn % 100); 
        }
    }, 1000);
}

function renderPauseStats() {
    const w = gameState.weapon;
    const info = WEAPONS_INFO[w.type];
    let html = `<h3 style="color:${info.color}">${info.name} (Nível ${w.level})</h3>`;
    for (let key in w.upgrades) {
        if (w.upgrades[key] > 0) {
            let name = key.toUpperCase(); let rarity = 'common';
            // Check in global and current weapon pools
            const pool = UPGRADE_POOLS[w.type] || [];
            const allUpgrades = [...pool, ...GLOBAL_STATS_POOL];
            const upgradeInfo = allUpgrades.find(u => u.id === key);
            
            if(upgradeInfo) {
                name = upgradeInfo.name;
                rarity = upgradeInfo.rarity;
            }
            html += `<div class="pause-stat-item"><span class="rarity-${rarity}">${name}</span> <span>${w.upgrades[key]}</span></div>`;
        }
    }
    if(gameState.stats.glassCannon) html += `<div class="pause-stat-item"><span class="rarity-legendary">CANHÃO DE VIDRO</span> <span>ATIVO</span></div>`;
    html += '<br><h4>Estatísticas</h4>';
    html += `<div class="pause-stat-item"><span>Dano</span> <span>x${gameState.stats.damageMult.toFixed(2)}</span></div>`;
    html += `<div class="pause-stat-item"><span>Área</span> <span>x${gameState.stats.areaMult.toFixed(2)}</span></div>`;
    DOM.ui.pauseStats.innerHTML = html;
}