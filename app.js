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
// État global
let loadedSkin = null;
let loadedBox = null;
let loadedModelMeta = null;

// Animation render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize dynamique
window.addEventListener('resize', () => {
  const w = Math.max(320, viewer.clientWidth);
  const h = Math.max(240, viewer.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// Helper: affichage de status
function setStatus(text, type = "") {
  DOM.status.textContent = text;
  DOM.status.className = "status-box" + (type ? " " + type : "");
}

// Helper: chargement et affichage du modèle 3D
function loadModel3D(meta) {
  setStatus("Chargement du modèle 3D…");
  loader.load(
    `3D_display/${meta.id}/${meta.file}`,
    gltf => {
      // Efface l'ancien modèle
      while (modelGroup.children.length)
        modelGroup.remove(modelGroup.children[0]);
      // Ajoute le nouveau
      modelGroup.add(gltf.scene);
      loadedModelMeta = meta;
      setStatus("Modèle 3D prêt !");
    },
    xhr => {},
    err => {
      setStatus("Erreur de chargement du modèle 3D !", "error");
    }
  );
}
// Chargement du catalogue de modèles 3D
async function fetchModelIndex() {
  setStatus("Chargement de la liste des modèles 3D…");
  let models = [];
  try {
    const resp = await fetch("3D_display/index.json");
    if (!resp.ok) throw new Error("index.json introuvable");
    models = await resp.json();
  } catch (err) {
    setStatus("Échec du chargement de la liste des modèles !", "error");
    return [];
  }
  setStatus("Liste des modèles chargée.");
  return models;
}

// Rafraîchir le dropdown et charger le modèle sélectionné
async function refreshModelDropdown(selectDefault = true) {
  const models = await fetchModelIndex();
  DOM.modelSelect.innerHTML = "";
  if (!models || !models.length) {
    DOM.modelSelect.innerHTML = "<option>Aucun modèle !</option>";
    return;
  }
  for (const entry of models) {
    const opt = document.createElement('option');
    opt.value = entry.id;
    opt.textContent = entry.name;
    DOM.modelSelect.appendChild(opt);
  }
  if (selectDefault) DOM.modelSelect.selectedIndex = 0;
  loadModel3D(models[DOM.modelSelect.selectedIndex]);
}

// Interactions dropdown modèle
DOM.reloadModel.addEventListener('click', () => {
  refreshModelDropdown(false);
});
DOM.refreshIndex.addEventListener('click', () => {
  refreshModelDropdown(true);
});
DOM.modelSelect.addEventListener('change', async e => {
  const models = await fetchModelIndex();
  const idx = DOM.modelSelect.selectedIndex;
  loadModel3D(models[idx]);
});
// Chargement de la galerie de boîtes couleurs
async function fetchBoxGallery() {
  let boxes = [];
  try {
    const resp = await fetch('box_color/index.json');
    if (!resp.ok) throw new Error("index.json introuvable");
    boxes = await resp.json();
  } catch (e) {
    DOM.boxGalleryStatus.textContent = "Erreur de chargement de la galerie.";
    return [];
  }
  DOM.boxGalleryStatus.textContent = "";
  return boxes;
}

async function refreshBoxGallery() {
  const boxes = await fetchBoxGallery();
  DOM.boxGallery.innerHTML = '';
  if (!boxes.length) {
    DOM.boxGallery.innerHTML = "<div>Aucune boîte disponible</div>";
    return;
  }
  boxes.forEach(name => {
    const tile = document.createElement('div');
    tile.className = 'box-tile';
    tile.title = name;
    const img = document.createElement('img');
    img.src = `box_color/${name}`;
    img.alt = name;
    tile.appendChild(img);
    tile.addEventListener('click', () => {
      document.querySelectorAll('.box-tile.selected').forEach(e => e.classList.remove('selected'));
      tile.classList.add('selected');
      loadedBox = name;
      setStatus("Boîte sélectionnée : " + name);
    });
    DOM.boxGallery.appendChild(tile);
  });
}

// Upload box custom
DOM.boxUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const tile = document.createElement('div');
    tile.className = 'box-tile selected';
    const img = document.createElement('img');
    img.src = ev.target.result;
    img.alt = 'box custom';
    tile.appendChild(img);
    DOM.boxGallery.prepend(tile);
    document.querySelectorAll('.box-tile.selected').forEach(e => e.classList.remove('selected'));
    tile.classList.add('selected');
    loadedBox = ev.target.result;
  };
  reader.readAsDataURL(file);
});
// Chargement des items Minecraft
async function fetchItemsList() {
  let items = [];
  try {
    const resp = await fetch('all_items/index.json');
    if (!resp.ok) throw new Error("index.json introuvable");
    items = await resp.json();
  } catch (e) {
    return [];
  }
  return items;
}

// Rafraîchir dropdown item + preview
async function refreshItemDropdown(selectDefault = true) {
  const items = await fetchItemsList();
  DOM.itemTarget.innerHTML = "";
  if (!items || !items.length) {
    DOM.itemTarget.innerHTML = "<option>Aucun item !</option>";
    return;
  }
  for (const entry of items) {
    const opt = document.createElement('option');
    opt.value = entry;
    opt.textContent = entry;
    DOM.itemTarget.appendChild(opt);
  }
  if (selectDefault) DOM.itemTarget.selectedIndex = 0;
  updateItemPreview(items[DOM.itemTarget.selectedIndex]);
}

function updateItemPreview(item) {
  const url = `${CONFIG.ITEM_TEXTURES_CDN}${item}.png`;
  DOM.itemPreviewImg.src = url;
  DOM.itemPreviewImg.alt = item;
  DOM.itemPreviewImg.style.display = 'block';
  DOM.itemPreviewPlaceholder.style.display = 'none';
}

// Dropdown change event
DOM.itemTarget.addEventListener('change', e => {
  updateItemPreview(e.target.value);
});

// Initial refresh items
refreshItemDropdown();

// SKIN MINECRAFT
DOM.fetchSkin.addEventListener('click', async () => {
  const username = DOM.username.value.trim();
  if (!username) {
    setStatus("Veuillez entrer un pseudo Minecraft.", "error");
    return;
  }
  setStatus("Recherche du skin Minecraft
// Nom custom et POP génération (exemple)
DOM.genPack.addEventListener('click', () => {
  setStatus("⚡ Génération du pack…");
  // (logique de génération ZIP en vrai app)
  setTimeout(() => setStatus("Pack généré ! Téléchargement prêt.", "success"), 1200);
});

// Preview pack
DOM.previewPack.addEventListener('click', () => {
  setStatus("Aperçu du pack (dummy)");
});

// Modal info
DOM.infoBtn.addEventListener('click', () => {
  DOM.infoModal.hidden = false;
});
DOM.infoModal.querySelector('.modal-close').addEventListener('click', () => {
  DOM.infoModal.hidden = true;
});

DOM.themToggle.addEventListener('click', () => {
  const cur = document.body.getAttribute('data-theme');
  document.body.setAttribute('data-theme', cur === "dark" ? "light" : "dark");
});

// Initialisation générale
window.addEventListener('DOMContentLoaded', () => {
  // Par défaut, mode sombre
  document.body.setAttribute('data-theme', 'dark');
  refreshModelDropdown();
  refreshBoxGallery();
  refreshItemDropdown();
  setStatus("Chargement terminé. Prêt !");
});

// Auto-save dummy local
DOM.autoSaveStatus.textContent = "💾 Auto-sauvegarde locale (désactivé démo)";
