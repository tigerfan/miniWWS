// ==================== 配置 ====================
const MAPS = {
    islands: {
        name: '海岛',
        size: 36000,
        description: '岛屿密布的热带海域，适合伏击和近战',
        teamSize: { allies: 10, enemies: 10 },
        islands: 18,
        spawns: {
            allies: [{ x: 3000, y: 18000 }, { x: 5000, y: 15000 }, { x: 5000, y: 21000 }],
            enemies: [{ x: 33000, y: 18000 }, { x: 31000, y: 15000 }, { x: 31000, y: 21000 }]
        },
        capturePoints: [
            { x: 12000, y: 18000 },  // 西侧控制点
            { x: 24000, y: 18000 }   // 东侧控制点
        ],
        colors: { water: '#0c1e3a', deepWater: '#0a1628', island: '#4a6a2e' }
    },
    polar: {
        name: '北极光',
        size: 42000,
        description: '冰川环绕的寒冷海域，长距离交战',
        teamSize: { allies: 10, enemies: 10 },
        islands: 12,
        spawns: {
            allies: [{ x: 4000, y: 21000 }, { x: 6000, y: 18000 }, { x: 6000, y: 24000 }],
            enemies: [{ x: 38000, y: 21000 }, { x: 36000, y: 18000 }, { x: 36000, y: 24000 }]
        },
        capturePoints: [
            { x: 14000, y: 21000 },  // 西侧控制点
            { x: 28000, y: 21000 }   // 东侧控制点
        ],
        colors: { water: '#1a2d4a', deepWater: '#0f1a30', island: '#8aa3b8' },
        iceMode: true
    },
    sleeping_giant: {
        name: '沉睡的巨人',
        size: 39000,
        description: '火山岛屿群，控制中央水道是关键',
        teamSize: { allies: 10, enemies: 10 },
        islands: 15,
        spawns: {
            allies: [{ x: 3500, y: 19500 }, { x: 5500, y: 16500 }, { x: 5500, y: 22500 }],
            enemies: [{ x: 35500, y: 19500 }, { x: 33500, y: 16500 }, { x: 33500, y: 22500 }]
        },
        capturePoints: [
            { x: 13000, y: 19500 },  // 西侧控制点
            { x: 26000, y: 19500 }   // 东侧控制点
        ],
        colors: { water: '#0d2847', deepWater: '#0a1f3a', island: '#5a4a3a' }
    },
    fire_archipelago: {
        name: '火焰群岛',
        size: 36000,
        description: '活跃的火山群岛，地形复杂多变',
        teamSize: { allies: 10, enemies: 10 },
        islands: 20,
        spawns: {
            allies: [{ x: 3000, y: 18000 }, { x: 5000, y: 15000 }, { x: 5000, y: 21000 }],
            enemies: [{ x: 33000, y: 18000 }, { x: 31000, y: 15000 }, { x: 31000, y: 21000 }]
        },
        capturePoints: [
            { x: 12000, y: 18000 },  // 西侧控制点
            { x: 24000, y: 18000 }   // 东侧控制点
        ],
        colors: { water: '#1e0a0a', deepWater: '#0f0505', island: '#8b4513' },
        volcanic: true
    },
    desert_oasis: {
        name: '荒漠之泪',
        size: 37500,
        description: '沙漠中的绿洲海域，视野开阔',
        teamSize: { allies: 10, enemies: 10 },
        islands: 8,
        spawns: {
            allies: [{ x: 3500, y: 18750 }, { x: 5500, y: 15750 }, { x: 5500, y: 21750 }],
            enemies: [{ x: 34000, y: 18750 }, { x: 32000, y: 15750 }, { x: 32000, y: 21750 }]
        },
        capturePoints: [
            { x: 12500, y: 18750 },  // 西侧控制点
            { x: 25000, y: 18750 }   // 东侧控制点
        ],
        colors: { water: '#1a3a4a', deepWater: '#0f2835', island: '#c4a35a' }
    }
};

// 舰船参数调整 - 更接近战舰世界的手感 (1像素 = 1米 比例调整)
const SHIP_TYPES = {
    destroyer: {
        name: '驱逐舰', hp: 14500, maxSpeed: 36, acceleration: 0.08, turnSpeed: 0.045,
        length: 120, width: 12, color: '#5599dd', gunColor: '#88bbee',
        mainGun: { damage: 1200, reload: 4, range: 8500, shells: 6, spread: 0.035, shellSpeed: 18 },
        torpedo: { damage: 5500, reload: 12, range: 7500, count: 8, speed: 9, spread: 0.08 },
        concealment: 0.6, detectability: 5500
    },
    cruiser: {
        name: '巡洋舰', hp: 32000, maxSpeed: 30, acceleration: 0.05, turnSpeed: 0.03,
        length: 180, width: 18, color: '#4488cc', gunColor: '#77aadd',
        mainGun: { damage: 2500, reload: 7, range: 12000, shells: 8, spread: 0.025, shellSpeed: 16 },
        torpedo: { damage: 6500, reload: 18, range: 6000, count: 6, speed: 8, spread: 0.06 },
        concealment: 0.75, detectability: 8000
    },
    battleship: {
        name: '战列舰', hp: 68000, maxSpeed: 22, acceleration: 0.035, turnSpeed: 0.018,
        length: 250, width: 32, color: '#3366aa', gunColor: '#6699cc',
        mainGun: { damage: 6500, reload: 15, range: 18000, shells: 12, spread: 0.018, shellSpeed: 14 },
        torpedo: { damage: 5500, reload: 30, range: 4500, count: 4, speed: 7, spread: 0.05 },
        concealment: 1.0, detectability: 12000
    }
};

// ==================== 工具函数 ====================
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function angleTo(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function randRange(a, b) { return a + Math.random() * (b - a); }
function normalizeAngle(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

// ==================== 粒子系统 ====================
class Particle {
    constructor(x, y, vx, vy, life, size, color, fadeColor) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.life = life; this.maxLife = life; this.size = size;
        this.color = color; this.fadeColor = fadeColor || color;
    }
    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.life -= dt;
        this.vx *= 0.98; this.vy *= 0.98;
    }
    draw(ctx, cam) {
        const alpha = clamp(this.life / this.maxLife, 0, 1);
        const sx = this.x - cam.x, sy = this.y - cam.y;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(sx, sy, this.size * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ==================== 弹药类 ====================
class Projectile {
    constructor(x, y, angle, speed, range, damage, type, owner) {
        this.x = x; this.y = y; this.angle = angle;
        this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.speed = speed; this.range = range; this.damage = damage;
        this.type = type; this.owner = owner;
        this.traveled = 0; this.alive = true;
        this.trail = [];
    }
    update(dt, game) {
        const dx = this.vx * dt * 60, dy = this.vy * dt * 60;
        this.x += dx; this.y += dy;
        this.traveled += Math.hypot(dx, dy);
        if (this.traveled >= this.range) this.alive = false;
        // 使用游戏世界边界
        const worldSize = game?.currentMap?.size || 42000;
        if (this.x < 0 || this.x > worldSize || this.y < 0 || this.y > worldSize) this.alive = false;
        // 轨迹
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 15) this.trail.shift();
        this.trail.forEach(t => t.alpha *= 0.92);
    }
    draw(ctx, cam) {
        const sx = this.x - cam.x, sy = this.y - cam.y;
        // 轨迹
        if (this.type === 'torpedo') {
            ctx.strokeStyle = 'rgba(150, 255, 200, 0.3)';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
            ctx.lineWidth = 2;
        }
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const tx = t.x - cam.x, ty = t.y - cam.y;
            if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        // 弹头
        if (this.type === 'torpedo') {
            ctx.fillStyle = '#80ffb0';
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(128, 255, 176, 0.3)';
            ctx.beginPath();
            ctx.arc(sx, sy, 7, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#ffcc44';
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 200, 60, 0.4)';
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ==================== 岛屿 ====================
class Island {
    constructor(x, y, radius, mapType = 'islands') {
        this.x = x || randRange(300, 42000 - 300);
        this.y = y || randRange(300, 42000 - 300);
        this.radius = radius || randRange(80, 350);
        this.points = [];
        this.mapType = mapType;
        const n = Math.floor(randRange(8, 16));
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const r = this.radius * randRange(0.75, 1.0);
            this.points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
    }
    draw(ctx, cam, mapConfig) {
        const sx = this.x - cam.x, sy = this.y - cam.y;
        if (sx < -this.radius - 50 || sx > cam.w + this.radius + 50 || 
            sy < -this.radius - 50 || sy > cam.h + this.radius + 50) return;
        
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.moveTo(sx + this.points[0].x + 6, sy + this.points[0].y + 6);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(sx + this.points[i].x + 6, sy + this.points[i].y + 6);
        }
        ctx.closePath();
        ctx.fill();
        
        // 岛屿颜色根据地图类型
        const islandColor = mapConfig?.colors?.island || '#4a6a2e';
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius);
        grad.addColorStop(0, this.lightenColor(islandColor, 20));
        grad.addColorStop(0.7, islandColor);
        grad.addColorStop(1, this.darkenColor(islandColor, 20));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx + this.points[0].x, sy + this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(sx + this.points[i].x, sy + this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.lightenColor(islandColor, 30);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 冰川效果
        if (mapConfig?.iceMode) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(sx, sy, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    collides(ship) {
        return dist(this, ship) < this.radius + ship.cfg.width;
    }
}

// ==================== 占领点 ====================
class CapturePoint {
    constructor(x, y, radius = 800, captureTime = 60) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.captureTime = captureTime; // 占领所需时间（秒）
        this.owner = null; // 'player', 'enemy', null
        this.capturer = null; // 正在占领的阵营
        this.progress = 0; // 0-100 的占领进度
        this.contested = false; // 是否正在被争夺
        this.inCombat = false; // 是否处于战斗状态（用于重置进度）
        this.combatTimer = 0;
    }

    update(dt, game) {
        // 获取范围内的所有舰船
        const shipsInRange = [];
        
        // 检查友军（包含玩家）
        for (const ally of game.allies) {
            if (ally.alive && dist(ally, this) < this.radius) {
                shipsInRange.push(ally);
            }
        }
        
        // 检查敌军
        for (const enemy of game.enemies) {
            if (enemy.alive && dist(enemy, this) < this.radius) {
                shipsInRange.push(enemy);
            }
        }

        // 统计各方舰船数量
        const playerShips = shipsInRange.filter(s => s.team === 'player').length;
        const enemyShips = shipsInRange.filter(s => s.team === 'enemy').length;

        // 判断争夺状态
        this.contested = playerShips > 0 && enemyShips > 0;
        
        // 处理战斗状态计时器
        if (this.inCombat) {
            this.combatTimer -= dt;
            if (this.combatTimer <= 0) {
                this.inCombat = false;
            }
        }

        // 如果被争夺或有战斗，暂停占领
        if (this.contested || this.inCombat) {
            return;
        }

        // 计算占领速度（多舰加速）
        const captureSpeed = (ships) => {
            if (ships === 0) return 0;
            if (ships === 1) return 1;
            return 1 + (ships - 1) * 0.5; // 每多一艘增加50%速度
        };

        // 处理占领逻辑
        if (playerShips > 0 && enemyShips === 0) {
            // 友方占领
            if (this.owner === 'player') {
                // 已被我方占领，无需操作
                return;
            }
            
            if (this.capturer === 'player') {
                // 继续占领
                this.progress += (100 / this.captureTime) * captureSpeed(playerShips) * dt;
            } else if (this.capturer === 'enemy') {
                // 争夺中，减少敌方进度
                this.progress -= (100 / this.captureTime) * captureSpeed(playerShips) * dt * 2;
            } else {
                // 开始占领
                this.capturer = 'player';
                this.progress += (100 / this.captureTime) * captureSpeed(playerShips) * dt;
            }
        } else if (enemyShips > 0 && playerShips === 0) {
            // 敌方占领
            if (this.owner === 'enemy') {
                return;
            }
            
            if (this.capturer === 'enemy') {
                this.progress += (100 / this.captureTime) * captureSpeed(enemyShips) * dt;
            } else if (this.capturer === 'player') {
                this.progress -= (100 / this.captureTime) * captureSpeed(enemyShips) * dt * 2;
            } else {
                this.capturer = 'enemy';
                this.progress += (100 / this.captureTime) * captureSpeed(enemyShips) * dt;
            }
        } else {
            // 无人占领，进度缓慢回退
            if (this.progress > 0 && this.capturer !== null) {
                this.progress -= (100 / this.captureTime) * 0.5 * dt;
            }
        }

        // 进度边界处理
        if (this.progress >= 100) {
            this.progress = 100;
            this.owner = this.capturer;
            this.capturer = null;
        } else if (this.progress <= 0) {
            this.progress = 0;
            if (this.capturer !== null) {
                this.capturer = null;
                this.owner = null;
            }
        }
    }

    // 被攻击时进入战斗状态
    onAttacked() {
        this.inCombat = true;
        this.combatTimer = 5; // 5秒内被攻击会暂停占领
    }

    draw(ctx, cam) {
        const sx = this.x - cam.x;
        const sy = this.y - cam.y;
        
        // 检查是否在视野内
        if (sx < -this.radius - 100 || sx > cam.w + this.radius + 100 || 
            sy < -this.radius - 100 || sy > cam.h + this.radius + 100) return;

        // 绘制占领范围圈
        ctx.beginPath();
        ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
        
        // 根据状态设置颜色
        let strokeColor = 'rgba(200, 200, 200, 0.3)';
        let fillColor = 'rgba(200, 200, 200, 0.05)';
        
        if (this.owner === 'player') {
            strokeColor = 'rgba(68, 170, 255, 0.6)';
            fillColor = 'rgba(68, 170, 255, 0.15)';
        } else if (this.owner === 'enemy') {
            strokeColor = 'rgba(255, 68, 68, 0.6)';
            fillColor = 'rgba(255, 68, 68, 0.15)';
        } else if (this.capturer === 'player') {
            strokeColor = 'rgba(68, 170, 255, 0.4)';
            fillColor = 'rgba(68, 170, 255, 0.08)';
        } else if (this.capturer === 'enemy') {
            strokeColor = 'rgba(255, 68, 68, 0.4)';
            fillColor = 'rgba(255, 68, 68, 0.08)';
        }
        
        // 争夺状态时闪烁效果
        if (this.contested || this.inCombat) {
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            strokeColor = `rgba(255, 200, 68, ${0.8 * pulse})`;
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = this.contested || this.inCombat ? 5 : 3;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = fillColor;
        ctx.fill();

        // 绘制占领进度圆环（更明显的进度显示）
        if (this.progress > 0 && this.progress < 100 && !this.contested && !this.inCombat) {
            const progressRadius = this.radius * 0.85;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (this.progress / 100) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.arc(sx, sy, progressRadius, startAngle, endAngle);
            ctx.strokeStyle = this.capturer === 'player' ? 
                'rgba(68, 170, 255, 0.8)' : 'rgba(255, 68, 68, 0.8)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // 绘制中心标记
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制图标（菱形）
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 25);
        ctx.lineTo(sx + 18, sy);
        ctx.lineTo(sx, sy + 25);
        ctx.lineTo(sx - 18, sy);
        ctx.closePath();
        ctx.stroke();

        // 绘制占领进度文字
        let statusText = '';
        let textColor = '#fff';
        
        if (this.contested) {
            statusText = '争夺中!';
            textColor = '#ffd700';
        } else if (this.inCombat) {
            statusText = '战斗暂停';
            textColor = '#ffaa00';
        } else if (this.progress > 0 && this.progress < 100) {
            statusText = Math.round(this.progress) + '%';
            textColor = this.capturer === 'player' ? '#44aaff' : '#ff6666';
        } else if (this.owner) {
            statusText = this.owner === 'player' ? '友军占领' : '敌军占领';
            textColor = this.owner === 'player' ? '#44aaff' : '#ff6666';
        } else {
            statusText = '中立';
            textColor = '#aaa';
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(sx - 35, sy - 50, 70, 22);
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(statusText, sx, sy - 39);

        // 已占领标记
        if (this.owner) {
            ctx.fillStyle = this.owner === 'player' ? '#44aaff' : '#ff6666';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.owner === 'player' ? '★ 友军' : '★ 敌军', sx, sy + 40);
        }
        
        // 底部进度条（更明显的显示）
        if (!this.contested && !this.inCombat && this.progress > 0) {
            const barW = 80;
            const barH = 8;
            const bx = sx - barW / 2;
            const by = sy + 55;
            
            // 背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
            
            // 进度
            const progressColor = this.capturer === 'player' ? 
                '#44aaff' : '#ff4444';
            ctx.fillStyle = progressColor;
            ctx.fillRect(bx, by, barW * (this.progress / 100), barH);
            
            // 边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, barW, barH);
        }
    }

    drawMinimap(mctx, scale) {
        const mx = this.x * scale;
        const my = this.y * scale;
        const mr = Math.max(this.radius * scale, 4);
        
        // 占领圈
        let color = 'rgba(200, 200, 200, 0.4)';
        if (this.owner === 'player') color = 'rgba(68, 170, 255, 0.8)';
        else if (this.owner === 'enemy') color = 'rgba(255, 68, 68, 0.8)';
        else if (this.capturer === 'player') color = 'rgba(68, 170, 255, 0.5)';
        else if (this.capturer === 'enemy') color = 'rgba(255, 68, 68, 0.5)';
        
        mctx.strokeStyle = color;
        mctx.lineWidth = 1.5;
        mctx.beginPath();
        mctx.arc(mx, my, mr, 0, Math.PI * 2);
        mctx.stroke();
        
        // 中心点
        mctx.fillStyle = color;
        mctx.beginPath();
        mctx.arc(mx, my, 3, 0, Math.PI * 2);
        mctx.fill();
    }
}

// ==================== 舰船类 ====================
class Ship {
    constructor(x, y, type, team = 'enemy') {
        this.x = x; this.y = y;
        this.type = type;
        this.cfg = SHIP_TYPES[type];
        this.isPlayer = false; // 动态设置
        this.team = team; // 'player' 或 'enemy'
        this.hp = this.cfg.hp;
        this.maxHp = this.cfg.hp;
        this.angle = Math.random() * Math.PI * 2;
        this.turretAngle = this.angle;
        this.speed = 0;
        this.throttle = 0; // -1 to 1
        this.rudder = 0; // -1 to 1
        this.alive = true;
        this.mainGunTimer = 0;
        this.torpedoTimer = 0;
        this.repairCooldown = 0;
        this.sinkTimer = 0;
        this.damageFlash = 0;
        this.wakeParticles = [];
        // AI
        this.aiTarget = null;
        this.aiState = 'patrol';
        this.aiPatrolTarget = { x: x + randRange(-2000, 2000), y: y + randRange(-2000, 2000) };
        this.aiFireDelay = randRange(1, 3);
        this.aiTorpDelay = randRange(5, 15);
        this.aiFormationOffset = { x: randRange(-300, 300), y: randRange(-300, 300) };
    }

    update(dt, game) {
        if (!this.alive) {
            this.sinkTimer += dt;
            return;
        }
        // 冷却
        if (this.mainGunTimer > 0) this.mainGunTimer -= dt;
        if (this.torpedoTimer > 0) this.torpedoTimer -= dt;
        if (this.repairCooldown > 0) this.repairCooldown -= dt;
        if (this.damageFlash > 0) this.damageFlash -= dt;
        // 物理
        const maxSpd = this.cfg.maxSpeed * 0.3; // 像素/帧 尺度
        const targetSpeed = this.throttle * maxSpd;
        this.speed = lerp(this.speed, targetSpeed, this.cfg.acceleration);
        if (Math.abs(this.speed) > 0.2) {
            this.angle += this.rudder * this.cfg.turnSpeed * (this.speed / maxSpd);
        }
        this.angle = normalizeAngle(this.angle);
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        // 边界 - 使用游戏世界大小
        const worldSize = game?.currentMap?.size || 42000;
        this.x = clamp(this.x, 100, worldSize - 100);
        this.y = clamp(this.y, 100, worldSize - 100);
        // 岛屿碰撞
        for (const isl of game.islands) {
            if (isl.collides(this)) {
                const a = angleTo(isl, this);
                const pushDist = isl.radius + this.cfg.width - dist(this, isl);
                this.x += Math.cos(a) * pushDist * 0.5;
                this.y += Math.sin(a) * pushDist * 0.5;
                this.speed *= 0.5;
            }
        }
        // 尾流
        if (Math.abs(this.speed) > 0.5) {
            const wx = this.x - Math.cos(this.angle) * this.cfg.length * 0.5;
            const wy = this.y - Math.sin(this.angle) * this.cfg.length * 0.5;
            game.particles.push(new Particle(
                wx + randRange(-3, 3), wy + randRange(-3, 3),
                -Math.cos(this.angle) * 0.3 + randRange(-0.1, 0.1),
                -Math.sin(this.angle) * 0.3 + randRange(-0.1, 0.1),
                randRange(0.8, 1.5), randRange(2, 5), 'rgba(180, 220, 255, 0.4)'
            ));
        }
        // 炮塔跟随
        if (this.isPlayer) {
            const targetAng = angleTo(this, game.mouseWorld);
            let diff = normalizeAngle(targetAng - this.turretAngle);
            this.turretAngle += diff * 0.1;
            this.turretAngle = normalizeAngle(this.turretAngle);
        }
    }

    fireMainGun(targetAngle, game) {
        if (this.mainGunTimer > 0 || !this.alive) return false;
        this.mainGunTimer = this.cfg.mainGun.reload;
        const gun = this.cfg.mainGun;
        for (let i = 0; i < gun.shells; i++) {
            const spread = (Math.random() - 0.5) * gun.spread;
            const a = targetAngle + spread;
            const ox = this.x + Math.cos(this.angle) * this.cfg.length * 0.35;
            const oy = this.y + Math.sin(this.angle) * this.cfg.length * 0.35;
            game.projectiles.push(new Projectile(ox, oy, a, gun.shellSpeed, gun.range, gun.damage, 'shell', this));
        }
        // 炮口闪光
        for (let i = 0; i < 8; i++) {
            const a = targetAngle + randRange(-0.5, 0.5);
            const spd = randRange(1, 3);
            game.particles.push(new Particle(
                this.x + Math.cos(this.angle) * this.cfg.length * 0.35,
                this.y + Math.sin(this.angle) * this.cfg.length * 0.35,
                Math.cos(a) * spd, Math.sin(a) * spd,
                randRange(0.2, 0.5), randRange(3, 6), '#ffdd44'
            ));
        }
        return true;
    }

    fireTorpedo(targetAngle, game) {
        if (this.torpedoTimer > 0 || !this.alive) return false;
        this.torpedoTimer = this.cfg.torpedo.reload;
        const torp = this.cfg.torpedo;
        const baseAngle = targetAngle;
        for (let i = 0; i < torp.count; i++) {
            const spreadOff = (i - (torp.count - 1) / 2) * torp.spread;
            const a = baseAngle + spreadOff;
            const ox = this.x + Math.cos(this.angle + Math.PI / 2) * 5;
            const oy = this.y + Math.sin(this.angle + Math.PI / 2) * 5;
            game.projectiles.push(new Projectile(ox, oy, a, torp.speed, torp.range, torp.damage, 'torpedo', this));
        }
        return true;
    }

    repair() {
        if (this.repairCooldown > 0 || !this.alive) return;
        this.repairCooldown = 30;
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.15);
    }

    takeDamage(dmg, game) {
        if (!this.alive) return;
        this.hp -= dmg;
        this.damageFlash = 0.15;
        // 伤害数字
        game.floatingTexts.push({
            x: this.x + randRange(-20, 20), y: this.y - 30,
            text: '-' + Math.round(dmg), color: '#ff4444',
            life: 1.2, vy: -1
        });
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            this.sinkTimer = 0;
            // 爆炸特效
            for (let i = 0; i < 30; i++) {
                const a = Math.random() * Math.PI * 2;
                const spd = randRange(1, 5);
                game.particles.push(new Particle(
                    this.x + randRange(-15, 15), this.y + randRange(-15, 15),
                    Math.cos(a) * spd, Math.sin(a) * spd,
                    randRange(0.5, 1.5), randRange(4, 12),
                    Math.random() > 0.5 ? '#ff6622' : '#ffaa22'
                ));
            }
            for (let i = 0; i < 15; i++) {
                const a = Math.random() * Math.PI * 2;
                const spd = randRange(0.5, 2);
                game.particles.push(new Particle(
                    this.x + randRange(-10, 10), this.y + randRange(-10, 10),
                    Math.cos(a) * spd, Math.sin(a) * spd,
                    randRange(1, 3), randRange(8, 20), '#333'
                ));
            }
        }
    }

    draw(ctx, cam) {
        const sx = this.x - cam.x, sy = this.y - cam.y;
        if (sx < -150 || sx > cam.w + 150 || sy < -150 || sy > cam.h + 150) return;

        ctx.save();
        ctx.translate(sx, sy);

        // 沉没动画
        if (!this.alive) {
            const sinkAlpha = clamp(1 - this.sinkTimer / 3, 0, 1);
            ctx.globalAlpha = sinkAlpha;
            ctx.rotate(this.angle + this.sinkTimer * 0.3);
        } else {
            ctx.rotate(this.angle);
        }

        const L = this.cfg.length, W = this.cfg.width;

        // 舰体阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.moveTo(L * 0.5 + 3, 3);
        ctx.lineTo(-L * 0.35 + 3, W * 0.5 + 3);
        ctx.lineTo(-L * 0.5 + 3, W * 0.3 + 3);
        ctx.lineTo(-L * 0.5 + 3, -W * 0.3 + 3);
        ctx.lineTo(-L * 0.35 + 3, -W * 0.5 + 3);
        ctx.closePath();
        ctx.fill();

        // 舰体
        const bodyGrad = ctx.createLinearGradient(0, -W * 0.5, 0, W * 0.5);
        if (this.team === 'player') {
            bodyGrad.addColorStop(0, '#4488aa');
            bodyGrad.addColorStop(0.5, this.cfg.color);
            bodyGrad.addColorStop(1, '#226688');
        } else {
            bodyGrad.addColorStop(0, '#aa4444');
            bodyGrad.addColorStop(0.5, '#883333');
            bodyGrad.addColorStop(1, '#772222');
        }
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(L * 0.5, 0);
        ctx.lineTo(-L * 0.35, W * 0.5);
        ctx.lineTo(-L * 0.5, W * 0.3);
        ctx.lineTo(-L * 0.5, -W * 0.3);
        ctx.lineTo(-L * 0.35, -W * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.team === 'player' ? '#66aadd' : '#cc6666';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 甲板细节
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(-L * 0.2, -W * 0.2, L * 0.3, W * 0.4);

        // 上层建筑
        ctx.fillStyle = this.team === 'player' ? '#5599bb' : '#995555';
        ctx.fillRect(-L * 0.1, -W * 0.22, L * 0.15, W * 0.44);

        // 受伤闪光
        if (this.damageFlash > 0) {
            ctx.fillStyle = `rgba(255, 100, 100, ${this.damageFlash * 3})`;
            ctx.beginPath();
            ctx.moveTo(L * 0.5, 0);
            ctx.lineTo(-L * 0.35, W * 0.5);
            ctx.lineTo(-L * 0.5, W * 0.3);
            ctx.lineTo(-L * 0.5, -W * 0.3);
            ctx.lineTo(-L * 0.35, -W * 0.5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // 炮塔（独立旋转）
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.team === 'player' ? this.cfg.gunColor : '#bb7766';
        ctx.fillRect(0, -2.5, L * 0.3, 5);
        ctx.beginPath();
        ctx.arc(0, 0, W * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 血条（显示所有舰船的血条）
        if (this.alive) {
            const barW = L * 0.8, barH = 4;
            const bx = sx - barW / 2, by = sy - W - 15;
            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
            let hpColor;
            if (this.team === 'player') {
                hpColor = hpRatio > 0.5 ? '#2ecc40' : hpRatio > 0.25 ? '#ffaa00' : '#ff3333';
            } else {
                hpColor = hpRatio > 0.5 ? '#ff6666' : hpRatio > 0.25 ? '#ff8844' : '#ff1111';
            }
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, barW * hpRatio, barH);
        }

        // 名称
        if (this.alive) {
            ctx.fillStyle = this.team === 'player' ? 'rgba(100, 200, 255, 0.9)' : 'rgba(255, 150, 150, 0.9)';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            const label = this.team === 'player' ? (this.isPlayer ? '我' : '友军') + ' ' + this.cfg.name : '敌军 ' + this.cfg.name;
            ctx.fillText(label, sx, sy - W - 20);
        }
    }

    // AI - 强化版
    updateAI(dt, game) {
        if (!this.alive || this.isPlayer) return;

        this.aiFireDelay -= dt;
        this.aiTorpDelay -= dt;

        const hpRatio = this.hp / this.maxHp;
        const enemyTeam = this.team === 'player' ? game.enemies : [...game.allies, game.player].filter(s => s && s.alive);
        const allyTeam = this.team === 'player' ? [...game.allies, game.player].filter(s => s && s.alive) : game.enemies;

        // 寻找最近的敌方目标
        let closestEnemy = null;
        let closestDist = Infinity;
        for (const enemy of enemyTeam) {
            if (!enemy || !enemy.alive) continue;
            const d = dist(this, enemy);
            if (d < closestDist) {
                closestDist = d;
                closestEnemy = enemy;
            }
        }
        this.aiTarget = closestEnemy;

        // 计算分数差距
        const scoreDiff = this.team === 'player' ? 
            (game.playerScore - game.enemyScore) : 
            (game.enemyScore - game.playerScore);
        const isLosing = scoreDiff < -100;
        const isWinning = scoreDiff > 100;

        // 获取占领点信息
        const myTeamCaps = game.capturePoints.filter(cp => cp.owner === this.team).length;
        const enemyCaps = game.capturePoints.filter(cp => cp.owner === (this.team === 'player' ? 'enemy' : 'player')).length;
        const totalCaps = game.capturePoints.length;
        const neutralCaps = game.capturePoints.filter(cp => !cp.owner && !cp.capturer);

        // AI状态决策优先级：
        // 1. 低血量撤退 (HP < 25%)
        // 2. 争夺/防守控制点
        // 3. 追击残血敌人
        // 4. 常规战斗
        // 5. 占领空闲点

        let targetX = null, targetY = null;
        let targetSpeed = 0.2;
        let shouldFire = false;
        let shouldUseTorp = false;

        // 状态1：严重受损，撤退找队友
        if (hpRatio < 0.25) {
            this.aiState = 'retreat';
            // 寻找最近的队友方向撤退
            let nearestAlly = null;
            let nearestAllyDist = Infinity;
            for (const ally of allyTeam) {
                if (ally === this) continue;
                const d = dist(this, ally);
                if (d < nearestAllyDist) {
                    nearestAllyDist = d;
                    nearestAlly = ally;
                }
            }
            if (nearestAlly) {
                targetX = nearestAlly.x;
                targetY = nearestAlly.y;
                targetSpeed = 0.25;
            } else {
                // 没有队友，向出生点撤退
                const spawn = this.team === 'player' ? game.currentMap.spawns.allies[0] : game.currentMap.spawns.enemies[0];
                targetX = spawn.x;
                targetY = spawn.y;
                targetSpeed = 0.25;
            }
        }
        // 状态2：争夺控制点（如果落后或机会好）
        else if (isLosing || (neutralCaps > 0 && !this.aiTarget) || (myTeamCaps < totalCaps * 0.5)) {
            // 寻找最佳占领点
            let bestPoint = null;
            let bestScore = -Infinity;
            
            for (const cp of game.capturePoints) {
                // 计算占领这个点的价值
                let score = 0;
                const d = dist(this, cp);
                
                if (!cp.owner && !cp.capturer) {
                    // 空闲点，价值高
                    score = 100 - d / 100;
                } else if (cp.owner !== this.team && !cp.contested) {
                    // 敌方点但未被争夺
                    score = 80 - d / 100;
                } else if (cp.capturer !== this.team && cp.progress > 50) {
                    // 敌方正在占领，去打断
                    score = 90 - d / 100;
                } else if (cp.owner === this.team && cp.contested) {
                    // 我方点被争夺，防守
                    score = 70 - d / 100;
                }
                
                // 考虑距离惩罚
                score -= d / 200;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestPoint = cp;
                }
            }
            
            if (bestPoint) {
                this.aiState = 'capture';
                targetX = bestPoint.x;
                targetY = bestPoint.y;
                targetSpeed = 0.22;
                
                // 如果在占领范围内且没有敌人，减速占领
                if (dist(this, bestPoint) < bestPoint.radius * 0.8 && !bestPoint.contested) {
                    targetSpeed = 0.05;
                }
            }
        }

        // 如果没有指定目标点，使用默认行为
        if (targetX === null) {
            // 友军AI跟随玩家或寻找目标
            if (this.team === 'player' && !this.aiTarget) {
                if (game.player && game.player.alive) {
                    const targetPX = game.player.x + this.aiFormationOffset.x;
                    const targetPY = game.player.y + this.aiFormationOffset.y;
                    const d = Math.hypot(targetPX - this.x, targetPY - this.y);
                    if (d > 500) {
                        targetX = targetPX;
                        targetY = targetPY;
                        targetSpeed = 0.15;
                    } else {
                        this.throttle = 0.05;
                        this.rudder *= 0.9;
                    }
                }
                this.turretAngle = lerp(this.turretAngle, this.angle, 0.05);
                return;
            }

            if (this.aiTarget && this.aiTarget.alive) {
                const d = dist(this, this.aiTarget);
                const aToTarget = angleTo(this, this.aiTarget);

                // 追击残血敌人（血量低于30%）
                if (this.aiTarget.hp / this.aiTarget.maxHp < 0.3) {
                    this.aiState = 'chase';
                    targetX = this.aiTarget.x;
                    targetY = this.aiTarget.y;
                    targetSpeed = 0.28; // 全速追击
                }
                // 敌人距离远，接近
                else if (d > this.cfg.mainGun.range * 1.5) {
                    this.aiState = 'approach';
                    targetX = this.aiTarget.x;
                    targetY = this.aiTarget.y;
                    targetSpeed = 0.25;
                }
                // 进入战斗距离
                else {
                    this.aiState = 'combat';
                    // 保持最佳战斗距离：战列舰远，驱逐舰近
                    const optimalRange = this.type === 'battleship' ? this.cfg.mainGun.range * 0.9 :
                                        this.type === 'destroyer' ? this.cfg.torpedo.range * 0.7 :
                                        this.cfg.mainGun.range * 0.7;
                    
                    if (d > optimalRange * 1.2) {
                        // 距离太远，接近
                        targetX = this.aiTarget.x;
                        targetY = this.aiTarget.y;
                        targetSpeed = 0.18;
                    } else if (d < optimalRange * 0.6 && this.type !== 'destroyer') {
                        // 距离太近（非驱逐舰），后退保持距离
                        const retreatAngle = aToTarget + Math.PI;
                        targetX = this.x + Math.cos(retreatAngle) * 500;
                        targetY = this.y + Math.sin(retreatAngle) * 500;
                        targetSpeed = 0.15;
                    } else {
                        // 理想距离，保持侧舷
                        const desiredAngle = aToTarget + Math.PI * 0.4;
                        const diff = normalizeAngle(desiredAngle - this.angle);
                        this.rudder = clamp(diff * 2, -1, 1);
                        this.throttle = 0.12;
                        targetSpeed = null; // 使用上面设置的值
                        
                        // 开火决策
                        shouldFire = d < this.cfg.mainGun.range && this.aiFireDelay <= 0;
                        shouldUseTorp = d < this.cfg.torpedo.range * 0.8 && this.aiTorpDelay <= 0;
                        
                        // 更新炮塔角度
                        const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
                        this.turretAngle = lerp(this.turretAngle, leadAngle, 0.08);
                    }
                }
            } else {
                // 巡逻状态 - 寻找最近的中立或敌方控制点
                let nearestTarget = this.aiPatrolTarget;
                let nearestDist = dist(this, nearestTarget);
                
                for (const cp of game.capturePoints) {
                    if (cp.owner !== this.team) {
                        const d = dist(this, cp);
                        if (d < nearestDist) {
                            nearestDist = d;
                            nearestTarget = { x: cp.x, y: cp.y };
                        }
                    }
                }
                
                this.aiPatrolTarget = nearestTarget;
                targetX = this.aiPatrolTarget.x;
                targetY = this.aiPatrolTarget.y;
                targetSpeed = 0.15;
            }
        }

        // 执行移动
        if (targetX !== null && targetY !== null) {
            const aToTarget = angleTo(this, { x: targetX, y: targetY });
            const diff = normalizeAngle(aToTarget - this.angle);
            this.rudder = clamp(diff * 3, -1, 1);
            this.throttle = targetSpeed;
            
            // 炮塔转向目标
            if (this.aiTarget && this.aiTarget.alive) {
                const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
                this.turretAngle = lerp(this.turretAngle, leadAngle, 0.08);
            } else {
                this.turretAngle = lerp(this.turretAngle, this.angle, 0.05);
            }
        }

        // 执行开火
        if (shouldFire) {
            const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
            this.fireMainGun(leadAngle, game);
            this.aiFireDelay = randRange(1.0, 3.0); // 更快射击
        }
        
        if (shouldUseTorp) {
            const leadAngle = this.predictLead(this.aiTarget, this.cfg.torpedo.speed);
            this.fireTorpedo(leadAngle, game);
            this.aiTorpDelay = randRange(8, 20); // 更快发射鱼雷
        }
    }

    predictLead(target, projSpeed) {
        const d = dist(this, target);
        const t = d / (projSpeed * 60); // 预判时间
        const px = target.x + Math.cos(target.angle) * target.speed * 60 * t;
        const py = target.y + Math.sin(target.angle) * target.speed * 60 * t;
        return angleTo(this, { x: px, y: py });
    }
}

// ==================== 主游戏 ====================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniCanvas = document.getElementById('minimapCanvas');
        this.miniCtx = this.miniCanvas.getContext('2d');

        // 相机先初始化
        this.cam = { x: 0, y: 0, w: 0, h: 0 };
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 状态
        this.running = false;
        this.playerIndex = 0; // 玩家控制的舰船索引
        this.allies = []; // 友军（包含玩家控制的船）
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.islands = [];
        this.capturePoints = []; // 占领点
        this.kills = 0;
        this.allyKills = 0;
        this.enemyKills = 0;
        this.totalDamage = 0;
        this.gameTime = 0;
        this.maxGameTime = 15 * 60; // 15分钟游戏时间
        this.playerScore = 0; // 友军团队分数
        this.enemyScore = 0; // 敌军团队分数
        this.waveOffset = 0;
        this.selectedType = 'cruiser';
        this.selectedMap = 'islands'; // 默认地图
        this.currentMap = null;

        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.mouseWorld = { x: 0, y: 0 };

        this.setupInput();
        this.setupUI();

        // 海浪纹理偏移
        this.waveTime = 0;
    }

    // 获取当前玩家控制的船
    getPlayer() {
        if (this.allies.length === 0) return null;
        return this.allies[this.playerIndex] || this.allies[0];
    }

    // 切换到指定舰船
    switchToShip(index) {
        if (index < 0 || index >= this.allies.length) return false;
        const oldPlayer = this.getPlayer();
        if (oldPlayer) {
            oldPlayer.isPlayer = false;
            oldPlayer.throttle = 0;
            oldPlayer.rudder = 0;
        }
        this.playerIndex = index;
        const newPlayer = this.getPlayer();
        if (newPlayer && newPlayer.alive) {
            newPlayer.isPlayer = true;
            return true;
        }
        return false;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cam.w = this.canvas.width;
        this.cam.h = this.canvas.height;
    }

    setupInput() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
            
            // 0-9切换舰船
            if (e.key >= '0' && e.key <= '9') {
                const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
                if (this.running) {
                    this.switchToShip(index);
                }
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
        });
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.mouseWorld.x = e.clientX + this.cam.x;
            this.mouseWorld.y = e.clientY + this.cam.y;
            const ch = document.getElementById('crosshair');
            ch.style.left = e.clientX + 'px';
            ch.style.top = e.clientY + 'px';
        });
        this.canvas.addEventListener('mousedown', e => {
            const player = this.getPlayer();
            if (!this.running || !player || !player.alive) return;
            e.preventDefault();
            if (e.button === 0) {
                player.fireMainGun(player.turretAngle, this);
            } else if (e.button === 2) {
                player.fireTorpedo(player.turretAngle, this);
            }
        });
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    setupUI() {
        // 舰种选择
        document.querySelectorAll('.ship-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ship-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedType = btn.dataset.type;
            });
        });
        // 地图选择
        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedMap = btn.dataset.map;
                // 更新地图描述
                const mapConfig = MAPS[this.selectedMap];
                const descEl = document.querySelector('.map-desc');
                if (descEl && mapConfig) {
                    descEl.textContent = mapConfig.description + ` (${mapConfig.teamSize.allies}v${mapConfig.teamSize.enemies})`;
                }
            });
        });
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('ally-panel').style.display = 'none';
        document.getElementById('enemy-panel').style.display = 'none';
        });
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('crosshair').style.display = 'block';
        document.getElementById('scoreboard').style.display = 'flex';
        document.getElementById('ally-panel').style.display = 'flex';
        document.getElementById('enemy-panel').style.display = 'flex';

        // 重置
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.kills = 0;
        this.allyKills = 0;
        this.enemyKills = 0;
        this.totalDamage = 0;
        this.gameTime = 0;
        this.playerScore = 0; // 友军团队分数
        this.enemyScore = 0; // 敌军团队分数

        // 加载地图配置
        this.currentMap = MAPS[this.selectedMap] || MAPS.islands;
        const mapConfig = this.currentMap;
        const worldSize = mapConfig.size;

        // 生成岛屿 - 根据地图配置
        this.islands = [];
        const islandCount = mapConfig.islands || 12;
        for (let i = 0; i < islandCount; i++) {
            const isl = new Island(
                randRange(500, worldSize - 500),
                randRange(500, worldSize - 500),
                randRange(300, 900),
                this.selectedMap
            );
            // 避免在出生点附近
            let ok = true;
            for (const spawn of [...mapConfig.spawns.allies, ...mapConfig.spawns.enemies]) {
                if (dist(isl, spawn) < 1500) ok = false;
            }
            for (const other of this.islands) {
                if (dist(isl, other) < isl.radius + other.radius + 500) ok = false;
            }
            if (ok) this.islands.push(isl);
        }

        // 生成占领点 - 范围扩大2倍(4800)，鼓励争夺
        this.capturePoints = [];
        const capturePointsConfig = mapConfig.capturePoints || [];
        for (const cp of capturePointsConfig) {
            this.capturePoints.push(new CapturePoint(cp.x, cp.y, 4800, 60));
        }

        // 玩家出生点
        const playerSpawn = mapConfig.spawns.allies[0];
        const playerShip = new Ship(playerSpawn.x, playerSpawn.y, this.selectedType, 'player');
        playerShip.isPlayer = true;
        playerShip.angle = Math.PI / 2;

        // 生成友军（包含玩家共10艘）
        this.allies = [playerShip];
        this.playerIndex = 0;
        const allyCount = mapConfig.teamSize.allies - 1; // 剩余9艘
        const allyTypes = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'battleship', 'destroyer', 'cruiser', 'battleship', 'destroyer'];
        for (let i = 0; i < allyCount; i++) {
            const spawn = mapConfig.spawns.allies[(i + 1) % mapConfig.spawns.allies.length];
            const offsetX = randRange(-800, 800);
            const offsetY = randRange(-800, 800);
            const type = allyTypes[i % allyTypes.length];
            const ally = new Ship(spawn.x + offsetX, spawn.y + offsetY, type, 'player');
            ally.angle = Math.PI / 2;
            this.allies.push(ally);
        }

        // 生成敌军
        this.enemies = [];
        const enemyCount = mapConfig.teamSize.enemies;
        const enemyTypes = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'cruiser', 'battleship', 'destroyer'];
        for (let i = 0; i < enemyCount; i++) {
            const spawn = mapConfig.spawns.enemies[i % mapConfig.spawns.enemies.length];
            const offsetX = randRange(-1000, 1000);
            const offsetY = randRange(-1000, 1000);
            const type = enemyTypes[i % enemyTypes.length];
            const enemy = new Ship(spawn.x + offsetX, spawn.y + offsetY, type, 'enemy');
            enemy.angle = -Math.PI / 2; // 朝向左侧（我方）
            this.enemies.push(enemy);
        }

        this.running = true;
        if (!this._loopStarted) {
            this._loopStarted = true;
            this.lastTime = performance.now();
            requestAnimationFrame(t => this.loop(t));
        }
    }

    spawnEnemy() {
        // 这个方法现在只在需要补充敌舰时使用
        const worldSize = this.currentMap?.size || 42000;
        let x, y, attempts = 0;
        do {
            x = randRange(500, worldSize - 500);
            y = randRange(500, worldSize - 500);
            attempts++;
        } while (dist({ x, y }, this.getPlayer() || { x: worldSize / 2, y: worldSize / 2 }) < 1500 && attempts < 50);

        const type = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'cruiser', 'battleship', 'destroyer'][Math.floor(Math.random() * 7)];
        const enemy = new Ship(x, y, type, 'enemy');
        this.enemies.push(enemy);
    }

    loop(now) {
        requestAnimationFrame(t => this.loop(t));
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        if (!this.running) return;

        this.gameTime += dt;
        this.waveTime += dt;
        this.update(dt);
        this.render();
    }

    update(dt) {
        // 玩家输入
        const currentPlayer = this.getPlayer();
        if (currentPlayer && currentPlayer.alive) {
            const p = currentPlayer;
            // 油门
            if (this.keys['w']) p.throttle = Math.min(p.throttle + dt * 1.5, 1);
            else if (this.keys['s']) p.throttle = Math.max(p.throttle - dt * 1.5, -0.4);
            else p.throttle *= 0.995;
            // 方向
            if (this.keys['a']) p.rudder = -1;
            else if (this.keys['d']) p.rudder = 1;
            else p.rudder *= 0.85;
            // 急刹
            if (this.keys[' ']) p.throttle *= 0.95;
            // 维修
            if (this.keys['r']) p.repair();

            p.update(dt, this);

            // 相机跟随
            const targetCx = p.x - this.cam.w / 2;
            const targetCy = p.y - this.cam.h / 2;
            this.cam.x = lerp(this.cam.x, targetCx, 0.08);
            this.cam.y = lerp(this.cam.y, targetCy, 0.08);

            // 鼠标世界坐标
            this.mouseWorld.x = this.mouse.x + this.cam.x;
            this.mouseWorld.y = this.mouse.y + this.cam.y;
        }

        // 友军AI更新（跳过玩家控制的船）
        for (const ally of this.allies) {
            ally.update(dt, this);
            if (!ally.isPlayer) {
                ally.updateAI(dt, this);
            }
        }

        // 敌人
        for (const e of this.enemies) {
            e.update(dt, this);
            e.updateAI(dt, this);
        }

        // 弹药
        for (const proj of this.projectiles) {
            proj.update(dt, this);
            if (!proj.alive) continue;

            // 碰撞检测 - 根据团队判断目标
            let targets = [];
            if (proj.owner.team === 'player') {
                targets = this.enemies.filter(e => e && e.alive);
            } else {
                targets = [...this.allies.filter(a => a && a.alive), this.getPlayer()].filter(s => s && s.alive);
            }
            for (const t of targets) {
                if (!t || !t.alive) continue;
                if (dist(proj, t) < t.cfg.width + 8) {
                    t.takeDamage(proj.damage, this);
                    if (proj.owner.team === 'player' && proj.owner.isPlayer) {
                        this.totalDamage += proj.damage;
                    }
                    proj.alive = false;
                    // 命中特效
                    for (let i = 0; i < 8; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const spd = randRange(1, 3);
                        this.particles.push(new Particle(
                            proj.x, proj.y,
                            Math.cos(a) * spd, Math.sin(a) * spd,
                            randRange(0.3, 0.6), randRange(3, 7),
                            proj.type === 'torpedo' ? '#80ffb0' : '#ffaa44'
                        ));
                    }
                    // 检查占领点范围内的战斗
                    for (const cp of this.capturePoints) {
                        if (dist(proj, cp) < cp.radius && t.team !== proj.owner.team) {
                            cp.onAttacked();
                        }
                    }
                    // 检查击杀并计分
                    if (!t.alive) {
                        // 根据舰种给予分数
                        const shipPoints = {
                            destroyer: 40,
                            cruiser: 60,
                            battleship: 80
                        };
                        const points = shipPoints[t.type] || 40;
                        
                        if (t.team === 'enemy') {
                            this.kills++;
                            if (!proj.owner.isPlayer) this.allyKills++;
                            this.playerScore += points; // 友军得分
                        } else {
                            this.enemyKills++;
                            this.enemyScore += points; // 敌军得分
                        }
                        
                        const label = t.team === 'enemy' ? '击沉敌军 ' : '友军 ';
                        const color = t.team === 'enemy' ? '#ffd700' : '#ff6666';
                        this.floatingTexts.push({
                            x: t.x, y: t.y - 60,
                            text: '+' + points + '分', color: '#ffffff',
                            life: 1.5, vy: -1
                        });
                        this.floatingTexts.push({
                            x: t.x, y: t.y - 40,
                            text: label + t.cfg.name + '!', color: color,
                            life: 2.5, vy: -0.8
                        });
                    }
                    break;
                }
            }

            // 岛屿碰撞
            for (const isl of this.islands) {
                if (dist(proj, isl) < isl.radius) {
                    proj.alive = false;
                    for (let i = 0; i < 3; i++) {
                        this.particles.push(new Particle(
                            proj.x, proj.y,
                            randRange(-1, 1), randRange(-1, 1),
                            0.3, randRange(2, 4), '#aaa'
                        ));
                    }
                }
            }
        }

        // 清理弹药
        this.projectiles = this.projectiles.filter(p => p.alive);

        // 粒子
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.life > 0);

        // 浮动文字
        this.floatingTexts.forEach(ft => {
            ft.y += ft.vy;
            ft.life -= dt;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

        // 清理已沉没的舰船
        this.allies = this.allies.filter(a => a.alive || a.sinkTimer < 3);
        this.enemies = this.enemies.filter(e => e.alive || e.sinkTimer < 3);

        // 更新占领点并计算占领分数
        const playerCaps = this.capturePoints.filter(cp => cp.owner === 'player').length;
        const enemyCaps = this.capturePoints.filter(cp => cp.owner === 'enemy').length;
        const totalCaps = this.capturePoints.length;
        
        for (const cp of this.capturePoints) {
            cp.update(dt, this);
        }
        
        // 占领点产出分数：每个占领点每秒1.5分（降低产出，鼓励争夺）
        const pointsPerCap = 1.5 * dt;
        this.playerScore += playerCaps * pointsPerCap;
        this.enemyScore += enemyCaps * pointsPerCap;
        
        // 更新计分板UI
        document.getElementById('player-score').textContent = Math.floor(this.playerScore);
        document.getElementById('enemy-score').textContent = Math.floor(this.enemyScore);
        document.getElementById('player-caps').textContent = playerCaps + '▼';
        document.getElementById('enemy-caps').textContent = enemyCaps + '▼';
        
        // 更新倒计时
        const timeLeft = Math.max(0, this.maxGameTime - this.gameTime);
        const mins = Math.floor(timeLeft / 60);
        const secs = Math.floor(timeLeft % 60);
        document.getElementById('game-timer').textContent = 
            mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');

        // 更新舰队面板
        this.updateFleetPanels();

        // 游戏结束判定
        const aliveAllies = this.allies.filter(a => a.alive).length;
        const aliveEnemies = this.enemies.filter(e => e.alive).length;
        
        // 检查游戏结束条件
        const endGamePlayer = this.getPlayer();
        if (endGamePlayer && !endGamePlayer.alive && endGamePlayer.sinkTimer > 2 && aliveAllies === 0) {
            // 玩家和友军全部阵亡
            this.endGame(false, playerCaps, enemyCaps);
        } else if (aliveEnemies === 0 && this.enemies.length > 0) {
            // 敌军全灭
            this.endGame(true, playerCaps, enemyCaps);
        } else if (endGamePlayer && !endGamePlayer.alive && aliveAllies === 0) {
            // 我方全灭
            this.endGame(false, playerCaps, enemyCaps);
        } else if (this.playerScore >= 1000) {
            // 先达到1000分获胜
            this.endGame(true, playerCaps, enemyCaps);
        } else if (this.enemyScore >= 1000) {
            // 敌方先达到1000分
            this.endGame(false, playerCaps, enemyCaps);
        } else if (this.gameTime >= this.maxGameTime) {
            // 时间到，分数高的获胜
            this.endGame(this.playerScore > this.enemyScore, playerCaps, enemyCaps);
        }
    }

    updateHUD() {
        const player = this.getPlayer();
        if (!player) return;
        const p = player;
        const hpRatio = p.hp / p.maxHp;
        const hpBar = document.getElementById('hp-bar');
        hpBar.style.width = (hpRatio * 100) + '%';
        if (hpRatio > 0.5) hpBar.style.background = 'linear-gradient(90deg, #2ecc40, #4cff72)';
        else if (hpRatio > 0.25) hpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc44)';
        else hpBar.style.background = 'linear-gradient(90deg, #ff3333, #ff6644)';
        document.getElementById('hp-text').textContent = Math.round(p.hp) + ' / ' + p.maxHp;

        const gunReload = p.mainGunTimer > 0 ? p.mainGunTimer.toFixed(1) + 's' : '就绪';
        const torpReload = p.torpedoTimer > 0 ? p.torpedoTimer.toFixed(1) + 's' : '就绪';
        document.getElementById('weapon-name').textContent = '主炮 | 鱼雷';
        document.getElementById('reload-status').textContent = gunReload + ' | ' + torpReload;
        const reloadEl = document.getElementById('reload-status');
        reloadEl.style.color = (p.mainGunTimer <= 0) ? '#4cff72' : '#ffaa44';

        document.getElementById('speed-val').textContent = Math.abs(Math.round(p.speed / (p.cfg.maxSpeed * 0.3) * p.cfg.maxSpeed));
        document.getElementById('score-val').textContent = this.kills;
    }

    // 更新舰队面板
    updateFleetPanels() {
        this.updateAllyPanel();
        this.updateEnemyPanel();
    }

    // 更新友军面板
    updateAllyPanel() {
        const panel = document.getElementById('ally-ships-list');
        if (!panel) return;

        // 初始化面板内容（第一次）
        if (panel.children.length !== this.allies.length) {
            panel.innerHTML = '';
            this.allies.forEach((ally, index) => {
                const item = document.createElement('div');
                item.className = 'ship-item';
                item.dataset.index = index;
                item.innerHTML = `
                    <div class="ship-icon">${this.getShipIcon(ally.type)}</div>
                    <div class="ship-info">
                        <div class="ship-name">${ally.cfg.name}</div>
                        <div class="ship-status">${ally.alive ? '正常' : '已沉没'}</div>
                        <div class="ship-hp-bar"><div class="ship-hp-fill" style="width: ${(ally.hp / ally.maxHp * 100)}%"></div></div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    if (ally.alive) this.switchToShip(index);
                });
                panel.appendChild(item);
            });
        }

        // 更新现有项
        Array.from(panel.children).forEach((item, index) => {
            const ally = this.allies[index];
            if (!ally) return;

            // 更新激活状态
            item.classList.toggle('active', ally.isPlayer);
            item.classList.toggle('destroyed', !ally.alive);

            // 更新状态文字
            const statusEl = item.querySelector('.ship-status');
            if (statusEl) {
                if (!ally.alive) {
                    statusEl.textContent = '已沉没';
                } else if (ally.isPlayer) {
                    statusEl.textContent = '控制中';
                } else {
                    statusEl.textContent = 'AI控制';
                }
            }

            // 更新血条
            const hpFill = item.querySelector('.ship-hp-fill');
            if (hpFill) {
                const hpPercent = ally.hp / ally.maxHp * 100;
                hpFill.style.width = hpPercent + '%';
                hpFill.classList.remove('low', 'critical');
                if (hpPercent < 25) hpFill.classList.add('critical');
                else if (hpPercent < 50) hpFill.classList.add('low');
            }
        });
    }

    // 更新敌军面板
    updateEnemyPanel() {
        const panel = document.getElementById('enemy-ships-list');
        if (!panel) return;

        // 初始化面板内容
        if (panel.children.length !== this.enemies.length) {
            panel.innerHTML = '';
            this.enemies.forEach((enemy, index) => {
                const item = document.createElement('div');
                item.className = 'ship-item';
                item.innerHTML = `
                    <div class="ship-icon">${this.getShipIcon(enemy.type)}</div>
                    <div class="ship-info">
                        <div class="ship-name">${enemy.cfg.name}</div>
                        <div class="ship-status">${enemy.alive ? '正常' : '已沉没'}</div>
                        <div class="ship-hp-bar"><div class="ship-hp-fill" style="width: ${(enemy.hp / enemy.maxHp * 100)}%"></div></div>
                    </div>
                `;
                panel.appendChild(item);
            });
        }

        // 更新现有项
        Array.from(panel.children).forEach((item, index) => {
            const enemy = this.enemies[index];
            if (!enemy) return;

            item.classList.toggle('destroyed', !enemy.alive);

            // 更新状态文字
            const statusEl = item.querySelector('.ship-status');
            if (statusEl) {
                statusEl.textContent = enemy.alive ? '正常' : '已沉没';
            }

            // 更新血条
            const hpFill = item.querySelector('.ship-hp-fill');
            if (hpFill) {
                hpFill.style.width = (enemy.hp / enemy.maxHp * 100) + '%';
            }
        });
    }

    // 获取舰船图标
    getShipIcon(type) {
        const icons = { destroyer: 'DD', cruiser: 'CA', battleship: 'BB' };
        return icons[type] || '?';
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;

        // 清空
        ctx.fillStyle = '#0a1830';
        ctx.fillRect(0, 0, W, H);

        // 海洋
        this.drawOcean(ctx);

        // 网格
        this.drawGrid(ctx);

        // 岛屿
        for (const isl of this.islands) isl.draw(ctx, this.cam, this.currentMap);

        // 占领点
        for (const cp of this.capturePoints) cp.draw(ctx, this.cam);

        // 粒子（底层）
        this.particles.forEach(p => p.draw(ctx, this.cam));

        // 弹药
        for (const proj of this.projectiles) proj.draw(ctx, this.cam);

        // 友军（在敌人之前绘制，敌人会显示在上方）
        for (const ally of this.allies) ally.draw(ctx, this.cam);

        // 敌军
        for (const e of this.enemies) e.draw(ctx, this.cam);

        // 玩家（始终在最上层）
        const renderPlayer = this.getPlayer();
        if (renderPlayer) renderPlayer.draw(ctx, this.cam);

        // 浮动文字
        for (const ft of this.floatingTexts) {
            const sx = ft.x - this.cam.x, sy = ft.y - this.cam.y;
            ctx.globalAlpha = clamp(ft.life, 0, 1);
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, sx, sy);
            ctx.globalAlpha = 1;
        }

        // 射程圈和受伤红框
        const rangePlayer = this.getPlayer();
        if (rangePlayer && rangePlayer.alive) {
            const sx = rangePlayer.x - this.cam.x;
            const sy = rangePlayer.y - this.cam.y;
            ctx.strokeStyle = 'rgba(100, 180, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(sx, sy, rangePlayer.cfg.mainGun.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 小地图
        this.drawMinimap();

        // 玩家受伤红框
        if (rangePlayer && rangePlayer.damageFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${rangePlayer.damageFlash * 0.5})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    drawOcean(ctx) {
        const W = this.canvas.width, H = this.canvas.height;
        const mapColors = this.currentMap?.colors || { water: '#0c1e3a', deepWater: '#0a1628' };
        // 动态海面效果 - 根据地图类型调整颜色
        const t = this.waveTime * 0.5;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, mapColors.water || '#0c1e3a');
        grad.addColorStop(1, mapColors.deepWater || '#0a1628');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 波纹
        ctx.strokeStyle = this.currentMap?.iceMode ? 'rgba(200, 220, 255, 0.08)' : 'rgba(60, 120, 180, 0.06)';
        ctx.lineWidth = 1;
        const spacing = 60;
        const offX = this.cam.x % spacing;
        const offY = this.cam.y % spacing;
        for (let y = -spacing; y < H + spacing; y += spacing) {
            ctx.beginPath();
            for (let x = -spacing; x < W + spacing; x += 10) {
                const wx = x + Math.sin((y + this.cam.y) * 0.005 + t) * 15;
                const wy = y - offY + Math.sin((x + this.cam.x) * 0.004 + t * 0.7) * 8;
                if (x === -spacing) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
        }
    }

    drawGrid(ctx) {
        const gridSize = 200;
        const startX = Math.floor(this.cam.x / gridSize) * gridSize;
        const startY = Math.floor(this.cam.y / gridSize) * gridSize;

        ctx.strokeStyle = 'rgba(60, 100, 150, 0.08)';
        ctx.lineWidth = 1;

        for (let x = startX; x < this.cam.x + this.cam.w + gridSize; x += gridSize) {
            const sx = x - this.cam.x;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, this.cam.h);
            ctx.stroke();
        }
        for (let y = startY; y < this.cam.y + this.cam.h + gridSize; y += gridSize) {
            const sy = y - this.cam.y;
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(this.cam.w, sy);
            ctx.stroke();
        }

        // 世界边界
        const worldSize = this.currentMap?.size || 42000;
        ctx.strokeStyle = 'rgba(255, 80, 80, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.cam.x, -this.cam.y, worldSize, worldSize);
    }

    drawMinimap() {
        const mctx = this.miniCtx;
        const mw = 180, mh = 180;
        const worldSize = this.currentMap?.size || 42000;
        const scale = mw / worldSize;

        mctx.fillStyle = this.currentMap?.colors?.deepWater || '#0a1830';
        mctx.fillRect(0, 0, mw, mh);

        // 网格
        mctx.strokeStyle = 'rgba(60, 100, 150, 0.15)';
        mctx.lineWidth = 0.5;
        for (let i = 0; i < worldSize; i += 5000) {
            const p = i * scale;
            mctx.beginPath(); mctx.moveTo(p, 0); mctx.lineTo(p, mh); mctx.stroke();
            mctx.beginPath(); mctx.moveTo(0, p); mctx.lineTo(mw, p); mctx.stroke();
        }

        // 岛屿
        mctx.fillStyle = this.currentMap?.colors?.island ? this.darkenColor(this.currentMap.colors.island, 10) : '#3a5a22';
        for (const isl of this.islands) {
            mctx.beginPath();
            mctx.arc(isl.x * scale, isl.y * scale, Math.max(isl.radius * scale, 2), 0, Math.PI * 2);
            mctx.fill();
        }

        // 占领点
        for (const cp of this.capturePoints) {
            const mx = cp.x * scale;
            const my = cp.y * scale;
            const mr = Math.max(cp.radius * scale, 4);
            
            let color = 'rgba(200, 200, 200, 0.4)';
            if (cp.owner === 'player') color = 'rgba(68, 170, 255, 0.8)';
            else if (cp.owner === 'enemy') color = 'rgba(255, 68, 68, 0.8)';
            else if (cp.capturer === 'player') color = 'rgba(68, 170, 255, 0.5)';
            else if (cp.capturer === 'enemy') color = 'rgba(255, 68, 68, 0.5)';
            
            mctx.strokeStyle = color;
            mctx.lineWidth = 1.5;
            mctx.beginPath();
            mctx.arc(mx, my, mr, 0, Math.PI * 2);
            mctx.stroke();
            
            mctx.fillStyle = color;
            mctx.beginPath();
            mctx.arc(mx, my, 3, 0, Math.PI * 2);
            mctx.fill();
        }

        // 视野框
        mctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        mctx.lineWidth = 1;
        mctx.strokeRect(
            this.cam.x * scale, this.cam.y * scale,
            this.cam.w * scale, this.cam.h * scale
        );

        // 友军
        mctx.fillStyle = '#44aaff';
        for (const ally of this.allies) {
            if (!ally.alive) continue;
            mctx.beginPath();
            mctx.arc(ally.x * scale, ally.y * scale, 2, 0, Math.PI * 2);
            mctx.fill();
        }

        // 敌舰
        mctx.fillStyle = '#ff4444';
        for (const e of this.enemies) {
            if (!e.alive) continue;
            mctx.beginPath();
            mctx.arc(e.x * scale, e.y * scale, 2.5, 0, Math.PI * 2);
            mctx.fill();
        }

        // 玩家
        const miniPlayer = this.getPlayer();
        if (miniPlayer && miniPlayer.alive) {
            mctx.fillStyle = '#4cff72';
            mctx.beginPath();
            mctx.arc(miniPlayer.x * scale, miniPlayer.y * scale, 3, 0, Math.PI * 2);
            mctx.fill();
            // 朝向
            mctx.strokeStyle = '#4cff72';
            mctx.lineWidth = 1;
            mctx.beginPath();
            mctx.moveTo(miniPlayer.x * scale, miniPlayer.y * scale);
            mctx.lineTo(
                (miniPlayer.x + Math.cos(miniPlayer.angle) * 400) * scale,
                (miniPlayer.y + Math.sin(miniPlayer.angle) * 400) * scale
            );
            mctx.stroke();
        }
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    endGame(victory, playerCaps = 0, enemyCaps = 0) {
        this.running = false;
        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('end-screen').classList.remove('hidden');
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        const totalCaps = this.capturePoints.length;
        document.getElementById('end-title').textContent = victory ? '战斗胜利！' : '战斗失败';
        
        let endText = `最终比分: ${Math.floor(this.playerScore)} : ${Math.floor(this.enemyScore)}<br>`;
        endText += `战斗时长: ${mins}分${secs}秒<br>`;
        if (totalCaps > 0) {
            endText += `占领点数: ${playerCaps} : ${enemyCaps}<br>`;
        }
        endText += `玩家击沉: ${this.kills} 艘 | 友军击沉: ${this.allyKills} 艘<br>`;
        endText += `损失友军: ${this.enemyKills} 艘<br>`;
        endText += `总伤害: ${Math.round(this.totalDamage).toLocaleString()}`;
        
        document.getElementById('end-stats').innerHTML = endText;
    }
}

// ==================== 启动 ====================
window.addEventListener('load', () => {
    new Game();
});
