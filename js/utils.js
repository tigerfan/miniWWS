// ==================== 工具函数 ====================

// 计算两点距离
function dist(a, b) { 
    return Math.hypot(a.x - b.x, a.y - b.y); 
}

// 计算从a到b的角度
function angleTo(a, b) { 
    return Math.atan2(b.y - a.y, b.x - a.x); 
}

// 数值钳制
function clamp(v, min, max) { 
    return Math.max(min, Math.min(max, v)); 
}

// 线性插值
function lerp(a, b, t) { 
    return a + (b - a) * t; 
}

// 随机范围
function randRange(a, b) { 
    return a + Math.random() * (b - a); 
}

// 角度标准化到 -PI ~ PI
function normalizeAngle(a) { 
    while (a > Math.PI) a -= 2 * Math.PI; 
    while (a < -Math.PI) a += 2 * Math.PI; 
    return a; 
}

// 颜色处理工具
const ColorUtils = {
    // 颜色变亮
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },
    
    // 颜色变暗
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
};

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dist, angleTo, clamp, lerp, randRange, normalizeAngle, ColorUtils };
}