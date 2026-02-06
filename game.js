// ==================== 配置 ====================
const WORLD_SIZE = 4000;
const SHIP_TYPES = {
    destroyer: {
        name: '驱逐舰', hp: 12000, maxSpeed: 38, acceleration: 0.06, turnSpeed: 0.035,
        length: 50, width: 10, color: '#5599dd', gunColor: '#88bbee',
        mainGun: { damage: 800, reload: 3, range: 500, shells: 4, spread: 0.04, shellSpeed: 12 },
        torpedo: { damage: 4000, reload: 15, range: 600, count: 4, speed: 6, spread: 0.12 }
    },
    cruiser: {
        name: '巡洋舰', hp: 25000, maxSpeed: 32, acceleration: 0.04, turnSpeed: 0.025,
        length: 70, width: 14, color: '#4488cc', gunColor: '#77aadd',
        mainGun: { damage: 1200, reload: 5, range: 650, shells: 6, spread: 0.03, shellSpeed: 11 },
        torpedo: { damage: 5000, reload: 20, range: 500, count: 3, speed: 5.5, spread: 0.1 }
    },
    battleship: {
        name: '战列舰', hp: 55000, maxSpeed: 24, acceleration: 0.025, turnSpeed: 0.015,
        length: 100, width: 22, color: '#3366aa', gunColor: '#6699cc',
        mainGun: { damage: 3500, reload: 10, range: 800, shells: 9, spread: 0.025, shellSpeed: 10 },
        torpedo: { damage: 4500, reload: 25, range: 400, count: 2, speed: 5, spread: 0.08 }
    }
};

const ENEMY_TYPES = ['destroyer', 'cruiser', 'battleship'];
const INITIAL_ENEMIES = 6;

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
    update(dt) {
        const dx = this.vx * dt * 60, dy = this.vy * dt * 60;
        this.x += dx; this.y += dy;
        this.traveled += Math.hypot(dx, dy);
        if (this.traveled >= this.range) this.alive = false;
        if (this.x < 0 || this.x > WORLD_SIZE || this.y < 0 || this.y > WORLD_SIZE) this.alive = false;
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
    constructor() {
        this.x = randRange(300, WORLD_SIZE - 300);
        this.y = randRange(300, WORLD_SIZE - 300);
        this.radius = randRange(40, 120);
        this.points = [];
        const n = Math.floor(randRange(6, 12));
        for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const r = this.radius * randRange(0.7, 1.0);
            this.points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
    }
    draw(ctx, cam) {
        const sx = this.x - cam.x, sy = this.y - cam.y;
        // 阴影
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.moveTo(sx + this.points[0].x + 4, sy + this.points[0].y + 4);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(sx + this.points[i].x + 4, sy + this.points[i].y + 4);
        }
        ctx.closePath();
        ctx.fill();
        // 岛屿
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius);
        grad.addColorStop(0, '#5a7a3a');
        grad.addColorStop(0.7, '#4a6a2e');
        grad.addColorStop(1, '#3a5a22');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx + this.points[0].x, sy + this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(sx + this.points[i].x, sy + this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#6a8a44';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    collides(ship) {
        return dist(this, ship) < this.radius + ship.cfg.width;
    }
}

// ==================== 舰船类 ====================
class Ship {
    constructor(x, y, type, isPlayer = false) {
        this.x = x; this.y = y;
        this.type = type;
        this.cfg = SHIP_TYPES[type];
        this.isPlayer = isPlayer;
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
        this.aiPatrolTarget = { x: randRange(200, WORLD_SIZE - 200), y: randRange(200, WORLD_SIZE - 200) };
        this.aiFireDelay = randRange(1, 3);
        this.aiTorpDelay = randRange(5, 15);
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
        // 边界
        this.x = clamp(this.x, 50, WORLD_SIZE - 50);
        this.y = clamp(this.y, 50, WORLD_SIZE - 50);
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
        bodyGrad.addColorStop(0, this.isPlayer ? '#5588cc' : '#aa4444');
        bodyGrad.addColorStop(0.5, this.isPlayer ? this.cfg.color : '#883333');
        bodyGrad.addColorStop(1, this.isPlayer ? '#3366aa' : '#772222');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(L * 0.5, 0);
        ctx.lineTo(-L * 0.35, W * 0.5);
        ctx.lineTo(-L * 0.5, W * 0.3);
        ctx.lineTo(-L * 0.5, -W * 0.3);
        ctx.lineTo(-L * 0.35, -W * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.isPlayer ? '#88bbee' : '#cc6666';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 甲板细节
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(-L * 0.2, -W * 0.2, L * 0.3, W * 0.4);

        // 上层建筑
        ctx.fillStyle = this.isPlayer ? '#6699cc' : '#995555';
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
        ctx.fillStyle = this.isPlayer ? this.cfg.gunColor : '#bb7766';
        ctx.fillRect(0, -2.5, L * 0.3, 5);
        ctx.beginPath();
        ctx.arc(0, 0, W * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 血条（非玩家或受伤时显示）
        if (this.alive && (!this.isPlayer || this.hp < this.maxHp)) {
            const barW = L * 0.8, barH = 4;
            const bx = sx - barW / 2, by = sy - W - 10;
            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
            const hpColor = hpRatio > 0.5 ? '#2ecc40' : hpRatio > 0.25 ? '#ffaa00' : '#ff3333';
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, barW * hpRatio, barH);
        }

        // 名称
        if (this.alive && !this.isPlayer) {
            ctx.fillStyle = 'rgba(255,200,200,0.7)';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.cfg.name, sx, sy - W - 16);
        }
    }

    // AI
    updateAI(dt, game) {
        if (!this.alive || this.isPlayer) return;

        this.aiFireDelay -= dt;
        this.aiTorpDelay -= dt;

        // 选择目标
        if (!this.aiTarget || !this.aiTarget.alive) {
            this.aiTarget = game.player.alive ? game.player : null;
        }

        if (this.aiTarget && this.aiTarget.alive) {
            const d = dist(this, this.aiTarget);
            const aToTarget = angleTo(this, this.aiTarget);

            if (d < this.cfg.mainGun.range * 1.2) {
                this.aiState = 'combat';
            } else {
                this.aiState = 'approach';
            }

            if (this.aiState === 'approach') {
                this.throttle = 0.8;
                const diff = normalizeAngle(aToTarget - this.angle);
                this.rudder = clamp(diff * 3, -1, 1);
                this.turretAngle = lerp(this.turretAngle, aToTarget, 0.05);
            } else {
                // 战斗：保持侧舷
                const desiredAngle = aToTarget + Math.PI * 0.4;
                const diff = normalizeAngle(desiredAngle - this.angle);
                this.rudder = clamp(diff * 2, -1, 1);
                this.throttle = 0.6;
                this.turretAngle = lerp(this.turretAngle, aToTarget, 0.08);

                // 开火
                if (d < this.cfg.mainGun.range && this.aiFireDelay <= 0) {
                    const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
                    this.fireMainGun(leadAngle, game);
                    this.aiFireDelay = randRange(1.5, 4);
                }
                // 鱼雷
                if (d < this.cfg.torpedo.range * 0.8 && this.aiTorpDelay <= 0) {
                    const leadAngle = this.predictLead(this.aiTarget, this.cfg.torpedo.speed);
                    this.fireTorpedo(leadAngle, game);
                    this.aiTorpDelay = randRange(10, 25);
                }
            }
        } else {
            // 巡逻
            this.throttle = 0.5;
            const d = dist(this, this.aiPatrolTarget);
            if (d < 100) {
                this.aiPatrolTarget = { x: randRange(200, WORLD_SIZE - 200), y: randRange(200, WORLD_SIZE - 200) };
            }
            const aToP = angleTo(this, this.aiPatrolTarget);
            const diff = normalizeAngle(aToP - this.angle);
            this.rudder = clamp(diff * 2, -1, 1);
            this.turretAngle = lerp(this.turretAngle, this.angle, 0.03);
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
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.islands = [];
        this.kills = 0;
        this.totalDamage = 0;
        this.gameTime = 0;
        this.waveOffset = 0;
        this.selectedType = 'cruiser';

        // 输入
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.mouseWorld = { x: 0, y: 0 };

        this.setupInput();
        this.setupUI();

        // 海浪纹理偏移
        this.waveTime = 0;
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
            if (!this.running || !this.player || !this.player.alive) return;
            e.preventDefault();
            if (e.button === 0) {
                this.player.fireMainGun(this.player.turretAngle, this);
            } else if (e.button === 2) {
                this.player.fireTorpedo(this.player.turretAngle, this);
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
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('end-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('crosshair').style.display = 'block';

        // 重置
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.kills = 0;
        this.totalDamage = 0;
        this.gameTime = 0;

        // 生成岛屿
        this.islands = [];
        for (let i = 0; i < 12; i++) {
            const isl = new Island();
            // 避免在中心过近
            let ok = true;
            if (dist(isl, { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 }) < 300) ok = false;
            for (const other of this.islands) {
                if (dist(isl, other) < isl.radius + other.radius + 80) ok = false;
            }
            if (ok) this.islands.push(isl);
        }

        // 玩家
        this.player = new Ship(WORLD_SIZE / 2, WORLD_SIZE / 2, this.selectedType, true);

        // 敌人
        this.enemies = [];
        for (let i = 0; i < INITIAL_ENEMIES; i++) {
            this.spawnEnemy();
        }

        this.running = true;
        if (!this._loopStarted) {
            this._loopStarted = true;
            this.lastTime = performance.now();
            requestAnimationFrame(t => this.loop(t));
        }
    }

    spawnEnemy() {
        let x, y, attempts = 0;
        do {
            x = randRange(200, WORLD_SIZE - 200);
            y = randRange(200, WORLD_SIZE - 200);
            attempts++;
        } while (dist({ x, y }, this.player || { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 }) < 600 && attempts < 50);

        const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        const enemy = new Ship(x, y, type, false);
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
        if (this.player && this.player.alive) {
            const p = this.player;
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

        // 敌人
        for (const e of this.enemies) {
            e.update(dt, this);
            e.updateAI(dt, this);
        }

        // 弹药
        for (const proj of this.projectiles) {
            proj.update(dt);
            if (!proj.alive) continue;

            // 碰撞检测
            const targets = proj.owner === this.player ? this.enemies : [this.player];
            for (const t of targets) {
                if (!t || !t.alive) continue;
                if (dist(proj, t) < t.cfg.width + 5) {
                    t.takeDamage(proj.damage, this);
                    if (proj.owner === this.player) this.totalDamage += proj.damage;
                    proj.alive = false;
                    // 命中特效
                    for (let i = 0; i < 6; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const spd = randRange(0.5, 2);
                        this.particles.push(new Particle(
                            proj.x, proj.y,
                            Math.cos(a) * spd, Math.sin(a) * spd,
                            randRange(0.2, 0.5), randRange(2, 5),
                            proj.type === 'torpedo' ? '#80ffb0' : '#ffaa44'
                        ));
                    }
                    // 检查击杀
                    if (!t.alive && !t.isPlayer) {
                        this.kills++;
                        this.floatingTexts.push({
                            x: t.x, y: t.y - 40,
                            text: '击沉 ' + t.cfg.name + '!', color: '#ffd700',
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

        // 清理已沉没的敌舰
        this.enemies = this.enemies.filter(e => e.alive || e.sinkTimer < 3);

        // 补充敌舰
        const aliveEnemies = this.enemies.filter(e => e.alive).length;
        if (aliveEnemies < 3) {
            this.spawnEnemy();
        }

        // 更新HUD
        this.updateHUD();

        // 检查游戏结束
        if (this.player && !this.player.alive && this.player.sinkTimer > 2) {
            this.endGame();
        }
    }

    updateHUD() {
        if (!this.player) return;
        const p = this.player;
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
        for (const isl of this.islands) isl.draw(ctx, this.cam);

        // 粒子（底层）
        this.particles.forEach(p => p.draw(ctx, this.cam));

        // 弹药
        for (const proj of this.projectiles) proj.draw(ctx, this.cam);

        // 敌舰
        for (const e of this.enemies) e.draw(ctx, this.cam);

        // 玩家
        if (this.player) this.player.draw(ctx, this.cam);

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

        // 射程圈
        if (this.player && this.player.alive) {
            const sx = this.player.x - this.cam.x;
            const sy = this.player.y - this.cam.y;
            ctx.strokeStyle = 'rgba(100, 180, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(sx, sy, this.player.cfg.mainGun.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 小地图
        this.drawMinimap();

        // 玩家受伤红框
        if (this.player && this.player.damageFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.player.damageFlash * 0.5})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    drawOcean(ctx) {
        const W = this.canvas.width, H = this.canvas.height;
        // 动态海面效果
        const t = this.waveTime * 0.5;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0c1e3a');
        grad.addColorStop(1, '#0a1628');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // 波纹
        ctx.strokeStyle = 'rgba(60, 120, 180, 0.06)';
        ctx.lineWidth = 1;
        const spacing = 60;
        const offX = this.cam.x % spacing;
        const offY = this.cam.y % spacing;
        for (let y = -spacing; y < H + spacing; y += spacing) {
            ctx.beginPath();
            for (let x = -spacing; x < W + spacing; x += 10) {
                const wx = x + Math.sin((y + this.cam.y) * 0.01 + t) * 15;
                const wy = y - offY + Math.sin((x + this.cam.x) * 0.008 + t * 0.7) * 8;
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
        ctx.strokeStyle = 'rgba(255, 80, 80, 0.3)';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.cam.x, -this.cam.y, WORLD_SIZE, WORLD_SIZE);
    }

    drawMinimap() {
        const mctx = this.miniCtx;
        const mw = 180, mh = 180;
        const scale = mw / WORLD_SIZE;

        mctx.fillStyle = '#0a1830';
        mctx.fillRect(0, 0, mw, mh);

        // 网格
        mctx.strokeStyle = 'rgba(60, 100, 150, 0.15)';
        mctx.lineWidth = 0.5;
        for (let i = 0; i < WORLD_SIZE; i += 500) {
            const p = i * scale;
            mctx.beginPath(); mctx.moveTo(p, 0); mctx.lineTo(p, mh); mctx.stroke();
            mctx.beginPath(); mctx.moveTo(0, p); mctx.lineTo(mw, p); mctx.stroke();
        }

        // 岛屿
        mctx.fillStyle = '#3a5a22';
        for (const isl of this.islands) {
            mctx.beginPath();
            mctx.arc(isl.x * scale, isl.y * scale, Math.max(isl.radius * scale, 2), 0, Math.PI * 2);
            mctx.fill();
        }

        // 视野框
        mctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        mctx.lineWidth = 1;
        mctx.strokeRect(
            this.cam.x * scale, this.cam.y * scale,
            this.cam.w * scale, this.cam.h * scale
        );

        // 敌舰
        mctx.fillStyle = '#ff4444';
        for (const e of this.enemies) {
            if (!e.alive) continue;
            mctx.beginPath();
            mctx.arc(e.x * scale, e.y * scale, 2.5, 0, Math.PI * 2);
            mctx.fill();
        }

        // 玩家
        if (this.player && this.player.alive) {
            mctx.fillStyle = '#4cff72';
            mctx.beginPath();
            mctx.arc(this.player.x * scale, this.player.y * scale, 3, 0, Math.PI * 2);
            mctx.fill();
            // 朝向
            mctx.strokeStyle = '#4cff72';
            mctx.lineWidth = 1;
            mctx.beginPath();
            mctx.moveTo(this.player.x * scale, this.player.y * scale);
            mctx.lineTo(
                (this.player.x + Math.cos(this.player.angle) * 200) * scale,
                (this.player.y + Math.sin(this.player.angle) * 200) * scale
            );
            mctx.stroke();
        }
    }

    endGame() {
        this.running = false;
        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('end-screen').classList.remove('hidden');
        const mins = Math.floor(this.gameTime / 60);
        const secs = Math.floor(this.gameTime % 60);
        document.getElementById('end-title').textContent = '战斗结束';
        document.getElementById('end-stats').innerHTML =
            `存活时间: ${mins}分${secs}秒<br>` +
            `击沉敌舰: ${this.kills} 艘<br>` +
            `总伤害: ${Math.round(this.totalDamage).toLocaleString()}`;
    }
}

// ==================== 启动 ====================
window.addEventListener('load', () => {
    new Game();
});
