import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ========== CONFIGURATION ==========
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

// ========== DOM CACHE ==========
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
  autoSaveStatus: document.getElementById('autoSaveStatus'
