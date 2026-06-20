/* ==========================================================================
   3D HERO MODEL CANVAS (js/three-hero.js)
   ========================================================================== */

(function() {
    const CONTAINER_ID = 'three-hero-container';
    const FALLBACK_IMAGE_PATH = 'assets/images/home_hero_fallback.png';
    const THREE_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById(CONTAINER_ID);
        if (!container) return;

        // Check WebGL availability
        if (!isWebGLAvailable()) {
            showFallback(container);
            return;
        }

        // Load Three.js dynamically to avoid delaying main script parsing
        loadScript(THREE_CDN_URL)
            .then(() => {
                initThreeScene(container);
            })
            .catch(err => {
                console.error("Failed to load Three.js via CDN. Using fallback image.", err);
                showFallback(container);
            });
    });

    /* Check if WebGL is supported by the browser */
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /* Dynamically append a script tag */
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /* Fallback display when WebGL is unavailable or Three fails */
    function showFallback(container) {
        container.innerHTML = `
            <img src="${FALLBACK_IMAGE_PATH}" alt="Battery Storage Unit Fallback Showcase" class="hero-fallback-img" style="width:100%; height:100%; object-fit:contain; animation: float-fallback 6s ease-in-out infinite;">
        `;
        
        // Add floating fallback style inline if stylesheet is missing it
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes float-fallback {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
        `;
        document.head.appendChild(style);
    }

    /* Initialize Three.js Environment */
    function initThreeScene(container) {
        let scene, camera, renderer, batteryGroup;
        let targetRotationX = 0, targetRotationY = 0.5;
        let mouseX = 0, mouseY = 0;
        
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Scene Setup
        scene = new THREE.Scene();

        // 2. Camera Setup
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 10);

        // 3. Renderer Setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // Key directional light (cyan tint)
        const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.5);
        dirLight1.position.set(5, 5, 5);
        scene.add(dirLight1);

        // Fill directional light (magenta/blue tint)
        const dirLight2 = new THREE.DirectionalLight(0x4facfe, 0.8);
        dirLight2.position.set(-5, -3, 3);
        scene.add(dirLight2);

        // Point light for glowing reflection
        const pointLight = new THREE.PointLight(0x00ff87, 2, 15);
        pointLight.position.set(0, 0, 3);
        scene.add(pointLight);

        // 5. Create Battery Model Group
        batteryGroup = new THREE.Group();
        
        // Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.85,
            roughness: 0.2,
            envMapIntensity: 1.0
        });

        const screenGlassMaterial = new THREE.MeshStandardMaterial({
            color: 0x090d16,
            roughness: 0.1,
            metalness: 0.9
        });

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2fe
        });
        
        const greenGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff87
        });

        // 5a. Main Body Cabinet (Sleek upright monolith)
        const bodyGeo = new THREE.BoxGeometry(2.4, 4.0, 1.2);
        const cabinet = new THREE.Mesh(bodyGeo, metalMaterial);
        batteryGroup.add(cabinet);

        // 5b. Glass front panel
        const panelGeo = new THREE.BoxGeometry(2.2, 3.8, 0.05);
        const glassPanel = new THREE.Mesh(panelGeo, screenGlassMaterial);
        glassPanel.position.set(0, 0, 0.6);
        batteryGroup.add(glassPanel);

        // 5c. Adding horizontal slots (glowing modular blocks inside panel)
        const slotCount = 5;
        const slots = [];
        for (let i = 0; i < slotCount; i++) {
            // Horizontal stripe divider
            const stripeGeo = new THREE.BoxGeometry(1.8, 0.1, 0.02);
            const stripe = new THREE.Mesh(stripeGeo, metalMaterial);
            stripe.position.set(0, 1.4 - (i * 0.7), 0.63);
            batteryGroup.add(stripe);

            // LED Status indicators (3 small green dots on the right of each slot)
            for(let j = 0; j < 3; j++) {
                const ledGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8);
                ledGeo.rotateX(Math.PI / 2);
                const led = new THREE.Mesh(ledGeo, greenGlowMaterial);
                led.position.set(0.6 + (j * 0.12), 1.4 - (i * 0.7), 0.63);
                batteryGroup.add(led);
            }
        }

        // 5d. Vertical charge strip (glowing electric line in middle)
        const chargeStripGeo = new THREE.BoxGeometry(0.04, 3.4, 0.02);
        const chargeStrip = new THREE.Mesh(chargeStripGeo, glowMaterial);
        chargeStrip.position.set(-0.7, 0, 0.63);
        batteryGroup.add(chargeStrip);

        scene.add(batteryGroup);

        // 6. Interactive Cursor Tracking (Rotate on mousemove)
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - windowHalfX) / windowHalfX;
            mouseY = (e.clientY - windowHalfY) / windowHalfY;
        });

        // 7. Theme change visual adaptations
        window.addEventListener('themechanged', (e) => {
            const theme = e.detail.theme;
            if (theme === 'light') {
                metalMaterial.color.setHex(0xcbd5e1);
                dirLight1.intensity = 1.0;
                dirLight2.intensity = 0.5;
            } else {
                metalMaterial.color.setHex(0x1e293b);
                dirLight1.intensity = 1.5;
                dirLight2.intensity = 0.8;
            }
        });

        // 8. Animation Loop
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Self rotation base
            targetRotationY = elapsedTime * 0.15;
            
            // Apply mouse tilt delta
            batteryGroup.rotation.y = targetRotationY + (mouseX * 0.4);
            batteryGroup.rotation.x = (mouseY * 0.3);

            // Floating effect
            batteryGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;

            // Pulse point light intensity
            pointLight.intensity = 2.0 + Math.sin(elapsedTime * 4) * 0.5;

            renderer.render(scene, camera);
        }

        animate();

        // 9. Resize Handling
        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            
            renderer.setSize(w, h);
        });
    }
})();
