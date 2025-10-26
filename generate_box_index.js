// ===============================
// 🧱 PopCraft - Box Index Builder
// ===============================
// Génère un fichier box_color/index.json listant toutes les textures (.png/.jpg)
// à exécuter avec: node generate_box_index.js

import fs from 'fs';
import path from 'path';

const BOX_DIR = './box_color';
const OUTPUT_FILE = path.join(BOX_DIR, 'index.json');

async function main() {
  try {
    console.log('🔍 Lecture du dossier', BOX_DIR);

    // Vérifie si le dossier existe
    if (!fs.existsSync(BOX_DIR)) {
      console.error('❌ Dossier introuvable :', BOX_DIR);
      process.exit(1);
    }

    // Récupère tous les fichiers .png et .jpg
    const files = fs.readdirSync(BOX_DIR)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));

    // Génère un tableau d’objets (utile si tu veux ajouter des infos plus tard)
    const jsonData = files.map(name => ({
      name: name.replace(/\.[^.]+$/, ''), // "red_box" au lieu de "red_box.png"
      file: name,
      url: `box_color/${name}`
    }));

    // Écrit le JSON joliment formaté
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
    console.log(`✅ ${files.length} textures listées dans ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('💥 Erreur :', err);
    process.exit(1);
  }
}

main();
