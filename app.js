import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Get DOM elements
const usernameInput = document.getElementById('usernameInput');
const updateBtn = document.getElementById('updateBtn');
const loadingOverlay = document.getElementById('loading');
const canvas = document.getElementById('minecraft-canvas');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setClearColor(0x000000, 0); // Transparent background

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Load 3D model
const loader = new GLTFLoader();
let characterModel;

loader.load(
    './3D_display/basic_pop/basic_pop.glb',
    (gltf) => {
        characterModel = gltf.scene;
        scene.add(characterModel);
        animate();
    },
    undefined,
    (error) => {
        console.error('An error occurred loading the model:', error);
        alert("An error occurred while loading the 3D model. Please try again later.");
    }
);

// Camera and controls
camera.position.z = 2.5;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Function to update the skin
async function updateSkin(username) {
    if (!characterModel) return;

    loadingOverlay.style.opacity = '1';
    loadingOverlay.style.pointerEvents = 'auto';

    const skinUrl = `https://minotar.net/skin/${username}`;
    
    try {
        const texture = await new Promise((resolve, reject) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.crossOrigin = 'anonymous';
            textureLoader.load(
                skinUrl,
                (texture) => resolve(texture),
                undefined,
                (err) => reject(err)
            );
        });

        // Find the "skin" material on the model
        characterModel.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.map && child.material.map.name === 'skin.png') {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            }
        });
        
    } catch (error) {
        console.error("Failed to load skin:", error);
        alert("The skin for this user could not be loaded. Please check the username.");
    } finally {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.pointerEvents = 'none';
    }
}

// Event listeners
updateBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        updateSkin(username);
    } else {
        alert("Please enter a username.");
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateBtn.click();
    }
});

// Initial load with a default skin
updateSkin('MHF_Steve');

// Handle window resizing
window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});