// DOM Elements
const usernameInput = document.getElementById('username');
const form = document.getElementById('skinForm');
const statusMessage = document.getElementById('statusMessage');
const skinPreview = document.getElementById('skinPreview');
const usernameDisplay = document.getElementById('usernameDisplay');
const importBtn = document.getElementById('importBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Configuration
const DEFAULT_SKIN = 'https://minotar.net/skin/steve.png'; // Fixed: Use /skin/ endpoint
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const CORS_PROXY_FALLBACK = 'https://corsproxy.io/?url='; // Backup proxy
const MINECRAFT_USERNAME_API = 'https://api.mojang.com/users/profiles/minecraft/';
const MINECRAFT_PROFILE_API = 'https://sessionserver.mojang.com/session/minecraft/profile/';
const SKIN_BASE_URL = 'https://minotar.net/skin/'; // Raw skin filesconst FACE_BASE_URL = 'https://minotar.net/avatar/';

let skinViewer = null;
let currentUsername = null;
let currentSkinData = null;

// Initialize the 3D skin viewer
async function initSkinViewer(skinUrl = DEFAULT_SKIN) {
    try {
        showLoading();
        if (skinViewer) {
            skinViewer.dispose();
            skinViewer = null;
        }

        if (!window.skinview3d) throw new Error('3D library not loaded');

        skinViewer = new skinview3d.SkinViewer({
            canvas: skinPreview,
            width: skinPreview.offsetWidth,
            height: skinPreview.offsetHeight,
            skinUrl: skinUrl, // Fixed: Use skinUrl
            cache: true,
        });

        skinViewer.camera.position.set(20, -10, 40);
        skinViewer.camera.lookAt(0, 0, 0);

        // Add rotation controls
        new skinview3d.HammerControls(skinViewer, { radius: 60 });

        function resize() {
            skinViewer.width = skinPreview.offsetWidth;
            skinViewer.height = skinPreview.offsetHeight;
            skinViewer.resize();
        }
        window.addEventListener('resize', resize);

        // Tab visibility
        document.addEventListener('visibilitychange', () => {
            skinViewer.renderPaused = document.visibilityState === 'hidden';
        });

        // Load cape if specified
        const params = new URLSearchParams(window.location.search);
        if (params.get('cape')) {
            skinViewer.loadCape(decodeURIComponent(params.get('cape')));
        }

        return skinViewer;
    } catch (error) {
        console.error('3D Viewer Error:', error);
        showStatus('Failed to load 3D preview. Showing static image.', 'error');
        displayFallbackImage(skinUrl);
        return null;
    }
}

// Show loading state
function showLoading() {
    skinPreview.innerHTML = '<div class="spinner">Loading skin...</div>';
    skinPreview.style.background = '#f1f5f9';
}

// Display fallback image
function displayFallbackImage(skinUrl) {
    const img = document.createElement('img');
    img.src = skinUrl;
    img.alt = 'Minecraft skin';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain'; // Fixed typo
    img.style.backgroundColor = '#f1f5f9';
    skinPreview.innerHTML = '';
    skinPreview.appendChild(img);
}

// Fetch player profile (with fallback proxies)
async function getPlayerProfile(username) {
    try {
        showStatus('Looking up player...', 'info');

        // 1. Get UUID        const usernameUrl = MINECRAFT_USERNAME_API + username;
        let response = await fetchWithFallback(CORS_PROXY, CORS_PROXY_FALLBACK, usernameUrl);
        if (!response.ok || !response.id) {
            throw new Error('Player not found');
        }
        const uuid = response.id; // Fixed: Define uuid here

        // 2. Get skin data
        const profileUrl = MINECRAFT_PROFILE_API + uuid;
        response = await fetchWithFallback(CORS_PROXY, CORS_PROXY_FALLBACK, profileUrl);
        if (!response.ok) throw new Error('Failed to load skin');

        const profileResult = await response.json();
        const skinData = JSON.parse(window.atob(profileResult.properties[0].value));
        const skinUrl = skinData.textures.SKIN ? skinData.textures.SKIN.url : `${SKIN_BASE_URL}${username}.png`;

        return { username, skinUrl, uuid };
    } catch (error) {
        console.error('Skin API Error:', error);
        showStatus(error.message || 'Failed to load skin', 'error');
        return null;
    }
}

// Fetch with backup proxy
async function fetchWithFallback(primaryProxy, fallbackProxy, url) {
    let response = await fetch(primaryProxy + encodeURIComponent(url));
    if (!response.ok && fallbackProxy) {
        response = await fetch(fallbackProxy + encodeURIComponent(url));
    }
    return await response.json();
}

// Load skin by username
async function loadSkin(username) {
    currentUsername = username;
    currentSkinData = null;
    importBtn.disabled = true;
    downloadBtn.href = '#';
    downloadBtn.disabled = true;

    try {
        const profile = await getPlayerProfile(username);
        if (!profile) return;

        currentSkinData = profile;
        usernameDisplay.textContent = profile.username;
        updateUrl(profile.username);
        await initSkinViewer(profile.skinUrl); // Fixed: Pass skinUrl

        importBtn.disabled = false;
        downloadBtn.disabled = false;
        downloadBtn.href = `${SKIN_BASE_URL}${profile.uuid}.png`;
        showStatus('Skin loaded!', 'success');
    } catch (error) {
        console.error('Load Skin Error:', error);
        showStatus('Failed to load skin.', 'error');
    }
}

// Status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
}

// Update URL
function updateUrl(username) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('skin', username);
    history.replaceState(null, '', newUrl);
}

// Initial load
function getInitialSkin() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('skin')) {
        loadSkin(params.get('skin'));
    } else if (params.get('url')) {
        loadSkin(decodeURIComponent(params.get('url')));
    } else {
        loadSkin('Steve');
    }
}

// Import to Popcraft (placeholder)
function importToPopcraft(skinData) {
    showStatus('Preparing import to Popcraft...', 'info');
    setTimeout(() => {
        showStatus(`Imported ${skinData.username}'s skin to Popcraft!`, 'success');
        const popcraftUrl = `https://popcraft.example.com?import-skin=${encodeURIComponent(skinData.skinUrl)}`;
        window.open(popcraftUrl, '_blank');
    }, 1000);
}

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username.length < 3) {
        showStatus('Username must be at least 3 characters.', 'error');
        return;
    }
    await loadSkin(username);
});

importBtn.addEventListener('click', () => {
    if (currentSkinData) importToPopcraft(currentSkinData);
});

window.addEventListener('DOMContentLoaded', getInitialSkin);

// Cleanup
window.addEventListener('beforeunload', () => {
    if (skinViewer) skinViewer.dispose();
});

// 3D library fallback
const skinviewScript = document.querySelector('script[src*="skinview3d"]');
if (skinviewScript) {
    skinviewScript.onerror = () => {
        showStatus('3D preview requires internet. Using fallback.', 'info');
        displayFallbackImage(DEFAULT_SKIN);
    };
}
