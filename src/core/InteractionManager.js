import * as THREE from 'three';

export class InteractionManager {
    constructor(camera, scene, domElement) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Alvos para o raycaster (os planos invisíveis dos chunks)
        this.interactionTargets = [];
        this.currentIntersect = null;

        // Criamos um único objeto de destaque que vamos mover pela cena
        this.highlightMesh = this.createHighlightMesh();
        this.scene.add(this.highlightMesh);

        // Adicionamos o "ouvinte" do evento de movimento do rato
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }
    
    // Função para um chunk se registar como um alvo clicável
    registerTarget(object) {
        this.interactionTargets.push(object);
    }
    
    // Cria o visual do destaque (bordas amarelas)
    createHighlightMesh() {
        const chunkSize = 15; // Deve ser o mesmo tamanho do chunk
        const plane = new THREE.PlaneGeometry(chunkSize, chunkSize);
        const edges = new THREE.EdgesGeometry(plane);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        const lineSegments = new THREE.LineSegments(edges, material);
        
        // Rodamos para que fique deitado no chão
        lineSegments.rotation.x = -Math.PI / 2;
        lineSegments.visible = false; // Começa invisível
        return lineSegments;
    }

    onMouseMove(event) {
        // Calcula a posição do rato em coordenadas normalizadas (-1 a +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    // Este método será chamado a cada frame no loop principal
    update() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactionTargets);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            // Usamos o userData para aceder ao nosso objeto Chunk
            const chunk = intersectedObject.userData.chunk;

            // Só mostramos o destaque se o chunk for selecionável
            if (chunk && chunk.isSelectable) {
                // Se estamos sobre um novo chunk selecionável
                if (this.currentIntersect !== intersectedObject) {
                    this.highlightMesh.position.copy(intersectedObject.position);
                    this.highlightMesh.visible = true;
                    this.currentIntersect = intersectedObject;
                }
            } else {
                // Se o chunk não for selecionável, esconde o destaque
                this.highlightMesh.visible = false;
                this.currentIntersect = null;
            }
        } else {
            // Se não estamos sobre nenhum chunk, esconde o destaque
            if (this.currentIntersect) {
                this.highlightMesh.visible = false;
                this.currentIntersect = null;
            }
        }
    }
}