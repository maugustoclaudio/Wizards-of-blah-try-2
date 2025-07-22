import * as THREE from 'three';
import { createTree } from './Elements.js';

export class Chunk {
    constructor(sceneManager, type, worldPosition) {
        this.sceneManager = sceneManager;
        this.type = type;
        this.worldPosition = worldPosition; // O centro do chunk
        this.size = 15; // Tamanho do chunk (15x15)
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
                this.sceneManager.add(tree);
            }
        }
        // Se o tipo for 'free', não fazemos nada, fica um espaço aberto.
    }
}