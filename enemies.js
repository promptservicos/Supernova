// --- FUNÇÕES DE CRIAÇÃO DE INIMIGOS ---

export function manageSpawns(gameState, canvas, spawnEnemyFunc) {
    const seconds = gameState.time / 1000;
    // Aumenta dificuldade com o tempo (spawn rate diminui = mais inimigos)
    // Mínimo de 80ms entre spawns
    let currentRate = Math.max(80, 1200 - (Math.floor(seconds/60) * 200));
    
    if (Date.now() - gameState.lastSpawn > currentRate) {
        spawnEnemyFunc(gameState, canvas); // Chama a função de spawn passada
        gameState.lastSpawn = Date.now();
    }
}

export function spawnEnemy(gameState, canvas, DOM) {
    const W = canvas.width; const H = canvas.height;
    const side = Math.floor(Math.random()*4);
    const offset = 100; 
    let rx, ry;

    // Lógica de Spawn fora da câmera (relativo à tela)
    if(side===0) { rx = Math.random()*W; ry = -offset; } // Cima
    else if(side===1) { rx = W+offset; ry = Math.random()*H; } // Direita
    else if(side===2) { rx = Math.random()*W; ry = H+offset; } // Baixo
    else { rx = -offset; ry = Math.random()*H; } // Esquerda

    // Converter para coordenadas do Mundo (Somando posição do jogador e ajustando centro)
    const worldX = gameState.player.x + (rx - W/2);
    const worldY = gameState.player.y + (ry - H/2);

    const minutes = gameState.time / 60000;
    const hpMult = 1 + (minutes * 1.0);
    const xpMult = 1 + minutes;

    let type = 'square';
    
    // Lógica de Chefe: 
    // Se não tem chefe ativo, passou de 30s (0.5 min) e caiu na chance baixa
    if (!gameState.boss.active && minutes > 0.5 && Math.random() < 0.005) {
        // 50% de chance para cada chefe (Quadrado ou Tri-Force)
        type = Math.random() < 0.5 ? 'boss' : 'triforce';
    }
    else if (minutes > 0.2 && Math.random() < 0.3) type = 'triangle';

    // Criação do Objeto Inimigo Base
    let e = { 
        x: worldX, 
        y: worldY, 
        type, 
        id: Math.random(), 
        frozenTimer: 0, 
        burnTimer: 0, 
        maxHp: 0, 
        hp: 0, 
        speed: 0, 
        xp: 0, 
        hasChest: false,
        isChild: false
    };

    // --- CONFIGURAÇÃO ESPECÍFICA POR TIPO ---

    if (type === 'boss') { // QUADRADO COLOSSAL (Chefe Antigo)
        e.size = 60; 
        e.maxHp = 1200 * hpMult; 
        e.speed = 0.8; 
        e.xp = 300 * xpMult; 
        e.color = '#880E4F'; 
        e.hasChest = true;
        
        gameState.boss.active = true; 
        gameState.boss.entity = e; 
        
        // Atualiza HUD
        if(DOM.ui.bossHud) { 
            DOM.ui.bossHud.style.display = 'block'; 
            if(DOM.ui.bossName) DOM.ui.bossName.textContent = "QUADRADO COLOSSAL"; 
        }
    
    } else if (type === 'triforce') { // TRI-FORCE (Novo Chefe)
        e.size = 90; 
        e.maxHp = 2500 * hpMult; 
        e.speed = 1.2; 
        e.xp = 800 * xpMult; 
        e.color = '#FFF'; 
        e.hasChest = true;
        
        // Propriedades Específicas de IA do Tri-Force
        e.phase = 'neutral'; // fases: neutral, fire, ice, thunder
        e.phaseTimer = 0;
        e.attackCooldown = 0;
        e.orbs = []; // Usado na fase de raio
        
        gameState.boss.active = true; 
        gameState.boss.entity = e;
        
        // Atualiza HUD
        if(DOM.ui.bossHud) { 
            DOM.ui.bossHud.style.display = 'block'; 
            if(DOM.ui.bossName) DOM.ui.bossName.textContent = "THE TRI-FORCE"; 
        }

    } else if (type === 'triangle') { // Triângulo Invocador
        e.size = 22; 
        e.maxHp = 15 * hpMult; 
        e.speed = 1.0; 
        e.xp = 3 * xpMult; 
        e.color = '#FF9800'; 
        e.isParent = true; // Comportamento de spawnar filhos
    } else { // Quadrado Comum (Kamikaze)
        e.size = 20; 
        e.maxHp = 10 * hpMult; 
        e.speed = 1.2 + Math.random()*0.5; 
        e.xp = 1 * xpMult; 
        e.color = '#D32F2F';
        
        // Chance rara de ser um mob dourado com baú
        if(Math.random() < 0.01) { 
            e.hasChest = true; 
            e.maxHp *= 4; 
            e.color = '#FFD700'; 
        }
    }
    
    e.hp = e.maxHp;
    gameState.enemies.push(e);
}

export function spawnChildTriangle(gameState, x, y) {
    const min = gameState.time/60000;
    gameState.enemies.push({ 
        x, y, 
        type:'triangle', 
        id:Math.random(), 
        size: 14, 
        maxHp:3*(1+min), 
        hp:3*(1+min), 
        speed:1.4, 
        xp:1, 
        color:'#FFE082', 
        isParent:false, 
        isChild: true // Importante para lógica de colisão diferenciada
    });
}