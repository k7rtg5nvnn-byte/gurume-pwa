/**
 * PROFESYONEL LOGO OLUŞTURUCU
 * 
 * Modern, minimalist, profesyonel Gurume logosu
 * Renk: Turuncu (#FF6B35), Kırmızı (#C73E1D)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

// SVG: Modern, profesyonel "G" logosu
const logoSVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C73E1D;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="512" cy="512" r="480" fill="url(#mainGradient)" filter="url(#shadow)"/>
  
  <!-- Letter G -->
  <path d="M 512 200 
           A 312 312 0 1 0 512 824
           A 312 312 0 0 0 700 650
           L 700 550
           L 512 550
           L 512 470
           L 800 470
           L 800 650
           A 312 312 0 1 1 512 200
           Z" 
        fill="#FFFFFF" 
        stroke="none"/>
  
  <!-- Inner accent - fork -->
  <path d="M 650 350 L 650 280 M 630 350 L 630 300 M 670 350 L 670 300" 
        stroke="#FFFFFF" 
        stroke-width="12" 
        stroke-linecap="round" 
        fill="none" 
        opacity="0.7"/>
</svg>
`;

async function generateLogos() {
  console.log('🎨 Profesyonel logo oluşturuluyor...');

  // 1. Ana Logo (1024x1024)
  await sharp(Buffer.from(logoSVG))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png oluşturuldu');

  // 2. Splash Icon (1024x1024)
  await sharp(Buffer.from(logoSVG))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✅ splash-icon.png oluşturuldu');

  // 3. Favicon (48x48)
  await sharp(Buffer.from(logoSVG))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✅ favicon.png oluşturuldu');

  // 4. Android Icons
  await sharp(Buffer.from(logoSVG))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✅ android-icon-foreground.png oluşturuldu');

  // Android background (solid color)
  const androidBg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#FF6B35"/>
    </svg>
  `;
  await sharp(Buffer.from(androidBg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('✅ android-icon-background.png oluşturuldu');

  // Monochrome icon
  const monoSVG = logoSVG.replace(/fill="#FFFFFF"/g, 'fill="#000000"')
                         .replace(/stroke="#FFFFFF"/g, 'stroke="#000000"')
                         .replace(/url\(#mainGradient\)/g, '#FFFFFF');
  await sharp(Buffer.from(monoSVG))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✅ android-icon-monochrome.png oluşturuldu');

  console.log('🎉 Tüm logolar başarıyla oluşturuldu!');
}

generateLogos().catch(console.error);
