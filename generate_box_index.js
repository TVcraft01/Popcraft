import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOX_DIR = path.join(__dirname, 'box_color');
const OUTPUT_FILE = path.join(BOX_DIR, 'index.json');

async function main() {
  try {
    console.log('🔍 Lecture du dossier:', BOX_DIR);

    if (!fs.existsSync(BOX_DIR)) {
      console.error('❌ Dossier introuvable:', BOX_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(BOX_DIR)
      .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) {
      console.warn('⚠️ Aucune texture trouvée dans', BOX_DIR);
    }

    // Format: simple array de noms de fichiers
    const jsonData = files;

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
    console.log(`✅ ${files.length} texture(s) listée(s) dans ${OUTPUT_FILE}`);
    console.log('Fichiers indexés:', files);

  } catch (err) {
    console.error('💥 Erreur:', err.message);
    process.exit(1);
  }
}

main();
