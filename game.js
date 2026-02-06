// ==================== 配置 ====================
const MAPS = {
    islands: {
        name: '海岛',
        size: 36000,
        description: '岛屿密布的热带海域，适合伏击和近战',
        teamSize: { allies: 9, enemies: 9 },
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
        teamSize: { allies: 9, enemies: 9 },
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
        teamSize: { allies: 9, enemies: 9 },
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
        teamSize: { allies: 9, enemies: 9 },
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
        teamSize: { allies: 9, enemies: 9 },
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
        name: '驱逐舰', hp: 14500, maxSpeed: 36, acceleration: 0.02, turnSpeed: 0.022,
        length: 120, width: 12, color: '#5599dd', gunColor: '#88bbee',
        mainGun: { damage: 1200, reload: 4, range: 8500, shells: 6, spread: 0.035, shellSpeed: 12, splashRadius: 50,
                   traverse: 0.35, arc: [-2.6, 2.6] },
        rearGun: { damage: 800, reload: 3, range: 7000, shells: 3, spread: 0.04, shellSpeed: 12, splashRadius: 50,
                   traverse: 0.35, arc: [-2.6, 2.6] },
        torpedo: { damage: 5500, reload: 12, range: 7500, count: 8, speed: 6, spread: 0.08 },
        concealment: 0.6, detectability: 5500
    },
    cruiser: {
        name: '巡洋舰', hp: 32000, maxSpeed: 30, acceleration: 0.012, turnSpeed: 0.015,
        length: 180, width: 18, color: '#4488cc', gunColor: '#77aadd',
        mainGun: { damage: 2500, reload: 7, range: 12000, shells: 8, spread: 0.025, shellSpeed: 10, splashRadius: 70,
                   traverse: 0.22, arc: [-2.6, 2.6] },
        rearGun: { damage: 1500, reload: 5, range: 10000, shells: 4, spread: 0.03, shellSpeed: 10, splashRadius: 70,
                   traverse: 0.22, arc: [-2.6, 2.6] },
        torpedo: { damage: 6500, reload: 18, range: 6000, count: 6, speed: 5, spread: 0.06 },
        concealment: 0.75, detectability: 8000
    },
    battleship: {
        name: '战列舰', hp: 68000, maxSpeed: 22, acceleration: 0.007, turnSpeed: 0.008,
        length: 250, width: 32, color: '#3366aa', gunColor: '#6699cc',
        mainGun: { damage: 6500, reload: 15, range: 18000, shells: 12, spread: 0.018, shellSpeed: 8, splashRadius: 120,
                   traverse: 0.08, arc: [-2.6, 2.6] },
        rearGun: { damage: 4000, reload: 12, range: 15000, shells: 6, spread: 0.022, shellSpeed: 8, splashRadius: 120,
                   traverse: 0.08, arc: [-2.6, 2.6] },
        torpedo: { damage: 5500, reload: 30, range: 4500, count: 4, speed: 4.5, spread: 0.05 },
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

// ==================== 3D渲染器 ====================
class Renderer3D {
    constructor() {
        this.container = document.getElementById('three-container');
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a1830, 0.00006);
        this.scene.background = new THREE.Color(0x0a1830);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 10, 60000);
        this.camera.position.set(0, 500, 300);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.setupLighting();
        this.setupSky();
        this.setupOcean();

        this.shipMeshes = new Map();
        this.islandMeshes = [];
        this.captureMeshes = [];
        this.projectilePool = [];
        this.particlePool = [];
        this.wakeLines = new Map();
        this.time = 0;
        this.camTarget = new THREE.Vector3();
        this.camLook = new THREE.Vector3();

        // 3D落点标记
        this.setupAimMarker();

        window.addEventListener('resize', () => this.onResize());
    }

    setupAimMarker() {
        const aimGroup = new THREE.Group();
        // 外圈环
        const ringGeo = new THREE.RingGeometry(28, 32, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x50ff78, transparent: true, opacity: 0.4, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        aimGroup.add(ring);

        // 内圈脉冲环
        const pulseGeo = new THREE.RingGeometry(12, 15, 24);
        const pulseMat = new THREE.MeshBasicMaterial({
            color: 0x50ff78, transparent: true, opacity: 0.6, side: THREE.DoubleSide
        });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.rotation.x = -Math.PI / 2;
        aimGroup.add(pulse);

        // 十字线
        const crossMat = new THREE.LineBasicMaterial({ color: 0x50ff78, transparent: true, opacity: 0.3 });
        const crossPoints1 = [new THREE.Vector3(-40, 0, 0), new THREE.Vector3(40, 0, 0)];
        const crossPoints2 = [new THREE.Vector3(0, 0, -40), new THREE.Vector3(0, 0, 40)];
        const cross1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPoints1), crossMat);
        const cross2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(crossPoints2), crossMat.clone());
        aimGroup.add(cross1);
        aimGroup.add(cross2);

        aimGroup.position.y = 2;
        aimGroup.visible = false;
        this.scene.add(aimGroup);
        this.aimMarker = aimGroup;
        this.aimMarkerRingMat = ringMat;
        this.aimMarkerPulseMat = pulseMat;
        this.aimMarkerPulse = pulse;
    }

    updateAimMarker(player, mouseWorld, onTarget, inRange) {
        if (!player || !player.alive || !inRange) {
            this.aimMarker.visible = false;
            return;
        }
        this.aimMarker.visible = true;

        // 落点位置 = 炮塔朝向 x 目标距离
        const targetDist = Math.hypot(mouseWorld.x - player.x, mouseWorld.y - player.y);
        const aimX = player.x + Math.cos(player.turretAngle) * targetDist;
        const aimZ = player.y + Math.sin(player.turretAngle) * targetDist;
        this.aimMarker.position.set(aimX, 2, aimZ);

        // 颜色：对准=绿，未对准=黄
        const color = onTarget ? 0x50ff78 : 0xffdd50;
        this.aimMarkerRingMat.color.setHex(color);
        this.aimMarkerPulseMat.color.setHex(color);
        this.aimMarkerRingMat.opacity = onTarget ? 0.5 : 0.3;

        // 脉冲动画
        const pulse = 0.8 + Math.sin(this.time * 4) * 0.2;
        this.aimMarkerPulse.scale.set(pulse, pulse, pulse);
        this.aimMarkerPulseMat.opacity = 0.3 + Math.sin(this.time * 3) * 0.2;

        // 根据散布缩放外环
        const spread = player.cfg.mainGun.spread;
        const spreadScale = 1 + targetDist * spread * 0.008;
        this.aimMarker.children[0].scale.set(spreadScale, spreadScale, spreadScale);
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0x2a3a5a, 0.7);
        this.scene.add(ambient);

        this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
        this.sunLight.position.set(5000, 4000, 3000);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 100;
        this.sunLight.shadow.camera.far = 15000;
        this.sunLight.shadow.camera.left = -3000;
        this.sunLight.shadow.camera.right = 3000;
        this.sunLight.shadow.camera.top = 3000;
        this.sunLight.shadow.camera.bottom = -3000;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        const hemi = new THREE.HemisphereLight(0x6699cc, 0x1a2a40, 0.5);
        this.scene.add(hemi);

        const rim = new THREE.DirectionalLight(0xff8844, 0.3);
        rim.position.set(-3000, 1000, -2000);
        this.scene.add(rim);
    }

    setupSky() {
        const skyGeo = new THREE.SphereGeometry(30000, 32, 16);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0a1830) },
                bottomColor: { value: new THREE.Color(0x1a3a5a) },
                horizonColor: { value: new THREE.Color(0x2a4a6a) },
                offset: { value: 20 },
                exponent: { value: 0.4 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform vec3 horizonColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
                    float t = max(pow(max(h, 0.0), exponent), 0.0);
                    vec3 sky = mix(horizonColor, topColor, t);
                    float b = max(pow(max(-h, 0.0), 0.5), 0.0);
                    sky = mix(sky, bottomColor, b);
                    gl_FragColor = vec4(sky, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.sky);
    }

    setupOcean() {
        const size = 60000;
        const segments = 200;
        const oceanGeo = new THREE.PlaneGeometry(size, size, segments, segments);
        const oceanMat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x0c2a4a) },
                uColor2: { value: new THREE.Color(0x1a4a7a) },
                uFoamColor: { value: new THREE.Color(0x4a7a9a) },
                uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.3).normalize() },
                uSunColor: { value: new THREE.Color(0xffeedd) },
                uCamPos: { value: new THREE.Vector3() }
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying vec3 vNormal;
                varying float vWaveHeight;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
// 海浪幅度降低一半
                    float wave1 = sin(pos.x * 0.008 + uTime * 0.7) * 6.0;
                    float wave2 = sin(pos.y * 0.006 + uTime * 0.5) * 4.0;
                    float wave3 = sin((pos.x + pos.y) * 0.004 + uTime * 1.1) * 3.0;
                    float wave4 = sin(pos.x * 0.02 + pos.y * 0.015 + uTime * 1.5) * 1.5;
                    pos.z += wave1 + wave2 + wave3 + wave4;
                    vWaveHeight = pos.z;
                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;
                    // 法线幅度也降低一半
                    float dx = cos(pos.x * 0.008 + uTime * 0.7) * 0.008 * 6.0
                             + cos((pos.x + pos.y) * 0.004 + uTime * 1.1) * 0.004 * 3.0;
                    float dy = cos(pos.y * 0.006 + uTime * 0.5) * 0.006 * 4.0
                             + cos((pos.x + pos.y) * 0.004 + uTime * 1.1) * 0.004 * 3.0;
                    vNormal = normalize(mat3(modelMatrix) * vec3(-dx, 1.0, -dy));
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uFoamColor;
                uniform vec3 uSunDir;
                uniform vec3 uSunColor;
                uniform vec3 uCamPos;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vWorldPos;
                varying vec3 vNormal;
                varying float vWaveHeight;
                void main() {
                    vec3 baseColor = mix(uColor1, uColor2, vUv.y * 0.5 + 0.5);
                    // 泡沫高度阈值也调整
                    float foam = smoothstep(4.0, 8.0, vWaveHeight);
                    baseColor = mix(baseColor, uFoamColor, foam * 0.3);
                    float diffuse = max(dot(vNormal, uSunDir), 0.0) * 0.5 + 0.5;
                    vec3 viewDir = normalize(uCamPos - vWorldPos);
                    vec3 halfDir = normalize(uSunDir + viewDir);
                    float spec = pow(max(dot(vNormal, halfDir), 0.0), 120.0);
                    vec3 color = baseColor * diffuse + uSunColor * spec * 0.6;
                    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
                    color += vec3(0.1, 0.15, 0.2) * fresnel;
                    float dist = length(vWorldPos - uCamPos);
                    float fogFactor = 1.0 - exp(-dist * 0.00006);
                    vec3 fogColor = vec3(0.04, 0.09, 0.19);
                    color = mix(color, fogColor, fogFactor);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });
        this.ocean = new THREE.Mesh(oceanGeo, oceanMat);
        this.ocean.rotation.x = -Math.PI / 2;
        this.ocean.position.y = 0;
        this.scene.add(this.ocean);
    }

    setMapColors(mapConfig) {
        if (!mapConfig) return;
        // 重置为默认值
        this.scene.fog.color.set(0x0a1830);
        this.scene.background.set(0x0a1830);
        this.sky.material.uniforms.topColor.value.set(0x0a1830);
        this.sky.material.uniforms.bottomColor.value.set(0x1a3a5a);
        this.sky.material.uniforms.horizonColor.value.set(0x2a4a6a);
        this.ocean.material.uniforms.uFoamColor.value.set(0x4a7a9a);
        this.sunLight.color.set(0xffeedd);

        const c = mapConfig.colors;
        if (c && c.water) {
            this.ocean.material.uniforms.uColor1.value.set(c.deepWater || c.water);
            this.ocean.material.uniforms.uColor2.value.set(c.water);
        }
        if (mapConfig.iceMode) {
            this.scene.fog.color.set(0x1a2d4a);
            this.scene.background.set(0x1a2d4a);
            this.sky.material.uniforms.topColor.value.set(0x1a2d4a);
            this.sky.material.uniforms.horizonColor.value.set(0x3a5a7a);
            this.ocean.material.uniforms.uFoamColor.value.set(0x8aaabb);
        } else if (mapConfig.volcanic) {
            this.scene.fog.color.set(0x1e0a0a);
            this.scene.background.set(0x1e0a0a);
            this.sky.material.uniforms.topColor.value.set(0x1e0a0a);
            this.sky.material.uniforms.horizonColor.value.set(0x4a2020);
            this.sky.material.uniforms.bottomColor.value.set(0x3a1a0a);
            this.sunLight.color.set(0xff8844);
        }
    }

    createShipMesh(ship) {
        const group = new THREE.Group();
        const L = ship.cfg.length;
        const W = ship.cfg.width;
        const H = W * 0.35;
        const isAlly = ship.team === 'player';

        // 舰体 - 使用Shape挤出
        const hullShape = new THREE.Shape();
        hullShape.moveTo(L * 0.5, 0);
        hullShape.quadraticCurveTo(L * 0.3, W * 0.5, -L * 0.35, W * 0.45);
        hullShape.lineTo(-L * 0.5, W * 0.25);
        hullShape.lineTo(-L * 0.5, -W * 0.25);
        hullShape.lineTo(-L * 0.35, -W * 0.45);
        hullShape.quadraticCurveTo(L * 0.3, -W * 0.5, L * 0.5, 0);

        const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
            depth: H, bevelEnabled: true, bevelThickness: 3,
            bevelSize: 2, bevelSegments: 3
        });
        const hullColor = isAlly ? 0x3a6a8a : 0x8a3a3a;
        const hullMat = new THREE.MeshPhongMaterial({
            color: hullColor, specular: 0x333333, shininess: 40
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.x = -Math.PI / 2;
        hull.position.y = 2;
        hull.castShadow = true;
        hull.receiveShadow = true;
        group.add(hull);

        // 甲板
        const deckGeo = new THREE.BoxGeometry(L * 0.7, 2, W * 0.6);
        const deckMat = new THREE.MeshPhongMaterial({
            color: isAlly ? 0x4a7a9a : 0x7a4a4a, specular: 0x222222
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.set(0, H + 3, 0);
        deck.castShadow = true;
        group.add(deck);

        // 上层建筑
        const superH = H * (ship.type === 'battleship' ? 2.5 : ship.type === 'cruiser' ? 2.0 : 1.5);
        const superGeo = new THREE.BoxGeometry(L * 0.18, superH, W * 0.35);
        const superMat = new THREE.MeshPhongMaterial({
            color: isAlly ? 0x5a8aaa : 0x8a5a5a
        });
        const superstructure = new THREE.Mesh(superGeo, superMat);
        superstructure.position.set(-L * 0.02, H + superH / 2 + 3, 0);
        superstructure.castShadow = true;
        group.add(superstructure);

        // 烟囱
        const stackGeo = new THREE.CylinderGeometry(W * 0.08, W * 0.1, superH * 0.8, 8);
        const stackMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const stack = new THREE.Mesh(stackGeo, stackMat);
        stack.position.set(-L * 0.08, H + superH + 3, 0);
        group.add(stack);

        // 桅杆
        const mastGeo = new THREE.CylinderGeometry(1, 2, superH * 1.5, 6);
        const mastMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.set(L * 0.05, H + superH * 1.2 + 3, 0);
        group.add(mast);

        // 前主炮塔
        const turretGroup = new THREE.Group();
        const turretBaseGeo = new THREE.CylinderGeometry(W * 0.25, W * 0.28, H * 0.5, 10);
        const turretMat = new THREE.MeshPhongMaterial({
            color: isAlly ? 0x6a9abb : 0xaa6655
        });
        const turretBase = new THREE.Mesh(turretBaseGeo, turretMat);
        turretGroup.add(turretBase);

        const barrelCount = ship.type === 'battleship' ? 3 : ship.type === 'cruiser' ? 2 : 1;
        for (let i = 0; i < barrelCount; i++) {
            const barrelGeo = new THREE.CylinderGeometry(1.8, 2.2, L * 0.25, 6);
            const barrelMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            barrel.rotation.z = Math.PI / 2;
            barrel.position.set(L * 0.125, H * 0.15, (i - (barrelCount - 1) / 2) * 4);
            turretGroup.add(barrel);
        }
        turretGroup.position.set(L * 0.22, H + 5, 0);
        group.add(turretGroup);

        // 后炮塔（更小）
        const rearTurretGroup = new THREE.Group();
        const rearBaseGeo = new THREE.CylinderGeometry(W * 0.18, W * 0.21, H * 0.4, 10);
        const rearTurretBase = new THREE.Mesh(rearBaseGeo, turretMat.clone());
        rearTurretGroup.add(rearTurretBase);
        const rearBarrelCount = Math.max(1, barrelCount - 1);
        for (let i = 0; i < rearBarrelCount; i++) {
            const rBarrelGeo = new THREE.CylinderGeometry(1.3, 1.7, L * 0.18, 6);
            const rBarrelMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
            const barrel = new THREE.Mesh(rBarrelGeo, rBarrelMat);
            barrel.rotation.z = Math.PI / 2;
            barrel.position.set(-L * 0.09, H * 0.12, (i - (rearBarrelCount - 1) / 2) * 3.5);
            rearTurretGroup.add(barrel);
        }
        rearTurretGroup.position.set(-L * 0.25, H + 4, 0);
        group.add(rearTurretGroup);

        group.userData = { turretGroup, rearTurretGroup, ship, hullMat, originalColor: hullColor };

        this.scene.add(group);
        this.shipMeshes.set(ship, group);
        return group;
    }

    createIslandMesh(island, mapConfig) {
        const color = mapConfig?.colors?.island || '#4a6a2e';
        const colorNum = parseInt(color.replace('#', ''), 16);
        const group = new THREE.Group();

        // 主体 - 随机化锥体
        const r = island.radius;
        const h = r * randRange(0.4, 0.8);
        const geo = new THREE.ConeGeometry(r, h, 16, 4);
        const positions = geo.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            if (positions[i + 1] < h * 0.4) {
                positions[i] += (Math.random() - 0.5) * r * 0.35;
                positions[i + 2] += (Math.random() - 0.5) * r * 0.35;
            }
            positions[i + 1] *= (0.6 + Math.random() * 0.4);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshPhongMaterial({
            color: colorNum, specular: 0x111111, shininess: 5, flatShading: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(island.x, h * 0.3, island.y);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // 植被/雪顶装饰
        if (mapConfig?.iceMode) {
            const snowGeo = new THREE.ConeGeometry(r * 0.4, h * 0.3, 8);
            const snowMat = new THREE.MeshPhongMaterial({ color: 0xddeeff, flatShading: true });
            const snow = new THREE.Mesh(snowGeo, snowMat);
            snow.position.set(island.x, h * 0.7, island.y);
            group.add(snow);
        } else if (mapConfig?.volcanic) {
            const lavaGeo = new THREE.ConeGeometry(r * 0.15, h * 0.15, 8);
            const lavaMat = new THREE.MeshPhongMaterial({
                color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 0.5
            });
            const lava = new THREE.Mesh(lavaGeo, lavaMat);
            lava.position.set(island.x, h * 0.75, island.y);
            group.add(lava);
        } else {
            const treeCount = Math.floor(r / 80);
            for (let i = 0; i < treeCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const treeDist = Math.random() * r * 0.5;
                const treeGeo = new THREE.ConeGeometry(12, 30, 6);
                const treeMat = new THREE.MeshPhongMaterial({
                    color: 0x2a5a1a + Math.floor(Math.random() * 0x102010),
                    flatShading: true
                });
                const tree = new THREE.Mesh(treeGeo, treeMat);
                tree.position.set(
                    island.x + Math.cos(angle) * treeDist,
                    h * 0.5 + 15,
                    island.y + Math.sin(angle) * treeDist
                );
                group.add(tree);
            }

            // 岩石装饰
            const rockCount = Math.floor(r / 150);
            for (let i = 0; i < rockCount; i++) {
                const rockGeo = new THREE.DodecahedronGeometry(randRange(5, 12), 0);
                const rockMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
                const rock = new THREE.Mesh(rockGeo, rockMat);
                const angle = Math.random() * Math.PI * 2;
                const rockDist = Math.random() * r * 0.7;
                rock.position.set(
                    island.x + Math.cos(angle) * rockDist,
                    randRange(5, 10),
                    island.y + Math.sin(angle) * rockDist
                );
                rock.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                group.add(rock);
            }

            // 花朵装饰
            const flowerCount = Math.floor(r / 120);
            for (let i = 0; i < flowerCount; i++) {
                const flowerGeo = new THREE.SphereGeometry(randRange(1.5, 3), 8, 6);
                const flowerColors = [0xff4444, 0xffff44, 0x44ff44, 0x4444ff, 0xff44ff];
                const flowerMat = new THREE.MeshLambertMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)] });
                const flower = new THREE.Mesh(flowerGeo, flowerMat);
                const angle = Math.random() * Math.PI * 2;
                const flowerDist = Math.random() * r * 0.6;
                flower.position.set(
                    island.x + Math.cos(angle) * flowerDist,
                    randRange(2, 5),
                    island.y + Math.sin(angle) * flowerDist
                );
                group.add(flower);
            }
        }

        // 海岸线浅滩
        const beachGeo = new THREE.RingGeometry(r * 0.9, r * 1.15, 24);
        const beachMat = new THREE.MeshBasicMaterial({
            color: 0x2a5a7a, transparent: true, opacity: 0.25, side: THREE.DoubleSide
        });
        const beach = new THREE.Mesh(beachGeo, beachMat);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(island.x, 1, island.y);
        group.add(beach);

        this.scene.add(group);
        this.islandMeshes.push(group);
        return group;
    }

    createCapturePointMesh(cp) {
        const group = new THREE.Group();

        // 外圈标记
        const ringGeo = new THREE.RingGeometry(cp.radius * 0.97, cp.radius, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa, transparent: true, opacity: 0.2, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(cp.x, 3, cp.y);
        group.add(ring);

        // 中心旗标
        const poleGeo = new THREE.CylinderGeometry(2, 2, 60, 6);
        const poleMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(cp.x, 30, cp.y);
        group.add(pole);

        const flagGeo = new THREE.PlaneGeometry(30, 18);
        const flagMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.9
        });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(cp.x + 15, 52, cp.y);
        group.add(flag);

        group.userData = { ringMat, poleMat, flagMat, cp, flag };
        this.scene.add(group);
        this.captureMeshes.push(group);
        return group;
    }

    // 创建炮弹3D对象
    createProjectileMesh(proj) {
        let mesh;
        if (proj.type === 'torpedo') {
            const geo = new THREE.SphereGeometry(5, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ color: 0x80ffb0 });
            mesh = new THREE.Mesh(geo, mat);
            // 尾迹
            const trailGeo = new THREE.BufferGeometry();
            const trailPositions = new Float32Array(30 * 3);
            trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            const trailMat = new THREE.LineBasicMaterial({
                color: 0x60dd90, transparent: true, opacity: 0.4
            });
            const trail = new THREE.Line(trailGeo, trailMat);
            mesh.userData.trail = trail;
            this.scene.add(trail);
        } else {
            const geo = new THREE.SphereGeometry(3, 6, 6);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffcc44 });
            mesh = new THREE.Mesh(geo, mat);
            // 光晕
            const glowGeo = new THREE.SphereGeometry(6, 6, 6);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0xffaa22, transparent: true, opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);
        }
        mesh.userData.proj = proj;
        this.scene.add(mesh);
        this.projectilePool.push(mesh);
        return mesh;
    }

    updateCamera(player, zoomLevel) {
        if (!player || !player.alive) return;
        const z = zoomLevel || 0;

        // 参数
        const camDist = lerp(600, 180, z);
        const camH = lerp(200, 60, z);
        const ahead = lerp(200, 800, z);
        const fov = lerp(55, 22, z);

        // 目标角度：zoom时混入炮塔朝向
        const targetAngle = z > 0.01
            ? normalizeAngle(player.angle + normalizeAngle(player.turretAngle - player.angle) * z)
            : player.angle;

        // 平滑相机角度（关键防抖：角度经过二次平滑）
        if (this._smoothCamAngle === undefined) this._smoothCamAngle = player.angle;
        const angleLerp = lerp(0.035, 0.018, z); // zoom时角度跟随更慢
        let angleDiff = normalizeAngle(targetAngle - this._smoothCamAngle);
        this._smoothCamAngle = normalizeAngle(this._smoothCamAngle + angleDiff * angleLerp);

        // 相机位置
        const behindX = player.x - Math.cos(this._smoothCamAngle) * camDist;
        const behindZ = player.y - Math.sin(this._smoothCamAngle) * camDist;
        this.camTarget.set(behindX, camH, behindZ);
        const posLerp = lerp(0.035, 0.025, z); // zoom时位置跟随更慢
        this.camera.position.lerp(this.camTarget, posLerp);

        // 看向点（同样用平滑角度）
        const lx = player.x + Math.cos(this._smoothCamAngle) * ahead;
        const lz = player.y + Math.sin(this._smoothCamAngle) * ahead;
        const lookH = lerp(10, 5, z);

        // 平滑看向点（去掉getWorldDirection反馈环，直接lerp目标）
        if (!this._smoothLook) this._smoothLook = new THREE.Vector3(lx, lookH, lz);
        const lookLerp = lerp(0.05, 0.03, z); // zoom时lookAt更平滑
        this._smoothLook.x = lerp(this._smoothLook.x, lx, lookLerp);
        this._smoothLook.y = lerp(this._smoothLook.y, lookH, lookLerp);
        this._smoothLook.z = lerp(this._smoothLook.z, lz, lookLerp);
        this.camera.lookAt(this._smoothLook);

        // FOV平滑过渡
        this.camera.fov = lerp(this.camera.fov, fov, 0.06);
        this.camera.updateProjectionMatrix();

        // 阴影+天穹
        this.sunLight.position.set(player.x + 3000, 4000, player.y + 2000);
        this.sunLight.target.position.set(player.x, 0, player.y);
        this.sunLight.target.updateMatrixWorld();
        this.sky.position.set(player.x, 0, player.y);
    }

    updateShip(ship) {
        let mesh = this.shipMeshes.get(ship);
        if (!mesh) mesh = this.createShipMesh(ship);

        if (!ship.alive) {
            mesh.position.y = lerp(mesh.position.y, -80, 0.015);
            mesh.rotation.z = Math.sin(ship.sinkTimer * 0.5) * 0.4;
            mesh.rotation.x = ship.sinkTimer * 0.08;
            mesh.visible = ship.sinkTimer < 3;

            // 受伤发红
            const ud = mesh.userData;
            if (ud.hullMat) ud.hullMat.emissive.setHex(0x330000);

            // 隐藏航迹
            const wake = this.wakeLines.get(ship);
            if (wake) {
                wake.left.visible = false;
                wake.right.visible = false;
                wake.center.visible = false;
            }
            return;
        }

        mesh.visible = true;
        const bobY = Math.sin(this.time * 1.2 + ship.x * 0.005) * 3;
        const roll = Math.sin(this.time * 0.8 + ship.y * 0.003) * 0.02;
        const pitch = Math.sin(this.time * 0.6 + ship.x * 0.004) * 0.015;

        mesh.position.set(ship.x, 6 + bobY, ship.y);
        mesh.rotation.y = -ship.angle;
        mesh.rotation.z = roll + ship.rudder * ship.speed * 0.005;
        mesh.rotation.x = pitch;

        // 前主炮跟随玩家瞄准
        const tg = mesh.userData.turretGroup;
        if (tg) tg.rotation.y = -(ship.turretAngle - ship.angle);
        // 尾炮独立自动瞄准
        const rtg = mesh.userData.rearTurretGroup;
        if (rtg) rtg.rotation.y = -(ship.rearTurretAngle - ship.angle);

        // 受伤闪光
        const ud = mesh.userData;
        if (ship.damageFlash > 0 && ud.hullMat) {
            ud.hullMat.emissive.setHex(0x661111);
        } else if (ud.hullMat) {
            ud.hullMat.emissive.setHex(0x000000);
        }

        // 航迹尾流
        this.updateWake(ship);
    }

    updateWake(ship) {
        const spd = Math.abs(ship.speed);
        if (spd < 0.3) return;

        let wake = this.wakeLines.get(ship);
        if (!wake) {
            const maxPts = 60;
            // 左舷尾浪
            const lGeo = new THREE.BufferGeometry();
            const lPos = new Float32Array(maxPts * 3);
            const lAlpha = new Float32Array(maxPts);
            lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
            lGeo.setAttribute('alpha', new THREE.BufferAttribute(lAlpha, 1));
            const lMat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                vertexShader: `
                    attribute float alpha;
                    varying float vAlpha;
                    void main() {
                        vAlpha = alpha;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying float vAlpha;
                    void main() {
                        gl_FragColor = vec4(0.7, 0.85, 1.0, vAlpha * 0.5);
                    }
                `
            });
            const lLine = new THREE.Line(lGeo, lMat);
            lLine.frustumCulled = false;
            this.scene.add(lLine);

            // 右舷尾浪
            const rGeo = new THREE.BufferGeometry();
            const rPos = new Float32Array(maxPts * 3);
            const rAlpha = new Float32Array(maxPts);
            rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
            rGeo.setAttribute('alpha', new THREE.BufferAttribute(rAlpha, 1));
            const rLine = new THREE.Line(rGeo, lMat.clone());
            rLine.frustumCulled = false;
            this.scene.add(rLine);

            // 中心泡沫带
            const cGeo = new THREE.BufferGeometry();
            const cPos = new Float32Array(maxPts * 3);
            const cAlpha = new Float32Array(maxPts);
            cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
            cGeo.setAttribute('alpha', new THREE.BufferAttribute(cAlpha, 1));
            const cMat = new THREE.ShaderMaterial({
                transparent: true, depthWrite: false,
                vertexShader: `
                    attribute float alpha;
                    varying float vAlpha;
                    void main() {
                        vAlpha = alpha;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying float vAlpha;
                    void main() {
                        gl_FragColor = vec4(0.85, 0.95, 1.0, vAlpha * 0.7);
                    }
                `
            });
            const cLine = new THREE.Line(cGeo, cMat);
            cLine.frustumCulled = false;
            this.scene.add(cLine);

            wake = { left: lLine, right: rLine, center: cLine, points: [], maxPts, timer: 0 };
            this.wakeLines.set(ship, wake);
        }

        // 每隔一小段时间记录位置
        wake.timer += 1 / 60;
        if (wake.timer > 0.08) {
            wake.timer = 0;
            const W = ship.cfg.width;
            const halfW = W * 0.5;
            const sternX = ship.x - Math.cos(ship.angle) * ship.cfg.length * 0.45;
            const sternZ = ship.y - Math.sin(ship.angle) * ship.cfg.length * 0.45;
            const perpX = -Math.sin(ship.angle);
            const perpZ = Math.cos(ship.angle);

            wake.points.unshift({
                cx: sternX, cz: sternZ,
                lx: sternX + perpX * halfW, lz: sternZ + perpZ * halfW,
                rx: sternX - perpX * halfW, rz: sternZ - perpZ * halfW,
                spread: 0
            });
            if (wake.points.length > wake.maxPts) wake.points.pop();
        }

        // 更新几何体
        const pts = wake.points;
        const lPos = wake.left.geometry.attributes.position.array;
        const lAlpha = wake.left.geometry.attributes.alpha.array;
        const rPos = wake.right.geometry.attributes.position.array;
        const rAlpha = wake.right.geometry.attributes.alpha.array;
        const cPos = wake.center.geometry.attributes.position.array;
        const cAlpha = wake.center.geometry.attributes.alpha.array;

        for (let i = 0; i < wake.maxPts; i++) {
            if (i < pts.length) {
                const p = pts[i];
                const fade = 1 - i / pts.length;
                p.spread += 0.15; // 尾浪逐渐扩散
                const spreadFactor = p.spread * 0.3;
                const perpX = (p.lx - p.cx);
                const perpZ = (p.lz - p.cz);
                const normLen = Math.sqrt(perpX * perpX + perpZ * perpZ) || 1;

                lPos[i * 3] = p.lx + (perpX / normLen) * spreadFactor;
                lPos[i * 3 + 1] = 1.5;
                lPos[i * 3 + 2] = p.lz + (perpZ / normLen) * spreadFactor;
                lAlpha[i] = fade * Math.min(spd * 0.5, 1);

                rPos[i * 3] = p.rx - (perpX / normLen) * spreadFactor;
                rPos[i * 3 + 1] = 1.5;
                rPos[i * 3 + 2] = p.rz - (perpZ / normLen) * spreadFactor;
                rAlpha[i] = fade * Math.min(spd * 0.5, 1);

                cPos[i * 3] = p.cx;
                cPos[i * 3 + 1] = 1.8;
                cPos[i * 3 + 2] = p.cz;
                cAlpha[i] = fade * Math.min(spd * 0.6, 1) * 0.8;
            } else {
                lAlpha[i] = 0;
                rAlpha[i] = 0;
                cAlpha[i] = 0;
            }
        }

        wake.left.geometry.attributes.position.needsUpdate = true;
        wake.left.geometry.attributes.alpha.needsUpdate = true;
        wake.right.geometry.attributes.position.needsUpdate = true;
        wake.right.geometry.attributes.alpha.needsUpdate = true;
        wake.center.geometry.attributes.position.needsUpdate = true;
        wake.center.geometry.attributes.alpha.needsUpdate = true;
        wake.left.geometry.setDrawRange(0, Math.min(pts.length, wake.maxPts));
        wake.right.geometry.setDrawRange(0, Math.min(pts.length, wake.maxPts));
        wake.center.geometry.setDrawRange(0, Math.min(pts.length, wake.maxPts));
    }

    updateProjectiles(projectiles) {
        // 清理旧的
        for (let i = this.projectilePool.length - 1; i >= 0; i--) {
            const mesh = this.projectilePool[i];
            const proj = mesh.userData.proj;
            if (!proj || !proj.alive) {
                this.scene.remove(mesh);
                if (mesh.userData.trail) this.scene.remove(mesh.userData.trail);
                this.projectilePool.splice(i, 1);
            }
        }

        // 添加新的
        const existingProjs = new Set(this.projectilePool.map(m => m.userData.proj));
        for (const proj of projectiles) {
            if (!proj.alive) continue;
            if (!existingProjs.has(proj)) {
                this.createProjectileMesh(proj);
            }
        }

        // 更新位置
        for (const mesh of this.projectilePool) {
            const proj = mesh.userData.proj;
            if (!proj) continue;
            const h = proj.z !== undefined ? proj.z : (proj.type === 'torpedo' ? 2 : 30);
            mesh.position.set(proj.x, h, proj.y);
        }
    }

    updateCapturePoints() {
        for (const group of this.captureMeshes) {
            const { ringMat, flagMat, cp, flag } = group.userData;

            let color = 0xaaaaaa;
            if (cp.owner === 'player') color = 0x44aaff;
            else if (cp.owner === 'enemy') color = 0xff4444;
            else if (cp.capturer === 'player') color = 0x2277cc;
            else if (cp.capturer === 'enemy') color = 0xcc2222;

            if (cp.contested) {
                const pulse = Math.sin(this.time * 5) * 0.3 + 0.7;
                ringMat.opacity = 0.3 * pulse;
                color = 0xffcc44;
            } else {
                ringMat.opacity = 0.2;
            }

            ringMat.color.setHex(color);
            flagMat.color.setHex(color);

            // 旗帜飘动
            if (flag) {
                flag.rotation.y = Math.sin(this.time * 2) * 0.15;
            }
        }
    }

    render(dt) {
        this.time += dt;
        this.ocean.material.uniforms.uTime.value = this.time;
        this.ocean.material.uniforms.uCamPos.value.copy(this.camera.position);
        this.updateCapturePoints();
        this.renderer.render(this.scene, this.camera);
    }

    clearScene() {
        for (const [, mesh] of this.shipMeshes) {
            this.scene.remove(mesh);
        }
        this.shipMeshes.clear();
        // 清理航迹
        for (const [, wake] of this.wakeLines) {
            this.scene.remove(wake.left);
            this.scene.remove(wake.right);
            this.scene.remove(wake.center);
        }
        this.wakeLines.clear();
        for (const mesh of this.islandMeshes) this.scene.remove(mesh);
        this.islandMeshes = [];
        for (const mesh of this.captureMeshes) this.scene.remove(mesh);
        this.captureMeshes = [];
        for (const mesh of this.projectilePool) {
            this.scene.remove(mesh);
            if (mesh.userData.trail) this.scene.remove(mesh.userData.trail);
        }
        this.projectilePool = [];
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

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
    constructor(x, y, angle, speed, range, damage, type, owner, targetDist) {
        this.x = x; this.y = y; this.angle = angle;
        this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.speed = speed; this.range = range; this.damage = damage;
        this.type = type; this.owner = owner;
        this.traveled = 0; this.alive = true;
        this.trail = [];
        this.landed = false;

        // 抛物线弹道（炮弹）
        if (type === 'shell' && targetDist > 0) {
            this.z = 15; // 甲板高度
            const hSpeed = speed * 60; // 水平速度 units/sec
            const effectiveDist = Math.min(targetDist, range);
            const flightTime = effectiveDist / hSpeed;
            const peakHeight = clamp(flightTime * 18, 20, 350);
            this.gravity = 8 * peakHeight / (flightTime * flightTime);
            this.vz = 4 * peakHeight / flightTime;
            this.flightTime = flightTime;
        } else {
            this.z = type === 'torpedo' ? 2 : 15;
            this.vz = 0;
            this.gravity = 0;
        }
    }
    update(dt, game) {
        const dx = this.vx * dt * 60, dy = this.vy * dt * 60;
        this.x += dx; this.y += dy;
        this.traveled += Math.hypot(dx, dy);

        // 抛物线弹道更新
        if (this.type === 'shell' && this.gravity > 0) {
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
        this.turretOnTarget = false; // 主炮是否对准目标
        this.turretDiffAbs = Math.PI; // 炮塔与目标的角度差（绝对值）
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
        // 主炮塔旋转（固定旋转速度 + 射界限制）
        if (this.isPlayer) {
            const targetAng = angleTo(this, game.mouseWorld);
            const result = this.traverseTurret(this.turretAngle, targetAng, this.cfg.mainGun, dt, false);
            this.turretAngle = result.angle;
            this.turretOnTarget = result.onTarget;
            this.turretDiffAbs = result.diffAbs;
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
        if (this.mainGunTimer > 0 || !this.alive) return false;
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

    // AI - 好战强化版 + 避障寻路
    updateAI(dt, game) {
        if (!this.alive || this.isPlayer) return;

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

        // === 执行移动 + 岛屿避障 ===
        if (targetX !== null && targetY !== null) {
            let steerAngle = angleTo(this, { x: targetX, y: targetY });

            // 岛屿避障：检测前方扇形区域内是否有障碍
            let avoidAngle = 0;
            let needAvoid = false;
            const checkDist = this.cfg.length * 4 + Math.abs(this.speed) * 40;
            for (const isl of game.islands) {
                const d = dist(this, isl);
                const clearance = isl.radius + this.cfg.width * 2;
                if (d < clearance + checkDist && d > clearance * 0.3) {
                    const aToIsland = angleTo(this, isl);
                    const relAngle = normalizeAngle(aToIsland - this.angle);
                    // 前方±60度内有岛
                    if (Math.abs(relAngle) < Math.PI * 0.35) {
                        needAvoid = true;
                        // 选择绕行方向：偏离岛屿
                        const avoidDir = relAngle > 0 ? -1 : 1;
                        const urgency = 1 - (d - clearance) / checkDist;
                        avoidAngle += avoidDir * Math.PI * 0.5 * Math.max(urgency, 0.3);
                    }
                }
            }

            if (needAvoid) {
                steerAngle = this.angle + avoidAngle;
            }

            // 边界回避
            const margin = 1500;
            if (this.x < margin) steerAngle = 0;
            else if (this.x > worldSize - margin) steerAngle = Math.PI;
            if (this.y < margin) steerAngle = Math.PI * 0.5;
            else if (this.y > worldSize - margin) steerAngle = -Math.PI * 0.5;

            const diff = normalizeAngle(steerAngle - this.angle);
            this.rudder = clamp(diff * 3.5, -1, 1);
            if (targetSpeed !== null) this.throttle = targetSpeed;

            // 炮塔跟踪（如果有目标）
            if (this.aiTarget && this.aiTarget.alive) {
                const leadAngle = this.predictLead(this.aiTarget, this.cfg.mainGun.shellSpeed);
                const moveResult = this.traverseTurret(this.turretAngle, leadAngle, this.cfg.mainGun, dt, false);
                this.turretAngle = moveResult.angle;
                this.turretOnTarget = moveResult.onTarget;
            }
        }

        // === 卡死检测与脱困 ===
        if (Math.abs(this.speed) < 0.15 && Math.abs(this.throttle) > 0.05) {
            this._stuckTimer += dt;
            if (this._stuckTimer > 1.5) {
                // 卡住了，反向+随机转向脱困
                this.throttle = -0.2;
                this._stuckAngle = this.angle + (Math.random() > 0.5 ? 1 : -1) * Math.PI * 0.6;
                this.rudder = normalizeAngle(this._stuckAngle - this.angle) > 0 ? 1 : -1;
                if (this._stuckTimer > 3) this._stuckTimer = 0; // 重置
            }
        } else {
            this._stuckTimer = 0;
        }

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
                // 0键：进入/退出观战模式
                if (e.key === '0') {
                    this.toggleSpectator();
                }
                // 1-9键：切换舰只
                if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    if (this.spectatorMode) {
                        // 观战模式下切换跟随目标
                        if (index < this.allies.length && this.allies[index] && this.allies[index].alive) {
                            this.spectatorTarget = index;
                        }
                    } else {
                        this.switchToShip(index);
                    }
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
        const clickTarget = document.getElementById('three-container');
        clickTarget.addEventListener('mousedown', e => {
            const player = this.getPlayer();
            if (!this.running || !player || !player.alive || this.spectatorMode) return;
            e.preventDefault();
            if (e.button === 0) {
                if (player.turretOnTarget) {
                    const targetDist = dist(player, this.mouseWorld);
                    player.fireMainGun(player.turretAngle, this, targetDist);
                }
            } else if (e.button === 2) {
                player.fireTorpedo(player.turretAngle, this);
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
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('crosshair').style.display = 'block';
        document.getElementById('game-container').classList.add('playing');
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

        // 生成友军（包含玩家共9艘）
        this.allies = [playerShip];
        this.playerIndex = 0;
        this.spectatorMode = false;
        this.spectatorTarget = 0;
        const allyCount = mapConfig.teamSize.allies - 1; // 剩余8艘
        const allyTypes = ['destroyer', 'cruiser', 'destroyer', 'cruiser', 'battleship', 'destroyer', 'cruiser', 'battleship'];
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
            if (proj.type === 'shell' && proj.landed) {
                const splashRadius = proj.owner?.cfg?.mainGun?.splashRadius || 80;
                // 落水水柱特效
                for (let i = 0; i < 15; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const spd = randRange(1, 4);
                    this.particles.push(new Particle(
                        proj.x + randRange(-8, 8), proj.y + randRange(-8, 8),
                        Math.cos(a) * spd, Math.sin(a) * spd,
                        randRange(0.4, 0.9), randRange(4, 10), '#aaddff'
                    ));
                }
                // 范围内溅射伤害
                for (const t of targets) {
                    if (!t || !t.alive) continue;
                    const d = dist(proj, t);
                    if (d < splashRadius + t.cfg.width) {
                        const falloff = 1 - Math.max(0, d - t.cfg.width * 0.5) / splashRadius;
                        const dmg = proj.damage * clamp(falloff, 0.15, 1);
                        t.takeDamage(dmg, this);
                        if (proj.owner.team === 'player' && proj.owner.isPlayer) {
                            this.totalDamage += dmg;
                        }
                        // 命中特效
                        for (let i = 0; i < 8; i++) {
                            const ea = Math.random() * Math.PI * 2;
                            const espd = randRange(1, 3);
                            this.particles.push(new Particle(
                                t.x, t.y,
                                Math.cos(ea) * espd, Math.sin(ea) * espd,
                                randRange(0.3, 0.6), randRange(3, 7), '#ffaa44'
                            ));
                        }
                        // 检查击杀并计分
                        if (!t.alive) {
                            const shipPoints = { destroyer: 40, cruiser: 60, battleship: 80 };
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

            // 抛物线炮弹飞行中 → 飞越目标上方，不做碰撞
            if (proj.type === 'shell' && proj.gravity > 0) continue;

            // 鱼雷及其他直射弹药 → 直接命中判定
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
                    for (const cp of this.capturePoints) {
                        if (dist(proj, cp) < cp.radius && t.team !== proj.owner.team) {
                            cp.onAttacked();
                        }
                    }
                    // 检查击杀并计分
                    if (!t.alive) {
                        const shipPoints = { destroyer: 40, cruiser: 60, battleship: 80 };
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

        const gunReload = p.mainGunTimer > 0 ? p.mainGunTimer.toFixed(1) + 's' : '就绪';
        const rearReload = p.rearGunTimer > 0 ? p.rearGunTimer.toFixed(1) + 's' : '自动';
        const torpReload = p.torpedoTimer > 0 ? p.torpedoTimer.toFixed(1) + 's' : '就绪';
        document.getElementById('weapon-name').textContent = '主炮 | 尾炮 | 鱼雷';
        document.getElementById('reload-status').textContent = gunReload + ' | ' + rearReload + ' | ' + torpReload;
        const reloadEl = document.getElementById('reload-status');
        reloadEl.style.color = (p.mainGunTimer <= 0) ? '#4cff72' : '#ffaa44';

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

        // 更新3D弹药
        this.renderer3D.updateProjectiles(this.projectiles);

        // 更新3D相机
        if (this.spectatorMode) {
            const specTarget = this.allies[this.spectatorTarget];
            this.renderer3D.updateCamera(specTarget, 0);
            this.renderer3D.aimMarker.visible = false;
        } else {
            this.renderer3D.updateCamera(currentPlayer, this.zoomLevel);
            // 更新3D落点标记
            if (currentPlayer && currentPlayer.alive) {
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
                if (idx >= 0) label = `[${idx + 1}] ` + label;
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

        // === WoWS风格动态准心 ===
        if (!this.spectatorMode && currentPlayer && currentPlayer.alive) {
            this.drawWoWSCrosshair(ctx, currentPlayer, W, H);
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

    // WoWS风格动态准心绘制
    drawWoWSCrosshair(ctx, player, W, H) {
        const mx = this.mouse.x;
        const my = this.mouse.y;
        const gun = player.cfg.mainGun;
        const zl = this.zoomLevel; // 0=正常, 1=全放大

        // 计算目标距离和飞行时间
        const targetDist = dist(player, this.mouseWorld);
        const hSpeed = gun.shellSpeed * 60;
        const flightTime = targetDist / hSpeed;
        const distKm = (targetDist / 1000).toFixed(1);
        const inRange = targetDist <= gun.range;

        // 炮塔对齐状态决定准心颜色
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

        // 十字线四段
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

            // 水平距离刻度（左右各几个刻度，代表km）
            const maxKm = gun.range / 1000;
            const tickSpacing = lerp(30, 50, zl); // 每km的屏幕像素距离
            for (let km = 2; km <= maxKm; km += 2) {
                const tx = mx + km * tickSpacing;
                const tx2 = mx - km * tickSpacing;
                const tickH = km % 4 === 0 ? 12 : 6;

                // 右侧
                ctx.beginPath();
                ctx.moveTo(tx, my - tickH); ctx.lineTo(tx, my + tickH);
                ctx.stroke();
                // 左侧
                ctx.beginPath();
                ctx.moveTo(tx2, my - tickH); ctx.lineTo(tx2, my + tickH);
                ctx.stroke();

                // 数字标注（每4km）
                if (km % 4 === 0) {
                    ctx.font = `${10 * scaleAlpha + 8}px "Consolas", monospace`;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = `rgba(200, 220, 255, ${0.5 * scaleAlpha})`;
                    ctx.fillText(km + '', tx, my + tickH + 14);
                    ctx.fillText(km + '', tx2, my + tickH + 14);
                }
            }

            // 垂直刻度（短的辅助线）
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
