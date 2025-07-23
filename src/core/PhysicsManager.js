import RAPIER from '@dimforge/rapier3d-compat';

class PhysicsManager {
    constructor() {
        this.world = null;
    }

    // A inicialização da física é assíncrona
    async init() {
        await RAPIER.init();
        const gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(gravity);
        console.log("Mundo da física inicializado.");
    }

    // Avança a simulação da física um passo no tempo
    update() {
        if (this.world) {
            this.world.step();
        }
    }
    
    // Função auxiliar para criar corpos rígidos estáticos (chão, paredes)
    createStaticBody(position, size, rotation = { x: 0, y: 0, z: 0 }) {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
            .setTranslation(position.x, position.y, position.z)
            .setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: 1.0 });

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        this.world.createCollider(colliderDesc, rigidBody);

        return rigidBody;
    }
    
    // Função auxiliar para criar corpos rígidos dinâmicos (personagem)
    createDynamicBody(position, size) {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z)
            .setLinearDamping(0.5) // Adiciona um pouco de "atrito" para o movimento não ser infinito
            .setAngularDamping(0.5);

        const rigidBody = this.world.createRigidBody(rigidBodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        this.world.createCollider(colliderDesc, rigidBody);
        
        return rigidBody;
    }

    removeRigidBody(body) {
    this.world.removeRigidBody(body);
    }
}

export default new PhysicsManager(); // Exportamos uma única instância (Singleton)