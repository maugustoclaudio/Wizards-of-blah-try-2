import * as THREE from 'three';
import { Chunk } from '../world/Chunk.js';
import PhysicsManager from './PhysicsManager.js';
import PathfindingManager from './PathfindingManager.js';

export class WorldManager {
    constructor(sceneManager, interactionManager) {
        this.sceneManager = sceneManager;
        this.interactionManager = interactionManager;
        
        // Configurações do Mundo
        this.CHUNK_SIZE = 15;
        this.GRID_DIMENSIONS = 11; // 11x11 chunks
        this.WORLD_SIZE = this.CHUNK_SIZE * this.GRID_DIMENSIONS; // 55x55 unidades
        
        this.chunks = []; // Para guardar os nossos chunks
    }

    generate() {
        // 1. Criar o chão principal
        const groundSize = { x: this.WORLD_SIZE, y: 1, z: this.WORLD_SIZE };
        const groundPos = { x: 0, y: -0.5, z: 0 };
        const groundGeometry = new THREE.BoxGeometry(groundSize.x, groundSize.y, groundSize.z);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.position.set(groundPos.x, groundPos.y, groundPos.z);
        this.sceneManager.add(groundMesh);
        PhysicsManager.createStaticBody(groundPos, groundSize);

        // 2. Inicializar o PathfindingManager com o tamanho total do mundo
        PathfindingManager.setup(this.WORLD_SIZE, this.WORLD_SIZE);
        
        // 3. Gerar os Chunks
        const offset = -Math.floor(this.GRID_DIMENSIONS / 2); // Para centrar a grelha em (0,0)
        
        for (let gx = 0; gx < this.GRID_DIMENSIONS; gx++) {
            this.chunks[gx] = [];
            for (let gz = 0; gz < this.GRID_DIMENSIONS; gz++) {
                
                // Definir o tipo de chunk
                const chunkType = (gx === 10 && gz === 5) ? 'free' : 'trees';

                // Calcular a posição do centro do chunk no mundo
                const worldX = (gx + offset) * this.CHUNK_SIZE;
                const worldZ = (gz + offset) * this.CHUNK_SIZE;
                const worldPosition = new THREE.Vector3(worldX, 0, worldZ);
                
               if (chunkType === 'trees') {
                    PathfindingManager.markObstacle(worldPosition, { 
                        x: this.CHUNK_SIZE, 
                        z: this.CHUNK_SIZE 
                    });
                }

                const chunk = new Chunk(this.sceneManager, this.interactionManager, chunkType, worldPosition);
                chunk.createContent();
                this.chunks[gx][gz] = chunk;
            }
        }

        this.calculateSelectableChunks();
        console.log("Mundo gerado com uma grelha de " + this.GRID_DIMENSIONS + "x" + this.GRID_DIMENSIONS + " chunks.");
    }

        calculateSelectableChunks() {
        const freeChunks = [];
        // Primeiro, encontramos todos os chunks livres
        for (let gx = 0; gx < this.GRID_DIMENSIONS; gx++) {
            for (let gz = 0; gz < this.GRID_DIMENSIONS; gz++) {
                if (this.chunks[gx][gz].type === 'free') {
                    freeChunks.push({ x: gx, z: gz });
                }
            }
        }
        
            for (let gx = 0; gx < this.GRID_DIMENSIONS; gx++) {
            for (let gz = 0; gz < this.GRID_DIMENSIONS; gz++) {
                const chunk = this.chunks[gx][gz];
                if (chunk.type === 'free') continue; // Chunks livres não são selecionáveis

                for (const freeChunk of freeChunks) {
                    const distX = Math.abs(gx - freeChunk.x);
                    const distZ = Math.abs(gz - freeChunk.z);
                    // Se for um vizinho (distância máxima de 1 em X e Z)
                    if (distX <= 1 && distZ <= 1) {
                        chunk.isSelectable = true;
                        break; // Encontrámos um vizinho livre, já podemos parar de procurar
                    }
                }
            }
        }
    }


    // Função para obter a posição inicial do jogador
    getStartPosition() {
        const offset = -Math.floor(this.GRID_DIMENSIONS / 2);
        const startX = (10 + offset) * this.CHUNK_SIZE;
        const startZ = (5 + offset) * this.CHUNK_SIZE;
        return new THREE.Vector3(startX, 1, startZ);
    }

        getChunkCenter(gridX, gridZ) {
        const offset = -Math.floor(this.GRID_DIMENSIONS / 2);
        const worldX = (gridX + offset) * this.CHUNK_SIZE;
        const worldZ = (gridZ + offset) * this.CHUNK_SIZE;
        // Posição para o alvo da câmara (sem altura)
        return new THREE.Vector3(worldX, 0, worldZ);
    }
}