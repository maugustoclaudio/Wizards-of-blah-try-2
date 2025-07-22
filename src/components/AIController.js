import * as THREE from 'three';
import PathfindingManager from '../core/PathfindingManager';

const AI_STATE = {
    IDLE: 'idle',
    TURNING: 'turning',
    FOLLOWING_PATH: 'following_path',
};

export class AIController {
    constructor(character) {
        this.character = character;
        
        // Configurações
        this.rotationSpeed = 4;
        this.moveSpeed = 3; // Velocidade de movimento
        this.idleTime = 3; // Tempo médio de espera
        
        // Controlo de estado e pathfinding
        this.state = AI_STATE.IDLE;
        this.timer = this.idleTime;
        this.path = null;
        this.currentPathIndex = 0;
    }
    
    decideNextAction() {
        const choice = Math.random();

        // 50% de chance de mover
        if (choice < 0.5) { 
            const destination = PathfindingManager.getRandomWalkablePoint();
            if (destination) {
                const start = this.character.rigidBody.translation();
                this.path = PathfindingManager.findPath(start, destination);
                if (this.path && this.path.length > 1) {
                    this.currentPathIndex = 1; // Começamos no segundo ponto, pois o primeiro é a nossa posição atual
                    this.state = AI_STATE.FOLLOWING_PATH;
                    return;
                }
            }
        } 
        // 25% de chance de virar
        else if (choice < 0.75) { 
            // A lógica de "apenas virar" pode ser adicionada aqui se desejado.
            // Por agora, vamos simplificar e juntar com "não fazer nada".
        }
        
        // 25% (+25%) de chance de não fazer nada
        this.state = AI_STATE.IDLE;
        this.timer = this.idleTime * (0.5 + Math.random()); // Reseta o tempo de espera
    }

    update(deltaTime) {
        switch (this.state) {
            case AI_STATE.IDLE:
                this.character.stopMovement();
                this.timer -= deltaTime;
                if (this.timer <= 0) {
                    this.decideNextAction();
                }
                break;

            case AI_STATE.FOLLOWING_PATH:
                if (!this.path || this.currentPathIndex >= this.path.length) {
                    this.state = AI_STATE.IDLE; // Caminho terminou
                    this.timer = this.idleTime * (0.5 + Math.random());
                    break;
                }

                const targetPoint = this.path[this.currentPathIndex];
                const targetDirection = new THREE.Vector3(
                    targetPoint.x - this.character.mesh.position.x,
                    0,
                    targetPoint.z - this.character.mesh.position.z
                ).normalize();

                // Virar e mover ao mesmo tempo
                this.character.rotateTowards(targetDirection, this.rotationSpeed, deltaTime);
                this.character.moveTo(targetPoint, this.moveSpeed);

                // Verificar se chegámos perto do ponto alvo
                const distanceToTarget = this.character.mesh.position.distanceTo(
                    new THREE.Vector3(targetPoint.x, this.character.mesh.position.y, targetPoint.z)
                );
                
                if (distanceToTarget < 0.5) {
                    this.currentPathIndex++; // Avança para o próximo ponto do caminho
                }
                break;
        }
    }
}