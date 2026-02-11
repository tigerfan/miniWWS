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
        this.rearTurretAngle = this.angle + Math.PI; // 尾炮初始朝后
        this.speed = 0;
        this.throttle = 0; // -1 to 1
        this.rudder = 0; // -1 to 1
        this.alive = true;
        this.mainGunTimer = 0;
        this.rearGunTimer = 0; // 尾炮冷却
        this.torpedoTimer = 0;
        this.repairCooldown = 0;
        this.sinkTimer = 0;
        this.damageFlash = 0;
        this.wakeParticles = [];
        this.damageDealt = 0; // 该舰造成的总伤害
        this.turretOnTarget = false; // 主炮是否对准目标
        this.turretDiffAbs = Math.PI; // 炮塔与目标的角度差（绝对值）
        
        // AI
        this.aiTarget = null;
        this.aiState = 'patrol';
        this.aiPatrolTarget = { x: x + randRange(-2000, 2000), y: y + randRange(-2000, 2000) };
        this.aiFireDelay = randRange(1, 3);
        this.aiTorpDelay = randRange(5, 15);
        this.aiFormationOffset = { x: randRange(-300, 300), y: randRange(-300, 300) };
        
        // 避障状态
        this._stuckTimer = 0;
        this._stuckAngle = 0;
        this._avoidDirection = 0; // 当前避障方向
        this._lastAvoidTime = 0; // 上次避障时间
        this._avoidingIsland = null; // 正在绕行的岛屿
        
        // CV航母特有
        if (this.type === 'carrier') {
            this.squadronDecks = {
                torpedo: { planes: this.cfg.squadrons.torpedo.planes, maxPlanes: this.cfg.squadrons.torpedo.planes, regenTimer: 0 },
                dive: { planes: this.cfg.squadrons.dive.planes, maxPlanes: this.cfg.squadrons.dive.planes, regenTimer: 0 },
                rocket: { planes: this.cfg.squadrons.rocket.planes, maxPlanes: this.cfg.squadrons.rocket.planes, regenTimer: 0 }
            };
            this.squadronCooldowns = { torpedo: 0, dive: 0, rocket: 0 };
            this.aiSquadronDelay = randRange(8, 15);
        }
    }

    update(dt, game) {
        if (!this.alive) {
            this.sinkTimer += dt;
            return;
        }
        
        // 冷却
        if (this.mainGunTimer > 0) this.mainGunTimer -= dt;
        if (this.rearGunTimer > 0) this.rearGunTimer -= dt;
        if (this.torpedoTimer > 0) this.torpedoTimer -= dt;
        if (this.repairCooldown > 0) this.repairCooldown -= dt;
        if (this.damageFlash > 0) this.damageFlash -= dt;
        
        // 物理
        const maxSpd = this.cfg.maxSpeed * 0.15; // 像素/帧 尺度 - 降速还原WWS手感
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
        
        // 主炮塔旋转（固定旋转速度 + 射界限制）- CV没有主炮
        if (this.isPlayer && this.cfg.mainGun) {
            const targetAng = angleTo(this, game.mouseWorld);
            const result = this.traverseTurret(this.turretAngle, targetAng, this.cfg.mainGun, dt, false);
            this.turretAngle = result.angle;
            this.turretOnTarget = result.onTarget;
            this.turretDiffAbs = result.diffAbs;
        }
        
        // CV甲板飞机再生
        if (this.type === 'carrier' && this.squadronDecks) {
            for (const sqType of ['torpedo', 'dive', 'rocket']) {
                const deck = this.squadronDecks[sqType];
                if (this.squadronCooldowns[sqType] > 0) this.squadronCooldowns[sqType] -= dt;
                if (deck.planes < deck.maxPlanes) {
                    deck.regenTimer += dt;
                    const regenTime = this.cfg.squadrons[sqType].reload * 0.6;
                    if (deck.regenTimer >= regenTime) {
                        deck.regenTimer = 0;
                        deck.planes = Math.min(deck.maxPlanes, deck.planes + 1);
                    }
                }
            }
        }

        // 尾炮自动瞄准射程内最近敌舰
        const rearGun = this.cfg.rearGun;
        if (rearGun) {
            const enemyTeam = this.team === 'player' ? game.enemies : game.allies;
            let nearestEnemy = null;
            let nearestDist = rearGun.range;
            for (const enemy of enemyTeam) {
                if (!enemy || !enemy.alive) continue;
                const d = dist(this, enemy);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestEnemy = enemy;
                }
            }
            if (nearestEnemy) {
                const predAngle = this.predictLead(nearestEnemy, rearGun.shellSpeed);
                const rResult = this.traverseTurret(this.rearTurretAngle, predAngle, rearGun, dt, true);
                this.rearTurretAngle = rResult.angle;
                // 自动开火
                if (this.rearGunTimer <= 0 && rResult.onTarget) {
                    this.fireRearGun(this.rearTurretAngle, game, nearestDist);
                }
            } else {
                // 无目标时尾炮回归朝后
                const backAngle = this.angle + Math.PI;
                const rResult = this.traverseTurret(this.rearTurretAngle, backAngle, rearGun, dt, true);
                this.rearTurretAngle = rResult.angle;
            }
        }
    }

    // 炮塔旋转引擎：固定速度旋转 + 射界钳位
    traverseTurret(currentAngle, targetAngle, gunCfg, dt, isRear) {
        const traverseSpeed = gunCfg.traverse || 0.15; // rad/s
        const arc = gunCfg.arc || [-Math.PI, Math.PI];

        // 将目标角度钳位到射界内（相对船体）
        let relTarget = normalizeAngle(targetAngle - this.angle);
        if (isRear) relTarget = normalizeAngle(relTarget - Math.PI); // 尾炮基准朝后
        relTarget = clamp(relTarget, arc[0], arc[1]);
        if (isRear) relTarget = normalizeAngle(relTarget + Math.PI);
        const clampedTarget = normalizeAngle(this.angle + relTarget);

        // 以固定速度旋转向目标
        let diff = normalizeAngle(clampedTarget - currentAngle);
        const maxStep = traverseSpeed * dt;
        let newAngle;
        if (Math.abs(diff) <= maxStep) {
            newAngle = clampedTarget;
        } else {
            newAngle = normalizeAngle(currentAngle + Math.sign(diff) * maxStep);
        }

        const diffAbs = Math.abs(normalizeAngle(clampedTarget - newAngle));
        const onTarget = diffAbs < 0.03; // ~1.7°阈值

        return { angle: newAngle, onTarget, diffAbs };
    }

    fireMainGun(targetAngle, game, targetDist) {
        if (!this.cfg.mainGun || this.mainGunTimer > 0 || !this.alive) return false;
        this.mainGunTimer = this.cfg.mainGun.reload;
        const gun = this.cfg.mainGun;
        const baseDist = targetDist || gun.range * 0.5;
        for (let i = 0; i < gun.shells; i++) {
            const spread = (Math.random() - 0.5) * gun.spread;
            const a = targetAngle + spread;
            const ox = this.x + Math.cos(this.angle) * this.cfg.length * 0.35;
            const oy = this.y + Math.sin(this.angle) * this.cfg.length * 0.35;
            const dSpread = baseDist * (1 + (Math.random() - 0.5) * 0.12);
            game.projectiles.push(new Projectile(ox, oy, a, gun.shellSpeed, gun.range, gun.damage, 'shell', this, dSpread));
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

    fireRearGun(targetAngle, game, targetDist) {
        const rearGun = this.cfg.rearGun;
        if (!rearGun || this.rearGunTimer > 0 || !this.alive) return false;
        this.rearGunTimer = rearGun.reload;
        const baseDist = targetDist || rearGun.range * 0.5;
        for (let i = 0; i < rearGun.shells; i++) {
            const spread = (Math.random() - 0.5) * rearGun.spread;
            const a = targetAngle + spread;
            // 从船尾发射
            const ox = this.x - Math.cos(this.angle) * this.cfg.length * 0.3;
            const oy = this.y - Math.sin(this.angle) * this.cfg.length * 0.3;
            const dSpread = baseDist * (1 + (Math.random() - 0.5) * 0.12);
            game.projectiles.push(new Projectile(ox, oy, a, rearGun.shellSpeed, rearGun.range, rearGun.damage, 'shell', this, dSpread));
        }
        // 炮口闪光（较小）
        for (let i = 0; i < 5; i++) {
            const a = targetAngle + randRange(-0.5, 0.5);
            const spd = randRange(0.8, 2);
            game.particles.push(new Particle(
                this.x - Math.cos(this.angle) * this.cfg.length * 0.3,
                this.y - Math.sin(this.angle) * this.cfg.length * 0.3,
                Math.cos(a) * spd, Math.sin(a) * spd,
                randRange(0.15, 0.35), randRange(2, 5), '#ffcc33'
            ));
        }
        return true;
    }

    fireTorpedo(targetAngle, game) {
        if (!this.cfg.torpedo || this.torpedoTimer > 0 || !this.alive) return false;
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

    // CV: 发射中队
    launchSquadron(type, game) {
        if (this.type !== 'carrier' || !this.alive) return null;
        const deck = this.squadronDecks[type];
        if (!deck || deck.planes <= 0 || this.squadronCooldowns[type] > 0) return null;
        const cfg = this.cfg.squadrons[type];
        const planeCount = Math.min(deck.planes, cfg.planes);
        deck.planes -= planeCount;
        this.squadronCooldowns[type] = cfg.reload;
        const sqCfg = { ...cfg, planes: planeCount };
        const sq = new Squadron(this, type, sqCfg, game);
        game.squadrons.push(sq);
        return sq;
    }

    // CV: 飞机返回甲板
    returnSquadronPlanes(type, count) {
        if (!this.squadronDecks || !this.squadronDecks[type]) return;
        const deck = this.squadronDecks[type];
        deck.planes = Math.min(deck.maxPlanes, deck.planes + count);
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

    // AI - 好战强化版 + 避障寻路
    updateAI(dt, game) {
        if (!this.alive || this.isPlayer) return;

        // CV航母AI：远离战场，发射中队
        if (this.type === 'carrier') {
            this.updateAI_CV(dt, game);
            return;
        }

        this.aiFireDelay -= dt;
        this.aiTorpDelay -= dt;
        if (!this._stuckTimer) this._stuckTimer = 0;
        if (!this._stuckAngle) this._stuckAngle = 0;

        const hpRatio = this.hp / this.maxHp;
        const enemyTeam = this.team === 'player' ? game.enemies : [...game.allies].filter(s => s && s.alive);
        const allyTeam = this.team === 'player' ? [...game.allies].filter(s => s && s.alive) : game.enemies;
        const worldSize = game.currentMap?.size || 36000;

        // === 寻找目标（优先选择近距离/残血） ===
        let bestTarget = null;
        let bestScore = -Infinity;
        for (const enemy of enemyTeam) {
            if (!enemy || !enemy.alive) continue;
            const d = dist(this, enemy);
            const hpR = enemy.hp / enemy.maxHp;
            // 评分：距离越近越好，血越少越好
            let score = -d / 1000 + (1 - hpR) * 8;
            if (d < this.cfg.mainGun.range) score += 15; // 射程内大加分
            if (d < this.cfg.mainGun.range * 0.6) score += 10;
            if (hpR < 0.3) score += 12; // 残血高优先
            if (score > bestScore) { bestScore = score; bestTarget = enemy; }
        }
        this.aiTarget = bestTarget;
        const targetDist = bestTarget ? dist(this, bestTarget) : Infinity;

        let targetX = null, targetY = null;
        let targetSpeed = 0.2;
        let shouldFire = false;
        let shouldUseTorp = false;

        // === 状态决策：战斗优先 ===

        // 1. 极低血量撤退 (HP < 12%)
        if (hpRatio < 0.12 && targetDist > 3000) {
            this.aiState = 'retreat';
            let nearestAlly = null, nearestAllyDist = Infinity;
            for (const ally of allyTeam) {
                if (ally === this) continue;
                const d = dist(this, ally);
                if (d < nearestAllyDist) { nearestAllyDist = d; nearestAlly = ally; }
            }
            if (nearestAlly) { targetX = nearestAlly.x; targetY = nearestAlly.y; }
            else {
                const spawn = this.team === 'player' ? game.currentMap.spawns.allies[0] : game.currentMap.spawns.enemies[0];
                targetX = spawn.x; targetY = spawn.y;
            }
            targetSpeed = 0.3;
            // 撤退时也射击追击者
            if (bestTarget && targetDist < this.cfg.mainGun.range) {
                shouldFire = this.aiFireDelay <= 0;
            }
        }
        // 2. 有敌人 → 战斗为主
        else if (bestTarget) {
            const d = targetDist;
            const aToTarget = angleTo(this, bestTarget);

            // 追击残血目标
            if (bestTarget.hp / bestTarget.maxHp < 0.35) {
                this.aiState = 'chase';
                targetX = bestTarget.x + Math.cos(bestTarget.angle) * bestTarget.speed * 30;
                targetY = bestTarget.y + Math.sin(bestTarget.angle) * bestTarget.speed * 30;
                targetSpeed = 0.35;
            }
            // 在主炮射程外，快速接近
            else if (d > this.cfg.mainGun.range * 0.95) {
                this.aiState = 'approach';
                targetX = bestTarget.x;
                targetY = bestTarget.y;
                targetSpeed = 0.3;
            }
            // 在射程内，战斗机动
            else {
                this.aiState = 'combat';
                const optimalRange = this.type === 'battleship' ? this.cfg.mainGun.range * 0.75 :
                                    this.type === 'destroyer' ? this.cfg.torpedo.range * 0.6 :
                                    this.cfg.mainGun.range * 0.6;

                if (d < optimalRange * 0.4 && this.type !== 'destroyer') {
                    // 太近，拉开
                    const retreatAngle = aToTarget + Math.PI;
                    targetX = this.x + Math.cos(retreatAngle) * 800;
                    targetY = this.y + Math.sin(retreatAngle) * 800;
                    targetSpeed = 0.2;
                } else {
                    // 侧舷机动 - 绕着敌人画弧
                    const circleDir = ((this.x + this.y) % 2 < 1) ? 1 : -1;
                    const desiredAngle = aToTarget + Math.PI * 0.35 * circleDir;
                    const diff = normalizeAngle(desiredAngle - this.angle);
                    this.rudder = clamp(diff * 3, -1, 1);
                    this.throttle = 0.18;
                    targetSpeed = null;
                }
            }

            // 射程内积极开火
            if (d < this.cfg.mainGun.range && this.aiFireDelay <= 0) shouldFire = true;
            // 鱼雷距离判定
            if (d < this.cfg.torpedo.range * 0.75 && this.aiTorpDelay <= 0) {
                // 检查鱼雷方向没有友军
                const torpAngle = this.predictLead(bestTarget, this.cfg.torpedo.speed);
                let friendlyInPath = false;
                for (const ally of allyTeam) {
                    if (ally === this || !ally.alive) continue;
                    const aToAlly = angleTo(this, ally);
                    const allyDist = dist(this, ally);
                    if (allyDist < d && Math.abs(normalizeAngle(torpAngle - aToAlly)) < 0.25) {
                        friendlyInPath = true; break;
                    }
                }
                if (!friendlyInPath) shouldUseTorp = true;
            }

            // 炮塔始终跟踪目标（固定旋转速度）
            const leadAngle = this.predictLead(bestTarget, this.cfg.mainGun.shellSpeed);
            const aiTurretResult = this.traverseTurret(this.turretAngle, leadAngle, this.cfg.mainGun, dt, false);
            this.turretAngle = aiTurretResult.angle;
            this.turretOnTarget = aiTurretResult.onTarget;
        }
        // 3. 无敌人 → 主动巡逻寻敌/占点
        else {
            // 优先去未占领的控制点
            let bestCp = null, bestCpDist = Infinity;
            for (const cp of game.capturePoints) {
                if (cp.owner === this.team) continue;
                const d = dist(this, cp);
                if (d < bestCpDist) { bestCpDist = d; bestCp = cp; }
            }
            if (bestCp) {
                targetX = bestCp.x; targetY = bestCp.y;
                targetSpeed = 0.25;
                if (dist(this, bestCp) < bestCp.radius * 0.7) targetSpeed = 0.06;
            } else {
                // 所有点已占领，向地图中心巡逻
                targetX = worldSize / 2 + randRange(-3000, 3000);
                targetY = worldSize / 2 + randRange(-3000, 3000);
                targetSpeed = 0.2;
            }
            const patrolResult = this.traverseTurret(this.turretAngle, this.angle, this.cfg.mainGun, dt, false);
            this.turretAngle = patrolResult.angle;
            this.turretOnTarget = false;
        }

        // === 执行移动 + 智能岛屿避障 ===
        if (targetX !== null && targetY !== null) {
            const steerResult = this.calculateAvoidanceSteer(targetX, targetY, game, worldSize);
            
            const diff = normalizeAngle(steerResult.steerAngle - this.angle);
            this.rudder = clamp(diff * 3.5, -1, 1);
            if (steerResult.targetSpeed !== null) this.throttle = steerResult.targetSpeed;

            // 炮塔跟踪（如果有目标）
            if (this.aiTarget && this.aiTarget.alive) {
                const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
                const moveResult = this.traverseTurret(this.turretAngle, leadAngle, this.cfg.mainGun, dt, false);
                this.turretAngle = moveResult.angle;
                this.turretOnTarget = moveResult.onTarget;
            }
        }

        // === 智能卡死检测与脱困 ===
        this.handleStuckDetection(dt, game);

        // === 开火执行（必须炮塔对准） ===
        if (shouldFire && this.aiTarget && this.turretOnTarget) {
            const targetDist = dist(this, this.aiTarget);
            this.fireMainGun(this.turretAngle, game, targetDist);
            this.aiFireDelay = randRange(0.3, 1.2); // 极快射击
        }
        if (shouldUseTorp && this.aiTarget) {
            const leadAngle = this.predictLead(this.aiTarget, this.cfg.torpedo.speed);
            this.fireTorpedo(leadAngle, game);
            this.aiTorpDelay = randRange(4, 10); // 更频繁鱼雷
        }
    }

    // CV航母AI
    updateAI_CV(dt, game) {
        if (!this.squadronDecks) return;
        this.aiSquadronDelay -= dt;

        const enemyTeam = this.team === 'player' ? game.enemies : game.allies;
        const worldSize = game.currentMap?.size || 36000;

        // 判断比分是否落后
        const myScore = this.team === 'player' ? game.playerScore : game.enemyScore;
        const enemyScore = this.team === 'player' ? game.enemyScore : game.playerScore;
        const scoreBehind = enemyScore - myScore;
        const isLosing = scoreBehind > 50; // 落后超过50分时前压

        // 寻找最佳占领点（未被我方控制的）
        let bestCp = null;
        let bestCpDist = Infinity;
        for (const cp of game.capturePoints) {
            // 优先选择未占领的点，其次敌方控制的点
            if (cp.owner === this.team) continue;
            const d = dist(this, cp);
            // 评分：距离近优先，中立点优先
            let score = d;
            if (cp.owner === null) score *= 0.7; // 中立点优先
            if (d < bestCpDist * (cp.owner === null ? 0.8 : 1)) {
                bestCpDist = d;
                bestCp = cp;
            }
        }

        // 比分落后时前压占点
        if (isLosing && bestCp) {
            // 检查占领点内是否有敌方舰船
            const enemyInCp = this.team === 'player' ? bestCp.enemyShipsInZone : bestCp.playerShipsInZone;
            const myShipsInCp = this.team === 'player' ? bestCp.playerShipsInZone : bestCp.enemyShipsInZone;
            
            // 前压到占领点边缘（保持安全距离）
            const safeRadius = bestCp.radius * 0.85;
            const d = dist(this, bestCp);
            
            if (d > safeRadius + 500) {
                // 接近占领点
                const toAngle = angleTo(this, bestCp);
                const diff = normalizeAngle(toAngle - this.angle);
                this.rudder = clamp(diff * 2.5, -1, 1);
                this.throttle = 0.6; // 快速接近
            } else if (d > safeRadius * 0.5) {
                // 已在点边缘，慢速巡航保持位置
                this.throttle = 0.25;
                // 绕圈巡航
                const circleAngle = angleTo(bestCp, this) + Math.PI / 2;
                const diff = normalizeAngle(circleAngle - this.angle);
                this.rudder = clamp(diff * 1.5, -0.5, 0.5);
            } else {
                // 已在点内，慢速或停止
                this.throttle = 0.1;
                this.rudder *= 0.9;
            }
        } else {
            // 正常状态：CV远离战场 - 保持在后方
            const spawnX = this.team === 'player' ? worldSize * 0.1 : worldSize * 0.9;
            const spawnY = worldSize * 0.5;
            const toDist = dist(this, { x: spawnX, y: spawnY });
            if (toDist > 3000) {
                const toAngle = angleTo(this, { x: spawnX, y: spawnY });
                const diff = normalizeAngle(toAngle - this.angle);
                this.rudder = clamp(diff * 2, -1, 1);
                this.throttle = 0.5;
            } else {
                this.throttle = 0.2;
                this.rudder *= 0.95;
            }
        }

        // 发射中队
        if (this.aiSquadronDelay <= 0) {
            // 找目标
            let bestTarget = null;
            let bestScore = -1;
            for (const e of enemyTeam) {
                if (!e.alive) continue;
                const d = dist(this, e);
                let score = 1;
                if (e.type === 'battleship') score = 3;
                else if (e.type === 'cruiser') score = 2;
                else if (e.type === 'destroyer') score = 1.5;
                score /= (d / 10000 + 0.5);
                if (score > bestScore) { bestScore = score; bestTarget = e; }
            }

            if (bestTarget) {
                // 选择中队类型
                const types = ['torpedo', 'dive', 'rocket'];
                const available = types.filter(t => this.squadronDecks[t].planes >= 2 && this.squadronCooldowns[t] <= 0);
                if (available.length > 0) {
                    // 优先鱼雷机打BB，攻击机打DD
                    let pick = available[0];
                    if (bestTarget.type === 'battleship' && available.includes('torpedo')) pick = 'torpedo';
                    else if (bestTarget.type === 'destroyer' && available.includes('rocket')) pick = 'rocket';
                    else if (available.includes('dive')) pick = 'dive';

                    const sq = this.launchSquadron(pick, game);
                    if (sq) {
                        sq._aiTarget = bestTarget;
                        sq._aiState = 'approach';
                    }
                }
            }
            this.aiSquadronDelay = randRange(10, 20);
        }

        // 更新AI控制的中队
        for (const sq of game.squadrons) {
            if (sq.owner !== this || !sq.alive) continue;
            if (sq.state === 'flying' && sq._aiTarget) {
                const t = sq._aiTarget;
                const d = dist(sq, t);
                
                // 目标已死亡或距离过远(超过8000)时，尝试切换新目标或返航
                if (!t.alive || d > 8000) {
                    let newTarget = null;
                    let newDist = Infinity;
                    for (const e of enemyTeam) {
                        if (!e.alive) continue;
                        const ed = dist(sq, e);
                        if (ed < 6000 && ed < newDist) {
                            newDist = ed;
                            newTarget = e;
                        }
                    }
                    if (newTarget) {
                        sq._aiTarget = newTarget;
                    } else {
                        sq.recall();
                        continue;
                    }
                }
                
                const toTarget = angleTo(sq, sq._aiTarget);
                const diff = normalizeAngle(toTarget - sq.angle);
                sq.rudder = clamp(diff * 3, -1, 1);
                const targetDist = dist(sq, sq._aiTarget);
                if (targetDist < 500 && Math.abs(diff) < 0.3) {
                    sq.startAttack();
                }
            }
        }
    }

    predictLead(target, projSpeed) {
        const d = dist(this, target);
        const t = d / (projSpeed * 60); // 预判时间
        const px = target.x + Math.cos(target.angle) * target.speed * 60 * t;
        const py = target.y + Math.sin(target.angle) * target.speed * 60 * t;
        return angleTo(this, { x: px, y: py });
    }

    // ==================== 智能避障系统 ====================

    /**
     * 计算避障转向 - 使用势场法 + 沿墙绕行
     */
    calculateAvoidanceSteer(targetX, targetY, game, worldSize) {
        let steerAngle = angleTo(this, { x: targetX, y: targetY });
        let targetSpeed = 0.2;

        // 船只尺寸相关的安全距离
        const shipRadius = this.cfg.width;
        const checkDist = Math.max(this.cfg.length * 6, 400) + Math.abs(this.speed) * 50;

        // === 1. 岛屿避障 - 使用改进的势场法 ===
        let repulsionX = 0, repulsionY = 0;
        let nearestBlockingIsland = null;
        let nearestBlockingDist = Infinity;

        for (const isl of game.islands) {
            const d = dist(this, isl);
            const safeRadius = isl.radius + shipRadius * 2.5;
            
            // 检测范围内的岛屿
            if (d < safeRadius + checkDist) {
                const aToIsland = angleTo(this, isl);
                const relAngle = normalizeAngle(aToIsland - this.angle);
                
                // 判断岛屿是否在前方路径上（扩展到±90度）
                if (Math.abs(relAngle) < Math.PI * 0.5) {
                    // 计算到岛屿切线的距离，判断是否会撞上
                    const tangentDist = d * Math.sin(Math.abs(relAngle));
                    const willCollide = tangentDist < safeRadius;
                    
                    if (willCollide || d < safeRadius + checkDist * 0.5) {
                        // 排斥力 - 垂直于到岛屿的方向
                        const urgency = Math.max(0, 1 - (d - safeRadius) / checkDist);
                        
                        // 选择更优的绕行方向：考虑目标位置
                        const aToTarget = angleTo(this, { x: targetX, y: targetY });
                        const targetRelToIsland = normalizeAngle(aToTarget - aToIsland);
                        
                        // 选择背离目标侧的绕行方向，或者选择更开阔的方向
                        let avoidDir;
                        if (this._avoidDirection !== 0 && this._avoidingIsland === isl) {
                            // 保持之前的绕行方向
                            avoidDir = this._avoidDirection;
                        } else {
                            // 选择更开阔的方向或目标所在侧
                            avoidDir = targetRelToIsland > 0 ? 1 : -1;
                            // 记录绕行状态
                            this._avoidDirection = avoidDir;
                            this._avoidingIsland = isl;
                        }
                        
                        // 排斥力方向：垂直于到岛屿的连线
                        const repelAngle = aToIsland + avoidDir * Math.PI * 0.5;
                        const repelStrength = urgency * urgency * 2; // 平方增强近距离排斥
                        
                        repulsionX += Math.cos(repelAngle) * repelStrength;
                        repulsionY += Math.sin(repelAngle) * repelStrength;
                        
                        if (d < nearestBlockingDist) {
                            nearestBlockingDist = d;
                            nearestBlockingIsland = isl;
                        }
                    }
                }
            }
        }

        // === 2. 应用排斥力调整航向 ===
        if (repulsionX !== 0 || repulsionY !== 0) {
            const targetDirX = Math.cos(steerAngle);
            const targetDirY = Math.sin(steerAngle);
            
            // 合成方向 = 目标方向 + 排斥力
            const combinedX = targetDirX + repulsionX;
            const combinedY = targetDirY + repulsionY;
            
            // 如果合成方向有效，使用它
            if (Math.abs(combinedX) > 0.01 || Math.abs(combinedY) > 0.01) {
                steerAngle = Math.atan2(combinedY, combinedX);
            }
            
            // 靠近障碍物时减速
            const maxRepulsion = Math.sqrt(repulsionX * repulsionX + repulsionY * repulsionY);
            if (maxRepulsion > 0.5) {
                targetSpeed *= Math.max(0.3, 1 - maxRepulsion * 0.3);
            }
        } else {
            // 没有避障需求，清除绕行状态
            if (nearestBlockingIsland === null) {
                this._avoidDirection = 0;
                this._avoidingIsland = null;
            }
        }

        // === 3. 边界回避 ===
        const margin = 1200;
        const borderRepulsion = 0.8;
        
        if (this.x < margin) {
            repulsionX += borderRepulsion * (1 - this.x / margin);
        } else if (this.x > worldSize - margin) {
            repulsionX -= borderRepulsion * (1 - (worldSize - this.x) / margin);
        }
        
        if (this.y < margin) {
            repulsionY += borderRepulsion * (1 - this.y / margin);
        } else if (this.y > worldSize - margin) {
            repulsionY -= borderRepulsion * (1 - (worldSize - this.y) / margin);
        }

        // 如果边界排斥力较大，重新计算航向
        if (Math.abs(repulsionX) > 0.3 || Math.abs(repulsionY) > 0.3) {
            const targetDirX = Math.cos(steerAngle);
            const targetDirY = Math.sin(steerAngle);
            const combinedX = targetDirX + repulsionX * 0.5;
            const combinedY = targetDirY + repulsionY * 0.5;
            steerAngle = Math.atan2(combinedY, combinedX);
        }

        return { steerAngle, targetSpeed };
    }

    /**
     * 智能卡死检测与脱困
     */
    handleStuckDetection(dt, game) {
        // 检测是否卡住：速度很低但油门很高
        const isStuck = Math.abs(this.speed) < 0.12 && Math.abs(this.throttle) > 0.08;
        
        if (isStuck) {
            this._stuckTimer += dt;
            
            // 快速检测卡死（0.8秒）
            if (this._stuckTimer > 0.8) {
                // 找到阻挡的岛屿
                let blockingIsland = null;
                let minDist = Infinity;
                
                for (const isl of game.islands) {
                    const d = dist(this, isl);
                    if (d < isl.radius + this.cfg.width * 3 && d < minDist) {
                        minDist = d;
                        blockingIsland = isl;
                    }
                }
                
                if (blockingIsland) {
                    // 计算脱困方向：垂直于到岛屿的方向
                    const aToIsland = angleTo(this, blockingIsland);
                    
                    // 选择更开阔的脱困方向
                    const escapeDir1 = aToIsland + Math.PI * 0.6;
                    const escapeDir2 = aToIsland - Math.PI * 0.6;
                    
                    // 选择与当前航向更接近的方向
                    const diff1 = Math.abs(normalizeAngle(escapeDir1 - this.angle));
                    const diff2 = Math.abs(normalizeAngle(escapeDir2 - this.angle));
                    
                    const escapeAngle = diff1 < diff2 ? escapeDir1 : escapeDir2;
                    
                    // 先倒车，再转向
                    if (this._stuckTimer < 2.0) {
                        // 倒车阶段
                        this.throttle = -0.25;
                        const reverseDiff = normalizeAngle(escapeAngle + Math.PI - this.angle);
                        this.rudder = clamp(reverseDiff * 2, -1, 1);
                    } else if (this._stuckTimer < 3.5) {
                        // 转向阶段
                        this.throttle = 0.1;
                        const turnDiff = normalizeAngle(escapeAngle - this.angle);
                        this.rudder = clamp(turnDiff * 3, -1, 1);
                    } else {
                        // 强制脱困：大角度转向
                        this.throttle = -0.3;
                        this.rudder = this.rudder > 0 ? 1 : -1;
                        
                        // 3秒后重置
                        if (this._stuckTimer > 5) {
                            this._stuckTimer = 0;
                            this._avoidDirection = 0;
                            this._avoidingIsland = null;
                        }
                    }
                } else {
                    // 没有岛屿阻挡，可能是边界或其他原因
                    if (this._stuckTimer > 1.5) {
                        // 随机转向脱困
                        this.throttle = -0.2;
                        const randomTurn = (Math.random() - 0.5) * Math.PI;
                        const targetAngle = this.angle + Math.PI + randomTurn;
                        const diff = normalizeAngle(targetAngle - this.angle);
                        this.rudder = clamp(diff * 2, -1, 1);
                        
                        if (this._stuckTimer > 3) {
                            this._stuckTimer = 0;
                        }
                    }
                }
            }
        } else {
            // 恢复正常，重置卡死计时
            if (this._stuckTimer > 0) {
                this._stuckTimer = Math.max(0, this._stuckTimer - dt * 2); // 缓慢恢复
            }
        }
    }
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Ship };
}