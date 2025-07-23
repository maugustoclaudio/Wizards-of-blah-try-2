import * as THREE from 'three';
import { createTree} from './Elements.js';
import PhysicsManager from '../core/PhysicsManager.js';

export class Chunk {
    constructor(sceneManager, interactionManager, type, worldPosition) {
        this.sceneManager = sceneManager;
        this.interactionManager = interactionManager;
        this.type = type;
        this.worldPosition = worldPosition;
        this.size = 15;
        this.isSelectable = false;
        // Criamos um grupo para conter todos os objetos visuais deste chunk
        this.contentGroup = new THREE.Group();
        this.sceneManager.add(this.contentGroup);

        this.createInteractionPlane();


        this.createInteractionPlane();
    }

        // Cria um plano invisível que servirá de alvo para o rato
    createInteractionPlane() {
        const planeGeo = new THREE.PlaneGeometry(this.size, this.size);
        const planeMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisível!
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);

        planeMesh.position.copy(this.worldPosition);
        planeMesh.rotation.x = -Math.PI / 2;

        // --- MUITO IMPORTANTE ---
        // Adicionamos uma referência deste mesh para o objeto Chunk correspondente
        planeMesh.userData.chunk = this;

        this.sceneManager.add(planeMesh);
        // Registamos este plano no nosso gestor de interação
        this.interactionManager.registerTarget(planeMesh);
    }

    // Cria o conteúdo do chunk com base no seu tipo
    createContent() {
        if (this.type === 'trees') {
            // Se for um chunk de árvores, preenchemos com algumas árvores
            const treeCount = Math.floor(Math.random() * 5) + 8; // Entre 8 a 12 árvores
            for (let i = 0; i < treeCount; i++) {
                // Posição aleatória dentro dos limites do chunk
                const x = this.worldPosition.x + (Math.random() - 0.5) * this.size;
                const z = this.worldPosition.z + (Math.random() - 0.5) * this.size;
                
                const tree = createTree(new THREE.Vector3(x, 0, z));
                this.contentGroup.add(tree);

            }
        }
        // Se o tipo for 'free', não fazemos nada, fica um espaço aberto.
    }

clearContent() {
    console.log("[PASSO 10] Chunk: A executar clearContent.");
    console.log(`[PASSO 11 - CRÍTICO] Chunk: O 'contentGroup' tem ${this.contentGroup.children.length} filhos para remover.`);
    
    while (this.contentGroup.children.length > 0) {
        const child = this.contentGroup.children[0];
        console.log("[PASSO 12] Chunk: A remover filho (árvore):", child);
        
        if (child.userData.physicsBody) {
            console.log("[PASSO 13] Chunk: A remover corpo físico da árvore.");
            PhysicsManager.removeRigidBody(child.userData.physicsBody);
        }
        
        this.contentGroup.remove(child);
    }
    console.log("[PASSO 14] Chunk: Limpeza de conteúdo concluída.");
}

    
}