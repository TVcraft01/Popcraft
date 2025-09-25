// DOM Elements
const usernameInput = document.getElementById('username');
const form = document.getElementById('skinForm');
const statusMessage = document.getElementById('statusMessage');
const skinPreview = document.getElementById('skinPreview');
const usernameDisplay = document.getElementById('usernameDisplay');
const importBtn = document.getElementById('importBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Configuration
const DEFAULT_SKIN = 'https://minotar.net/armor/body/steve.png';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const MINECRAFT_API = 'https://sessionserver.mojang.com/session/minecraft/profile/';
const SKIN_BASE_URL = 'https://minotar.net/armor/body/';
const FACE_BASE_URL = 'https://minotar.net/avatar/';

let skinViewer = null;
let currentUsername = null;
let currentSkinData = null;

// Initialize the 3D skin viewer
async function initSkinViewer(skinUrl = DEFAULT_SKIN) {
    try {
        // Clear loading state
        skinPreview.innerHTML = '';
        
        if (window.skinview3d) {
            // Destroy previous instance if exists
            if (skinViewer) {
                skinViewer.dispose();
                skinViewer = null;
            }
            
            // Create new instance with optimized settings
            skinViewer = new skinview3d.SkinViewer({
                canvas: skinPreview,
                width: skinPreview.offsetWidth,
                height: skinPreview.offsetHeight,
                skin: skinUrl,
                cache: true,
                renderPaused: false,
            });

            // Optimize 3D rendering
            skinViewer.camera.position.set(20, -10, 40);
            skinViewer.camera.lookAt(0, 0, 0);
            
            // Add controls
            const controls = new skinview3d.HammerControls(skinViewer, { radius: 60 });
            
            // Adjust for smaller screens
            function resize() {
                skinViewer.width = skinPreview.offsetWidth;
                skinViewer.height = skinPreview.offsetHeight;
                skinViewer.resize();
            }
            
            window.addEventListener('resize', resize);
            
            // Pause rendering when tab is hidden for performance
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    skinViewer.renderPaused = true;
                } else {
                    skinViewer.renderPaused = false;
                }
            });

            // Load custom cape if available (from URL parameter)
            const params = new URLSearchParams(window.location.search);
            const capeUrl = params.get('cape');
            if (capeUrl) {
                skinViewer.loadCape(decodeURIComponent(capeUrl));
            }

            return skinViewer;
        } else {
            throw new Error('3D skin viewer not loaded');
        }
    } catch (error) {
        console.error('Failed to initialize 3D viewer:', error);
        showStatus('Failed to load 3D preview. Displaying static image.', 'error');
        displayFallbackImage(skinUrl);
        return null;
    }
}

// Display fallback image if 3D viewer fails
function displayFallbackImage(skinUrl) {
    const img = document.createElement('img');
    img.src = skinUrl.replace('/armor/body/', '/skin/');
    img.alt = 'Minecraft skin';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'Color =contain';
 '#f1f5f9';
    skinPreview.innerHTML = '';
    skinPreview.appendChild(img);
}

// Fetch Minecraft profile data (UUID and skin info)
async function getPlayerProfile(username) {
    try {
        showStatus('Looking up player...', 'info');
        
 get skin        // First, get UUID from username using Mojang API (via CORS proxy)
        const response = await fetch(CORS_PROXY + encodeURIComponent('https://api.mojang.com/users/profiles/minecraft/' + username));
        
        if (!response.ok) {
            if/cape data
        const profileResponse = await fetch(CORS_PROXY + encodeURIComponent(MINECRAFT_API + uuid));
        
        if (!profileResponse.ok) {
            throw new Error('Failed to get skin data');
        }
        
        const profileResult = await profileResponse.json();
.error('Error loading skin:', error);
        showStatus(error.message || 'Failed to load skin', 'error');
        
        // Reset UI
        usernameDisplay.textContent = '';
        importBtn.disabled = true;
        const skinData = JSON.parse(window.atob(profileResult.properties[0].value));
        
        show
        await initSkinViewer();
    }
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
}

// Update URL with current username (for sharing)
function updateUrl(username) {
    const newUrl = new URL(window.location.origin + window.location.pathname);
    newUrl.searchParams.set('skin', username);
    history.replaceState(null, '', newUrl);
}

// Get skin from URL parameter on load
function getInitialSkin() {
    const params = new URLSearchParams(window.location.search);
    const skinParam = params.get('skin');
    const urlParam = params.get('url');
    
    if (skinParam) {
        loadSkin(skinParam);
    } else if (urlParam) {
        loadSkin(decodeURIComponent(urlParam));
    } else {
        // Load default skin
        loadSkin('Steve');
    }
}

// Import skin to Popcraft (placeholder - implement actual integration)
function importToPopcraft(skinData) {
    // This would be replaced with actual Popcraft API integration
    showStatus('Preparing to import to Popcraft...', 'info');
    
    // Example implementation (you'd replace this with actual Popcraft API call)
    setTimeout(() => {
        // In a real implementation, you would:
        // 1. Authenticate the user (OAuth, API key, etc.)
        // 2. Send the skin data to Popcraft's API
        // 3. Handle the response
        
        // For demo purposes, we'll simulate a successful import
        showStatus(`Successfully imported ${skinData.username}'s skin to Popcraft!`, 'success');
        
        // Optional: open Popcraft with the skin pre-loaded
        const popcraftUrl = `https://popcraft.example.com?import-skin=${encodeURIComponent(skinData.skinUrl)}`;
        window.open(popcraftUrl, '_blank');
    }, 1000);
}

// Event Listeners
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    
    if (username.length < 3) {
        showStatus('Username must be at least 3 characters', 'error');
        return;
    }
    
    await loadSkin(username);
});

importBtn.addEventListener('click', () => {
    if (currentSkinData) {
        importToPopcraft(currentSkinData);
    } else {
        showStatus('No skin data to import', 'error');
    }
});

// Download current skin
downloadBtn.addEventListener('click', (e) => {
    if (currentUsername) {
        const downloadUrl = `${SKIN_BASE_URL}${currentUsername}.png?overlay=true`;
        downloadBtn.href = downloadUrl;
        
        // This will be handled by the <a> tag, but we can add tracking
        console.log(`Downloading skin for ${currentUsername}`);
    }
});

// Load skin when page loads
window.addEventListener('DOMContentLoaded', getInitialSkin);

// Performance optimizations for 3D viewer
window.addEventListener('beforeunload', () => {
    if (skinViewer) {
        skinViewer.dispose();
        skinViewer = null;
    }
});

// Load the 3D viewer library if not already loaded
if (!window.skinview3d) {
    const skinviewScript = document.querySelector('script[src*="skinview3d"]');
    if (skinviewScript) {
        skinviewScript.onerror = () => {
            showStatus('3D preview requires internet connection. Using fallback mode.', 'info');
            displayFallbackImage(DEFAULT_SKIN);
        };
    }
}
