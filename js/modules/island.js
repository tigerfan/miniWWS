// ==================== 岛屿 ====================

class Island {
    constructor(x, y, radius, mapType = 'islands', isLarge = false) {
        this.x = x || randRange(300, 42000 - 300);
        this.y = y || randRange(300, 42000 - 300);
        this.radius = radius || randRange(80, 350);
        this.radius *= Math.pow(2, 1/3); // 体积加倍
        this.points = [];
        this.mapType = mapType;
        this.isLarge = isLarge;
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
        grad.addColorStop(0, ColorUtils.lightenColor(islandColor, 20));
        grad.addColorStop(0.7, islandColor);
        grad.addColorStop(1, ColorUtils.darkenColor(islandColor, 20));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx + this.points[0].x, sy + this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(sx + this.points[i].x, sy + this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = ColorUtils.lightenColor(islandColor, 30);
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
    
    collides(ship) {
        return dist(this, ship) < this.radius + ship.cfg.width;
    }
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Island };
}