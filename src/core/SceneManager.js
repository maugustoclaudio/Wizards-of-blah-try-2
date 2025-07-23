import * as THREE from 'three';
import { gsap } from 'gsap';
import { MapControls } from 'three/addons/controls/MapControls.js';

export class SceneManager {
    constructor(canvas) {
        this.scene = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 30;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

        this.controls = new MapControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.enableRotate = false;

        this.setup();
    }

   setup() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50); // Posição mais alta para melhor cobertura
        this.scene.add(directionalLight);

        // Expandimos a área de efeito da luz direcional para cobrir o mundo todo.
        const worldSize = 165; // 11 chunks * 15 unidades
        directionalLight.shadow.camera.left = -worldSize / 2;
        directionalLight.shadow.camera.right = worldSize / 2;
        directionalLight.shadow.camera.top = worldSize / 2;
        directionalLight.shadow.camera.bottom = -worldSize / 2;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        // --- FIM DA CORREÇÃO ---

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    // --- VERSÃO CORRIGIDA E LIMPA ---
    focusOnPoint(point) {
        // 1. Define o alvo da câmara no chão (y=0)
        this.controls.target.set(point.x, 50, point.z);

        // 2. Posiciona a câmara a uma altura consistente em relação ao alvo
        this.camera.position.set(
            this.controls.target.x + 20,
            this.controls.target.y + 20, // y do alvo é 0, então a câmara fica em y=20
            this.controls.target.z + 20
        );

        // 3. Aponta a câmara para o alvo
        this.camera.lookAt(this.controls.target);
    }

    rotateCamera(angleDegrees) {
        const rotationCenter = this.controls.target.clone();
        const angleRadians = THREE.MathUtils.degToRad(angleDegrees);
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), angleRadians
        );
        
        const newPosition = this.camera.position.clone().sub(rotationCenter);
        newPosition.applyQuaternion(rotationQuaternion);
        newPosition.add(rotationCenter);
        
        gsap.to(this.camera.position, {
            x: newPosition.x, y: newPosition.y, z: newPosition.z,
            duration: 0.7, ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(this.controls.target);
            }
        });
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 120;

        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export default SceneManager;