const fs = require('fs');
const path = require('path');

function ensureUnmatchedAsset() {
  const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
  const source = path.join(projectRoot, 'assets', 'images', 'icon.png');
  const targetDir = path.join(projectRoot, 'node_modules', 'expo-router', 'assets');
  const target = path.join(targetDir, 'unmatched.png');

  if (!fs.existsSync(source)) {
    console.warn('[patch-expo-router] Source asset not found:', source);
    return;
  }

  try {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(source, target);
    console.log('[patch-expo-router] Patched expo-router unmatched asset.');
  } catch (error) {
    console.warn('[patch-expo-router] Failed to patch unmatched asset:', error.message);
  }
}

ensureUnmatchedAsset();
