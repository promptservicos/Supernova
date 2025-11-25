// --- DADOS DAS ARMAS E CLASSES ---

export const WEAPONS_INFO = {
    padrao: { name: 'Disparo', desc: 'Disparos simples.', color: '#FFF' },
    thunder: { name: 'Feixe de Raios', desc: 'Raios rápidos em cadeia.', color: '#E040FB' },
    ice: { name: 'Zona de Gelo', desc: 'Aura de lentidão e estilhaços.', color: '#00BCD4' },
    fire: { name: 'Napalm', desc: 'Explosivos em área.', color: '#FF5722' }
};

export const GLOBAL_STATS_POOL = [
    { id: 'dmg', name: 'Força', desc: '+Dano', rarity: 'common', type: 'stat' },
    { id: 'rate', name: 'Rapidez', desc: '+Velocidade de Ataque', rarity: 'common', type: 'stat' },
    { id: 'health', name: 'Vitalidade', desc: '+Vida Max (Sem cura total)', rarity: 'common', type: 'stat' },
    { id: 'pickup', name: 'Imã', desc: '+Alcance de Coleta', rarity: 'common', type: 'stat' },
    { id: 'xp_gain', name: 'Sabedoria', desc: '+Ganho de XP', rarity: 'common', type: 'stat' },
    { id: 'glass_cannon', name: 'CANHÃO DE VIDRO', desc: '+50% Dano, mas recebe Dobro de Dano', rarity: 'legendary', type: 'stat', max: 1 }
];

export const UPGRADE_POOLS = {
    padrao: [
        ...GLOBAL_STATS_POOL,
        { id: 'count', name: 'Multidisparo', desc: '+1 Projétil', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'pierce', name: 'Perfuração', desc: 'Atravessa +1 inimigo', rarity: 'uncommon', type: 'mechanic', max: 3 },
    ],
    thunder: [
        ...GLOBAL_STATS_POOL,
        { id: 'range', name: 'Condutividade', desc: '+Alcance do Raio', rarity: 'common', type: 'stat' },
        { id: 'ricochet', name: 'Ricochete', desc: 'Raios saltam +1 vez', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'count', name: 'Multiraio', desc: '+1 Raio simultâneo', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'storm', name: 'TEMPESTADE', desc: '+1 Nuvem Autônoma', rarity: 'epic', type: 'mechanic', max: 3 },
        { id: 'static_field', name: 'Campo Estático', desc: 'Onda elétrica a cada 10s que paralisa', rarity: 'rare', type: 'mechanic', max: 1 },
        { id: 'lightning_rod', name: 'Para-Raio', desc: '10º Disparo atinge o inimigo mais forte', rarity: 'rare', type: 'mechanic', max: 1 },
        { id: 'cumulonimbus', name: 'CUMULONIMBUS', desc: 'Nuvens crescem ao matar', rarity: 'legendary', type: 'mechanic', max: 1 }
    ],
    ice: [
        ...GLOBAL_STATS_POOL,
        { id: 'area', name: 'Tamanho', desc: '+Área', rarity: 'common', type: 'stat' },
        { id: 'slow', name: 'Hipotermia', desc: 'Aumenta lentidão da aura', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'shard', name: 'Estilhaço', desc: 'Dispara gelo no inimigo próximo', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'freeze', name: 'CONGELAR', desc: 'Congela inimigos por 3s', rarity: 'epic', type: 'mechanic', max: 1 },
        { id: 'shatter', name: 'Estilhaçar', desc: 'Inimigos congelados explodem em 8 direções', rarity: 'uncommon', type: 'mechanic', max: 1 },
        { id: 'pierce', name: 'Perfurar', desc: 'Estilhaços atravessam +1 inimigo', rarity: 'uncommon', type: 'mechanic', max: 3 },
        { id: 'ice_armor', name: 'Armadura de Gelo', desc: 'Bloqueia 1 ataque e congela tudo (30s recarga)', rarity: 'rare', type: 'mechanic', max: 1 }
    ],
    fire: [
        ...GLOBAL_STATS_POOL,
        { id: 'area', name: 'Tamanho', desc: '+Área', rarity: 'common', type: 'stat' },
        { id: 'duration', name: 'Chama Eterna', desc: 'Fogo dura mais tempo', rarity: 'uncommon', type: 'mechanic', max: 5 },
        { id: 'count', name: 'Barragem', desc: '+1 Projétil', rarity: 'rare', type: 'mechanic', max: 5 },
        { id: 'explosion', name: 'EXPLOSÃO', desc: 'Inimigos explodem ao morrer', rarity: 'epic', type: 'mechanic', max: 1 },
        { id: 'burn', name: 'Queimadura', desc: 'Inimigos continuam queimando fora da área', rarity: 'uncommon', type: 'mechanic', max: 1 },
        { id: 'fireball', name: 'Bola de Fogo', desc: 'Dispara meteoro teleguiado periodicamente', rarity: 'rare', type: 'mechanic', max: 1 },
        { id: 'meteor', name: 'METEORITO', desc: 'Chuva de meteoro a cada 10s', rarity: 'epic', type: 'mechanic', max: 1 }
    ]
};