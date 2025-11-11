/**
 * YENİ LOGOYU TÜM APP ICON'LARINA UYGULA
 * 
 * WhatsApp'tan gelen görseli işleyip tüm logo dosyalarını günceller
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');
const sourceImage = path.join(__dirname, '..', 'assets', 'logo', 'WhatsApp Image 2025-11-11 at 18.44.49.jpeg');

async function updateAllLogos() {
  console.log('🎨 Logo güncelleniyor...');

  // 1. Ana Logo (1024x1024) - Kare olarak kırp
  await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('✅ icon.png güncellendi');

  // 2. Splash Icon (1024x1024)
  await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('✅ splash-icon.png güncellendi');

  // 3. Favicon (48x48)
  await sharp(sourceImage)
    .resize(48, 48, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('✅ favicon.png güncellendi');

  // 4. Android Icon Foreground (1024x1024)
  await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('✅ android-icon-foreground.png güncellendi');

  // 5. Android Background - gradient turuncu
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
  console.log('✅ android-icon-background.png güncellendi');

  // 6. Monochrome Icon - grayscale versiyonu
  await sharp(sourceImage)
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .greyscale()
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('✅ android-icon-monochrome.png güncellendi');

  console.log('🎉 Tüm logolar başarıyla güncellendi!');
  
  // Kaynak dosyayı temizle (opsiyonel)
  // fs.unlinkSync(sourceImage);
  // console.log('🧹 Geçici dosya temizlendi');
}

updateAllLogos().catch(console.error);
