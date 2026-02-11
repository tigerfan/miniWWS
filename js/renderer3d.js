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
        this.squadronMeshes = new Map();
        this.time = 0;
        this.camTarget = new THREE.Vector3();
        this.camLook = new THREE.Vector3();
        this.hitEffects = [];

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
                    float wave1 = sin(pos.x * 0.008 + uTime * 0.7) * 6.0;
                    float wave2 = sin(pos.y * 0.006 + uTime * 0.5) * 4.0;
                    float wave3 = sin((pos.x + pos.y) * 0.004 + uTime * 1.1) * 3.0;
                    float wave4 = sin(pos.x * 0.02 + pos.y * 0.015 + uTime * 1.5) * 1.5;
                    pos.z += wave1 + wave2 + wave3 + wave4;
                    vWaveHeight = pos.z;
                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;
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
        const isBB = ship.type === 'battleship';
        const isCA = ship.type === 'cruiser';
        const isDD = ship.type === 'destroyer';

        // 阵营配色方案
        const pal = isAlly ? {
            hull: 0x4a6a80, hullDark: 0x354e5e, deck: 0x6b5b4f,
            super: 0x6a8595, turret: 0x5a7a8a, accent: 0x4488cc,
            waterline: 0x8b2020, window: 0xffdd88
        } : {
            hull: 0x805050, hullDark: 0x5e3a3a, deck: 0x5a4a40,
            super: 0x957070, turret: 0x8a6060, accent: 0xcc4444,
            waterline: 0x8b2020, window: 0xffdd88
        };

        // ======== CV航母专用模型 ========
        if (ship.type === 'carrier') {
            return this._createCarrierMesh(ship, group, L, W, H, pal, isAlly);
        }

        // ======== 舰体（贝塞尔曲线） ========
        const hullShape = new THREE.Shape();
        hullShape.moveTo(L * 0.5, 0);
        hullShape.bezierCurveTo(L * 0.42, W * 0.22, L * 0.28, W * 0.46, L * 0.08, W * 0.48);
        hullShape.lineTo(-L * 0.22, W * 0.48);
        hullShape.bezierCurveTo(-L * 0.36, W * 0.46, -L * 0.46, W * 0.34, -L * 0.5, W * 0.18);
        hullShape.lineTo(-L * 0.5, -W * 0.18);
        hullShape.bezierCurveTo(-L * 0.46, -W * 0.34, -L * 0.36, -W * 0.46, -L * 0.22, -W * 0.48);
        hullShape.lineTo(L * 0.08, -W * 0.48);
        hullShape.bezierCurveTo(L * 0.28, -W * 0.46, L * 0.42, -W * 0.22, L * 0.5, 0);

        const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
            depth: H, bevelEnabled: true, bevelThickness: 2,
            bevelSize: 1.5, bevelSegments: 3
        });
        const hullColor = pal.hull;
        const hullMat = new THREE.MeshStandardMaterial({
            color: hullColor, roughness: 0.7, metalness: 0.3
        });
        const hullMesh = new THREE.Mesh(hullGeo, hullMat);
        hullMesh.rotation.x = -Math.PI / 2;
        hullMesh.position.y = 2;
        hullMesh.castShadow = true;
        hullMesh.receiveShadow = true;
        group.add(hullMesh);

        // ======== 水线带（红色防污漆） ========
        const wlShape = new THREE.Shape();
        wlShape.moveTo(L * 0.48, 0);
        wlShape.bezierCurveTo(L * 0.4, W * 0.2, L * 0.26, W * 0.44, L * 0.06, W * 0.46);
        wlShape.lineTo(-L * 0.2, W * 0.46);
        wlShape.bezierCurveTo(-L * 0.34, W * 0.44, -L * 0.44, W * 0.32, -L * 0.48, W * 0.16);
        wlShape.lineTo(-L * 0.48, -W * 0.16);
        wlShape.bezierCurveTo(-L * 0.44, -W * 0.32, -L * 0.34, -W * 0.44, -L * 0.2, -W * 0.46);
        wlShape.lineTo(L * 0.06, -W * 0.46);
        wlShape.bezierCurveTo(L * 0.26, -W * 0.44, L * 0.4, -W * 0.2, L * 0.48, 0);
        const wlGeo = new THREE.ExtrudeGeometry(wlShape, { depth: H * 0.3, bevelEnabled: false });
        const wlMat = new THREE.MeshStandardMaterial({ color: pal.waterline, roughness: 0.85, metalness: 0.05 });
        const wlMesh = new THREE.Mesh(wlGeo, wlMat);
        wlMesh.rotation.x = -Math.PI / 2;
        wlMesh.position.y = 0.5;
        group.add(wlMesh);

        // ======== 甲板（随船体轮廓） ========
        const deckShape = new THREE.Shape();
        deckShape.moveTo(L * 0.44, 0);
        deckShape.bezierCurveTo(L * 0.36, W * 0.18, L * 0.24, W * 0.38, L * 0.06, W * 0.42);
        deckShape.lineTo(-L * 0.2, W * 0.42);
        deckShape.bezierCurveTo(-L * 0.34, W * 0.4, -L * 0.43, W * 0.3, -L * 0.46, W * 0.14);
        deckShape.lineTo(-L * 0.46, -W * 0.14);
        deckShape.bezierCurveTo(-L * 0.43, -W * 0.3, -L * 0.34, -W * 0.4, -L * 0.2, -W * 0.42);
        deckShape.lineTo(L * 0.06, -W * 0.42);
        deckShape.bezierCurveTo(L * 0.24, -W * 0.38, L * 0.36, -W * 0.18, L * 0.44, 0);
        const deckGeo = new THREE.ExtrudeGeometry(deckShape, { depth: 1.5, bevelEnabled: false });
        const deckMat = new THREE.MeshStandardMaterial({ color: pal.deck, roughness: 0.9, metalness: 0.05 });
        const deckMesh = new THREE.Mesh(deckGeo, deckMat);
        deckMesh.rotation.x = -Math.PI / 2;
        deckMesh.position.y = H + 2.5;
        deckMesh.receiveShadow = true;
        group.add(deckMesh);

        // ======== 船首挡浪板 ========
        const bwGeo = new THREE.BoxGeometry(W * 0.85, H * 0.35, 1.5);
        const bwMat = new THREE.MeshStandardMaterial({ color: pal.hull, roughness: 0.7, metalness: 0.3 });
        const bw = new THREE.Mesh(bwGeo, bwMat);
        bw.position.set(L * 0.26, H + 4, 0);
        bw.castShadow = true;
        group.add(bw);

        // ======== 上层建筑（多层） ========
        const superMat = new THREE.MeshStandardMaterial({ color: pal.super, roughness: 0.6, metalness: 0.2 });
        const baseH = H * (isBB ? 1.3 : isCA ? 1.0 : 0.8);
        const baseW = W * 0.36;

        // 基座层
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(L * 0.22, baseH, baseW), superMat);
        b1.position.set(-L * 0.02, H + baseH / 2 + 3, 0);
        b1.castShadow = true;
        group.add(b1);

        // 舰桥层（收窄）
        const brH = baseH * 0.65;
        const br = new THREE.Mesh(new THREE.BoxGeometry(L * 0.15, brH, baseW * 0.78), superMat);
        br.position.set(-L * 0.01, H + baseH + brH / 2 + 3, 0);
        br.castShadow = true;
        group.add(br);

        // 舰桥窗户（发光条带）
        const winMat = new THREE.MeshStandardMaterial({
            color: pal.window, emissive: pal.window, emissiveIntensity: 0.35,
            roughness: 0.2, metalness: 0.7
        });
        const win = new THREE.Mesh(new THREE.BoxGeometry(L * 0.155, brH * 0.22, baseW * 0.8), winMat);
        win.position.set(-L * 0.01, H + baseH + brH * 0.7 + 3, 0);
        group.add(win);

        // 雷达平台（BB/CA）
        if (!isDD) {
            const rpH = brH * 0.35;
            const rp = new THREE.Mesh(new THREE.BoxGeometry(L * 0.08, rpH, baseW * 0.5), superMat);
            rp.position.set(-L * 0.01, H + baseH + brH + rpH / 2 + 3, 0);
            rp.castShadow = true;
            group.add(rp);
        }

        // ======== 烟囱 ========
        const funnelCount = isBB ? 2 : 1;
        for (let fi = 0; fi < funnelCount; fi++) {
            const fH = H * (isBB ? 2.0 : isCA ? 1.8 : 1.4);
            const fR = W * (isBB ? 0.1 : 0.08);
            const fX = -L * (0.08 + fi * 0.1);

            // 烟囱主体
            const fMat = new THREE.MeshStandardMaterial({ color: pal.hullDark, roughness: 0.8, metalness: 0.15 });
            const f = new THREE.Mesh(new THREE.CylinderGeometry(fR * 0.82, fR, fH, 10), fMat);
            f.position.set(fX, H + fH / 2 + baseH + 3, 0);
            f.castShadow = true;
            group.add(f);

            // 烟囱帽
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(fR * 1.1, fR * 0.82, fH * 0.12, 10),
                new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
            );
            cap.position.set(fX, H + fH + baseH + 3, 0);
            group.add(cap);

            // 阵营色条纹
            const bandMat = new THREE.MeshStandardMaterial({
                color: pal.accent, emissive: pal.accent, emissiveIntensity: 0.15, roughness: 0.5
            });
            const band = new THREE.Mesh(new THREE.CylinderGeometry(fR * 0.86, fR * 0.9, fH * 0.15, 10), bandMat);
            band.position.set(fX, H + fH * 0.55 + baseH + 3, 0);
            group.add(band);
        }

        // ======== 桅杆 ========
        const mH = H * (isBB ? 3.5 : isCA ? 3.0 : 2.2);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.4 });
        const mastBaseY = H + baseH + brH + 3;

        // 主桅
        const mastMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, mH, 6), mastMat);
        mastMesh.position.set(L * 0.05, mastBaseY + mH / 2, 0);
        group.add(mastMesh);

        // 横桁
        const ya = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, W * 0.65, 4), mastMat);
        ya.rotation.x = Math.PI / 2;
        ya.position.set(L * 0.05, mastBaseY + mH * 0.65, 0);
        group.add(ya);

        // 雷达天线
        const rd = new THREE.Mesh(
            new THREE.BoxGeometry(W * 0.35, W * 0.08, 1),
            new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.5 })
        );
        rd.position.set(L * 0.05, mastBaseY + mH * 0.85, 0);
        group.add(rd);

        // ======== 前主炮塔 ========
        const turretGroup = this._buildTurret(ship, pal, L, W, H, false);
        turretGroup.position.set(L * 0.22, H + 5, 0);
        group.add(turretGroup);

        // ======== 后炮塔 ========
        const rearTurretGroup = this._buildTurret(ship, pal, L, W, H, true);
        rearTurretGroup.position.set(-L * 0.25, H + 4, 0);
        group.add(rearTurretGroup);

        // ======== 副炮（BB/CA两侧） ========
        if (!isDD) {
            const secCount = isBB ? 3 : 2;
            const secMat = new THREE.MeshStandardMaterial({ color: 0x556666, roughness: 0.5, metalness: 0.4 });
            for (let si = 0; si < secCount; si++) {
                const sx = L * (0.08 - si * 0.1);
                for (const side of [-1, 1]) {
                    const sBase = new THREE.Mesh(
                        new THREE.CylinderGeometry(W * 0.035, W * 0.045, H * 0.25, 6), secMat
                    );
                    sBase.position.set(sx, H + 4, side * W * 0.38);
                    group.add(sBase);
                    const sBrl = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.4, 0.5, L * 0.028, 4), secMat
                    );
                    sBrl.rotation.z = Math.PI / 2;
                    sBrl.position.set(sx + L * 0.015, H + 4.5, side * W * 0.38);
                    group.add(sBrl);
                }
            }
        }

        // ======== 防空炮位（BB/CA） ========
        if (!isDD) {
            const aaMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.5 });
            const aaPos = isBB ? [
                { x: -L * 0.15, z: W * 0.28 }, { x: -L * 0.15, z: -W * 0.28 },
                { x: L * 0.1, z: W * 0.32 }, { x: L * 0.1, z: -W * 0.32 }
            ] : [
                { x: -L * 0.12, z: W * 0.24 }, { x: -L * 0.12, z: -W * 0.24 }
            ];
            for (const p of aaPos) {
                const aa = new THREE.Mesh(
                    new THREE.CylinderGeometry(W * 0.02, W * 0.028, H * 0.2, 6), aaMat
                );
                aa.position.set(p.x, H + baseH + 4, p.z);
                group.add(aa);
            }
        }

        // ======== 舷窗（发光） ========
        const phCount = isBB ? 7 : isCA ? 5 : 3;
        const phMat = new THREE.MeshStandardMaterial({
            color: 0xffeeaa, emissive: 0xffeeaa, emissiveIntensity: 0.3, roughness: 0.3
        });
        for (let pi = 0; pi < phCount; pi++) {
            const px = L * (-0.28 + pi * 0.08);
            for (const s of [-1, 1]) {
                const ph = new THREE.Mesh(new THREE.CircleGeometry(0.8, 6), phMat);
                ph.position.set(px, H * 0.6 + 3, s * W * 0.49);
                ph.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
                group.add(ph);
            }
        }

        // ======== 锚 ========
        const aMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8, metalness: 0.3 });
        for (const s of [-1, 1]) {
            const anchor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.8), aMat);
            anchor.position.set(L * 0.38, H * 0.5 + 3, s * W * 0.36);
            group.add(anchor);
        }

        group.userData = { turretGroup, rearTurretGroup, ship, hullMat, originalColor: hullColor,
            bobPhase: Math.random() * Math.PI * 2,
            rollPhase: Math.random() * Math.PI * 2,
            pitchPhase: Math.random() * Math.PI * 2
        };

        this.scene.add(group);
        this.shipMeshes.set(ship, group);
        return group;
    }

    _buildTurret(ship, pal, L, W, H, isRear) {
        const g = new THREE.Group();
        const isBB = ship.type === 'battleship';
        const isCA = ship.type === 'cruiser';
        const sc = isRear ? 0.72 : 1.0;
        const barrels = isRear
            ? Math.max(1, (isBB ? 3 : isCA ? 2 : 1) - 1)
            : (isBB ? 3 : isCA ? 2 : 1);

        const tR = W * 0.25 * sc;
        const tH = H * 0.5 * sc;

        // 盾形炮塔（圆弧前脸 + 平后壁）
        const ts = new THREE.Shape();
        ts.moveTo(tR * 0.8, tR * 0.9);
        ts.quadraticCurveTo(tR * 1.4, 0, tR * 0.8, -tR * 0.9);
        ts.lineTo(-tR * 0.7, -tR * 0.8);
        ts.lineTo(-tR * 0.7, tR * 0.8);
        ts.closePath();

        const tGeo = new THREE.ExtrudeGeometry(ts, {
            depth: tH, bevelEnabled: true, bevelThickness: 0.8,
            bevelSize: 0.5, bevelSegments: 2
        });
        const tMat = new THREE.MeshStandardMaterial({ color: pal.turret, roughness: 0.5, metalness: 0.4 });
        const turretShield = new THREE.Mesh(tGeo, tMat);
        turretShield.rotation.x = -Math.PI / 2;
        turretShield.position.y = -tH * 0.3;
        turretShield.castShadow = true;
        g.add(turretShield);

        // 炮管
        const bLen = L * 0.25 * sc;
        const bR = 1.8 * sc;
        const bMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.35, metalness: 0.65 });
        for (let i = 0; i < barrels; i++) {
            const brl = new THREE.Mesh(
                new THREE.CylinderGeometry(bR * 0.75, bR, bLen, 8), bMat
            );
            brl.rotation.z = Math.PI / 2;
            brl.position.set(bLen * 0.5, H * 0.15 * sc, (i - (barrels - 1) / 2) * (4 * sc));
            brl.castShadow = true;
            g.add(brl);

            // 炮口制退器
            const mz = new THREE.Mesh(
                new THREE.TorusGeometry(bR * 1.0, bR * 0.2, 4, 8), bMat
            );
            mz.rotation.y = Math.PI / 2;
            mz.position.set(bLen * 0.98, H * 0.15 * sc, (i - (barrels - 1) / 2) * (4 * sc));
            g.add(mz);
        }

        return g;
    }

    _createCarrierMesh(ship, group, L, W, H, pal, isAlly) {
        // ======== 舰体 ========
        const hullShape = new THREE.Shape();
        hullShape.moveTo(L * 0.48, 0);
        hullShape.bezierCurveTo(L * 0.44, W * 0.18, L * 0.3, W * 0.44, L * 0.1, W * 0.48);
        hullShape.lineTo(-L * 0.3, W * 0.48);
        hullShape.bezierCurveTo(-L * 0.42, W * 0.46, -L * 0.48, W * 0.3, -L * 0.5, W * 0.15);
        hullShape.lineTo(-L * 0.5, -W * 0.15);
        hullShape.bezierCurveTo(-L * 0.48, -W * 0.3, -L * 0.42, -W * 0.46, -L * 0.3, -W * 0.48);
        hullShape.lineTo(L * 0.1, -W * 0.48);
        hullShape.bezierCurveTo(L * 0.3, -W * 0.44, L * 0.44, -W * 0.18, L * 0.48, 0);
        const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
            depth: H, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.5, bevelSegments: 3
        });
        const hullColor = pal.hull;
        const hullMat = new THREE.MeshStandardMaterial({ color: hullColor, roughness: 0.7, metalness: 0.3 });
        const hullMesh = new THREE.Mesh(hullGeo, hullMat);
        hullMesh.rotation.x = -Math.PI / 2;
        hullMesh.position.y = 2;
        hullMesh.castShadow = true;
        hullMesh.receiveShadow = true;
        group.add(hullMesh);

        // ======== 水线带 ========
        const wlShape = new THREE.Shape();
        wlShape.moveTo(L * 0.46, 0);
        wlShape.bezierCurveTo(L * 0.42, W * 0.16, L * 0.28, W * 0.42, L * 0.08, W * 0.46);
        wlShape.lineTo(-L * 0.28, W * 0.46);
        wlShape.bezierCurveTo(-L * 0.4, W * 0.44, -L * 0.46, W * 0.28, -L * 0.48, W * 0.13);
        wlShape.lineTo(-L * 0.48, -W * 0.13);
        wlShape.bezierCurveTo(-L * 0.46, -W * 0.28, -L * 0.4, -W * 0.44, -L * 0.28, -W * 0.46);
        wlShape.lineTo(L * 0.08, -W * 0.46);
        wlShape.bezierCurveTo(L * 0.28, -W * 0.42, L * 0.42, -W * 0.16, L * 0.46, 0);
        const wlGeo = new THREE.ExtrudeGeometry(wlShape, { depth: H * 0.3, bevelEnabled: false });
        const wlMat = new THREE.MeshStandardMaterial({ color: pal.waterline, roughness: 0.85, metalness: 0.05 });
        const wlMesh = new THREE.Mesh(wlGeo, wlMat);
        wlMesh.rotation.x = -Math.PI / 2;
        wlMesh.position.y = 0.5;
        group.add(wlMesh);

        // ======== 飞行甲板（大型平板） ========
        const deckW = W * 0.95;
        const deckL = L * 0.92;
        const deckGeo = new THREE.BoxGeometry(deckL, 2, deckW);
        const deckMat = new THREE.MeshStandardMaterial({ color: pal.deck, roughness: 0.9, metalness: 0.05 });
        const deckMesh = new THREE.Mesh(deckGeo, deckMat);
        deckMesh.position.set(0, H + 3, 0);
        deckMesh.receiveShadow = true;
        deckMesh.castShadow = true;
        group.add(deckMesh);

        // ======== 甲板标线 ========
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        // 中线
        const cl = new THREE.Mesh(new THREE.BoxGeometry(deckL * 0.8, 0.2, 0.8), lineMat);
        cl.position.set(0, H + 4.2, 0);
        group.add(cl);
        // 着舰区斜线
        for (let i = 0; i < 4; i++) {
            const sl = new THREE.Mesh(new THREE.BoxGeometry(deckL * 0.12, 0.2, 0.5), lineMat);
            sl.position.set(-L * 0.1 - i * L * 0.06, H + 4.2, W * 0.15 - i * W * 0.06);
            sl.rotation.y = -0.3;
            group.add(sl);
        }

        // ======== 舰岛（右舷偏置上层建筑） ========
        const superMat = new THREE.MeshStandardMaterial({ color: pal.super, roughness: 0.6, metalness: 0.2 });
        const islandW = W * 0.18;
        const islandH = H * 2.5;
        const islandL = L * 0.18;
        const island = new THREE.Mesh(new THREE.BoxGeometry(islandL, islandH, islandW), superMat);
        island.position.set(L * 0.05, H + islandH / 2 + 4, -W * 0.38);
        island.castShadow = true;
        group.add(island);

        // 舰桥层
        const brH = islandH * 0.5;
        const br = new THREE.Mesh(new THREE.BoxGeometry(islandL * 0.7, brH, islandW * 0.85), superMat);
        br.position.set(L * 0.05, H + islandH + brH / 2 + 4, -W * 0.38);
        br.castShadow = true;
        group.add(br);

        // 舰桥窗户
        const winMat = new THREE.MeshStandardMaterial({
            color: pal.window, emissive: pal.window, emissiveIntensity: 0.35, roughness: 0.2, metalness: 0.7
        });
        const win = new THREE.Mesh(new THREE.BoxGeometry(islandL * 0.75, brH * 0.25, islandW * 0.9), winMat);
        win.position.set(L * 0.05, H + islandH + brH * 0.65 + 4, -W * 0.38);
        group.add(win);

        // 烟囱
        const fH = H * 1.8;
        const fR = W * 0.06;
        const fMat = new THREE.MeshStandardMaterial({ color: pal.hullDark, roughness: 0.8, metalness: 0.15 });
        const funnel = new THREE.Mesh(new THREE.CylinderGeometry(fR * 0.8, fR, fH, 8), fMat);
        funnel.position.set(L * 0.02, H + islandH + fH / 2 + 4, -W * 0.38);
        funnel.castShadow = true;
        group.add(funnel);

        // 桅杆+雷达
        const mH = H * 3;
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.7, metalness: 0.4 });
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, mH, 6), mastMat);
        mast.position.set(L * 0.06, H + islandH + brH + mH / 2 + 4, -W * 0.38);
        group.add(mast);
        const rd = new THREE.Mesh(
            new THREE.BoxGeometry(W * 0.2, W * 0.05, 1),
            new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.5 })
        );
        rd.position.set(L * 0.06, H + islandH + brH + mH * 0.8 + 4, -W * 0.38);
        group.add(rd);

        // ======== 防空炮 ========
        const aaMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.5 });
        const aaPositions = [
            { x: L * 0.3, z: -W * 0.35 }, { x: -L * 0.2, z: -W * 0.35 },
            { x: L * 0.3, z: W * 0.35 }, { x: -L * 0.2, z: W * 0.35 },
            { x: L * 0.15, z: -W * 0.35 }, { x: -L * 0.35, z: -W * 0.35 }
        ];
        for (const p of aaPositions) {
            const aa = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.02, W * 0.025, H * 0.2, 6), aaMat);
            aa.position.set(p.x, H + 5, p.z);
            group.add(aa);
        }

        // ======== 阵营标志条纹 ========
        const bandMat = new THREE.MeshStandardMaterial({
            color: pal.accent, emissive: pal.accent, emissiveIntensity: 0.15, roughness: 0.5
        });
        const band = new THREE.Mesh(new THREE.BoxGeometry(deckL * 0.06, 0.3, deckW * 0.6), bandMat);
        band.position.set(L * 0.35, H + 4.3, 0);
        group.add(band);

        group.userData = { turretGroup: null, rearTurretGroup: null, ship, hullMat, originalColor: hullColor,
            bobPhase: Math.random() * Math.PI * 2,
            rollPhase: Math.random() * Math.PI * 2,
            pitchPhase: Math.random() * Math.PI * 2
        };
        this.scene.add(group);
        this.shipMeshes.set(ship, group);
        return group;
    }

    createSquadronMesh(sq) {
        const group = new THREE.Group();
        const isAlly = sq.owner.team === 'player';
        const bodyColor = isAlly ? 0x4a7090 : 0x905060;
        const wingColor = isAlly ? 0x5a8aaa : 0xaa6070;

        for (let i = 0; i < sq.planes; i++) {
            const plane = new THREE.Group();
            // 机身
            const bodyGeo = new THREE.BoxGeometry(14, 2.5, 3.5);
            const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.5, metalness: 0.3 });
            plane.add(new THREE.Mesh(bodyGeo, bodyMat));
            // 机翼
            const wingGeo = new THREE.BoxGeometry(4, 0.6, 22);
            const wingMat = new THREE.MeshStandardMaterial({ color: wingColor, roughness: 0.5, metalness: 0.3 });
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.position.set(-1, 0.8, 0);
            plane.add(wing);
            // 尾翼
            const tailGeo = new THREE.BoxGeometry(2, 5, 1);
            const tail = new THREE.Mesh(tailGeo, bodyMat);
            tail.position.set(-6, 2.5, 0);
            plane.add(tail);
            // 螺旋桨位
            const propGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 4);
            const prop = new THREE.Mesh(propGeo, new THREE.MeshBasicMaterial({ color: 0x333333 }));
            prop.rotation.z = Math.PI / 2;
            prop.position.set(8, 0, 0);
            plane.add(prop);

            // V字编队位置
            const row = Math.floor(i / 2);
            const side = i % 2 === 0 ? -1 : 1;
            if (i === 0) {
                plane.userData.offset = { x: 0, z: 0 };
            } else {
                plane.userData.offset = { x: -row * 18, z: side * (row) * 14 };
            }
            group.add(plane);
        }
        this.scene.add(group);
        this.squadronMeshes.set(sq, group);
        return group;
    }

    updateSquadron(sq) {
        let mesh = this.squadronMeshes.get(sq);
        if (!mesh && sq.alive) {
            mesh = this.createSquadronMesh(sq);
        }
        if (!mesh) return;

        if (!sq.alive) {
            this.scene.remove(mesh);
            this.squadronMeshes.delete(sq);
            return;
        }

        mesh.position.set(sq.x, sq.z, sq.y);
        mesh.rotation.y = -sq.angle;

        // 编队中各机的微动
        const children = mesh.children;
        for (let i = 0; i < children.length; i++) {
            const plane = children[i];
            if (!plane.userData.offset) continue;
            const off = plane.userData.offset;
            plane.position.set(off.x, Math.sin(this.time * 2 + i) * 1.5, off.z);
            plane.rotation.z = Math.sin(this.time * 1.5 + i * 0.5) * 0.05;
        }

        // 攻击状态倾斜
        if (sq.state === 'attacking') {
            mesh.rotation.x = 0.15;
        } else if (sq.state === 'launching') {
            mesh.rotation.x = -0.1 * (1 - sq.launchTimer / 1.5);
        } else {
            mesh.rotation.x = 0;
        }
    }

    updateSquadronCamera(sq) {
        if (!sq || !sq.alive) return;
        const camDist = 250;
        const camH = 120;
        const ahead = 300;

        if (this._smoothCamAngle === undefined) this._smoothCamAngle = sq.angle;
        let angleDiff = normalizeAngle(sq.angle - this._smoothCamAngle);
        this._smoothCamAngle = normalizeAngle(this._smoothCamAngle + angleDiff * 0.04);

        const behindX = sq.x - Math.cos(this._smoothCamAngle) * camDist;
        const behindZ = sq.y - Math.sin(this._smoothCamAngle) * camDist;
        this.camTarget.set(behindX, sq.z + camH, behindZ);
        this.camera.position.lerp(this.camTarget, 0.05);

        const lx = sq.x + Math.cos(this._smoothCamAngle) * ahead;
        const lz = sq.y + Math.sin(this._smoothCamAngle) * ahead;
        if (!this._smoothLook) this._smoothLook = new THREE.Vector3(lx, sq.z, lz);
        this._smoothLook.x = lerp(this._smoothLook.x, lx, 0.06);
        this._smoothLook.y = lerp(this._smoothLook.y, sq.z, 0.06);
        this._smoothLook.z = lerp(this._smoothLook.z, lz, 0.06);
        this.camera.lookAt(this._smoothLook);

        this.camera.fov = lerp(this.camera.fov, 60, 0.06);
        this.camera.updateProjectionMatrix();

        this.sunLight.position.set(sq.x + 3000, 4000, sq.y + 2000);
        this.sunLight.target.position.set(sq.x, 0, sq.y);
        this.sunLight.target.updateMatrixWorld();
        this.sky.position.set(sq.x, 0, sq.y);
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

    // 创建炮弹/鱼雷3D对象（含飞行拖尾效果）
    createProjectileMesh(proj) {
        let mesh;
        const maxTrailPts = 40;

        if (proj.type === 'torpedo') {
            // 鱼雷本体（拉长圆柱+半球头）
            const bodyGeo = new THREE.CylinderGeometry(2.5, 3, 14, 6);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x556655, roughness: 0.6, metalness: 0.4
            });
            mesh = new THREE.Mesh(bodyGeo, bodyMat);
            mesh.rotation.z = Math.PI / 2;

            // 发光光晕
            const glowGeo = new THREE.SphereGeometry(6, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: 0x60ffaa, transparent: true, opacity: 0.25
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            mesh.add(glow);

            // 气泡尾迹线
            const trailGeo = new THREE.BufferGeometry();
            const trailPos = new Float32Array(maxTrailPts * 3);
            const trailAlpha = new Float32Array(maxTrailPts);
            trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
            trailGeo.setAttribute('alpha', new THREE.BufferAttribute(trailAlpha, 1));
            const trailMat = new THREE.ShaderMaterial({
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
                        gl_FragColor = vec4(0.7, 1.0, 0.85, vAlpha * 0.6);
                    }
                `
            });
            const trail = new THREE.Line(trailGeo, trailMat);
            trail.frustumCulled = false;
            mesh.userData.trail = trail;
            mesh.userData.trailHistory = [];
            mesh.userData.maxTrailPts = maxTrailPts;
            this.scene.add(trail);
        } else {
            // 炮弹本体（拉长发光体）
            const bodyGeo = new THREE.CylinderGeometry(1.2, 1.8, 10, 6);
            const bodyMat = new THREE.MeshBasicMaterial({ color: 0xffdd55 });
            mesh = new THREE.Mesh(bodyGeo, bodyMat);
            mesh.rotation.z = Math.PI / 2;

            // 发光核心
            const coreGeo = new THREE.SphereGeometry(4, 8, 8);
            const coreMat = new THREE.MeshBasicMaterial({
                color: 0xffaa22, transparent: true, opacity: 0.5
            });
            mesh.add(new THREE.Mesh(coreGeo, coreMat));

            // 外层光晕
            const haloGeo = new THREE.SphereGeometry(8, 6, 6);
            const haloMat = new THREE.MeshBasicMaterial({
                color: 0xff6600, transparent: true, opacity: 0.15
            });
            mesh.add(new THREE.Mesh(haloGeo, haloMat));

            // 火焰拖尾线
            const trailGeo = new THREE.BufferGeometry();
            const trailPos = new Float32Array(maxTrailPts * 3);
            const trailAlpha = new Float32Array(maxTrailPts);
            trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
            trailGeo.setAttribute('alpha', new THREE.BufferAttribute(trailAlpha, 1));
            const trailMat = new THREE.ShaderMaterial({
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
                        vec3 col = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.3), vAlpha);
                        gl_FragColor = vec4(col, vAlpha * 0.7);
                    }
                `
            });
            const trail = new THREE.Line(trailGeo, trailMat);
            trail.frustumCulled = false;
            mesh.userData.trail = trail;
            mesh.userData.trailHistory = [];
            mesh.userData.maxTrailPts = maxTrailPts;
            this.scene.add(trail);
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

        // 平滑相机角度
        if (this._smoothCamAngle === undefined) this._smoothCamAngle = player.angle;
        const angleLerp = lerp(0.035, 0.018, z);
        let angleDiff = normalizeAngle(targetAngle - this._smoothCamAngle);
        this._smoothCamAngle = normalizeAngle(this._smoothCamAngle + angleDiff * angleLerp);

        // 相机位置
        const behindX = player.x - Math.cos(this._smoothCamAngle) * camDist;
        const behindZ = player.y - Math.sin(this._smoothCamAngle) * camDist;
        this.camTarget.set(behindX, camH, behindZ);
        const posLerp = lerp(0.035, 0.025, z);
        this.camera.position.lerp(this.camTarget, posLerp);

        // 看向点
        const lx = player.x + Math.cos(this._smoothCamAngle) * ahead;
        const lz = player.y + Math.sin(this._smoothCamAngle) * ahead;
        const lookH = lerp(10, 5, z);

        if (!this._smoothLook) this._smoothLook = new THREE.Vector3(lx, lookH, lz);
        const lookLerp = lerp(0.05, 0.03, z);
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

            const ud = mesh.userData;
            if (ud.hullMat) ud.hullMat.emissive.setHex(0x330000);

            const wake = this.wakeLines.get(ship);
            if (wake) {
                wake.left.visible = false;
                wake.right.visible = false;
                wake.center.visible = false;
            }
            return;
        }

        mesh.visible = true;
        const ud2 = mesh.userData;
        const bobY = Math.sin(this.time * 1.2 + (ud2.bobPhase || 0)) * 3;
        const roll = Math.sin(this.time * 0.8 + (ud2.rollPhase || 0)) * 0.02;
        const pitch = Math.sin(this.time * 0.6 + (ud2.pitchPhase || 0)) * 0.015;

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
                p.spread += 0.15;
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
        // 清理已消亡的
        for (let i = this.projectilePool.length - 1; i >= 0; i--) {
            const mesh = this.projectilePool[i];
            const proj = mesh.userData.proj;
            if (!proj || !proj.alive) {
                this.scene.remove(mesh);
                if (mesh.userData.trail) this.scene.remove(mesh.userData.trail);
                this.projectilePool.splice(i, 1);
            }
        }

        // 添加新弹药
        const existingProjs = new Set(this.projectilePool.map(m => m.userData.proj));
        for (const proj of projectiles) {
            if (!proj.alive) continue;
            if (!existingProjs.has(proj)) {
                this.createProjectileMesh(proj);
            }
        }

        // 更新位置、朝向、拖尾
        for (const mesh of this.projectilePool) {
            const proj = mesh.userData.proj;
            if (!proj) continue;

            const h = proj.z !== undefined ? proj.z : (proj.type === 'torpedo' ? 2 : 30);
            mesh.position.set(proj.x, h, proj.y);
            mesh.rotation.y = -proj.angle;

            // 拖尾轨迹更新
            const trail = mesh.userData.trail;
            const history = mesh.userData.trailHistory;
            const maxPts = mesh.userData.maxTrailPts;
            if (trail && history && maxPts) {
                history.unshift({ x: proj.x, y: h, z: proj.y });
                if (history.length > maxPts) history.length = maxPts;

                const posArr = trail.geometry.attributes.position.array;
                const alphaArr = trail.geometry.attributes.alpha.array;
                for (let ti = 0; ti < maxPts; ti++) {
                    if (ti < history.length) {
                        const pt = history[ti];
                        posArr[ti * 3] = pt.x;
                        posArr[ti * 3 + 1] = pt.y;
                        posArr[ti * 3 + 2] = pt.z;
                        alphaArr[ti] = 1.0 - ti / history.length;
                    } else {
                        alphaArr[ti] = 0;
                    }
                }
                trail.geometry.attributes.position.needsUpdate = true;
                trail.geometry.attributes.alpha.needsUpdate = true;
                trail.geometry.setDrawRange(0, history.length);
            }
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

            if (flag) {
                flag.rotation.y = Math.sin(this.time * 2) * 0.15;
            }
        }
    }

    createHitEffect(x, z, type) {
        const group = new THREE.Group();
        group.position.set(x, 2, z);

        if (type === 'torpedo') {
            // 鱼雷命中：绿色水柱+扩散环
            const colGeo = new THREE.CylinderGeometry(1.5, 3, 25, 6);
            const colMat = new THREE.MeshBasicMaterial({ color: 0x80ffb0, transparent: true, opacity: 0.6 });
            const col = new THREE.Mesh(colGeo, colMat);
            col.position.y = 12;
            group.add(col);
            const ringGeo = new THREE.RingGeometry(2, 5, 12);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x80ffb0, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 2;
            group.add(ring);
            this.hitEffects.push({ group, life: 0.9, maxLife: 0.9, type });
        } else if (type === 'shell_hit') {
            // 炮弹命中舰船：橙色火球
            const coreGeo = new THREE.SphereGeometry(4, 6, 6);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.7 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            core.position.y = 8;
            group.add(core);
            const outerGeo = new THREE.SphereGeometry(7, 6, 6);
            const outerMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.25 });
            const outer = new THREE.Mesh(outerGeo, outerMat);
            outer.position.y = 8;
            group.add(outer);
            this.hitEffects.push({ group, life: 0.6, maxLife: 0.6, type });
        } else {
            // 炮弹落水：白色水柱
            const colGeo = new THREE.CylinderGeometry(1, 2.5, 20, 6);
            const colMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.5 });
            const col = new THREE.Mesh(colGeo, colMat);
            col.position.y = 10;
            group.add(col);
            const splashGeo = new THREE.RingGeometry(3, 7, 12);
            const splashMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
            const splash = new THREE.Mesh(splashGeo, splashMat);
            splash.rotation.x = -Math.PI / 2;
            splash.position.y = 1.5;
            group.add(splash);
            this.hitEffects.push({ group, life: 0.8, maxLife: 0.8, type });
        }
        this.scene.add(group);
    }

    updateHitEffects(dt) {
        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const eff = this.hitEffects[i];
            eff.life -= dt;
            const t = 1 - eff.life / eff.maxLife; // 0→1
            const g = eff.group;

            if (eff.type === 'torpedo') {
                // 水柱上升+扩散环扩大
                const col = g.children[0];
                const ring = g.children[1];
                if (col) { col.position.y = 12 + t * 15; col.scale.y = 1 + t * 0.3; col.material.opacity = (1 - t) * 0.6; }
                if (ring) { ring.scale.set(1 + t * 2.5, 1 + t * 2.5, 1); ring.material.opacity = (1 - t) * 0.4; }
            } else if (eff.type === 'shell_hit') {
                // 火球扩大+消散
                const s = 1 + t * 1.5;
                g.children.forEach(c => { c.scale.set(s, s, s); c.material.opacity = Math.max(0, (1 - t * t)) * (c === g.children[0] ? 0.7 : 0.25); });
            } else {
                // 水柱上升+消散
                const col = g.children[0];
                const splash = g.children[1];
                if (col) { col.position.y = 10 + t * 20; col.scale.set(1 - t * 0.2, 1 + t * 0.5, 1 - t * 0.2); col.material.opacity = (1 - t) * 0.5; }
                if (splash) { splash.scale.set(1 + t * 2, 1, 1 + t * 2); splash.material.opacity = (1 - t) * 0.35; }
            }

            if (eff.life <= 0) {
                g.children.forEach(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
                this.scene.remove(g);
                this.hitEffects.splice(i, 1);
            }
        }
    }

    render(dt) {
        this.time += dt;
        this.ocean.material.uniforms.uTime.value = this.time;
        this.ocean.material.uniforms.uCamPos.value.copy(this.camera.position);
        this.updateCapturePoints();
        this.updateHitEffects(dt);
        this.renderer.render(this.scene, this.camera);
    }

    clearScene() {
        for (const [, mesh] of this.shipMeshes) {
            this.scene.remove(mesh);
        }
        this.shipMeshes.clear();
        for (const [, mesh] of this.squadronMeshes) {
            this.scene.remove(mesh);
        }
        this.squadronMeshes.clear();
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
        for (const eff of this.hitEffects) {
            eff.group.children.forEach(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
            this.scene.remove(eff.group);
        }
        this.hitEffects = [];
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer3D };
}
