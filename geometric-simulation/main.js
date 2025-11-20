import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// Configuración de la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 4, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('canvas-container').appendChild(labelRenderer.domElement);

// Controles de cámara
const controls = new OrbitControls(camera, renderer.domElement); // Note: OrbitControls works with the top element, which might be labelRenderer now if it covers. 
// Actually CSS2DRenderer sits on top. We should pass labelRenderer.domElement to OrbitControls if we want it to capture events, 
// OR set pointerEvents: none on labelRenderer (which I did).
// If pointerEvents is none, events go through to canvas. So renderer.domElement is fine.
controls.enableDamping = true;

// Iluminación
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Luz suave
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// Grid para referencia
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
scene.add(gridHelper);

// Grupo principal que contendrá las figuras
let currentFigureGroup = new THREE.Group();
scene.add(currentFigureGroup);

// Variables para Modo Creatividad
let isCreativeMode = false;
const creativeGroup = new THREE.Group();
scene.add(creativeGroup);
let transformControl;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

// Materiales
const materialBase = new THREE.MeshStandardMaterial({ 
    color: 0x00ff88, 
    roughness: 0.2, 
    metalness: 0.1,
    side: THREE.DoubleSide
});
const materialCreative = new THREE.MeshStandardMaterial({ 
    color: 0x9b59b6, 
    roughness: 0.3, 
    metalness: 0.1
});
const materialEdges = new THREE.LineBasicMaterial({ color: 0xffffff });

// Estado de la simulación
let assemblyProgress = 0; // 0 a 1
let isAnimating = false;
let animationDirection = 1;

// Configuración de dimensiones por defecto
const dimensions = {
    cube: { side: 2 },
    pyramid: { side: 3 },
    cuboid: { width: 3, height: 1.5, depth: 2 },
    prism: { base: 2, length: 3 },
    cylinder: { radius: 1.5, height: 3 }
};

// Fórmulas
const formulas = {
    cube: `
        <div class="formula-box">V = L³</div>
        <div class="formula-sub">A = 6L²</div>
        <div class="formula-sub">P = 4L</div>
    `,
    pyramid: `
        <div class="formula-box">V = L³ / (6√2)</div>
        <div class="formula-sub">A = √3 L²</div>
        <div class="formula-sub">P = 3L</div>
    `,
    cuboid: `
        <div class="formula-box">V = W × H × D</div>
        <div class="formula-sub">A = 2(WH + WD + HD)</div>
        <div class="formula-sub">P = 2(W + D)</div>
    `,
    prism: `
        <div class="formula-box">V = A_base × L</div>
        <div class="formula-sub">A = 2(A_base) + 3(B × L)</div>
        <div class="formula-sub">P = 3B</div>
    `,
    cylinder: `
        <div class="formula-box">V = πr²h</div>
        <div class="formula-sub">A = 2πr(r + h)</div>
        <div class="formula-sub">P = 2πr</div>
    `
};

// --- Definición de Figuras ---

function createLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'label-annotation';
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.copy(position);
    return label;
}

function createPiece(geometry, finalPosition, finalRotation, startPosition, startRotation) {
    const mesh = new THREE.Mesh(geometry, materialBase);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Crear bordes para mejor visualización
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, materialEdges);
    mesh.add(line);

    // Guardar datos de transformación para la animación
    mesh.userData = {
        startPos: startPosition,
        endPos: finalPosition,
        startRot: startRotation,
        endRot: finalRotation
    };

    // Inicializar en posición inicial (desarmado)
    mesh.position.copy(startPosition);
    mesh.rotation.set(startRotation.x, startRotation.y, startRotation.z);

    return mesh;
}

function createCube(dims) {
    const group = new THREE.Group();
    const size = dims.side;
    const offset = size / 2;
    const explodeDist = 3;

    // Geometría de una cara
    const geometry = new THREE.PlaneGeometry(size, size);

    // Cara Frontal
    const front = createPiece(
        geometry,
        new THREE.Vector3(0, 0, offset),
        new THREE.Euler(0, 0, 0),
        new THREE.Vector3(0, 0, offset + explodeDist),
        new THREE.Euler(0, 0, Math.PI / 4)
    );
    // Attach label to Front Face
    front.add(createLabel(`L = ${size}`, new THREE.Vector3(0, -offset - 0.2, 0)));
    group.add(front);

    // Cara Trasera
    group.add(createPiece(
        geometry,
        new THREE.Vector3(0, 0, -offset),
        new THREE.Euler(0, Math.PI, 0),
        new THREE.Vector3(0, 0, -offset - explodeDist),
        new THREE.Euler(0, Math.PI, -Math.PI / 4)
    ));

    // Cara Derecha
    group.add(createPiece(
        geometry,
        new THREE.Vector3(offset, 0, 0),
        new THREE.Euler(0, Math.PI / 2, 0),
        new THREE.Vector3(offset + explodeDist, 0, 0),
        new THREE.Euler(0, Math.PI / 2, Math.PI / 4)
    ));

    // Cara Izquierda
    group.add(createPiece(
        geometry,
        new THREE.Vector3(-offset, 0, 0),
        new THREE.Euler(0, -Math.PI / 2, 0),
        new THREE.Vector3(-offset - explodeDist, 0, 0),
        new THREE.Euler(0, -Math.PI / 2, -Math.PI / 4)
    ));

    // Cara Superior
    group.add(createPiece(
        geometry,
        new THREE.Vector3(0, offset, 0),
        new THREE.Euler(-Math.PI / 2, 0, 0),
        new THREE.Vector3(0, offset + explodeDist, 0),
        new THREE.Euler(-Math.PI / 2, 0, Math.PI / 4)
    ));

    // Cara Inferior
    group.add(createPiece(
        geometry,
        new THREE.Vector3(0, -offset, 0),
        new THREE.Euler(Math.PI / 2, 0, 0),
        new THREE.Vector3(0, -offset - explodeDist, 0),
        new THREE.Euler(Math.PI / 2, 0, -Math.PI / 4)
    ));

    return group;
}

function createPyramid(dims) {
    const group = new THREE.Group();
    const side = dims.side; // Lado del triángulo equilátero
    const height = side * Math.sqrt(2/3); // Altura del tetraedro regular
    const explodeDist = 2.5;

    // Geometría de la cara (Triángulo Equilátero)
    // Centrado en (0,0)
    const hTri = side * Math.sqrt(3) / 2;
    const shape = new THREE.Shape();
    shape.moveTo(0, hTri * 2/3);
    shape.lineTo(-side/2, -hTri/3);
    shape.lineTo(side/2, -hTri/3);
    shape.lineTo(0, hTri * 2/3);
    const geometry = new THREE.ShapeGeometry(shape);

    // Distancia del centro a la cara en un tetraedro regular
    const centerToFace = side / (2 * Math.sqrt(6));
    
    // Cara Base
    const base = createPiece(
        geometry,
        new THREE.Vector3(0, -centerToFace, 0),
        new THREE.Euler(Math.PI/2, 0, 0), // Mirando abajo
        new THREE.Vector3(0, -centerToFace - explodeDist, 0),
        new THREE.Euler(Math.PI/2, 0, Math.PI)
    );
    // Attach label to Base
    base.add(createLabel(`L = ${side}`, new THREE.Vector3(0, -side/4, 0)));
    group.add(base);

    // Caras Laterales
    for (let i = 0; i < 3; i++) {
        const angle = i * (2 * Math.PI) / 3;
        
        // Normal vector calculation for the face
        const nx = Math.sin(angle) * Math.sqrt(8)/3;
        const nz = Math.cos(angle) * Math.sqrt(8)/3;
        const ny = 1/3;
        
        const finalPos = new THREE.Vector3(nx * centerToFace, ny * centerToFace, nz * centerToFace);
        const startPos = finalPos.clone().add(new THREE.Vector3(nx, ny, nz).multiplyScalar(explodeDist));

        // LookAt logic to orient the face
        const dummy = new THREE.Object3D();
        dummy.position.copy(finalPos);
        dummy.lookAt(finalPos.clone().add(new THREE.Vector3(nx, ny, nz)));
        const finalRot = dummy.rotation;
        
        const startRot = new THREE.Euler(
            finalRot.x + (Math.random()-0.5), 
            finalRot.y + (Math.random()-0.5), 
            finalRot.z + (Math.random()-0.5)
        );

        group.add(createPiece(geometry, finalPos, finalRot, startPos, startRot));
    }

    return group;
}

function createCuboid(dims) {
    const group = new THREE.Group();
    const width = dims.width;
    const height = dims.height;
    const depth = dims.depth;
    const explodeDist = 3;

    // Geometrías
    const frontBackGeo = new THREE.PlaneGeometry(width, height);
    const leftRightGeo = new THREE.PlaneGeometry(depth, height);
    const topBottomGeo = new THREE.PlaneGeometry(width, depth);

    // Front
    const front = createPiece(
        frontBackGeo,
        new THREE.Vector3(0, 0, depth/2),
        new THREE.Euler(0, 0, 0),
        new THREE.Vector3(0, 0, depth/2 + explodeDist),
        new THREE.Euler(0, 0, Math.PI/8)
    );
    front.add(createLabel(`W = ${width}`, new THREE.Vector3(0, -height/2 - 0.2, 0)));
    group.add(front);

    // Back
    group.add(createPiece(
        frontBackGeo,
        new THREE.Vector3(0, 0, -depth/2),
        new THREE.Euler(0, Math.PI, 0),
        new THREE.Vector3(0, 0, -depth/2 - explodeDist),
        new THREE.Euler(0, Math.PI, -Math.PI/8)
    ));

    // Right
    const right = createPiece(
        leftRightGeo,
        new THREE.Vector3(width/2, 0, 0),
        new THREE.Euler(0, Math.PI/2, 0),
        new THREE.Vector3(width/2 + explodeDist, 0, 0),
        new THREE.Euler(0, Math.PI/2, Math.PI/8)
    );
    right.add(createLabel(`H = ${height}`, new THREE.Vector3(0, 0, depth/2 + 0.2))); // Adjusted for rotated local space
    group.add(right);

    // Left
    group.add(createPiece(
        leftRightGeo,
        new THREE.Vector3(-width/2, 0, 0),
        new THREE.Euler(0, -Math.PI/2, 0),
        new THREE.Vector3(-width/2 - explodeDist, 0, 0),
        new THREE.Euler(0, -Math.PI/2, -Math.PI/8)
    ));

    // Top
    const top = createPiece(
        topBottomGeo,
        new THREE.Vector3(0, height/2, 0),
        new THREE.Euler(-Math.PI/2, 0, 0),
        new THREE.Vector3(0, height/2 + explodeDist, 0),
        new THREE.Euler(-Math.PI/2, 0, Math.PI/8)
    );
    top.add(createLabel(`D = ${depth}`, new THREE.Vector3(width/2 + 0.2, 0, 0)));
    group.add(top);

    // Bottom
    group.add(createPiece(
        topBottomGeo,
        new THREE.Vector3(0, -height/2, 0),
        new THREE.Euler(Math.PI/2, 0, 0),
        new THREE.Vector3(0, -height/2 - explodeDist, 0),
        new THREE.Euler(Math.PI/2, 0, -Math.PI/8)
    ));

    return group;
}

function createTriangularPrism(dims) {
    const group = new THREE.Group();
    const length = dims.length; 
    const side = dims.base; 
    const explodeDist = 2.5;

    // Altura del triángulo base
    const hTri = side * Math.sqrt(3) / 2;
    
    // Geometría Base (Triángulo)
    const shape = new THREE.Shape();
    shape.moveTo(0, hTri * 2/3);
    shape.lineTo(-side/2, -hTri/3);
    shape.lineTo(side/2, -hTri/3);
    shape.lineTo(0, hTri * 2/3);
    const triangleGeo = new THREE.ShapeGeometry(shape);

    // Geometría Lateral (Rectángulo)
    const sideGeo = new THREE.PlaneGeometry(side, length);

    // Tapa Frontal
    const front = createPiece(
        triangleGeo,
        new THREE.Vector3(0, 0, length/2),
        new THREE.Euler(0, 0, 0),
        new THREE.Vector3(0, 0, length/2 + explodeDist),
        new THREE.Euler(0, 0, Math.PI/4)
    );
    front.add(createLabel(`B = ${side}`, new THREE.Vector3(0, -side/2, 0)));
    group.add(front);

    // Tapa Trasera
    group.add(createPiece(
        triangleGeo,
        new THREE.Vector3(0, 0, -length/2),
        new THREE.Euler(0, Math.PI, 0), // Mirar atrás
        new THREE.Vector3(0, 0, -length/2 - explodeDist),
        new THREE.Euler(0, Math.PI, -Math.PI/4)
    ));

    // Caras Laterales
    // Lado 1: Base inferior
    const bottomSide = createPiece(
        sideGeo,
        new THREE.Vector3(0, -hTri/3, 0),
        new THREE.Euler(Math.PI/2, 0, 0),
        new THREE.Vector3(0, -hTri/3 - explodeDist, 0),
        new THREE.Euler(Math.PI/2, 0, 0)
    );
    bottomSide.add(createLabel(`L = ${length}`, new THREE.Vector3(side/2 + 0.5, 0, 0)));
    group.add(bottomSide);

    // Lado 2: Lado derecho
    const pRight = new THREE.Vector3(side/4, hTri/6, 0);
    const nRight = new THREE.Vector3(Math.sqrt(3)/2, 0.5, 0); 
    
    const dummyR = new THREE.Object3D();
    dummyR.position.copy(pRight);
    dummyR.lookAt(pRight.clone().add(nRight));
    dummyR.rotateZ(Math.PI / 2); 
    dummyR.rotateX(Math.PI / 2); 

    group.add(createPiece(
        sideGeo,
        pRight,
        dummyR.rotation,
        pRight.clone().add(nRight.multiplyScalar(explodeDist)),
        new THREE.Euler(0, 0, 0)
    ));

    // Lado Izquierdo
    const pLeft = new THREE.Vector3(-side/4, hTri/6, 0);
    const nLeft = new THREE.Vector3(-Math.sqrt(3)/2, 0.5, 0); 
    
    const dummyL = new THREE.Object3D();
    dummyL.position.copy(pLeft);
    dummyL.lookAt(pLeft.clone().add(nLeft));
    dummyL.rotateZ(Math.PI / 2); 
    dummyL.rotateX(Math.PI / 2); 

    group.add(createPiece(
        sideGeo,
        pLeft,
        dummyL.rotation,
        pLeft.clone().add(nLeft.multiplyScalar(explodeDist)),
        new THREE.Euler(0, 0, 0)
    ));

    return group;
}

function createCylinder(dims) {
    const group = new THREE.Group();
    const radius = dims.radius;
    const height = dims.height;
    const explodeDist = 2.5;

    // Top Cap
    const capGeo = new THREE.CircleGeometry(radius, 32);
    const top = createPiece(
        capGeo,
        new THREE.Vector3(0, height/2, 0),
        new THREE.Euler(-Math.PI/2, 0, 0),
        new THREE.Vector3(0, height/2 + explodeDist, 0),
        new THREE.Euler(-Math.PI/2, 0, Math.PI/4)
    );
    top.add(createLabel(`r = ${radius}`, new THREE.Vector3(radius/2, 0, 0)));
    group.add(top);

    // Bottom Cap
    group.add(createPiece(
        capGeo,
        new THREE.Vector3(0, -height/2, 0),
        new THREE.Euler(Math.PI/2, 0, 0),
        new THREE.Vector3(0, -height/2 - explodeDist, 0),
        new THREE.Euler(Math.PI/2, 0, -Math.PI/4)
    ));

    // Body Segments (4 quarters)
    const segmentGeo = new THREE.CylinderGeometry(radius, radius, height, 16, 1, true, 0, Math.PI/2);
    
    // Segment 1
    const seg1 = createPiece(
        segmentGeo,
        new THREE.Vector3(0, 0, 0),
        new THREE.Euler(0, 0, 0),
        new THREE.Vector3(explodeDist, 0, explodeDist),
        new THREE.Euler(0, 0, 0)
    );
    seg1.add(createLabel(`h = ${height}`, new THREE.Vector3(radius + 0.2, 0, 0)));
    group.add(seg1);

    // Segment 2
    group.add(createPiece(
        segmentGeo,
        new THREE.Vector3(0, 0, 0),
        new THREE.Euler(0, Math.PI/2, 0),
        new THREE.Vector3(explodeDist, 0, -explodeDist),
        new THREE.Euler(0, Math.PI/2, 0)
    ));

    // Segment 3
    group.add(createPiece(
        segmentGeo,
        new THREE.Vector3(0, 0, 0),
        new THREE.Euler(0, Math.PI, 0),
        new THREE.Vector3(-explodeDist, 0, -explodeDist),
        new THREE.Euler(0, Math.PI, 0)
    ));

    // Segment 4
    group.add(createPiece(
        segmentGeo,
        new THREE.Vector3(0, 0, 0),
        new THREE.Euler(0, -Math.PI/2, 0),
        new THREE.Vector3(-explodeDist, 0, explodeDist),
        new THREE.Euler(0, -Math.PI/2, 0)
    ));

    return group;
}

// --- Lógica de Actualización ---

function updateFigure(progress) {
    currentFigureGroup.children.forEach(child => {
        if (child.userData && child.userData.startPos) {
            // Interpolar posición
            child.position.lerpVectors(child.userData.startPos, child.userData.endPos, progress);
            
            // Interpolar rotación (usando cuaterniones para suavidad)
            const startQ = new THREE.Quaternion().setFromEuler(child.userData.startRot);
            const endQ = new THREE.Quaternion().setFromEuler(child.userData.endRot);
            child.quaternion.slerpQuaternions(startQ, endQ, progress);
        }
    });
}

function calculateStats(type) {
    let perimeter = 0;
    let area = 0;
    let volume = 0;
    let perimeterLabel = "Perímetro Base";
    const dims = dimensions[type];

    if (type === 'cube') {
        const s = dims.side;
        perimeter = 4 * s; 
        area = 6 * s * s;
        volume = Math.pow(s, 3);
    } else if (type === 'pyramid') {
        const s = dims.side;
        perimeter = 3 * s; 
        area = Math.sqrt(3) * s * s; 
        volume = Math.pow(s, 3) / (6 * Math.sqrt(2));
    } else if (type === 'cuboid') {
        const w = dims.width, h = dims.height, d = dims.depth;
        perimeter = 2 * (w + d); 
        area = 2 * (w*h + w*d + h*d);
        volume = w * h * d;
    } else if (type === 'prism') {
        const b = dims.base, l = dims.length;
        perimeter = 3 * b; 
        area = 2 * (Math.sqrt(3)/4 * b*b) + 3 * (b * l);
        volume = (Math.sqrt(3)/4 * b*b) * l;
    } else if (type === 'cylinder') {
        const r = dims.radius, h = dims.height;
        perimeter = 2 * Math.PI * r;
        area = 2 * Math.PI * r * (r + h);
        volume = Math.PI * r * r * h;
    }

    return {
        perimeter: perimeter.toFixed(2),
        area: area.toFixed(2),
        volume: volume.toFixed(2),
        perimeterLabel: perimeterLabel
    };
}

function updateStats(type) {
    const stats = calculateStats(type);
    document.getElementById('stat-perimeter').textContent = stats.perimeter;
    document.getElementById('stat-area').textContent = stats.area;
    document.getElementById('stat-volume').textContent = stats.volume;
    
    // Update formulas
    const formulaContainer = document.getElementById('formula-content');
    formulaContainer.innerHTML = formulas[type];
}

function updateInputs(type) {
    const container = document.getElementById('dimensions-container');
    container.innerHTML = '';
    
    const dims = dimensions[type];
    for (const [key, value] of Object.entries(dims)) {
        const group = document.createElement('div');
        group.className = 'input-group';
        
        const label = document.createElement('label');
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ':';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.step = '0.1';
        input.addEventListener('change', (e) => {
            dimensions[type][key] = parseFloat(e.target.value);
            switchFigure(type); // Recreate figure with new dims
        });
        
        group.appendChild(label);
        group.appendChild(input);
        container.appendChild(group);
    }
}

function clearLabels() {
    // Remove all CSS2DObjects from the DOM manually to ensure cache is cleared
    const labels = document.querySelectorAll('.label-annotation');
    labels.forEach(l => {
        if (l.parentNode) {
            l.parentNode.removeChild(l);
        }
    });
}

function switchFigure(type) {
    clearLabels(); // Force clear DOM elements
    scene.remove(currentFigureGroup);
    const dims = dimensions[type];
    
    if (type === 'cube') {
        currentFigureGroup = createCube(dims);
    } else if (type === 'pyramid') {
        currentFigureGroup = createPyramid(dims);
    } else if (type === 'cuboid') {
        currentFigureGroup = createCuboid(dims);
    } else if (type === 'prism') {
        currentFigureGroup = createTriangularPrism(dims);
    } else if (type === 'cylinder') {
        currentFigureGroup = createCylinder(dims);
    }
    
    scene.add(currentFigureGroup);
    updateFigure(assemblyProgress);
    updateStats(type);
}

// --- Modo Creatividad ---

function initCreativeMode() {
    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
    });
    scene.add(transformControl);

    window.addEventListener('keydown', function (event) {
        if (!isCreativeMode) return;
        switch (event.key) {
            case 't':
                transformControl.setMode('translate');
                break;
            case 'r':
                transformControl.setMode('rotate');
                break;
        }
    });

    renderer.domElement.addEventListener('click', onMouseClick, false);
}

function onMouseClick(event) {
    if (!isCreativeMode) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(creativeGroup.children);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        transformControl.attach(selectedObject);
    } else {
        transformControl.detach();
        selectedObject = null;
    }
}

window.addCreativeFigure = function(type) {
    let geometry, mesh;
    if (type === 'cube') {
        geometry = new THREE.BoxGeometry(2, 2, 2);
    } else if (type === 'pyramid') {
        geometry = new THREE.ConeGeometry(1.5, 2, 4);
    } else if (type === 'cuboid') {
        geometry = new THREE.BoxGeometry(3, 1.5, 2);
    } else if (type === 'cylinder') {
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
    } else if (type === 'prism') {
        geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 3);
    }

    mesh = new THREE.Mesh(geometry, materialCreative);
    mesh.position.set((Math.random()-0.5)*5, 0, (Math.random()-0.5)*5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add edges
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, materialEdges);
    mesh.add(line);

    creativeGroup.add(mesh);
};

// --- Generadores Automáticos ---

function createWindowTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base wall
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 64, 64);
    
    // Windows
    ctx.fillStyle = '#dfe6e9'; // Light blue-ish white
    // Draw 2x2 windows
    ctx.fillRect(8, 8, 20, 20);
    ctx.fillRect(36, 8, 20, 20);
    ctx.fillRect(8, 36, 20, 20);
    ctx.fillRect(36, 36, 20, 20);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter; // Pixelated look
    return tex;
}

function createCreativeMesh(geometry, material, x, y, z, rotX=0, rotY=0, rotZ=0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, materialEdges);
    mesh.add(line);

    creativeGroup.add(mesh);
    return mesh;
}

window.generateHouse = function(x = 0, z = 0) {
    // Base
    const baseGeo = new THREE.BoxGeometry(4, 3, 4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.7 }); // Orange/Brick
    createCreativeMesh(baseGeo, baseMat, x, 1.5, z);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.2, 2, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 }); // Dark brown
    createCreativeMesh(doorGeo, doorMat, x, 1, z + 2);

    // Techo (Prisma)
    const roofGeo = new THREE.CylinderGeometry(0, 3.5, 3, 4, 1); // Pirámide base cuadrada rotada
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 }); // Red roof
    createCreativeMesh(roofGeo, roofMat, x, 4.5, z, 0, Math.PI/4, 0);
};

window.generateBuilding = function(x = 0, z = 0) {
    const tiers = Math.floor(Math.random() * 3) + 1;
    let currentY = 0;
    let width = 4 + Math.random() * 2;
    let depth = 4 + Math.random() * 2;
    
    const color = Math.random() > 0.5 ? '#3498db' : '#95a5a6'; // Blue or Grey
    const mat = new THREE.MeshStandardMaterial({ 
        map: createWindowTexture(color),
        roughness: 0.3
    });

    for(let i=0; i<tiers; i++) {
        const height = 5 + Math.random() * 5;
        const geo = new THREE.BoxGeometry(width, height, depth);
        createCreativeMesh(geo, mat, x, currentY + height/2, z);
        
        currentY += height;
        width *= 0.7; // Shrink for next tier
        depth *= 0.7;
    }
};

window.generateCity = function() {
    // Limpiar escena primero
    while(creativeGroup.children.length > 0){ 
        creativeGroup.remove(creativeGroup.children[0]); 
    }
    selectedObject = null;
    transformControl.detach();

    const gridSize = 60;
    const step = 10;

    // Ground Plane (Roads)
    const groundGeo = new THREE.PlaneGeometry(gridSize * 2.5, gridSize * 2.5);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 }); // Dark asphalt
    createCreativeMesh(groundGeo, groundMat, 0, -0.1, 0, -Math.PI/2, 0, 0);

    for (let x = -gridSize; x <= gridSize; x += step) {
        for (let z = -gridSize; z <= gridSize; z += step) {
            // Probabilidad de generar algo
            const rand = Math.random();
            
            if (rand > 0.6) {
                // 40% chance de edificio
                window.generateBuilding(x, z);
            } else if (rand > 0.3) {
                // 30% chance de casa
                window.generateHouse(x, z);
            }
            // 30% espacio vacío (calles/parques)
        }
    }
};

document.getElementById('delete-selected-btn').addEventListener('click', () => {
    if (selectedObject) {
        transformControl.detach();
        creativeGroup.remove(selectedObject);
        selectedObject = null;
    }
});

document.getElementById('clear-scene-btn').addEventListener('click', () => {
    transformControl.detach();
    while(creativeGroup.children.length > 0){ 
        creativeGroup.remove(creativeGroup.children[0]); 
    }
    selectedObject = null;
});

// --- Event Listeners ---

const slider = document.getElementById('assembly-slider');
const select = document.getElementById('figure-select');
const animateBtn = document.getElementById('animate-btn');
const modeBtn = document.getElementById('mode-toggle-btn');
const backSimBtn = document.getElementById('back-sim-btn');
const creativePanel = document.getElementById('creative-controls');
const infoPanel = document.getElementById('info');

function toggleMode() {
    isCreativeMode = !isCreativeMode;
    
    if (isCreativeMode) {
        // Enter Creative Mode
        infoPanel.style.display = 'none';
        creativePanel.style.display = 'block';
        scene.remove(currentFigureGroup);
        clearLabels();
        if (!transformControl) initCreativeMode();
        scene.add(transformControl);
        scene.add(creativeGroup);
    } else {
        // Enter Simulation Mode
        infoPanel.style.display = 'block';
        creativePanel.style.display = 'none';
        scene.remove(creativeGroup);
        if (transformControl) transformControl.detach();
        scene.remove(transformControl);
        
        // Restore simulation state
        const type = select.value;
        switchFigure(type);
    }
}

modeBtn.addEventListener('click', toggleMode);
backSimBtn.addEventListener('click', toggleMode);

slider.addEventListener('input', (e) => {
    assemblyProgress = parseFloat(e.target.value);
    updateFigure(assemblyProgress);
    isAnimating = false; // Detener animación automática si el usuario interactúa
});

select.addEventListener('change', (e) => {
    const type = e.target.value;
    updateInputs(type);
    switchFigure(type);
});

animateBtn.addEventListener('click', () => {
    isAnimating = true;
    // Si ya está completo, reiniciar para animar desde 0
    if (assemblyProgress >= 1) {
        assemblyProgress = 0;
        slider.value = 0;
    }
});

// --- Loop Principal ---

function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        assemblyProgress += 0.01 * animationDirection;
        
        if (assemblyProgress >= 1) {
            assemblyProgress = 1;
            isAnimating = false;
        }
        
        slider.value = assemblyProgress;
        updateFigure(assemblyProgress);
    }

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Inicialización
updateInputs('cube');
switchFigure('cube');
animate();

// Manejo de redimensionamiento
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
