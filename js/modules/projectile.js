// ==================== 弹药类 ====================

class Projectile {
    constructor(x, y, angle, speed, range, damage, type, owner, targetDist, initialZ) {
        this.x = x; 
        this.y = y; 
        this.angle = angle;
        this.vx = Math.cos(angle) * speed; 
        this.vy = Math.sin(angle) * speed;
        this.speed = speed; 
        this.range = range; 
        this.damage = damage;
        this.type = type; 
        this.owner = owner;
        this.traveled = 0; 
        this.alive = true;
        this.trail = [];
        this.landed = false;

        // 抛物线弹道（炮弹）
        if (type === 'shell' && targetDist > 0) {
            this.z = initialZ !== undefined ? initialZ : 15; // 甲板高度
            const hSpeed = speed * 60; // 水平速度 units/sec
            const effectiveDist = Math.min(targetDist, range);
            const flightTime = effectiveDist / hSpeed;
            const peakHeight = clamp(flightTime * 18, 20, 350);
            this.gravity = 8 * peakHeight / (flightTime * flightTime);
            this.vz = 4 * peakHeight / flightTime;
            this.flightTime = flightTime;
        } else if (type === 'bomb') {
            this.z = initialZ !== undefined ? initialZ : 80;
            const hSpeed = speed * 60;
            const effectiveDist = targetDist || 80;
            this.flightTime = effectiveDist / hSpeed;
            // 自由落体: 0 = z0 + vz*t - 0.5*g*t^2. 设vz=0
            this.vz = 0;
            this.gravity = (2 * this.z) / (this.flightTime * this.flightTime);
        } else {
            this.z = type === 'torpedo' ? 2 : (type === 'rocket' ? 25 : 15);
            this.vz = 0;
            this.gravity = 0;
        }
    }
    
    update(dt, game) {
        const dx = this.vx * dt * 60, dy = this.vy * dt * 60;
        this.x += dx; 
        this.y += dy;
        this.traveled += Math.hypot(dx, dy);

        // 抛物线弹道更新
        if ((this.type === 'shell' || this.type === 'bomb') && this.gravity > 0) {
            this.vz -= this.gravity * dt;
            this.z += this.vz * dt;
            // 落地判定（下降阶段z<=0）
            if (this.vz < 0 && this.z <= 0) {
                this.z = 0;
                this.alive = false;
                this.landed = true;
            }
            // 安全上限：超出射程120%强制落地
            if (this.traveled >= this.range * 1.2) {
                this.alive = false;
                this.landed = true;
            }
        } else {
            if (this.traveled >= this.range) this.alive = false;
        }

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
        } else if (this.type === 'rocket') {
            ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
            ctx.lineWidth = 2;
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
        } else if (this.type === 'rocket') {
            ctx.fillStyle = '#ffaa44';
            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(this.angle)*6, sy + Math.sin(this.angle)*6);
            ctx.lineTo(sx - Math.cos(this.angle)*4 + Math.sin(this.angle)*2, sy - Math.sin(this.angle)*4 + Math.cos(this.angle)*2);
            ctx.lineTo(sx - Math.cos(this.angle)*4 - Math.sin(this.angle)*2, sy - Math.sin(this.angle)*4 - Math.cos(this.angle)*2);
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

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Projectile };
}