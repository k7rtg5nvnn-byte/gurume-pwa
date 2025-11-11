/**
 * PROFESYONEL GURUME LOGOSU
 * 
 * Modern, minimalist, yemek & rota temalı
 */

const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

// Profesyonel SVG Logo
const professionalLogo = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#F7931E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C73E1D;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
      <feOffset dx="0" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="512" cy="512" r="480" fill="url(#mainGradient)"/>
  
  <!-- Main G Letter - Bold & Modern -->
  <g filter="url(#shadow)">
    <path d="M 512 220
             A 292 292 0 1 0 512 804
             A 292 292 0 0 0 740 612
             L 740 512
             L 512 512
             L 512 442
             L 820 442
             L 820 612
             A 292 292 0 1 1 512 220
             Z" 
          fill="#FFFFFF" 
          stroke="none"/>
  </g>
  
  <!-- Fork Icon (left side) -->
  <g opacity="0.9">
    <line x1="340" y1="380" x2="340" y2="320" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
    <line x1="320" y1="380" x2="320" y2="340" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
    <line x1="360" y1="380" x2="360" y2="340" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
    <path d="M 310 380 L 370 380 L 365 420 L 345 420 Q 340 420 340 415 L 340 390" 
          fill="#FFFFFF" stroke="none"/>
  </g>
  
  <!-- Route/Path Icon (bottom right) -->
  <g opacity="0.9">
    <circle cx="680" cy="680" r="16" fill="#FFFFFF"/>
    <circle cx="620" cy="720" r="12" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="740" cy="720" r="12" fill="#FFFFFF" opacity="0.8"/>
    <path d="M 680 680 Q 650 700 620 720" stroke="#FFFFFF" stroke-width="8" 
          fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M 680 680 Q 710 700 740 720" stroke="#FFFFFF" stroke-width="8" 
          fill="none" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>
`;

async function createProfessionalLogos() {
  console.log('🎨 Profesyonel Gurume logosu oluşturuluyor...');

  // 1. Ana Logo (1024x1024)
  await sharp(Buffer.from(professionalLogo))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png oluşturuldu');

  // 2. Splash Icon
  await sharp(Buffer.from(professionalLogo))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✅ splash-icon.png oluşturuldu');

  // 3. Favicon
  await sharp(Buffer.from(professionalLogo))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✅ favicon.png oluşturuldu');

  // 4. Android Foreground
  await sharp(Buffer.from(professionalLogo))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✅ android-icon-foreground.png oluşturuldu');

  // 5. Android Background
  const androidBg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#C73E1D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)"/>
    </svg>
  `;
  await sharp(Buffer.from(androidBg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('✅ android-icon-background.png oluşturuldu');

  // 6. Monochrome
  const monoLogo = professionalLogo
    .replace(/fill="#FFFFFF"/g, 'fill="#000000"')
    .replace(/stroke="#FFFFFF"/g, 'stroke="#000000"')
    .replace(/url\(#mainGradient\)/g, '#FFFFFF');
  
  await sharp(Buffer.from(monoLogo))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✅ android-icon-monochrome.png oluşturuldu');

  console.log('🎉 Profesyonel Gurume logoları başarıyla oluşturuldu!');
  console.log('📱 Özellikler:');
  console.log('   • Modern gradient (turuncu-kırmızı)');
  console.log('   • Bold G harfi');
  console.log('   • Çatal ikonu (gurme)');
  console.log('   • Rota ikonu (keşfet)');
  console.log('   • Gölge efektleri');
}

createProfessionalLogos().catch(console.error);
