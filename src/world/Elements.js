import * as THREE from 'three';
import PhysicsManager from '../core/PhysicsManager';
import PathfindingManager from '../core/PathfindingManager';

// Função para criar uma árvore com corpo físico e obstáculo de pathfinding
export function createTree(position) {
    const treeGroup = new THREE.Group();
    treeGroup.position.copy(position);

    // Tronco (Cilindro)
    const trunkHeight = 2.5;
    const trunkRadius = 0.25;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Cor de madeira
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.y = trunkHeight / 2;
    treeGroup.add(trunkMesh);
    
    // Folhagem (Cone)
    const leavesHeight = 3;
    const leavesRadius = 1.5;
    const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 }); // Verde floresta
    const leavesMesh = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leavesMesh.position.y = trunkHeight + leavesHeight / 2 - 0.5; // Um pouco sobreposto ao tronco
    treeGroup.add(leavesMesh);

    // Obstáculo para a física e pathfinding
    // Usamos um cubo invisível na base da árvore
    const obstacleSize = { x: trunkRadius * 2, y: trunkHeight, z: trunkRadius * 2 };
    PhysicsManager.createStaticBody(position, obstacleSize);
    PathfindingManager.markObstacle(position, {x: 1, z: 1}); // Marcamos uma célula 1x1 como obstáculo

    return treeGroup;
}