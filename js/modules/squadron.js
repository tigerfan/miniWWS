// ==================== 飞行中队 ====================

class Squadron {
    constructor(owner, type, config) {
        this.owner = owner;
        this.type = type; // 'torpedo', 'dive', 'rocket'
        this.cfg = config;
        this.x = owner.x + Math.cos(owner.angle) * owner.cfg.length * 0.3;
        this.y = owner.y + Math.sin(owner.angle) * owner.cfg.length * 0.3;
        this.z = 20;
        this.angle = owner.angle;
        this.speed = config.speed * 0.15;
        this.baseSpeed = this.speed;
        this.planes = config.planes;
        this.maxPlanes = config.planes;
        this.alive = true;
        this.state = 'launching'; // launching, flying, attacking, returning
        this.launchTimer = 0;
        this.attackTimer = 0;
        this._dropped = false;
        this._queuedAttack = false;
        this.team = owner.team;
        this.hp = config.hp * config.planes;
        this.maxHp = this.hp;
        this.rudder = 0;
        this.boosting = false;
        this.braking = false; // 减速状态
        this.boostFuel = 5; // 5秒加速燃料
        this.maxBoostFuel = 5;
        this.turnSpeed = 0.025;
        // 攻击预瞄
        this.aimProgress = 0; // 0-1 瞄准收束进度
    }

    update(dt, game) {
        if (!this.alive) return;

        // 加速消耗
        if (this.boosting && this.boostFuel > 0) {
            this.boostFuel -= dt;
            this.speed = this.baseSpeed * 1.5;
        } else if (this.braking) {
            this.speed = this.baseSpeed * 0.5; // 减速50%
            this.boosting = false;
            if (this.boostFuel < this.maxBoostFuel) this.boostFuel += dt * 0.3;
        } else {
            this.boosting = false;
            this.speed = this.baseSpeed;
            if (this.boostFuel < this.maxBoostFuel) this.boostFuel += dt * 0.3;
        }

        if (this.state === 'launching') {
            this.launchTimer += dt;
            this.z = lerp(20, 80, Math.min(this.launchTimer / 1.5, 1));
            this.x += Math.cos(this.angle) * this.speed * 0.5;
            this.y += Math.sin(this.angle) * this.speed * 0.5;
            if (this.launchTimer > 1.5) {
                this.state = 'flying';
                if (this._queuedAttack) {
                    this._queuedAttack = false;
                    this.startAttack();
                }
            }
        }
        else if (this.state === 'flying') {
            // 转向
            this.angle += this.rudder * this.turnSpeed;
            this.angle = normalizeAngle(this.angle);
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            // 瞄准收束（不转向时逐渐收束）
            if (Math.abs(this.rudder) < 0.1) {
                this.aimProgress = Math.min(1, this.aimProgress + dt * 0.4);
            } else {
                this.aimProgress = Math.max(0, this.aimProgress - dt * 0.8);
            }
        }
        else if (this.state === 'attacking') {
            // 攻击跑 - 直线飞行
            this.x += Math.cos(this.angle) * this.speed * 1.2;
            this.y += Math.sin(this.angle) * this.speed * 1.2;
            this.attackTimer += dt;
            if (this.attackTimer > 0.6 && !this._dropped) {
                this._dropped = true;
                this.dropOrdnance(game);
            }
            if (this.attackTimer > 2.0) {
                this.state = 'returning';
            }
        }
        else if (this.state === 'returning') {
            const toOwner = angleTo(this, this.owner);
            let diff = normalizeAngle(toOwner - this.angle);
            this.angle += clamp(diff * 2, -0.04, 0.04);
            this.angle = normalizeAngle(this.angle);
            this.x += Math.cos(this.angle) * this.speed * 1.3;
            this.y += Math.sin(this.angle) * this.speed * 1.3;
            // 接近母舰时降低高度
            const d = dist(this, this.owner);
            if (d < 500) this.z = lerp(this.z, 20, 0.02);
            if (d < 150) {
                this.alive = false;
                this.owner.returnSquadronPlanes(this.type, this.planes);
            }
        }

        // 边界
        const worldSize = game?.currentMap?.size || 42000;
        if (this.x < 100 || this.x > worldSize - 100 || this.y < 100 || this.y > worldSize - 100) {
            this.state = 'returning';
        }
        this.x = clamp(this.x, 50, worldSize - 50);
        this.y = clamp(this.y, 50, worldSize - 50);
    }

    dropOrdnance(game) {
        const aimSpread = lerp(1.8, 0.4, this.aimProgress);
        if (this.type === 'torpedo') {
            const count = this.cfg.torpCount;
            for (let i = 0; i < count; i++) {
                const spreadOff = (i - (count - 1) / 2) * this.cfg.spread * aimSpread;
                const a = this.angle + spreadOff;
                game.projectiles.push(new Projectile(
                    this.x, this.y, a, this.cfg.torpSpeed,
                    this.cfg.torpRange, this.cfg.damage, 'torpedo', this.owner
                ));
            }
        } else if (this.type === 'dive') {
            const count = this.cfg.bombCount;
            // 动态计算目标距离：找前方最近敌舰
            const enemyTeam = this.owner.team === 'player' ? game.enemies : game.allies;
            let bestDist = 300; // 默认落点
            for (const e of enemyTeam) {
                if (!e || !e.alive) continue;
                const d = dist(this, e);
                if (d > 1500) continue;
                const aToE = angleTo(this, e);
                const aDiff = Math.abs(normalizeAngle(aToE - this.angle));
                if (aDiff < 0.8 && d < bestDist) {
                    bestDist = d;
                }
            }
            const targetDist = clamp(bestDist, 80, 800);
            for (let i = 0; i < count; i++) {
                const spread = (Math.random() - 0.5) * this.cfg.spread * aimSpread;
                const a = this.angle + spread;
                // 轰炸机：使用 bomb 类型，targetDist动态计算
                game.projectiles.push(new Projectile(
                    this.x, this.y, a, 2.0, 800, this.cfg.damage, 'bomb', this.owner, targetDist, this.z
                ));
            }
        } else if (this.type === 'rocket') {
            const count = this.cfg.rocketCount;
            for (let i = 0; i < count; i++) {
                const spread = (Math.random() - 0.5) * this.cfg.spread * aimSpread;
                const a = this.angle + spread;
                // 火箭弹改为直射（type='rocket', targetDist=0）
                // 速度提高，射程适中
                game.projectiles.push(new Projectile(
                    this.x, this.y, a, this.cfg.rocketSpeed * 0.4,
                    this.cfg.rocketRange, this.cfg.damage, 'rocket', this.owner, 0
                ));
            }
        }
        // 投弹特效
        for (let i = 0; i < 6; i++) {
            const ea = Math.random() * Math.PI * 2;
            const espd = randRange(0.5, 2);
            game.particles.push(new Particle(
                this.x, this.y,
                Math.cos(ea) * espd, Math.sin(ea) * espd,
                randRange(0.3, 0.6), randRange(3, 6), '#ffdd44'
            ));
        }
    }

    startAttack() {
        if (this.state === 'launching') {
            this._queuedAttack = true;
            return true;
        }
        if (this.state !== 'flying') return false;
        this.state = 'attacking';
        this.attackTimer = 0;
        this._dropped = false;
        return true;
    }

    recall() {
        if (this.state === 'returning' || !this.alive) return;
        this.state = 'returning';
    }

    takeDamage(dmg) {
        if (!this.alive) return;
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
            this.planes = 0;
            return;
        }
        this.planes = Math.max(1, Math.ceil(this.maxPlanes * (this.hp / this.maxHp)));
    }
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Squadron };
}