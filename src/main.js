import SceneManager from './core/SceneManager.js';
import PhysicsManager from './core/PhysicsManager.js';
import { Character } from './components/Character.js';
import { WorldManager } from './core/WorldManager.js';
import { AIController } from './components/AIController.js';
import { InteractionManager } from './core/InteractionManager.js';
import * as THREE from 'three';

// --- Inicialização ---
const canvas = document.getElementById('game-canvas');
const sceneManager = new SceneManager(canvas);

const interactionManager = new InteractionManager(sceneManager.camera, sceneManager.scene, canvas);

let character;
let aiController;
let worldManager;

async function initialize() {
    // Inicializa a física primeiro
    await PhysicsManager.init();

    // Usamos o WorldManager para gerar o mundo
    worldManager = new WorldManager(sceneManager, interactionManager);
    worldManager.generate();

    // Obtemos a posição inicial do WorldManager e criamos o personagem
    const startPosition = worldManager.getStartPosition();
    character = new Character(sceneManager, startPosition); // Passamos a posição inicial

    aiController = new AIController(character);

    const cameraTarget = startPosition.clone();
    cameraTarget.y = 0;

    const initialCameraFocus = worldManager.getChunkCenter(13, 8);
    sceneManager.focusOnPoint(initialCameraFocus);

    

    setupCameraControls();
    // Inicia o loop do jogo
    animate();
}

function setupCameraControls() {
    const rotateLeftBtn = document.getElementById('rotate-left-btn');
    const rotateRightBtn = document.getElementById('rotate-right-btn');

    rotateLeftBtn.addEventListener('click', () => {
        sceneManager.rotateCamera(90); // Roda 90 graus para a esquerda
    });

    rotateRightBtn.addEventListener('click', () => {
        sceneManager.rotateCamera(-90); // Roda 90 graus para a direita
    });
}

// --- Loop do Jogo ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    // 1. Atualiza a física
    PhysicsManager.update();

    interactionManager.update();
    
    // 2. Atualiza a lógica da IA
    if(aiController) {
       aiController.update(deltaTime);
    }

    // 3. Sincroniza os objetos visuais com os físicos
    if (character) {
        character.update();
    }
    
    // 4. Renderiza a cena
    sceneManager.update();
}

// Inicia todo o processo
initialize();