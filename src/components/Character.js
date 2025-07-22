import * as THREE from 'three';
import PhysicsManager from '../core/PhysicsManager'; // <-- LINHA ADICIONADA DE VOLTA

export class Character {
    
    constructor(sceneManager, initialPosition = new THREE.Vector3(0, 1, 0)) {
        this.sceneManager = sceneManager;
        
        const size = { x: 1, y: 1, z: 1 };
        // Usamos a posição inicial fornecida
        const position = initialPosition; 

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshStandardMaterial({ color: 0xff5722 })
        );
        this.mesh.position.copy(position);
        this.sceneManager.add(this.mesh);

        this.rigidBody = PhysicsManager.createDynamicBody(position, size);
    }

    rotateTowards(direction, rotationSpeed, deltaTime) {
        const targetDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), targetDirection);
        this.mesh.quaternion.slerp(targetQuaternion, rotationSpeed * deltaTime);
        this.rigidBody.setRotation(this.mesh.quaternion, true);
        const angle = this.mesh.quaternion.angleTo(targetQuaternion);
        return angle < 0.05;
    }

    moveTo(targetPoint, speed) {
        const currentPosition = this.rigidBody.translation();
        const direction = new THREE.Vector3(
            targetPoint.x - currentPosition.x,
            0,
            targetPoint.z - currentPosition.z
        ).normalize();
        
        const velocity = {
            x: direction.x * speed,
            y: this.rigidBody.linvel().y,
            z: direction.z * speed
        };
        this.rigidBody.setLinvel(velocity, true);
    }
    
    stopMovement() {
        // Agora this.rigidBody existe e esta linha funcionará
        this.rigidBody.setLinvel({ x: 0, y: this.rigidBody.linvel().y, z: 0 }, true);
    }

    update() {
        const position = this.rigidBody.translation();
        this.mesh.position.copy(position);
        this.rigidBody.setRotation(this.mesh.quaternion, true);
    }
}