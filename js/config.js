// ==================== 游戏配置 ====================

// 地图配置
const MAPS = {
    islands: {
        name: '海岛',
        size: 36000,
        description: '岛屿密布的热带海域，适合伏击和近战',
        teamSize: { allies: 12, enemies: 12 },
        islands: 18,
        spawns: {
            allies: [{ x: 3000, y: 18000 }, { x: 5000, y: 15000 }, { x: 5000, y: 21000 }, { x: 3500, y: 12000 }, { x: 3500, y: 24000 }],
            enemies: [{ x: 33000, y: 18000 }, { x: 31000, y: 15000 }, { x: 31000, y: 21000 }, { x: 32500, y: 12000 }, { x: 32500, y: 24000 }]
        },
        capturePoints: [
            { x: 18000, y: 18000 }
        ],
        colors: { water: '#0c1e3a', deepWater: '#0a1628', island: '#4a6a2e' }
    },
    polar: {
        name: '北极光',
        size: 42000,
        description: '冰川环绕的寒冷海域，长距离交战',
        teamSize: { allies: 12, enemies: 12 },
        islands: 12,
        spawns: {
            allies: [{ x: 4000, y: 21000 }, { x: 6000, y: 18000 }, { x: 6000, y: 24000 }, { x: 4500, y: 14000 }, { x: 4500, y: 28000 }],
            enemies: [{ x: 38000, y: 21000 }, { x: 36000, y: 18000 }, { x: 36000, y: 24000 }, { x: 37500, y: 14000 }, { x: 37500, y: 28000 }]
        },
        capturePoints: [
            { x: 21000, y: 21000 }
        ],
        colors: { water: '#1a2d4a', deepWater: '#0f1a30', island: '#8aa3b8' },
        iceMode: true
    },
    sleeping_giant: {
        name: '沉睡的巨人',
        size: 39000,
        description: '火山岛屿群，控制中央水道是关键',
        teamSize: { allies: 12, enemies: 12 },
        islands: 15,
        spawns: {
            allies: [{ x: 3500, y: 19500 }, { x: 5500, y: 16500 }, { x: 5500, y: 22500 }, { x: 4000, y: 13000 }, { x: 4000, y: 26000 }],
            enemies: [{ x: 35500, y: 19500 }, { x: 33500, y: 16500 }, { x: 33500, y: 22500 }, { x: 35000, y: 13000 }, { x: 35000, y: 26000 }]
        },
        capturePoints: [
            { x: 19500, y: 19500 }
        ],
        colors: { water: '#0d2847', deepWater: '#0a1f3a', island: '#5a4a3a' }
    },
    fire_archipelago: {
        name: '火焰群岛',
        size: 36000,
        description: '活跃的火山群岛，地形复杂多变',
        teamSize: { allies: 12, enemies: 12 },
        islands: 20,
        spawns: {
            allies: [{ x: 3000, y: 18000 }, { x: 5000, y: 15000 }, { x: 5000, y: 21000 }, { x: 3500, y: 12000 }, { x: 3500, y: 24000 }],
            enemies: [{ x: 33000, y: 18000 }, { x: 31000, y: 15000 }, { x: 31000, y: 21000 }, { x: 32500, y: 12000 }, { x: 32500, y: 24000 }]
        },
        capturePoints: [
            { x: 18000, y: 18000 }
        ],
        colors: { water: '#1e0a0a', deepWater: '#0f0505', island: '#8b4513' },
        volcanic: true
    },
    desert_oasis: {
        name: '荒漠之泪',
        size: 37500,
        description: '沙漠中的绿洲海域，视野开阔',
        teamSize: { allies: 12, enemies: 12 },
        islands: 8,
        spawns: {
            allies: [{ x: 3500, y: 18750 }, { x: 5500, y: 15750 }, { x: 5500, y: 21750 }, { x: 4000, y: 12000 }, { x: 4000, y: 25500 }],
            enemies: [{ x: 34000, y: 18750 }, { x: 32000, y: 15750 }, { x: 32000, y: 21750 }, { x: 33500, y: 12000 }, { x: 33500, y: 25500 }]
        },
        capturePoints: [
            { x: 18750, y: 18750 }
        ],
        colors: { water: '#1a3a4a', deepWater: '#0f2835', island: '#c4a35a' }
    }
};

// 舰船参数调整 - 更接近战舰世界的手感 (1像素 = 1米 比例调整)
const SHIP_TYPES = {
    destroyer: {
        name: '驱逐舰', hp: 14500, maxSpeed: 36, acceleration: 0.02, turnSpeed: 0.022,
        length: 120, width: 12, color: '#5599dd', gunColor: '#88bbee',
        mainGun: { damage: 1200, reload: 4, range: 8500, shells: 6, spread: 0.035, shellSpeed: 12, splashRadius: 50,
                   traverse: 0.35, arc: [-2.6, 2.6] },
        rearGun: { damage: 800, reload: 3, range: 7000, shells: 3, spread: 0.04, shellSpeed: 12, splashRadius: 50,
                   traverse: 0.35, arc: [-2.6, 2.6] },
        torpedo: { damage: 5500, reload: 12, range: 7500, count: 8, speed: 6, spread: 0.08 },
        concealment: 0.6, detectability: 5500
    },
    cruiser: {
        name: '巡洋舰', hp: 32000, maxSpeed: 30, acceleration: 0.012, turnSpeed: 0.015,
        length: 180, width: 18, color: '#4488cc', gunColor: '#77aadd',
        mainGun: { damage: 2500, reload: 7, range: 12000, shells: 8, spread: 0.025, shellSpeed: 10, splashRadius: 70,
                   traverse: 0.22, arc: [-2.6, 2.6] },
        rearGun: { damage: 1500, reload: 5, range: 10000, shells: 4, spread: 0.03, shellSpeed: 10, splashRadius: 70,
                   traverse: 0.22, arc: [-2.6, 2.6] },
        torpedo: { damage: 6500, reload: 18, range: 6000, count: 6, speed: 5, spread: 0.06 },
        concealment: 0.75, detectability: 8000
    },
    battleship: {
        name: '战列舰', hp: 68000, maxSpeed: 22, acceleration: 0.007, turnSpeed: 0.008,
        length: 250, width: 32, color: '#3366aa', gunColor: '#6699cc',
        mainGun: { damage: 6500, reload: 15, range: 18000, shells: 12, spread: 0.018, shellSpeed: 8, splashRadius: 120,
                   traverse: 0.08, arc: [-2.6, 2.6] },
        rearGun: { damage: 4000, reload: 12, range: 15000, shells: 6, spread: 0.022, shellSpeed: 8, splashRadius: 120,
                   traverse: 0.08, arc: [-2.6, 2.6] },
        torpedo: { damage: 5500, reload: 30, range: 4500, count: 4, speed: 4.5, spread: 0.05 },
        concealment: 1.0, detectability: 12000
    },
    carrier: {
        name: '航空母舰', hp: 52000, maxSpeed: 28, acceleration: 0.008, turnSpeed: 0.006,
        length: 280, width: 40, color: '#336699', gunColor: '#5588aa',
        mainGun: null,
        rearGun: { damage: 600, reload: 1.5, range: 6000, shells: 2, spread: 0.06, shellSpeed: 11, splashRadius: 35,
                   traverse: 0.4, arc: [-2.8, 2.8] },
        torpedo: null,
        concealment: 1.2, detectability: 14000,
        squadrons: {
            torpedo: {
                name: '鱼雷机', planes: 4, damage: 4800, speed: 10,
                reload: 30, torpCount: 2, torpSpeed: 5, torpRange: 2500, spread: 0.12,
                hp: 1800
            },
            dive: {
                name: '轰炸机', planes: 4, damage: 6000, speed: 11,
                reload: 25, bombCount: 2, spread: 0.04,
                hp: 2000
            },
            rocket: {
                name: '攻击机', planes: 6, damage: 2200, speed: 12,
                reload: 18, rocketCount: 4, rocketSpeed: 15, rocketRange: 1200, spread: 0.10,
                hp: 1400
            }
        }
    }
};

// 导出配置（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAPS, SHIP_TYPES };
}