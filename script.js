// --- CONFIGURAÇÃO ---
const DOM = {
    container: document.getElementById('game-container'),
    world: document.getElementById('world'),
    damageLayer: document.getElementById('damage-layer'),
    countdown: document.getElementById('countdown-overlay'),
    skillHud: document.getElementById('skill-hud'), // NOVO CONTAINER
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
        upgradesContainer: document.getElementById('upgrade-options-container'),
        chestTitle: document.getElementById('chest-title'),
        chestContent: document.getElementById('chest-content'),
        closeChestBtn: document.getElementById('close-chest-button'),
        weaponSelectionContainer: document.getElementById('weapon-selection-container'),
        bossHud: document.getElementById('boss-hud'),
        bossHpBar: document.getElementById('boss-hp-bar'),
        weaponDisplay: document.getElementById('weapon-display'),
        enemyCount: document.getElementById('enemy-count'),
        pauseStats: document.getElementById('pause-stats'),
        resumeBtn: document.getElementById('resume-button'),
        quitBtn: document.getElementById('quit-button'),
        restartBtn: document.getElementById('restart-button'),
        finalKills: document.getElementById('final-kills')
    }
};

// --- DADOS ---
const WEAPONS_INFO = {
    thunder: { name: 'Feixe de Raios', desc: 'Raios rápidos em cadeia.', color: '#E040FB' },
    ice: { name: 'Zona de Gelo', desc: 'Aura de lentidão e estilhaços.', color: '#00BCD4' },
    fire: { name: 'Napalm', desc: 'Explosivos em área.', color: '#FF5722' }
};

const GLOBAL_STATS_POOL = [
    { id: 'dmg', name: 'Força', desc: '+Dano', rarity: 'common', type: 'stat' },
    { id: 'area', name: 'Tamanho', desc: '+Área', rarity: 'common', type: 'stat' },
    { id: 'rate', name: 'Rapidez', desc: '+Velocidade de Ataque', rarity: 'common', type: 'stat' },
    { id: 'health', name: 'Vitalidade', desc: '+Vida Max e Cura', rarity: 'common', type: 'stat' },
    { id: 'pickup', name: 'Imã', desc: '+Alcance de Coleta', rarity: 'common', type: 'stat' },
    { id: 'xp_gain', name: 'Sabedoria', desc: '+Ganho de XP', rarity: 'common', type: 'stat' },
    // GERAL LENDÁRIO
    { id: 'glass_cannon', name: 'CANHÃO DE VIDRO', desc: '+50% Dano, mas recebe Dobro de Dano', rarity: 'legendary', type: 'stat', max: 1 }
];

const UPGRADE_POOLS = {
    thunder: [
        ...GLOBAL_STATS_POOL,
        { id: 'range', name: 'Condutividade', desc: '+Alcance do Raio', rarity: 'common', type: 'stat' },
        { id: 'ricochet', name: 'Ricochete', desc: 'Raios saltam +1 vez', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'count', name: 'Multiraio', desc: '+1 Raio simultâneo', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'storm', name: 'TEMPESTADE', desc: '+1 Nuvem Autônoma', rarity: 'epic', type: 'mechanic', max: 3 },
        // NOVOS RAIO
        { id: 'static_field', name: 'Campo Estático', desc: 'Chance de paralisar ao atingir inimigos próximos', rarity: 'rare', type: 'mechanic', max: 3 },
        { id: 'lightning_rod', name: 'Para-Raio', desc: '10º Disparo atinge o inimigo mais forte', rarity: 'rare', type: 'mechanic', max: 1 },
        { id: 'cumulonimbus', name: 'CUMULONIMBUS', desc: 'Nuvens crescem ao matar', rarity: 'legendary', type: 'mechanic', max: 1 }
    ],
    ice: [
        ...GLOBAL_STATS_POOL,
        { id: 'slow', name: 'Hipotermia', desc: 'Aumenta lentidão da aura', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'shard', name: 'Estilhaço', desc: 'Dispara gelo no inimigo próximo', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'freeze', name: 'CONGELAR', desc: 'Congela inimigos por 3s', rarity: 'epic', type: 'mechanic', max: 3 },
        // NOVOS GELO
        { id: 'shatter', name: 'Estilhaçar', desc: 'Inimigos congelados explodem ao morrer', rarity: 'uncommon', type: 'mechanic', max: 1 },
        { id: 'pierce', name: 'Perfurar', desc: 'Estilhaços atravessam +1 inimigo (Requer Estilhaço)', rarity: 'uncommon', type: 'mechanic', max: 3 },
        { id: 'ice_armor', name: 'Armadura de Gelo', desc: 'Bloqueia 1 ataque e congela tudo (30s recarga)', rarity: 'rare', type: 'mechanic', max: 1 }
    ],
    fire: [
        ...GLOBAL_STATS_POOL,
        { id: 'duration', name: 'Chama Eterna', desc: 'Fogo dura mais tempo', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'count', name: 'Barragem', desc: '+1 Projétil', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'explosion', name: 'EXPLOSÃO', desc: 'Inimigos explodem ao morrer', rarity: 'epic', type: 'mechanic', max: 3 },
        // NOVOS FOGO
        { id: 'burn', name: 'Queimadura', desc: 'Inimigos continuam queimando fora da área', rarity: 'uncommon', type: 'mechanic', max: 3 },
        { id: 'fireball', name: 'Bola de Fogo', desc: 'Dispara meteoro teleguiado periodicamente', rarity: 'rare', type: 'mechanic', max: 1 },
        { id: 'meteor', name: 'METEORITO', desc: 'Chuva de meteoro a cada 10s', rarity: 'epic', type: 'mechanic', max: 1 }
    ]
};

let gameState = { running: false, paused: false, resumeCount: 0 };

// --- INICIO ---
document.getElementById('btn-class-mage').onclick = () => { DOM.screens.start.style.display = 'none'; showWeaponSelection(); };

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
    gameState.running = false;
    gameState.paused = false;
    hideAllScreens();
    DOM.screens.start.style.display = 'flex';
    DOM.world.innerHTML = '';
    DOM.damageLayer.innerHTML = '';
    DOM.skillHud.innerHTML = '';
}

function startGame(weaponKey) {
    const w = DOM.container.clientWidth;
    const h = DOM.container.clientHeight;

    gameState = {
        running: true, paused: false, resumeCount: 0, keys: {},
        player: { x: w/2, y: h/2, size: 20, isDamaged: false, damageTimer: 0, armorCooldown: 0 },
        // PICKUP RADIUS AGORA É 35 (REDUZIDO)
        stats: { maxHealth: 100, health: 100, moveSpeed: 2.5, pickupRadius: 35, damageMult: 1, areaMult: 1, attackDelayMult: 1, xpMult: 1, glassCannon: false },
        weapon: { 
            type: weaponKey, level: 1, lastAttack: 0, lastShard: 0, 
            lightningRodCounter: 0, lastFireball: 0, lastMeteor: 0,
            upgrades: { 
                ricochet:0, count:0, storm:0, slow:0, shard:0, freeze:0, duration:0, explosion:0,
                static_field:0, lightning_rod:0, cumulonimbus:0,
                shatter:0, pierce:0, ice_armor:0,
                burn:0, fireball:0, meteor:0
            } 
        },
        enemies: [], projectiles: [], items: [], effects: [],
        boss: { active: false, entity: null },
        level: 1, xp: 0, xpNeeded: 20, time: 0, kills: 0,
        lastUpdate: Date.now(), lastSpawn: 0
    };
    updateWeaponUI(); hideAllScreens(); DOM.ui.bossHud.style.display = 'none';
    gameLoop();
}

// --- LOOP ---
function gameLoop() {
    if (!gameState.running || gameState.paused) {
        if(gameState.running && gameState.paused) requestAnimationFrame(gameLoop);
        return;
    }

    const now = Date.now();
    const dt = now - gameState.lastUpdate;
    gameState.lastUpdate = now;
    gameState.time += dt;

    manageSpawns(now);
    movePlayer(dt);
    handleWeaponLogic(now, dt);
    moveEntities(dt);
    checkCollisions(now);
    draw();
    updateUI();

    gameState.effects = gameState.effects.filter(e => now - e.created < e.duration);
    if (gameState.player.isDamaged && now - gameState.player.damageTimer > 200) {
        gameState.player.isDamaged = false;
    }

    requestAnimationFrame(gameLoop);
}

// --- PAUSE SYSTEM COM COUNTDOWN ---
function togglePause() {
    if (!gameState.running) return;
    
    // Se estiver em contagem, ignorar
    if (gameState.resumeCount > 0) return;

    if (!gameState.paused) {
        // Pausar agora
        gameState.paused = true;
        DOM.screens.pause.style.display = 'flex';
        renderPauseStats();
    } else {
        // Despausar (iniciar countdown)
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
            // Importante: Resetar timers delta-based para não pular
            gameState.lastSpawn = Date.now() - (gameState.lastSpawn % 100); 
            
            // Recomeçar loop se necessário (embora o requestAnimationFrame mantenha o loop vivo checando paused)
        }
    }, 1000);
}

function renderPauseStats() {
    const w = gameState.weapon;
    const info = WEAPONS_INFO[w.type];
    let html = `<h3 style="color:${info.color}">${info.name} (Nível ${w.level})</h3>`;
    
    for (let key in w.upgrades) {
        if (w.upgrades[key] > 0) {
            // Achar nome
            let name = key.toUpperCase();
            let rarity = 'common';
            [...UPGRADE_POOLS[w.type], ...GLOBAL_STATS_POOL].forEach(u => { if(u.id===key) { name = u.name; rarity = u.rarity; } });
            html += `<div class="pause-stat-item"><span class="rarity-${rarity}">${name}</span> <span>${w.upgrades[key]}</span></div>`;
        }
    }
    if(gameState.stats.glassCannon) html += `<div class="pause-stat-item"><span class="rarity-legendary">CANHÃO DE VIDRO</span> <span>ATIVO</span></div>`;

    html += '<br><h4>Estatísticas</h4>';
    html += `<div class="pause-stat-item"><span>Dano</span> <span>x${gameState.stats.damageMult.toFixed(2)}</span></div>`;
    html += `<div class="pause-stat-item"><span>Área</span> <span>x${gameState.stats.areaMult.toFixed(2)}</span></div>`;
    html += `<div class="pause-stat-item"><span>Velocidade</span> <span>x${gameState.stats.attackDelayMult.toFixed(2)}</span></div>`;
    html += `<div class="pause-stat-item"><span>Coleta</span> <span>${gameState.stats.pickupRadius}px</span></div>`;
    DOM.ui.pauseStats.innerHTML = html;
}

// --- SPAWN ---
function manageSpawns(now) {
    const seconds = gameState.time / 1000;
    let currentRate = Math.max(80, 1200 - (Math.floor(seconds/60) * 200));
    
    if (now - gameState.lastSpawn > currentRate) {
        spawnEnemy();
        gameState.lastSpawn = now;
    }
}

function spawnEnemy() {
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;
    const side = Math.floor(Math.random()*4);
    let x, y; const p=60; 
    if(side===0){x=Math.random()*W;y=-p;} else if(side===1){x=W+p;y=Math.random()*H;}
    else if(side===2){x=Math.random()*W;y=H+p;} else {x=-p;y=Math.random()*H;}

    const minutes = gameState.time / 60000;
    const hpMult = 1 + (minutes * 1.0);
    const xpMult = 1 + minutes;

    let type = 'square';
    if (!gameState.boss.active && minutes > 0.5 && Math.random() < 0.005) type = 'boss';
    else if (minutes > 0.2 && Math.random() < 0.3) type = 'triangle';

    let e = { x, y, type, id: Math.random(), frozenTimer: 0, burnTimer: 0, maxHp: 0, hp: 0, speed: 0, xp: 0, hasChest: false };

    if (type === 'boss') {
        e.size = 60; e.maxHp = 1200 * hpMult; e.speed = 0.8; e.xp = 300 * xpMult;
        e.color = '#880E4F'; e.hasChest = true;
        gameState.boss.active = true; gameState.boss.entity = e;
        DOM.ui.bossHud.style.display = 'block';
    } else if (type === 'triangle') {
        e.size = 22; e.maxHp = 15 * hpMult; e.speed = 1.0; e.xp = 3 * xpMult; e.color = '#FF9800'; e.isParent = true;
    } else { 
        e.size = 20; e.maxHp = 10 * hpMult; e.speed = 1.2 + Math.random()*0.5; e.xp = 1 * xpMult; e.color = '#D32F2F';
        if(Math.random() < 0.01) {
            e.hasChest = true; e.maxHp *= 4; e.color = '#FFD700';
        }
    }
    e.hp = e.maxHp;
    gameState.enemies.push(e);
}

// --- LOGICA ARMAS E MECÂNICAS ---
function handleWeaponLogic(now, dt) {
    const w = gameState.weapon;
    const s = gameState.stats;
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;

    // --- THUNDER ---
    if (w.type === 'thunder') {
        const cooldown = 1200 * s.attackDelayMult;
        if (now - w.lastAttack > cooldown) {
            fireLightningSource(gameState.player, w, s, now);
            
            // Para-Raio (Lightning Rod)
            if (w.upgrades.lightning_rod > 0) {
                w.lightningRodCounter = (w.lightningRodCounter || 0) + 1;
                if (w.lightningRodCounter >= 10) {
                    w.lightningRodCounter = 0;
                    const strong = getEnemyWithHighestHP();
                    if (strong) {
                        // isMega = true
                        gameState.effects.push({ type: 'thick-thunder', x1: strong.x, y1: 0, x2: strong.x, y2: strong.y, created: now, duration: 300 });
                        takeEnemyDamage(strong, 100 * s.damageMult); // Dano maciço
                        getEnemiesInRadius(strong.x, strong.y, 120).forEach(n => takeEnemyDamage(n, 50 * s.damageMult));
                    }
                }
            }
            w.lastAttack = now;
        }
        
        // Tempestade & Cumulonimbus
        const activeStorms = gameState.effects.filter(e => e.type === 'storm');
        if (activeStorms.length < w.upgrades.storm) {
             gameState.effects.push({
                 type: 'storm', x: Math.random()*W, y: Math.random()*H,
                 vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5,
                 duration: 99999999, created: now, lastShot: 0, kills: 0
             });
        }
        activeStorms.forEach(storm => {
            storm.x += storm.vx; storm.y += storm.vy;
            if(storm.x < 0 || storm.x > W) storm.vx *= -1;
            if(storm.y < 0 || storm.y > H) storm.vy *= -1;
            
            if (now - storm.lastShot > cooldown) {
                // Se tem Cumulonimbus, a nuvem fica mais forte baseada em kills
                let dmgMod = 1;
                if (w.upgrades.cumulonimbus > 0 && storm.kills) {
                    dmgMod = 1 + (storm.kills * 0.05); // +5% dano por kill da nuvem
                }
                fireLightningSource(storm, w, s, now, dmgMod, storm); // Passa 'storm' como owner para trackear kills
                storm.lastShot = now;
            }
        });
    }

    // --- ICE ---
    else if (w.type === 'ice') {
        const radius = 70 * s.areaMult * (1 + w.level*0.1);
        const damage = 0.2 * s.damageMult * (1 + w.level*0.2); // Dano por tick
        const freezeTime = 3000;

        gameState.enemies.forEach(e => {
            if (Math.hypot(gameState.player.x-e.x, gameState.player.y-e.y) < radius + e.size) {
                takeEnemyDamage(e, damage);
                e.isSlowed = true;
                if (w.upgrades.freeze > 0 && Math.random() < 0.005 * w.upgrades.freeze && e.frozenTimer <= 0) {
                    e.frozenTimer = freezeTime;
                }
            } else { e.isSlowed = false; }
        });

        const shardCooldown = 1000 * s.attackDelayMult;
        if (w.upgrades.shard > 0 && now - w.lastShard > shardCooldown) {
            const count = w.upgrades.shard;
            for(let i=0; i<count; i++) {
                const target = getNearestEnemy(gameState.player, 400);
                if (target) {
                    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x) + (Math.random()-0.5)*0.5;
                    gameState.projectiles.push({
                        type: 'shard', x: gameState.player.x, y: gameState.player.y,
                        vx: Math.cos(angle)*7, vy: Math.sin(angle)*7,
                        damage: 15 * s.damageMult, duration: 2000, created: now,
                        pierce: w.upgrades.pierce || 0, hitList: []
                    });
                }
            }
            w.lastShard = now;
        }
    }

    // --- FIRE ---
    else if (w.type === 'fire') {
        const cooldown = 1500 * s.attackDelayMult;
        if (now - w.lastAttack > cooldown) {
            const count = 1 + w.upgrades.count;
            for(let i=0; i<count; i++) {
                setTimeout(() => launchMolotov(s, w), i * 100);
            }
            w.lastAttack = now;
        }

        // Bola de Fogo (Teleguiada no mais forte)
        if (w.upgrades.fireball > 0) {
            const fbCd = 3000; // 3s
            if (now - (w.lastFireball||0) > fbCd) {
                const target = getEnemyWithHighestHP();
                if (target) {
                    const angle = Math.atan2(target.y - gameState.player.y, target.x - gameState.player.x);
                    gameState.projectiles.push({
                        type: 'fireball', x: gameState.player.x, y: gameState.player.y,
                        vx: Math.cos(angle)*5, vy: Math.sin(angle)*5,
                        damage: 40 * s.damageMult, duration: 3000, created: now
                    });
                    w.lastFireball = now;
                }
            }
        }

        // Meteorito
        if (w.upgrades.meteor > 0) {
            const metCd = 10000; // 10s
            if (now - (w.lastMeteor||0) > metCd) {
                const mx = Math.random() * W;
                const my = Math.random() * H;
                // Aviso visual
                gameState.effects.push({ type: 'meteor_warning', x: mx, y: my, duration: 1000, created: now });
                setTimeout(() => {
                    if(!gameState.running) return; // Checa se jogo ainda roda
                    gameState.effects.push({ type: 'explosion', x: mx, y: my, duration: 600, created: Date.now() });
                    getEnemiesInRadius(mx, my, 120).forEach(e => takeEnemyDamage(e, 200 * s.damageMult));
                }, 1000);
                w.lastMeteor = now;
            }
        }
    }

    // Efeitos de Área
    gameState.effects.forEach(eff => {
        if (eff.type === 'fire_zone') {
            getEnemiesInRadius(eff.x, eff.y, eff.size).forEach(e => {
                takeEnemyDamage(e, eff.damage);
                // Burn Logic
                if (w.upgrades.burn > 0) {
                    e.burnTimer = 2000; // 2s de queima
                    e.burnDamage = eff.damage * 0.5;
                }
            });
        }
    });
}

function fireLightningSource(source, w, s, now, dmgMod = 1, owner = null) {
    const count = 1 + w.upgrades.count;
    const damage = 15 * s.damageMult * (1 + w.level * 0.1) * dmgMod;
    const maxRange = 300 * (1 + (w.upgrades.range||0)*0.2);
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
        gameState.effects.push({ type: 'thunder_line', x1: currentPos.x, y1: currentPos.y, x2: curTarget.x, y2: curTarget.y, created: now, duration: 100 });
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
    gameState.projectiles.push({
        type: 'molotov', x: gameState.player.x, y: gameState.player.y, tx, ty,
        vx: ((tx - gameState.player.x)/flightDist)*6, vy: ((ty - gameState.player.y)/flightDist)*6,
        damage: 0.5 * s.damageMult * (1 + w.level*0.2),
        duration: 3000 + (w.upgrades.duration * 1000),
        area: 50 * s.areaMult,
        explosion: w.upgrades.explosion
    });
}

// --- DANO E MORTE ---
function takeEnemyDamage(e, amount, owner = null) {
    e.hp -= amount;
    showDamageNumber(e.x, e.y, Math.ceil(amount));
    
    // --- Lógica de Campo Estático (Thunder) ---
    // Se inimigo toma dano de RAIO, estiver dentro do campo (120px do player), chance de stun
    if (gameState.weapon.type === 'thunder' && gameState.weapon.upgrades.static_field > 0) {
        if (Math.hypot(e.x - gameState.player.x, e.y - gameState.player.y) < 120) {
            // 30% chance ao receber dano de raio dentro da área
            if (Math.random() < 0.3 && e.frozenTimer <= 0) {
                e.frozenTimer = 2000; 
                showDamageNumber(e.x, e.y - 20, "STUN");
            }
        }
    }

    if (e.hp <= 0 && !e.dead) {
        e.dead = true;
        gameState.kills++;
        
        // Cumulonimbus Track
        if (owner && owner.type === 'storm') {
            owner.kills = (owner.kills || 0) + 1;
        }

        // Fire Explosion
        if (gameState.weapon.type === 'fire' && gameState.weapon.upgrades.explosion > 0) {
            gameState.effects.push({ type: 'explosion', x: e.x, y: e.y, created: Date.now(), duration: 500 });
            getEnemiesInRadius(e.x, e.y, 70).forEach(n => { if(!n.dead) takeEnemyDamage(n, amount * 2); });
        }

        // Ice Shatter (Estilhaçar)
        if (gameState.weapon.type === 'ice' && gameState.weapon.upgrades.shatter > 0 && e.frozenTimer > 0) {
            const count = 4;
            for(let i=0; i<count; i++) {
                 const angle = (Math.PI*2 / count) * i;
                 gameState.projectiles.push({
                     type: 'shard', x: e.x, y: e.y,
                     vx: Math.cos(angle)*7, vy: Math.sin(angle)*7,
                     damage: 10 * gameState.stats.damageMult, duration: 1000, created: Date.now(),
                     pierce: 0, hitList: []
                 });
            }
        }

        if (e.type === 'boss') {
            gameState.boss.active = false; DOM.ui.bossHud.style.display = 'none';
            spawnLoot(e.x, e.y, 'boss');
        } else if (e.type === 'triangle' && e.isParent) {
            spawnChildTriangle(e.x-10, e.y-10); spawnChildTriangle(e.x+10, e.y+10);
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
        gameState.items.push({ x, y, type: 'xp', value: xpVal, size: 8 });
    }
}

function openChest(tier) {
    gameState.running = false;
    let count = 1; let colorClass = 'chest-tier-bronze'; let title = "BAÚ DE BRONZE";
    if (tier === 'silver') { count = 3; colorClass = 'chest-tier-silver'; title = "BAÚ DE PRATA"; }
    if (tier === 'gold') { count = 5; colorClass = 'chest-tier-gold'; title = "BAÚ DE OURO"; }

    DOM.ui.chestTitle.textContent = title;
    DOM.ui.chestTitle.className = colorClass;
    DOM.ui.chestContent.innerHTML = '';

    for(let i=0; i<count; i++) {
        const up = GLOBAL_STATS_POOL[Math.floor(Math.random() * GLOBAL_STATS_POOL.length)];
        applyUpgrade(up);
        const p = document.createElement('p');
        p.textContent = `> ${up.name} (${up.desc})`;
        p.style.color = '#81C784'; p.style.margin = '5px';
        DOM.ui.chestContent.appendChild(p);
    }
    DOM.screens.chest.style.display = 'flex';
}

function showDamageNumber(x, y, dmg) {
    if (dmg < 1) return;
    const el = document.createElement('div');
    el.className = 'floating-damage';
    el.textContent = Math.floor(dmg);
    el.style.left = x + 'px'; el.style.top = (y - 20) + 'px';
    DOM.damageLayer.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

// --- UTILS (MIRA INTELIGENTE) ---
function getNearestEnemy(pos, maxDist=Infinity, exclude=[]) {
    let nearest = null, minDist = Infinity;
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;
    gameState.enemies.forEach(e => { 
        if (exclude.includes(e.id)) return;
        if (e.x < 0 || e.x > W || e.y < 0 || e.y > H) return;
        const d = Math.hypot(pos.x-e.x, pos.y-e.y); 
        if (d < minDist && d <= maxDist) { minDist=d; nearest=e; } 
    });
    return nearest;
}
function getEnemyWithHighestHP() {
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;
    let strongest = null; let maxHp = -1;
    gameState.enemies.forEach(e => {
        if (e.x < 0 || e.x > W || e.y < 0 || e.y > H) return;
        if (e.hp > maxHp) { maxHp = e.hp; strongest = e; }
    });
    return strongest;
}
function getMultipleNearest(source, count, maxRange) {
    let targets = []; let excluded = [];
    for(let i=0; i<count; i++) { let t = getNearestEnemy(source, maxRange, excluded); if(t) { targets.push(t); excluded.push(t.id); } }
    return targets;
}
function getEnemiesInRadius(x, y, r) { return gameState.enemies.filter(e => Math.hypot(e.x-x, e.y-y) < r + e.size/2); }

// --- LEVEL UP & UPDATES ---
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
        if (rnd < 0.01) targetRarity = 'legendary'; // 1% Lendária
        else if (rnd < 0.05) targetRarity = 'epic';
        else if (rnd < 0.20) targetRarity = 'rare';
        else if (rnd < 0.50) targetRarity = 'uncommon';
        
        let candidates = available.filter(u => u.rarity === targetRarity);
        if (candidates.length === 0) candidates = available.filter(u => u.rarity !== targetRarity); // Fallback
        
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
        if(opt.id==='health') { gameState.stats.maxHealth+=20; gameState.stats.health=gameState.stats.maxHealth; }
        if(opt.id==='pickup') gameState.stats.pickupRadius+=20;
        if(opt.id==='xp_gain') gameState.stats.xpMult+=0.2;
        
        // CANHÃO DE VIDRO
        if(opt.id==='glass_cannon') { gameState.stats.damageMult += 0.5; gameState.stats.glassCannon = true; }
    } else {
        if(!gameState.weapon.upgrades[opt.id]) gameState.weapon.upgrades[opt.id]=0;
        gameState.weapon.upgrades[opt.id]++;
    }
    updateWeaponUI();
}

function updateUI() {
    DOM.ui.level.textContent = gameState.level; DOM.ui.time.textContent = Math.floor(gameState.time / 1000);
    DOM.ui.enemyCount.textContent = `Inimigos: ${gameState.enemies.length}`;
    DOM.ui.killCount.textContent = gameState.kills;
    DOM.ui.hpText.textContent = `${Math.ceil(gameState.stats.health)}/${gameState.stats.maxHealth}`;
    DOM.ui.xpBar.style.width = `${Math.min(100, (gameState.xp/gameState.xpNeeded)*100)}%`;
    DOM.ui.healthBar.style.width = `${Math.min(100, (gameState.stats.health/gameState.stats.maxHealth)*100)}%`;
    if(gameState.boss.active) DOM.ui.bossHpBar.style.width = `${Math.max(0, (gameState.boss.entity.hp/gameState.boss.entity.maxHp)*100)}%`;
    
    // Indicador Visual Armadura de Gelo (Player)
    const playerDiv = document.querySelector('.player');
    if(playerDiv) {
        if(gameState.weapon.upgrades.ice_armor > 0 && Date.now() > gameState.player.armorCooldown) {
            playerDiv.classList.add('shielded');
        } else {
            playerDiv.classList.remove('shielded');
        }
    }

    // Atualizar HUD de Skills
    updateSkillHUD();
}

function updateSkillHUD() {
    DOM.skillHud.innerHTML = '';
    const w = gameState.weapon;

    const createIcon = (emoji, pct, countText = '') => {
        const div = document.createElement('div');
        div.className = `skill-icon ${pct >= 100 ? 'ready' : ''}`;
        div.innerHTML = `${emoji}<div class="skill-cd-overlay" style="height:${100 - pct}%"></div>${countText ? `<div class="skill-count">${countText}</div>` : ''}`;
        DOM.skillHud.appendChild(div);
    };

    // 1. Armadura de Gelo
    if (w.upgrades.ice_armor > 0) {
        const cdTotal = 30000;
        const remaining = Math.max(0, gameState.player.armorCooldown - Date.now());
        const pct = 100 - (remaining / cdTotal * 100);
        createIcon('🛡️', pct);
    }
    // 2. Bola de Fogo
    if (w.upgrades.fireball > 0) {
        const cdTotal = 3000;
        const elapsed = Date.now() - (w.lastFireball || 0);
        const pct = Math.min(100, (elapsed / cdTotal) * 100);
        createIcon('🔥', pct);
    }
    // 3. Meteorito
    if (w.upgrades.meteor > 0) {
        const cdTotal = 10000;
        const elapsed = Date.now() - (w.lastMeteor || 0);
        const pct = Math.min(100, (elapsed / cdTotal) * 100);
        createIcon('☄️', pct);
    }
    // 4. Para-Raio
    if (w.upgrades.lightning_rod > 0) {
        const count = w.lightningRodCounter || 0;
        const pct = (count / 10) * 100;
        createIcon('⚡', pct, `${count}/10`);
    }
}

function updateWeaponUI() {
    const w = WEAPONS_INFO[gameState.weapon.type];
    DOM.ui.weaponDisplay.textContent = `${w.name} Nv.${gameState.weapon.level}`;
    DOM.ui.weaponDisplay.style.color = w.color;
}

function spawnChildTriangle(x, y) {
    const min = gameState.time/60000;
    // Filhotes menores, amarelados, com flag isChild
    gameState.enemies.push({ 
        x, y, type:'triangle', id:Math.random(), 
        size:12, // Menor (era 14)
        maxHp:3*(1+min), hp:3*(1+min), 
        speed:1.3, xp:1, 
        color:'#FFE082', // Amarelo claro
        isParent:false,
        isChild: true // Flag visual
    });
}
function hideAllScreens() { Object.values(DOM.screens).forEach(s => s.style.display = 'none'); }

// --- RECEBER DANO ---
function takePlayerDamage(amt, now) {
    // ARMADURA DE GELO (Imune + Congela)
    if (gameState.weapon.type === 'ice' && gameState.weapon.upgrades.ice_armor > 0) {
        if (now > gameState.player.armorCooldown) {
            // Ativar
            gameState.player.armorCooldown = now + 30000; // 30s cooldown
            gameState.effects.push({ type: 'explosion', x: gameState.player.x, y: gameState.player.y, duration: 500, created: now }); // Visual
            // Congela aura
            const r = 70 * gameState.stats.areaMult * (1 + gameState.weapon.level*0.1);
            getEnemiesInRadius(gameState.player.x, gameState.player.y, r).forEach(e => e.frozenTimer = 5000);
            return; // Não toma dano
        }
    }

    if(gameState.player.isDamaged && now - gameState.player.damageTimer < 500) return;
    const scale = 1 + (gameState.time / 60000) * 0.5;
    let finalDmg = amt * scale;
    
    // CANHÃO DE VIDRO
    if (gameState.stats.glassCannon) finalDmg *= 2;

    gameState.stats.health -= finalDmg;
    
    gameState.player.isDamaged = true; gameState.player.damageTimer = now;
    const pDiv = document.querySelector('.player');
    if(pDiv) pDiv.classList.add('damaged');

    if(gameState.stats.health <= 0) { 
        gameState.running=false; DOM.screens.gameOver.style.display='flex'; 
        DOM.ui.finalTime.textContent=Math.floor(gameState.time/1000); // Fix ID
        document.getElementById('final-level').textContent=gameState.level; 
        DOM.ui.finalKills.textContent=gameState.kills;
    }
}

// --- MOVIMENTACAO ---
function movePlayer(dt) {
    let dx=0, dy=0;
    if (gameState.keys['w']||gameState.keys['ArrowUp']) dy=-1;
    if (gameState.keys['s']||gameState.keys['ArrowDown']) dy=1;
    if (gameState.keys['a']||gameState.keys['ArrowLeft']) dx=-1;
    if (gameState.keys['d']||gameState.keys['ArrowRight']) dx=1;
    if(dx&&dy){dx*=0.707;dy*=0.707;}
    
    const dist = gameState.stats.moveSpeed;
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;
    gameState.player.x = Math.max(10, Math.min(W-10, gameState.player.x + dx*dist));
    gameState.player.y = Math.max(10, Math.min(H-10, gameState.player.y + dy*dist));
}

function moveEntities(dt) {
    const W = DOM.container.clientWidth; const H = DOM.container.clientHeight;
    gameState.enemies = gameState.enemies.filter(e => !e.dead);
    
    gameState.enemies.forEach(e => {
        // Burn (Fogo)
        if (e.burnTimer > 0) {
            e.burnTimer -= dt;
            takeEnemyDamage(e, (e.burnDamage || 0.1));
        }

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

    for(let i=gameState.projectiles.length-1; i>=0; i--){
        let p = gameState.projectiles[i];
        if (p.type === 'fireball') {
            p.x += p.vx; p.y += p.vy;
            let hit = false;
            for(let e of gameState.enemies) {
                if(Math.hypot(p.x-e.x, p.y-e.y) < e.size + 5) {
                    gameState.effects.push({ type: 'explosion', x: e.x, y: e.y, duration: 600, created: Date.now() });
                    getEnemiesInRadius(e.x, e.y, 80).forEach(n => takeEnemyDamage(n, p.damage));
                    hit = true; break;
                }
            }
            if (hit || p.x<0 || p.x>W || p.y<0 || p.y>H) gameState.projectiles.splice(i,1);
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
                // Evita atingir o mesmo inimigo múltiplas vezes com o mesmo projétil (se perfurar)
                if (p.hitList.includes(e.id)) continue;

                if(Math.hypot(p.x-e.x, p.y-e.y) < e.size) { 
                    takeEnemyDamage(e, p.damage); 
                    p.hitList.push(e.id);
                    
                    if (p.pierce > 0) {
                        p.pierce--;
                        // Continua vivo
                    } else {
                        hit = true; 
                    }
                    break; // Atinge um por frame no máximo para não bugar
                }
            }
            if(hit || p.x<0 || p.x>W || p.y<0 || p.y>H) gameState.projectiles.splice(i,1);
        }
    }
    gameState.items.forEach(i => {
        if(i.type!=='chest' && Math.hypot(gameState.player.x-i.x, gameState.player.y-i.y) < gameState.stats.pickupRadius) {
            i.x += (gameState.player.x-i.x)*0.2; i.y += (gameState.player.y-i.y)*0.2;
        }
    });
}

function checkCollisions(now) {
    gameState.enemies.forEach(e => {
        if(Math.hypot(gameState.player.x-e.x, gameState.player.y-e.y) < gameState.player.size/2 + e.size/2) {
            if(e.frozenTimer <= 0) takePlayerDamage(10, now);
        }
    });
    for(let i=gameState.items.length-1; i>=0; i--){
        let item = gameState.items[i];
        if(Math.hypot(gameState.player.x-item.x, gameState.player.y-item.y) < gameState.player.size/2 + item.size) {
            if(item.type==='chest') openChest(item.tier);
            else { gameState.xp += item.value * gameState.stats.xpMult; if(gameState.xp >= gameState.xpNeeded) levelUp(); }
            gameState.items.splice(i,1);
        }
    }
}

// --- DRAW ---
function draw() {
    DOM.world.innerHTML = '';
    
    // Thunder static field
    if (gameState.weapon.type === 'thunder' && gameState.weapon.upgrades.static_field > 0) {
        let el = document.createElement('div'); el.className = 'static-field';
        el.style.width = '240px'; el.style.height = '240px';
        el.style.left = (gameState.player.x - 120) + 'px'; el.style.top = (gameState.player.y - 120) + 'px';
        DOM.world.appendChild(el);
    }

    gameState.effects.forEach(eff => {
        let el = document.createElement('div');
        if (eff.type === 'thunder_line' || eff.type === 'thick-thunder') {
            // Verifica se é o grosso
            el.className = eff.type === 'thick-thunder' ? 'thunder-line thick' : 'thunder-line';
            const dx = eff.x2-eff.x1, dy = eff.y2-eff.y1;
            el.style.width = Math.hypot(dx,dy)+'px'; el.style.left = eff.x1+'px'; el.style.top = eff.y1+'px';
            el.style.transform = `rotate(${Math.atan2(dy,dx)*57.29}deg)`;
        } else if (eff.type === 'fire_zone') {
            el.className = 'fire-zone'; el.style.width=eff.size+'px'; el.style.height=eff.size+'px'; el.style.left=(eff.x-eff.size/2)+'px'; el.style.top=(eff.y-eff.size/2)+'px';
        } else if (eff.type === 'storm') {
            el.className = 'storm-cloud'; el.style.left=(eff.x-30)+'px'; el.style.top=(eff.y-30)+'px';
            // Tamanho baseado em kills (Cumulonimbus)
            if (eff.kills && eff.kills > 0) {
                const scale = 1 + Math.min(1, eff.kills * 0.05);
                el.style.transform = `scale(${scale})`;
            }
        } else if (eff.type === 'explosion') {
            el.className = 'explosion'; el.style.width='100px'; el.style.height='100px'; el.style.left=(eff.x-50)+'px'; el.style.top=(eff.y-50)+'px';
        } else if (eff.type === 'meteor_warning') {
            el.className = 'meteor-warning'; el.style.width='240px'; el.style.height='240px'; el.style.left=(eff.x-120)+'px'; el.style.top=(eff.y-120)+'px';
        }
        DOM.world.appendChild(el);
    });

    if (gameState.weapon.type === 'ice') {
        const r = 70 * gameState.stats.areaMult * (1 + gameState.weapon.level*0.1);
        const el = document.createElement('div'); el.className = 'ice-aura'; el.style.width = (r*2)+'px'; el.style.height = (r*2)+'px'; el.style.left = (gameState.player.x-r)+'px'; el.style.top = (gameState.player.y-r)+'px'; DOM.world.appendChild(el);
    }

    const p = document.createElement('div'); p.className = `player ${gameState.player.isDamaged?'damaged':''}`;
    p.style.width='20px'; p.style.height='20px'; p.style.left=(gameState.player.x-10)+'px'; p.style.top=(gameState.player.y-10)+'px'; 
    if(gameState.weapon.upgrades.ice_armor > 0 && Date.now() > gameState.player.armorCooldown) p.classList.add('shielded');
    
    const hpPct = Math.max(0, Math.min(100, (gameState.stats.health/gameState.stats.maxHealth)*100));
    p.innerHTML = `<div class="mini-hp-container"><div class="mini-hp-fill" style="width:${hpPct}%"></div></div>`;
    DOM.world.appendChild(p);

    gameState.enemies.forEach(e => {
        const el = document.createElement('div'); 
        // Classes especiais para visual
        el.className = `enemy enemy-${e.type} ${e.hasChest?'enemy-chest-carrier':''} ${e.frozenTimer>0?'frozen':''} ${e.burnTimer>0?'burning':''} ${e.isChild?'enemy-triangle-child':''}`;
        
        if(e.type==='triangle') { 
            el.style.left=(e.x-10)+'px'; el.style.top=(e.y-10)+'px'; 
            // A rotação deve respeitar o ângulo
            el.style.transform = `rotate(${Math.atan2(gameState.player.y - e.y, gameState.player.x - e.x) * 57.29 + 90}deg)`; 
        }
        else { el.style.width=e.size+'px'; el.style.height=e.size+'px'; el.style.left=(e.x-e.size/2)+'px'; el.style.top=(e.y-e.size/2)+'px'; }
        
        if(e.isChild) el.style.borderBottomColor = e.color; // Sobrescreve cor se filho
        DOM.world.appendChild(el);
    });

    gameState.items.forEach(i => {
        const el = document.createElement('div'); el.className = i.type==='chest'?'chest':'xp-orb';
        el.style.width=i.size+'px'; el.style.height=i.size+'px'; el.style.left=(i.x-i.size/2)+'px'; el.style.top=(i.y-i.size/2)+'px'; DOM.world.appendChild(el);
    });
    gameState.projectiles.forEach(p => {
        const el = document.createElement('div'); 
        if (p.type === 'fireball') el.className = 'fireball';
        else el.className = p.type==='molotov'?'molotov':'ice-shard';
        
        if(p.type==='ice-shard') { el.style.transform = `rotate(${Math.atan2(p.vy, p.vx)*57.29 + 90}deg)`; }
        el.style.left=(p.x-(p.type==='fireball'?10:5))+'px'; el.style.top=(p.y-(p.type==='fireball'?10:5))+'px'; 
        DOM.world.appendChild(el);
    });
}

// Inputs
window.addEventListener('keydown', e => {
    if(e.key === 'Tab') { e.preventDefault(); togglePause(); }
    gameState.keys[e.key] = true;
});
window.addEventListener('keyup', e => gameState.keys[e.key] = false);
DOM.ui.closeChestBtn.onclick = () => { DOM.screens.chest.style.display='none'; gameState.running=true; gameState.lastUpdate=Date.now(); gameLoop(); };
DOM.ui.restartBtn.onclick = resetToMenu;
DOM.ui.quitBtn.onclick = resetToMenu;
DOM.ui.resumeBtn.onclick = togglePause;