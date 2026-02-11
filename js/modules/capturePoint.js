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
        this.shipsInRange = [];
        
        // 检查友军（包含玩家）
        for (const ally of game.allies) {
            if (ally.alive && dist(ally, this) < this.radius) {
                this.shipsInRange.push(ally);
            }
        }
        
        // 检查敌军
        for (const enemy of game.enemies) {
            if (enemy.alive && dist(enemy, this) < this.radius) {
                this.shipsInRange.push(enemy);
            }
        }

        // 统计各方舰船数量
        this.playerShipsInZone = this.shipsInRange.filter(s => s.team === 'player').length;
        this.enemyShipsInZone = this.shipsInRange.filter(s => s.team === 'enemy').length;
        const playerShips = this.playerShipsInZone;
        const enemyShips = this.enemyShipsInZone;

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
            // 如果已被友方控制（无敌舰），无需继续占领
            if (this.owner === 'player') {
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
            // 如果已被敌方控制（无友舰），无需继续占领
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
            // 无人占领或双方都有人（争夺中），进度缓慢回退
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

        // 绘制舰船数量信息（新机制显示）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(sx - 50, sy - 70, 100, 42);
        
        // 友军舰船数
        ctx.fillStyle = '#44aaff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('友军: ' + (this.playerShipsInZone || 0) + '艘', sx - 45, sy - 55);
        
        // 敌军舰船数
        ctx.fillStyle = '#ff6666';
        ctx.fillText('敌军: ' + (this.enemyShipsInZone || 0) + '艘', sx - 45, sy - 38);

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
            statusText = this.owner === 'player' ? '友军控制' : '敌军控制';
            textColor = this.owner === 'player' ? '#44aaff' : '#ff6666';
        } else {
            statusText = '中立';
            textColor = '#aaa';
        }
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(sx - 40, sy - 22, 80, 20);
        ctx.fillStyle = textColor;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(statusText, sx, sy - 12);

        // 已控制标记 - 显示额外加分
        if (this.owner) {
            ctx.fillStyle = this.owner === 'player' ? '#44aaff' : '#ff6666';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            const bonusText = this.owner === 'player' && this.enemyShipsInZone === 0 ? 
                '★ +10分/秒' : this.owner === 'enemy' && this.playerShipsInZone === 0 ?
                '★ +10分/秒' : '★ 被入侵';
            ctx.fillText(bonusText, sx, sy + 40);
        } else {
            // 未占领时显示提示
            ctx.fillStyle = '#aaa';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('点内每舰+1分/秒', sx, sy + 40);
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

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CapturePoint };
}