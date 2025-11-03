// Script Node.js pour générer box_color/index.json avec toutes les images PNG et JPG
const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'box_color');
const output = path.join(folder, 'index.json');

// Filtre les fichiers PNG/JPG
const files = fs.readdirSync(folder)
  .filter(f =>
    f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg')
  );

// Sauvegarde dans index.json
fs.writeFileSync(output, JSON.stringify(files, null, 2), 'utf8');

console.log(`index.json généré avec ${files.length} fichiers !`);
