// ==================== 主游戏类 ====================
// 依赖: config.js, utils.js, particle.js, projectile.js, squadron.js, island.js, capturePoint.js, ship.js, renderer3d.js

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
        this.squadrons = []; // 飞行中队
        this.squadronControlMode = false; // 是否正在控制中队
        this.activeSquadron = null;
        this.selectedSquadronType = 'torpedo';
        
        // 武器模式 'main' | 'torpedo'
        this.weaponMode = 'main';

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
        this.zoomMode = false;   // Shift瞄准镜模式
        this.zoomLevel = 0;      // 0=正常 1=全放大（平滑过渡用）

        this.setupInput();
        this.setupUI();

        // 海浪纹理偏移
        this.waveTime = 0;

        // 3D渲染器
        this.renderer3D = new Renderer3D();

        // 缓存3D投影对象（避免每帧GC）
        this._raycaster = new THREE.Raycaster();
        this._ndcVec = new THREE.Vector2();
        this._seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this._rayTarget = new THREE.Vector3();
        this._projVec = new THREE.Vector3();
    }

    // 获取当前玩家控制的船
    getPlayer() {
        if (this.allies.length === 0) return null;
        return this.allies[this.playerIndex] || this.allies[0];
    }

    // 切换到指定舰船（1-9对应index 0-8）
    switchToShip(index) {
        if (index < 0 || index >= this.allies.length) return false;
        if (this.spectatorMode) return false;
        const target = this.allies[index];
        if (!target || !target.alive) return false;

        const oldPlayer = this.getPlayer();
        if (oldPlayer) {
            oldPlayer.isPlayer = false;
            oldPlayer.throttle = 0;
            oldPlayer.rudder = 0;
        }
        this.playerIndex = index;
        target.isPlayer = true;
        return true;
    }

    // 进入/退出观战模式
    toggleSpectator() {
        if (this.spectatorMode) {
            // 退出观战 - 找一个存活的舰船接管
            let idx = this.spectatorTarget;
            if (!this.allies[idx] || !this.allies[idx].alive) {
                idx = this.allies.findIndex(a => a && a.alive);
                if (idx < 0) return; // 全部沉没
            }
            this.exitSpectator(idx);
        } else {
            // 进入观战
            const oldPlayer = this.getPlayer();
            if (oldPlayer) {
                oldPlayer.isPlayer = false;
                oldPlayer.throttle = 0;
                oldPlayer.rudder = 0;
            }
            this.spectatorMode = true;
            this.spectatorTarget = this.playerIndex;
            document.getElementById('crosshair').style.display = 'none';
        }
    }

    // 退出观战模式并接管指定舰船
    exitSpectator(index) {
        if (index < 0 || index >= this.allies.length) return;
        const target = this.allies[index];
        if (!target || !target.alive) return;
        this.spectatorMode = false;
        this.playerIndex = index;
        target.isPlayer = true;
        document.getElementById('crosshair').style.display = 'block';
    }

    // 观战模式下自动切换死亡目标
    checkSpectatorTarget() {
        if (!this.spectatorMode) return;
        const target = this.allies[this.spectatorTarget];
        if (!target || !target.alive) {
            const next = this.allies.findIndex(a => a && a.alive);
            if (next >= 0) this.spectatorTarget = next;
        }
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
            
            if (this.running) {
                const player = this.getPlayer();

                // === 公共控制 ===
                // 0键：切换观战模式
                if (e.key === '0') {
                    this.toggleSpectator();
                    return;
                }

                // === 观战模式控制 ===
                if (this.spectatorMode) {
                    // 1-9键：直接切换观察目标
                    if (e.key >= '1' && e.key <= '9') {
                        const idx = parseInt(e.key) - 1;
                        if (idx < this.allies.length) this.spectatorTarget = idx;
                    }
                    // [ / ] 键：循环切换观察目标
                    if (e.key === '[' || e.key === ']') {
                        let newIndex = this.spectatorTarget + (e.key === ']' ? 1 : -1);
                        if (newIndex < 0) newIndex = this.allies.length - 1;
                        if (newIndex >= this.allies.length) newIndex = 0;
                        this.spectatorTarget = newIndex;
                    }
                    return; // 观战模式下屏蔽其他控制
                }

                // === 玩家控制 ===
                
                // 1键：主炮模式 / CV鱼雷机
                if (e.key === '1') {
                    if (player && player.type === 'carrier' && !this.squadronControlMode) {
                        this.selectedSquadronType = 'torpedo';
                        const sq = player.launchSquadron('torpedo', this);
                        if (sq) {
                            this.squadronControlMode = true;
                            this.activeSquadron = sq;
                        }
                    } else {
                        this.weaponMode = 'main';
                        const hud = document.getElementById('weapon-info');
                        if (hud) {
                            hud.querySelector('#weapon-name').textContent = '主炮';
                            hud.style.color = '#fff';
                        }
                    }
                }
                // 2键：鱼雷模式 / CV轰炸机
                if (e.key === '2') {
                    if (player && player.type === 'carrier' && !this.squadronControlMode) {
                        this.selectedSquadronType = 'dive';
                        const sq = player.launchSquadron('dive', this);
                        if (sq) {
                            this.squadronControlMode = true;
                            this.activeSquadron = sq;
                        }
                    } else {
                        if (player && player.cfg.torpedo) {
                            this.weaponMode = 'torpedo';
                            const hud = document.getElementById('weapon-info');
                            if (hud) {
                                hud.querySelector('#weapon-name').textContent = '鱼雷';
                                hud.style.color = '#80ffb0';
                            }
                        }
                    }
                }
                // 3键：CV攻击机
                if (e.key === '3') {
                    if (player && player.type === 'carrier' && !this.squadronControlMode) {
                        this.selectedSquadronType = 'rocket';
                        const sq = player.launchSquadron('rocket', this);
                        if (sq) {
                            this.squadronControlMode = true;
                            this.activeSquadron = sq;
                        }
                    }
                }

                // [ / ] 键：切换控制舰只
                if (e.key === '[' || e.key === ']') {
                    let newIndex = this.playerIndex + (e.key === ']' ? 1 : -1);
                    if (newIndex < 0) newIndex = this.allies.length - 1;
                    if (newIndex >= this.allies.length) newIndex = 0;
                    
                    // 寻找下一个存活的
                    let count = 0;
                    while ((!this.allies[newIndex] || !this.allies[newIndex].alive) && count < this.allies.length) {
                        newIndex += (e.key === ']' ? 1 : -1);
                        if (newIndex < 0) newIndex = this.allies.length - 1;
                        if (newIndex >= this.allies.length) newIndex = 0;
                        count++;
                    }
                    
                    if (count < this.allies.length) {
                        this.switchToShip(newIndex);
                    }
                }

                // F键：召回中队（返航后自动交还控制权）
                if (e.key.toLowerCase() === 'f' && this.squadronControlMode && this.activeSquadron) {
                    this.activeSquadron.recall();
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
            if (ch) {
                ch.style.left = e.clientX + 'px';
                ch.style.top = e.clientY + 'px';
            }
        });
        const clickTarget = document.getElementById('three-container');
        clickTarget.addEventListener('mousedown', e => {
            const player = this.getPlayer();
            if (!this.running || !player || !player.alive || this.spectatorMode) return;
            e.preventDefault();
            
            // 左键点击
            if (e.button === 0) {
                // CV中队攻击（保持视角跟随中队直到返航）
                if (this.squadronControlMode && this.activeSquadron) {
                    this.activeSquadron.startAttack();
                } 
                // 船只开火
                else if (player.turretOnTarget) {
                    if (this.weaponMode === 'torpedo') {
                        player.fireTorpedo(player.turretAngle, this);
                    } else {
                        const targetDist = dist(player, this.mouseWorld);
                        player.fireMainGun(player.turretAngle, this, targetDist);
                    }
                }
            } 
        });
        clickTarget.addEventListener('contextmenu', e => e.preventDefault());
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
        const isSpectator = document.getElementById('spectator-check').checked;

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('crosshair').style.display = isSpectator ? 'none' : 'block';
        document.getElementById('game-container').classList.add('playing');
        document.getElementById('scoreboard').style.display = 'flex';
        document.getElementById('ally-panel').style.display = 'flex';
        document.getElementById('enemy-panel').style.display = 'flex';

        // 重置
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.squadrons = [];
        this.squadronControlMode = false;
        this.activeSquadron = null;
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
        playerShip.isPlayer = !isSpectator; // 观战模式下不由玩家控制
        playerShip.angle = Math.PI / 2;

        // 生成友军（包含玩家共12艘）
        this.allies = [playerShip];
        this.playerIndex = 0;
        this.spectatorMode = isSpectator;
        this.spectatorTarget = 0;
        const allyCount = mapConfig.teamSize.allies - 1; // 剩余11艘
        const allyTypes = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'battleship', 'destroyer', 'cruiser', 'battleship', 'destroyer', 'cruiser', 'carrier'];
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
        const enemyTypes = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'cruiser', 'battleship', 'destroyer', 'battleship', 'destroyer', 'cruiser', 'cruiser', 'carrier'];
        for (let i = 0; i < enemyCount; i++) {
            const spawn = mapConfig.spawns.enemies[i % mapConfig.spawns.enemies.length];
            const offsetX = randRange(-1000, 1000);
            const offsetY = randRange(-1000, 1000);
            const type = enemyTypes[i % enemyTypes.length];
            const enemy = new Ship(spawn.x + offsetX, spawn.y + offsetY, type, 'enemy');
            enemy.angle = -Math.PI / 2; // 朝向左侧（我方）
            this.enemies.push(enemy);
        }

        // 初始化3D场景
        this.renderer3D.clearScene();
        this.renderer3D.setMapColors(mapConfig);
        // 创建3D岛屿
        for (const isl of this.islands) {
            this.renderer3D.createIslandMesh(isl, mapConfig);
        }
        // 创建3D占领点
        for (const cp of this.capturePoints) {
            this.renderer3D.createCapturePointMesh(cp);
        }
        // 移动海洋到地图中心
        this.renderer3D.ocean.position.set(worldSize / 2, 0, worldSize / 2);

        // 初始化相机到玩家后方（玩家初始角度PI/2朝+Z）
        const ps = playerSpawn;
        this.renderer3D.camera.position.set(ps.x, 350, ps.y - 450);
        this.renderer3D.camera.lookAt(ps.x, 0, ps.y + 200);

        // 初始化2D相机
        this.cam.x = ps.x - this.cam.w / 2;
        this.cam.y = ps.y - this.cam.h / 2;

        this.running = true;
        if (!this._loopStarted) {
            this._loopStarted = true;
            this.lastTime = performance.now();
            requestAnimationFrame(t => this.loop(t));
        }
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
        if (this.spectatorMode) {
            // === 观战模式：所有友军都走AI ===
            for (const ally of this.allies) {
                ally.update(dt, this);
                ally.updateAI(dt, this);
            }
            this.checkSpectatorTarget();
            // 2D相机跟随观战目标
            const target = this.allies[this.spectatorTarget];
            if (target && target.alive) {
                this.cam.x = lerp(this.cam.x, target.x - this.cam.w / 2, 0.08);
                this.cam.y = lerp(this.cam.y, target.y - this.cam.h / 2, 0.08);
            }
        } else {
            // === 正常模式：玩家输入 ===
            const currentPlayer = this.getPlayer();
            if (currentPlayer && currentPlayer.alive) {
                const p = currentPlayer;

                // CV中队控制模式
                if (this.squadronControlMode && this.activeSquadron && this.activeSquadron.alive) {
                    const sq = this.activeSquadron;
                    // 返航时自动交还控制权
                    if (sq.state === 'returning') {
                        this.squadronControlMode = false;
                        this.activeSquadron = null;
                    } else if (sq.state === 'attacking') {
                        // 攻击跑期间锁定操控，但保持相机跟随中队
                        sq.rudder *= 0.8;
                        sq.boosting = false;
                        sq.braking = false;
                    } else {
                        // 正常飞行控制
                        if (this.keys['a']) sq.rudder = -1;
                        else if (this.keys['d']) sq.rudder = 1;
                        else sq.rudder *= 0.8;
                        sq.boosting = !!this.keys['w'];
                        sq.braking = !!this.keys['s'];
                    }
                    // CV本体自动巡航
                    p.update(dt, this);
                } else {
                    // 检查中队是否已失效
                    if (this.squadronControlMode) {
                        this.squadronControlMode = false;
                        this.activeSquadron = null;
                    }
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
                    // Shift瞄准镜
                    this.zoomMode = !!this.keys['shift'];

                    p.update(dt, this);
                }

                // 相机跟随
                const targetCx = p.x - this.cam.w / 2;
                const targetCy = p.y - this.cam.h / 2;
                this.cam.x = lerp(this.cam.x, targetCx, 0.08);
                this.cam.y = lerp(this.cam.y, targetCy, 0.08);

                // 鼠标世界坐标 - 通过3D射线投射到海平面
                this.updateMouseWorld();
            }

            // 友军AI更新（跳过已在上方更新的存活玩家船）
            for (const ally of this.allies) {
                if (ally.isPlayer) {
                    if (!ally.alive) ally.update(dt, this);
                } else {
                    ally.update(dt, this);
                    ally.updateAI(dt, this);
                }
            }
        }

        // 敌人
        for (const e of this.enemies) {
            e.update(dt, this);
            e.updateAI(dt, this);
        }

        // 飞行中队更新
        for (const sq of this.squadrons) {
            if (!sq.alive) continue;
            sq.update(dt, this);
            // AA防空伤害
            const enemyShips = sq.team === 'player' ? this.enemies : this.allies;
            for (const ship of enemyShips) {
                if (!ship.alive) continue;
                const d = dist(sq, ship);
                const aaRange = 4000;
                if (d < aaRange) {
                    const aaDps = ship.type === 'cruiser' ? 800 : ship.type === 'battleship' ? 600 : 400;
                    const falloff = 1 - d / aaRange;
                    sq.takeDamage(aaDps * falloff * dt);
                }
            }
        }
        // 清理死亡中队
        for (let i = this.squadrons.length - 1; i >= 0; i--) {
            const sq = this.squadrons[i];
            if (!sq.alive) {
                this.renderer3D.updateSquadron(sq);
                this.squadrons.splice(i, 1);
            }
        }

        // 弹药
        for (const proj of this.projectiles) {
            proj.update(dt, this);

            // 碰撞检测 - 根据团队判断目标
            let targets = [];
            if (proj.owner.team === 'player') {
                targets = this.enemies.filter(e => e && e.alive);
            } else {
                targets = [...this.allies.filter(a => a && a.alive), this.getPlayer()].filter(s => s && s.alive);
            }

            // 炮弹落地 → 溅射伤害判定
            if ((proj.type === 'shell' || proj.type === 'bomb') && proj.landed) {
                // 检查是否落在岛屿上（不造成伤害）
                let landedOnIsland = false;
                for (const isl of this.islands) {
                    if (dist(proj, isl) < isl.radius) {
                        landedOnIsland = true;
                        break;
                    }
                }
                if (landedOnIsland) continue;
                const splashRadius = proj.type === 'bomb' ? 120 : (proj.owner?.cfg?.mainGun?.splashRadius || 80);
                // 3D落水水柱特效
                this.renderer3D.createHitEffect(proj.x, proj.y, 'splash');
                // 范围内溅射伤害
                for (const t of targets) {
                    if (!t || !t.alive) continue;
                    const d = dist(proj, t);
                    if (d < splashRadius + t.cfg.width) {
                        const falloff = 1 - Math.max(0, d - t.cfg.width * 0.5) / splashRadius;
                        const dmg = proj.damage * clamp(falloff, 0.15, 1);
                        t.takeDamage(dmg, this);
                        if (proj.owner) proj.owner.damageDealt += dmg;
                        if (proj.owner.team === 'player' && proj.owner.isPlayer) {
                            this.totalDamage += dmg;
                        }
                        // 3D命中特效
                        this.renderer3D.createHitEffect(t.x, t.y, 'shell_hit');
                        // 检查击杀并计分
                        if (!t.alive) {
                            const shipPoints = { destroyer: 40, cruiser: 60, battleship: 80, carrier: 100 };
                            const points = shipPoints[t.type] || 40;
                            if (t.team === 'enemy') {
                                this.kills++;
                                if (!proj.owner.isPlayer) this.allyKills++;
                                this.playerScore += points;
                            } else {
                                this.enemyKills++;
                                this.enemyScore += points;
                            }
                            const label = t.team === 'enemy' ? '击沉敌军 ' : '友军 ';
                            const kcolor = t.team === 'enemy' ? '#ffd700' : '#ff6666';
                            this.floatingTexts.push({ x: t.x, y: t.y - 60, text: '+' + points + '分', color: '#ffffff', life: 1.5, vy: -1 });
                            this.floatingTexts.push({ x: t.x, y: t.y - 40, text: label + t.cfg.name + '!', color: kcolor, life: 2.5, vy: -0.8 });
                        }
                    }
                }
                // 检查占领点范围内的战斗
                for (const cp of this.capturePoints) {
                    if (dist(proj, cp) < cp.radius) cp.onAttacked();
                }
                continue;
            }

            if (!proj.alive) continue;

            // 抛物线炮弹飞行中 → 检查岛屿遮挡（低于岛高时拦截）
            if ((proj.type === 'shell' || proj.type === 'bomb') && proj.gravity > 0) {
                let blocked = false;
                for (const isl of this.islands) {
                    if (dist(proj, isl) < isl.radius * 0.85) {
                        const islandHeight = isl.radius * 0.5;
                        if (proj.z < islandHeight) {
                            proj.alive = false;
                            blocked = true;
                            break;
                        }
                    }
                }
                if (!blocked) continue;
            }

            // 鱼雷及其他直射弹药 → 直接命中判定
            for (const t of targets) {
                if (!t || !t.alive) continue;
                if (dist(proj, t) < t.cfg.width + 8) {
                    t.takeDamage(proj.damage, this);
                    if (proj.owner) proj.owner.damageDealt += proj.damage;
                    if (proj.owner.team === 'player' && proj.owner.isPlayer) {
                        this.totalDamage += proj.damage;
                    }
                    proj.alive = false;
                    // 3D命中特效
                    this.renderer3D.createHitEffect(proj.x, proj.y, proj.type === 'torpedo' ? 'torpedo' : 'shell_hit');
                    // 检查击杀并计分
                    if (!t.alive) {
                        const shipPoints = { destroyer: 40, cruiser: 60, battleship: 80, carrier: 100 };
                        const points = shipPoints[t.type] || 40;
                        if (t.team === 'enemy') {
                            this.kills++;
                            if (!proj.owner.isPlayer) this.allyKills++;
                            this.playerScore += points;
                        } else {
                            this.enemyKills++;
                            this.enemyScore += points;
                        }
                        const label = t.team === 'enemy' ? '击沉敌军 ' : '友军 ';
                        const kcolor = t.team === 'enemy' ? '#ffd700' : '#ff6666';
                        this.floatingTexts.push({ x: t.x, y: t.y - 60, text: '+' + points + '分', color: '#ffffff', life: 1.5, vy: -1 });
                        this.floatingTexts.push({ x: t.x, y: t.y - 40, text: label + t.cfg.name + '!', color: kcolor, life: 2.5, vy: -0.8 });
                    }
                    break;
                }
            }

            // 岛屿碰撞（仅鱼雷等低空弹药）
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

        // 更新占领点并计算占领分数
        const playerCaps = this.capturePoints.filter(cp => cp.owner === 'player').length;
        const enemyCaps = this.capturePoints.filter(cp => cp.owner === 'enemy').length;
        
        for (const cp of this.capturePoints) {
            cp.update(dt, this);
        }
        
        // 占领点产出分数：每个占领点每秒1.5分
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
        let p;
        if (this.spectatorMode) {
            p = this.allies[this.spectatorTarget];
        } else {
            p = this.getPlayer();
        }
        if (!p) return;
        const hpRatio = p.hp / p.maxHp;
        const hpBar = document.getElementById('hp-bar');
        hpBar.style.width = (hpRatio * 100) + '%';
        if (hpRatio > 0.5) hpBar.style.background = 'linear-gradient(90deg, #2ecc40, #4cff72)';
        else if (hpRatio > 0.25) hpBar.style.background = 'linear-gradient(90deg, #ffaa00, #ffcc44)';
        else hpBar.style.background = 'linear-gradient(90deg, #ff3333, #ff6644)';
        document.getElementById('hp-text').textContent = Math.round(p.hp) + ' / ' + p.maxHp;

        if (p.type === 'carrier' && p.squadronDecks) {
            const torp = p.squadronDecks.torpedo;
            const dive = p.squadronDecks.dive;
            const rocket = p.squadronDecks.rocket;
            const tc = p.squadronCooldowns.torpedo > 0 ? p.squadronCooldowns.torpedo.toFixed(0) + 's' : torp.planes + '✈';
            const dc = p.squadronCooldowns.dive > 0 ? p.squadronCooldowns.dive.toFixed(0) + 's' : dive.planes + '✈';
            const rc = p.squadronCooldowns.rocket > 0 ? p.squadronCooldowns.rocket.toFixed(0) + 's' : rocket.planes + '✈';
            document.getElementById('weapon-name').textContent = '[1]鱼雷机 | [2]轰炸机 | [3]攻击机';
            document.getElementById('reload-status').textContent = tc + ' | ' + dc + ' | ' + rc;
            const reloadEl = document.getElementById('reload-status');
            reloadEl.style.color = '#88ccff';
        } else {
            const gunReload = p.mainGunTimer > 0 ? p.mainGunTimer.toFixed(1) + 's' : '就绪';
            const torpReload = p.cfg.torpedo ? (p.torpedoTimer > 0 ? p.torpedoTimer.toFixed(1) + 's' : '就绪') : '无';
            
            const wName = document.getElementById('weapon-name');
            const wStatus = document.getElementById('reload-status');
            
            if (this.weaponMode === 'torpedo' && p.cfg.torpedo) {
                wName.innerHTML = '<span style="color:#888">主炮</span> | <span style="color:#80ffb0; font-weight:bold">[2] 鱼雷</span>';
                wStatus.textContent = gunReload + ' | ' + torpReload;
                wStatus.style.color = p.torpedoTimer > 0 ? '#ffaa44' : '#80ffb0';
            } else {
                const torpText = p.cfg.torpedo ? '鱼雷' : '无';
                wName.innerHTML = '<span style="color:#fff; font-weight:bold">[1] 主炮</span> | <span style="color:#888">' + torpText + '</span>';
                wStatus.textContent = gunReload + ' | ' + torpReload;
                wStatus.style.color = p.mainGunTimer > 0 ? '#ffaa44' : '#4cff72';
            }
        }

        document.getElementById('speed-val').textContent = Math.abs(Math.round(p.speed / (p.cfg.maxSpeed * 0.15) * p.cfg.maxSpeed));
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
                        <div class="ship-dmg">0</div>
                        <div class="ship-hp-bar"><div class="ship-hp-fill" style="width: 100%"></div></div>
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

            const isActive = this.spectatorMode ? (this.spectatorTarget === index) : ally.isPlayer;
            item.classList.toggle('active', isActive);
            item.classList.toggle('destroyed', !ally.alive);

            // 伤害值
            const dmgEl = item.querySelector('.ship-dmg');
            if (dmgEl) {
                dmgEl.textContent = this._formatDmg(ally.damageDealt);
            }

            // 血条
            const hpFill = item.querySelector('.ship-hp-fill');
            if (hpFill) {
                const hpPercent = ally.alive ? (ally.hp / ally.maxHp * 100) : 0;
                hpFill.style.width = hpPercent + '%';
                hpFill.classList.remove('low', 'critical');
                if (!ally.alive) hpFill.classList.add('critical');
                else if (hpPercent < 25) hpFill.classList.add('critical');
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
                        <div class="ship-dmg">0</div>
                        <div class="ship-hp-bar"><div class="ship-hp-fill" style="width: 100%"></div></div>
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

            // 伤害值
            const dmgEl = item.querySelector('.ship-dmg');
            if (dmgEl) {
                dmgEl.textContent = this._formatDmg(enemy.damageDealt);
            }

            // 血条
            const hpFill = item.querySelector('.ship-hp-fill');
            if (hpFill) {
                const hpPercent = enemy.alive ? (enemy.hp / enemy.maxHp * 100) : 0;
                hpFill.style.width = hpPercent + '%';
            }
        });
    }

    // 格式化伤害数字
    _formatDmg(dmg) {
        if (dmg >= 10000) return (dmg / 1000).toFixed(1) + 'k';
        return Math.round(dmg).toString();
    }

    // 获取舰船图标
    getShipIcon(type) {
        const icons = { destroyer: 'DD', cruiser: 'CA', battleship: 'BB', carrier: 'CV' };
        return icons[type] || '?';
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;
        const dt = 1 / 60;

        // 清空2D叠加层（透明背景）
        ctx.clearRect(0, 0, W, H);

        // === 3D渲染 ===
        const currentPlayer = this.getPlayer();

        // zoomLevel平滑过渡
        const targetZoom = this.zoomMode ? 1 : 0;
        this.zoomLevel = lerp(this.zoomLevel, targetZoom, 0.1);
        if (Math.abs(this.zoomLevel - targetZoom) < 0.005) this.zoomLevel = targetZoom;

        // 更新3D舰船
        for (const ally of this.allies) this.renderer3D.updateShip(ally);
        for (const e of this.enemies) this.renderer3D.updateShip(e);

        // 更新3D中队
        for (const sq of this.squadrons) {
            this.renderer3D.updateSquadron(sq);
        }

        // 更新3D弹药
        this.renderer3D.updateProjectiles(this.projectiles);

        // 更新3D相机
        if (this.spectatorMode) {
            const specTarget = this.allies[this.spectatorTarget];
            this.renderer3D.updateCamera(specTarget, 0);
            this.renderer3D.aimMarker.visible = false;
        } else if (this.squadronControlMode && this.activeSquadron && this.activeSquadron.alive) {
            // 中队控制模式 - 相机跟随中队
            this.renderer3D.updateSquadronCamera(this.activeSquadron);
            this.renderer3D.aimMarker.visible = false;
        } else {
            this.renderer3D.updateCamera(currentPlayer, this.zoomLevel);
            // 更新3D落点标记 - CV没有主炮
            if (currentPlayer && currentPlayer.alive && currentPlayer.cfg.mainGun) {
                const targetDist = dist(currentPlayer, this.mouseWorld);
                const inRange = targetDist <= currentPlayer.cfg.mainGun.range;
                this.renderer3D.updateAimMarker(currentPlayer, this.mouseWorld, currentPlayer.turretOnTarget, inRange);
            } else {
                this.renderer3D.aimMarker.visible = false;
            }
        }

        // 渲染3D场景
        this.renderer3D.render(dt);

        // === 2D HUD叠加层 ===
        // 浮动文字 - 投影到屏幕坐标
        for (const ft of this.floatingTexts) {
            const screenPos = this.worldToScreen(ft.x, ft.y);
            if (!screenPos) continue;
            ctx.globalAlpha = clamp(ft.life, 0, 1);
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 3;
            ctx.strokeText(ft.text, screenPos.x, screenPos.y);
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, screenPos.x, screenPos.y);
            ctx.globalAlpha = 1;
        }

        // 舰船名称和血条 - 在2D叠加层上绘制
        const allShips = [...this.allies, ...this.enemies];
        for (const ship of allShips) {
            if (!ship.alive) continue;
            const screenPos = this.worldToScreen(ship.x, ship.y);
            if (!screenPos) continue;

            const L = ship.cfg.length;
            const barW = L * 0.5;
            const barH = 5;
            const bx = screenPos.x - barW / 2;
            const by = screenPos.y - 40;
            const hpRatio = ship.hp / ship.maxHp;

            // 血条背景
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

            // 血条
            let hpColor;
            if (ship.team === 'player') {
                hpColor = hpRatio > 0.5 ? '#2ecc40' : hpRatio > 0.25 ? '#ffaa00' : '#ff3333';
            } else {
                hpColor = hpRatio > 0.5 ? '#ff6666' : hpRatio > 0.25 ? '#ff8844' : '#ff1111';
            }
            ctx.fillStyle = hpColor;
            ctx.fillRect(bx, by, barW * hpRatio, barH);

            // 名称
            ctx.fillStyle = ship.team === 'player' ? 'rgba(100, 200, 255, 0.9)' : 'rgba(255, 150, 150, 0.9)';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            let label;
            if (ship.team === 'player') {
                const idx = this.allies.indexOf(ship);
                const isSpecWatching = this.spectatorMode && idx === this.spectatorTarget;
                label = (ship.isPlayer ? '▶我' : isSpecWatching ? '▶观战' : '友军') + ' ' + ship.cfg.name;
                if (idx >= 0 && this.spectatorMode) label = `[${idx + 1}] ` + label;
            } else {
                label = '敌军 ' + ship.cfg.name;
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.strokeText(label, screenPos.x, by - 4);
            ctx.fillText(label, screenPos.x, by - 4);
        }

        // 小地图
        this.drawMinimap();

        // HUD更新
        this.updateHUD();

        // === WoWS风格动态准心 / CV中队HUD ===
        if (!this.spectatorMode && currentPlayer && currentPlayer.alive) {
            if (currentPlayer.type === 'carrier') {
                this.drawCarrierHUD(ctx, currentPlayer, W, H);
            } else {
                this.drawWoWSCrosshair(ctx, currentPlayer, W, H);
            }
        }

        // 观战模式提示
        if (this.spectatorMode) {
            const specShip = this.allies[this.spectatorTarget];
            const specName = specShip ? `[${this.spectatorTarget + 1}] ${specShip.cfg.name}` : '';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
            const specText = `观战模式 - ${specName}`;
            ctx.strokeText(specText, W / 2, 80);
            ctx.fillText(specText, W / 2, 80);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            ctx.fillText('按 1-9 切换目标 | 按 0 退出观战', W / 2, 105);
        }

        // 受伤红框
        if (!this.spectatorMode && currentPlayer && currentPlayer.damageFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${currentPlayer.damageFlash * 0.5})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    // 鼠标屏幕坐标转世界坐标（射线投射到y=0海平面）
    updateMouseWorld() {
        this._ndcVec.set(
            (this.mouse.x / window.innerWidth) * 2 - 1,
            -(this.mouse.y / window.innerHeight) * 2 + 1
        );
        this._raycaster.setFromCamera(this._ndcVec, this.renderer3D.camera);
        const result = this._raycaster.ray.intersectPlane(this._seaPlane, this._rayTarget);
        if (result) {
            this.mouseWorld.x = this._rayTarget.x;
            this.mouseWorld.y = this._rayTarget.z;
        }
    }

    // 世界坐标转屏幕坐标（通过Three.js相机投影）
    worldToScreen(wx, wy) {
        const vec = this._projVec;
        vec.set(wx, 15, wy);
        vec.project(this.renderer3D.camera);
        if (vec.z > 1) return null; // 在相机背后
        const x = (vec.x * 0.5 + 0.5) * this.canvas.width;
        const y = (-vec.y * 0.5 + 0.5) * this.canvas.height;
        if (x < -100 || x > this.canvas.width + 100 || y < -100 || y > this.canvas.height + 100) return null;
        return { x, y };
    }

    drawMinimap() {
        const mctx = this.miniCtx;
        const mw = 200, mh = 200;
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
        mctx.fillStyle = this.currentMap?.colors?.island ? ColorUtils.darkenColor(this.currentMap.colors.island, 10) : '#3a5a22';
        for (const isl of this.islands) {
            mctx.beginPath();
            mctx.arc(isl.x * scale, isl.y * scale, Math.max(isl.radius * scale, 2), 0, Math.PI * 2);
            mctx.fill();
        }

        // 占领点
        for (const cp of this.capturePoints) {
            cp.drawMinimap(mctx, scale);
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

        // 飞行中队
        for (const sq of this.squadrons) {
            if (!sq.alive) continue;
            mctx.fillStyle = sq.team === 'player' ? '#88ddff' : '#ff8888';
            const sx = sq.x * scale, sy = sq.y * scale;
            mctx.beginPath();
            mctx.moveTo(sx + Math.cos(sq.angle) * 3, sy + Math.sin(sq.angle) * 3);
            mctx.lineTo(sx + Math.cos(sq.angle + 2.4) * 2.5, sy + Math.sin(sq.angle + 2.4) * 2.5);
            mctx.lineTo(sx + Math.cos(sq.angle - 2.4) * 2.5, sy + Math.sin(sq.angle - 2.4) * 2.5);
            mctx.closePath();
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

    // CV航母HUD绘制
    drawCarrierHUD(ctx, player, W, H) {
        ctx.save();
        const sq = this.activeSquadron;

        if (this.squadronControlMode && sq && sq.alive) {
            // === 中队控制模式HUD ===
            const cx = W / 2;
            const cy = H / 2;

            // 攻击方向锥形
            const coneLen = 120;
            const aimSpread = lerp(0.5, 0.12, sq.aimProgress);
            ctx.strokeStyle = sq.aimProgress > 0.7 ? 'rgba(80, 255, 120, 0.7)' : 'rgba(255, 220, 80, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(-aimSpread) * coneLen, cy + Math.sin(-aimSpread) * coneLen * 0.3 - coneLen * 0.8);
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(aimSpread) * coneLen, cy + Math.sin(aimSpread) * coneLen * 0.3 - coneLen * 0.8);
            ctx.stroke();

            // 中心十字
            ctx.strokeStyle = sq.aimProgress > 0.7 ? 'rgba(80, 255, 120, 0.8)' : 'rgba(255, 220, 80, 0.7)';
            ctx.lineWidth = 1.5;
            const crossS = 15;
            ctx.beginPath();
            ctx.moveTo(cx - crossS, cy); ctx.lineTo(cx + crossS, cy);
            ctx.moveTo(cx, cy - crossS); ctx.lineTo(cx, cy + crossS);
            ctx.stroke();

            // 中队信息
            const sqNames = { torpedo: '鱼雷机', dive: '轰炸机', rocket: '攻击机' };
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(100, 220, 255, 0.9)';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            const sqText = `${sqNames[sq.type]} ×${sq.planes}`;
            ctx.strokeText(sqText, cx, H - 120);
            ctx.fillText(sqText, cx, H - 120);

            // 瞄准进度条
            const barW = 200;
            const barH = 4;
            const bx = cx - barW / 2;
            const by = H - 100;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = sq.aimProgress > 0.7 ? 'rgba(80, 255, 120, 0.8)' : 'rgba(255, 220, 80, 0.7)';
            ctx.fillRect(bx, by, barW * sq.aimProgress, barH);

            // 加速燃料
            const fuelW = 100;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(cx - fuelW / 2, by + 10, fuelW, 3);
            ctx.fillStyle = 'rgba(255, 180, 80, 0.8)';
            ctx.fillRect(cx - fuelW / 2, by + 10, fuelW * (sq.boostFuel / sq.maxBoostFuel), 3);

            // 操作提示
            ctx.font = '12px sans-serif';
            ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeText('A/D转向 | W加速 | S减速 | 左键攻击 | F召回', cx, H - 70);
            ctx.fillText('A/D转向 | W加速 | S减速 | 左键攻击 | F召回', cx, H - 70);
        } else {
            // === 舰船模式HUD（CV甲板视角）===
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(100, 200, 255, 0.85)';
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.lineWidth = 2;

            const sqTypes = ['torpedo', 'dive', 'rocket'];
            const sqNames = { torpedo: '鱼雷机', dive: '轰炸机', rocket: '攻击机' };
            const sqKeys = { torpedo: '1', dive: '2', rocket: '3' };

            const panelX = W / 2;
            const panelY = H - 130;

            for (let i = 0; i < 3; i++) {
                const type = sqTypes[i];
                const deck = player.squadronDecks[type];
                const cd = player.squadronCooldowns[type];
                const x = panelX + (i - 1) * 140;
                const y = panelY;

                // 背景
                ctx.fillStyle = 'rgba(0, 30, 60, 0.6)';
                ctx.fillRect(x - 55, y - 18, 110, 50);
                ctx.strokeStyle = cd > 0 ? 'rgba(255, 120, 60, 0.5)' : 'rgba(80, 200, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 55, y - 18, 110, 50);

                // 标题
                ctx.font = 'bold 13px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = cd > 0 ? 'rgba(255, 150, 80, 0.9)' : 'rgba(100, 220, 255, 0.9)';
                ctx.fillText(`[${sqKeys[type]}] ${sqNames[type]}`, x, y);

                // 飞机数量
                ctx.font = '12px sans-serif';
                ctx.fillStyle = deck.planes > 0 ? 'rgba(200, 255, 200, 0.9)' : 'rgba(255, 120, 120, 0.9)';
                ctx.fillText(`✈ ${deck.planes}/${deck.maxPlanes}`, x, y + 16);

                // 冷却
                if (cd > 0) {
                    ctx.fillStyle = 'rgba(255, 150, 80, 0.8)';
                    ctx.fillText(cd.toFixed(0) + 's', x, y + 28);
                }
            }
        }
        ctx.restore();
    }

    // WoWS风格动态准心绘制
    drawWoWSCrosshair(ctx, player, W, H) {
        const mx = this.mouse.x;
        const my = this.mouse.y;
        
        // === 鱼雷模式 ===
        if (this.weaponMode === 'torpedo') {
            const torp = player.cfg.torpedo;
            if (!torp) return;

            // 绘制鼠标光标
            ctx.strokeStyle = 'rgba(128, 255, 176, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(mx, my, 15, 0, Math.PI * 2);
            ctx.moveTo(mx - 20, my); ctx.lineTo(mx - 10, my);
            ctx.moveTo(mx + 20, my); ctx.lineTo(mx + 10, my);
            ctx.moveTo(mx, my - 20); ctx.lineTo(mx, my - 10);
            ctx.moveTo(mx, my + 20); ctx.lineTo(mx, my + 10);
            ctx.stroke();

            // 绘制鱼雷预测线
            const range = torp.range;
            const count = torp.count;
            const spread = torp.spread;
            const angle = player.turretAngle;

            const shipScreen = this.worldToScreen(player.x, player.y);
            if (!shipScreen) return;

            ctx.save();
            const isReloading = player.torpedoTimer > 0;
            ctx.strokeStyle = isReloading ? 'rgba(255, 160, 0, 0.4)' : 'rgba(128, 255, 176, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);

            for (let i = 0; i < count; i++) {
                const spreadOff = (i - (count - 1) / 2) * spread;
                const a = angle + spreadOff;
                const endX = player.x + Math.cos(a) * range;
                const endY = player.y + Math.sin(a) * range;
                const endScreen = this.worldToScreen(endX, endY);
                if (endScreen) {
                    ctx.beginPath();
                    ctx.moveTo(shipScreen.x, shipScreen.y);
                    ctx.lineTo(endScreen.x, endScreen.y);
                    ctx.stroke();
                }
            }
            
            ctx.fillStyle = isReloading ? 'rgba(255, 160, 0, 0.1)' : 'rgba(128, 255, 176, 0.15)';
            const startA = angle + (0 - (count - 1) / 2) * spread;
            const endA = angle + ((count - 1) - (count - 1) / 2) * spread;
            const p1 = this.worldToScreen(player.x + Math.cos(startA) * range, player.y + Math.sin(startA) * range);
            const p2 = this.worldToScreen(player.x + Math.cos(endA) * range, player.y + Math.sin(endA) * range);
            if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo(shipScreen.x, shipScreen.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.closePath();
                ctx.fill();
            }

            if (isReloading) {
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = '#ffa000';
                ctx.textAlign = 'center';
                ctx.fillText(player.torpedoTimer.toFixed(1) + 's', mx, my + 40);
            }

            ctx.restore();
            return;
        }

        // === 主炮模式 ===
        const gun = player.cfg.mainGun;
        if (!gun) return;

        const zl = this.zoomLevel;

        const targetDist = dist(player, this.mouseWorld);
        const hSpeed = gun.shellSpeed * 60;
        const flightTime = targetDist / hSpeed;
        const distKm = (targetDist / 1000).toFixed(1);
        const inRange = targetDist <= gun.range;

        const onTarget = player.turretOnTarget;
        const diffAbs = player.turretDiffAbs;
        let crossColor, crossAlpha;
        if (!inRange) {
            crossColor = '255, 80, 80';
            crossAlpha = 0.9;
        } else if (onTarget) {
            crossColor = '80, 255, 120';
            crossAlpha = 0.95;
        } else if (diffAbs < 0.3) {
            crossColor = '255, 220, 80';
            crossAlpha = 0.9;
        } else {
            crossColor = '255, 180, 80';
            crossAlpha = 0.8;
        }

        ctx.save();

        // === 瞄准镜暗角效果（zoom时） ===
        if (zl > 0.05) {
            const vigAlpha = zl * 0.6;
            const vigR = Math.min(W, H) * lerp(1.2, 0.55, zl);
            const gradient = ctx.createRadialGradient(W / 2, H / 2, vigR * 0.5, W / 2, H / 2, vigR);
            gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
            gradient.addColorStop(0.7, `rgba(0, 0, 0, ${vigAlpha * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 0, 0, ${vigAlpha})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);
        }

        // === 十字准心 ===
        ctx.strokeStyle = `rgba(${crossColor}, ${crossAlpha})`;
        const isZoomed = zl > 0.5;
        const crossSize = isZoomed ? lerp(22, 80, zl) : (onTarget ? 18 : 22);
        const gap = isZoomed ? lerp(7, 14, zl) : (onTarget ? 4 : 7);
        const lineW = isZoomed ? 1.2 : 2;

        ctx.lineWidth = lineW;
        if (!isZoomed) {
            ctx.shadowColor = `rgba(${crossColor}, 0.5)`;
            ctx.shadowBlur = 6;
        }

        ctx.beginPath();
        ctx.moveTo(mx - crossSize, my); ctx.lineTo(mx - gap, my);
        ctx.moveTo(mx + gap, my); ctx.lineTo(mx + crossSize, my);
        ctx.moveTo(mx, my - crossSize); ctx.lineTo(mx, my - gap);
        ctx.moveTo(mx, my + gap); ctx.lineTo(mx, my + crossSize);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 中心点
        if (onTarget) {
            ctx.fillStyle = `rgba(${crossColor}, 0.9)`;
            ctx.beginPath();
            ctx.arc(mx, my, isZoomed ? 1.5 : 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(mx, my, isZoomed ? 2 : 2.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // === 瞄准镜刻度线（zoom模式独有） ===
        if (zl > 0.3) {
            const scaleAlpha = clamp((zl - 0.3) / 0.4, 0, 1);
            ctx.strokeStyle = `rgba(200, 220, 255, ${0.4 * scaleAlpha})`;
            ctx.lineWidth = 1;

            const maxKm = gun.range / 1000;
            const tickSpacing = lerp(30, 50, zl);
            for (let km = 2; km <= maxKm; km += 2) {
                const tx = mx + km * tickSpacing;
                const tx2 = mx - km * tickSpacing;
                const tickH = km % 4 === 0 ? 12 : 6;

                ctx.beginPath();
                ctx.moveTo(tx, my - tickH); ctx.lineTo(tx, my + tickH);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(tx2, my - tickH); ctx.lineTo(tx2, my + tickH);
                ctx.stroke();

                if (km % 4 === 0) {
                    ctx.font = `${10 * scaleAlpha + 8}px "Consolas", monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = `rgba(200, 220, 255, ${0.5 * scaleAlpha})`;
                    ctx.fillText(km + '', tx, my + tickH + 14);
                    ctx.fillText(km + '', tx2, my + tickH + 14);
                }
            }

            for (let i = 1; i <= 4; i++) {
                const ty = my + i * tickSpacing;
                const ty2 = my - i * tickSpacing;
                const tickW = i % 2 === 0 ? 8 : 4;
                ctx.beginPath();
                ctx.moveTo(mx - tickW, ty); ctx.lineTo(mx + tickW, ty);
                ctx.moveTo(mx - tickW, ty2); ctx.lineTo(mx + tickW, ty2);
                ctx.stroke();
            }
        }

        // === 炮塔实际朝向指示器 ===
        const turretWorldX = player.x + Math.cos(player.turretAngle) * targetDist;
        const turretWorldY = player.y + Math.sin(player.turretAngle) * targetDist;
        const turretScreen = this.worldToScreen(turretWorldX, turretWorldY);

        if (turretScreen && !onTarget) {
            const tx = turretScreen.x;
            const ty = turretScreen.y;
            const markerSize = isZoomed ? 12 : 8;

            ctx.strokeStyle = `rgba(200, 220, 255, 0.7)`;
            ctx.lineWidth = isZoomed ? 1 : 1.5;
            ctx.beginPath();
            ctx.moveTo(tx, ty - markerSize);
            ctx.lineTo(tx + markerSize * 0.6, ty);
            ctx.lineTo(tx, ty + markerSize);
            ctx.lineTo(tx - markerSize * 0.6, ty);
            ctx.closePath();
            ctx.stroke();

            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = `rgba(200, 220, 255, ${isZoomed ? 0.15 : 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(mx, my);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // === 落点散布圈 ===
        if (inRange) {
            const spreadDist = targetDist * gun.spread * 3;
            const aimAngle = player.turretAngle;
            const aimX = player.x + Math.cos(aimAngle) * targetDist;
            const aimY = player.y + Math.sin(aimAngle) * targetDist;

            const spreadPoints = [];
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2;
                const sp = this.worldToScreen(aimX + Math.cos(a) * spreadDist, aimY + Math.sin(a) * spreadDist);
                if (sp) spreadPoints.push(sp);
            }

            if (spreadPoints.length >= 4) {
                ctx.strokeStyle = onTarget ? `rgba(80, 255, 120, 0.5)` : `rgba(255, 220, 80, 0.3)`;
                ctx.lineWidth = isZoomed ? 1 : 1.5;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(spreadPoints[0].x, spreadPoints[0].y);
                for (let i = 1; i < spreadPoints.length; i++) {
                    ctx.lineTo(spreadPoints[i].x, spreadPoints[i].y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // === 距离和飞行时间文字 ===
        const fontSize = isZoomed ? 14 : 12;
        ctx.font = `bold ${fontSize}px "Consolas", monospace`;
        ctx.textAlign = 'left';
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 2;

        const textX = mx + crossSize + 8;
        const textY = my - 4;

        const distColor = inRange ? `rgba(${crossColor}, 0.9)` : 'rgba(255, 80, 80, 0.9)';
        ctx.fillStyle = distColor;
        ctx.strokeText(distKm + ' km', textX, textY);
        ctx.fillText(distKm + ' km', textX, textY);

        if (inRange) {
            ctx.fillStyle = `rgba(200, 220, 255, 0.8)`;
            const ftText = flightTime.toFixed(1) + ' s';
            ctx.strokeText(ftText, textX, textY + 18);
            ctx.fillText(ftText, textX, textY + 18);
        } else {
            ctx.fillStyle = 'rgba(255, 80, 80, 0.8)';
            ctx.strokeText('超出射程', textX, textY + 18);
            ctx.fillText('超出射程', textX, textY + 18);
        }

        // === 装填状态弧线 ===
        const reloadProgress = player.mainGunTimer > 0
            ? 1 - player.mainGunTimer / gun.reload : 1;
        const arcRadius = (isZoomed ? gap + 2 : crossSize + 4);

        if (reloadProgress < 1) {
            ctx.strokeStyle = 'rgba(255, 180, 80, 0.6)';
            ctx.lineWidth = isZoomed ? 2 : 2.5;
            ctx.beginPath();
            ctx.arc(mx, my, arcRadius, -Math.PI / 2, -Math.PI / 2 + reloadProgress * Math.PI * 2);
            ctx.stroke();

            ctx.font = `bold ${isZoomed ? 11 : 10}px "Consolas", monospace`;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 180, 80, 0.8)';
            const pctText = Math.floor(reloadProgress * 100) + '%';
            ctx.strokeText(pctText, mx, my + (isZoomed ? gap + 18 : crossSize + 16));
            ctx.fillText(pctText, mx, my + (isZoomed ? gap + 18 : crossSize + 16));
        } else {
            ctx.strokeStyle = `rgba(${crossColor}, 0.35)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(mx, my, arcRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // === 炮塔旋转方向箭头 ===
        if (diffAbs > 0.15) {
            const arrowDir = normalizeAngle(angleTo(player, this.mouseWorld) - player.turretAngle) > 0 ? 1 : -1;
            ctx.strokeStyle = `rgba(255, 220, 80, 0.6)`;
            ctx.lineWidth = isZoomed ? 1.5 : 2;

            const arrowR = (isZoomed ? gap + 8 : crossSize + 12);
            const startA = arrowDir > 0 ? -Math.PI * 0.7 : Math.PI * 0.2;
            const endA = startA + arrowDir * Math.PI * 0.5;
            ctx.beginPath();
            ctx.arc(mx, my, arrowR, startA, endA, arrowDir < 0);
            ctx.stroke();

            const tipX = mx + Math.cos(endA) * arrowR;
            const tipY = my + Math.sin(endA) * arrowR;
            const arrowAngle = endA + (arrowDir > 0 ? Math.PI / 2 : -Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX + Math.cos(arrowAngle + 2.5) * 7, tipY + Math.sin(arrowAngle + 2.5) * 7);
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX + Math.cos(arrowAngle - 2.5) * 7, tipY + Math.sin(arrowAngle - 2.5) * 7);
            ctx.stroke();
        }

        // === 瞄准镜模式标记 ===
        if (zl > 0.3) {
            const labelAlpha = clamp((zl - 0.3) / 0.3, 0, 0.6);
            ctx.font = '11px "Consolas", monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = `rgba(180, 200, 220, ${labelAlpha})`;
            ctx.fillText('SCOPE x' + lerp(1, 2.5, zl).toFixed(1), W - 20, H - 20);
        }

        ctx.restore();
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
        document.getElementById('game-container').classList.remove('playing');
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
