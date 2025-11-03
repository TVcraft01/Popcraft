import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuration globale
const CONFIG = {
  API: {
    MOJANG_USERNAME: 'https://api.mojang.com/users/profiles/minecraft/',
    MOJANG_PROFILE: 'https://sessionserver.mojang.com/session/minecraft/profile/',
    ASHCON: 'https://api.ashcon.app/mojang/v2/user/',
    MINOTAR_SKIN: 'https://minotar.net/skin/',
    MINOTAR_FACE: 'https://minotar.net/avatar/',
  },
  ITEM_TEXTURES_CDN: 'https://cdn.jsdelivr.net/gh/PixelOutlaw/minecraft-textures@master/items/',
  TIMEOUT: 8000,
};

// Sélection DOM
const DOM = {
  status: document.getElementById('status'),
  modelSelect: document.getElementById('modelSelect'),
  reloadModel: document.getElementById('reloadModel'),
  refreshIndex: document.getElementById('refreshIndex'),
  username: document.getElementById('username'),
  fetchSkin: document.getElementById('fetchSkin'),
  fileInput: document.getElementById('fileInput'),
  fileName: document.getElementById('fileName'),
  boxUpload: document.getElementById('boxUpload'),
  boxGallery: document.getElementById('boxGallery'),
  boxGalleryStatus: document.getElementById('boxGalleryStatus'),
  previewBox: document.getElementById('previewBox'),
  itemTarget: document.getElementById('itemTarget'),
  itemPreviewImg: document.getElementById('itemPreviewImg'),
  itemPreviewPlaceholder: document.getElementById('itemPreviewPlaceholder'),
  popName: document.getElementById('popName'),
  importPack: document.getElementById('importPack'),
  packInput: document.getElementById('packInput'),
  genPack: document.getElementById('genPack'),
  previewPack: document.getElementById('previewPack'),
  themToggle: document.getElementById('themToggle'),
  infoBtn: document.getElementById('infoBtn'),
  infoModal: document.getElementById('infoModal'),
  autoSaveStatus: document.getElementById('autoSaveStatus'),
  viewerCanvas: document.getElementById('viewerCanvas'),
};
// ========== THREE.JS SETUP ==========
const viewer = document.getElementById('viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
const startW = Math.max(320, viewer.clientWidth);
const startH = Math.max(240, viewer.clientHeight);
renderer.setSize(startW, startH);
DOM.viewerCanvas.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1d20);
const camera = new THREE.PerspectiveCamera(45, startW / startH, 0.1, 1000);
camera.position.set(0, 1.5, 4);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
scene.add(new THREE.HemisphereLight(0xbfd7ff, 0x0a0a0a, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(3, 5, 5);
scene.add(dir);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 4;

const loader = new GLTFLoader();
let modelGroup = new THREE.Group();
scene.add(modelGroup);
