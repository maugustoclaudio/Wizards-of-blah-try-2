import { Grid, AStarFinder } from 'pathfinding';

class PathfindingManager {
    constructor() {
        this.grid = null;
        this.finder = new AStarFinder({
            allowDiagonal: true, // Permite movimentos na diagonal
            dontCrossCorners: true, // Evita que "corte" quinas de obstáculos
        });
        this.scale = 1; // 1 unidade do mundo = 1 célula na grelha
    }

    // Inicializa a grelha com base no tamanho do mundo
    setup(width, height) {
        this.grid = new Grid(width, height);
        console.log(`Grelha de pathfinding criada com ${width}x${height} células.`);
    }

    // Converte uma posição do mundo 3D para coordenadas da grelha 2D
    worldToGrid(position) {
        const gridX = Math.floor(position.x + this.grid.width / 2);
        const gridY = Math.floor(position.z + this.grid.height / 2);
        return { x: gridX, y: gridY };
    }

    // Converte coordenadas da grelha 2D para uma posição no mundo 3D
    gridToWorld(gridPos) {
        const worldX = gridPos[0] - this.grid.width / 2 + 0.5;
        const worldZ = gridPos[1] - this.grid.height / 2 + 0.5;
        return { x: worldX, y: 0.5, z: worldZ }; // Y é a altura do personagem
    }

    // Marca uma área da grelha como não-caminhável (obstáculo)
    markObstacle(position, size) {
        const start = this.worldToGrid({
            x: position.x - size.x / 2,
            z: position.z - size.z / 2,
        });
        const end = this.worldToGrid({
            x: position.x + size.x / 2,
            z: position.z + size.z / 2,
        });

        for (let y = start.y; y < end.y; y++) {
            for (let x = start.x; x < end.x; x++) {
                if (x >= 0 && x < this.grid.width && y >= 0 && y < this.grid.height) {
                    this.grid.setWalkableAt(x, y, false);
                }
            }
        }
    }

    // Encontra um caminho entre dois pontos no mundo 3D
    findPath(startPos, endPos) {
        if (!this.grid) return null;

        const gridStart = this.worldToGrid(startPos);
        const gridEnd = this.worldToGrid(endPos);

        // Verificamos se o ponto de destino é caminhável
        if (!this.grid.isWalkableAt(gridEnd.x, gridEnd.y)) {
             console.log("Destino não é caminhável!");
             return null;
        }

        const gridClone = this.grid.clone(); // Clonamos para não modificar a original
        const path = this.finder.findPath(gridStart.x, gridStart.y, gridEnd.x, gridEnd.y, gridClone);
        
        // Se encontrou um caminho, converte os pontos da grelha para coordenadas do mundo
        return path ? path.map(p => this.gridToWorld(p)) : null;
    }

    // Encontra uma posição aleatória que seja caminhável
    getRandomWalkablePoint() {
        if (!this.grid) return null;
        let x, y;
        do {
            x = Math.floor(Math.random() * this.grid.width);
            y = Math.floor(Math.random() * this.grid.height);
        } while (!this.grid.isWalkableAt(x, y));
        
        return this.gridToWorld([x, y]);
    }


clearObstacle(position, size) {
    const start = this.worldToGrid({
        x: position.x - size.x / 2,
        z: position.z - size.z / 2,
    });
    const end = this.worldToGrid({
        x: position.x + size.x / 2,
        z: position.z + size.z / 2,
    });

    for (let y = start.y; y < end.y; y++) {
        for (let x = start.x; x < end.x; x++) {
            if (x >= 0 && x < this.grid.width && y >= 0 && y < this.grid.height) {
                this.grid.setWalkableAt(x, y, true); // True para tornar caminhável
            }
        }
    }
}
}

// Exportamos uma única instância (Singleton)
export default new PathfindingManager();