// ==================== 粒子系统 ====================

class Particle {
    constructor(x, y, vx, vy, life, size, color, fadeColor) {
        this.x = x; 
        this.y = y; 
        this.vx = vx; 
        this.vy = vy;
        this.life = life; 
        this.maxLife = life; 
        this.size = size;
        this.color = color; 
        this.fadeColor = fadeColor || color;
    }
    
    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.life -= dt;
        this.vx *= 0.98; 
        this.vy *= 0.98;
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

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Particle };
}