/**
 * GURUME RENK PALETİ
 * 
 * Turuncu, Kırmızı ve Sarı tonlarında premium görünüm
 * - Primary: Turuncu tonları (CTA ve vurgu)
 * - Secondary: Kırmızı tonları (önemli aksiyonlar)
 * - Accent: Sarı tonları (bilgilendirme ve highlight)
 */

import { Platform } from 'react-native';

// Ana renkler
const primaryOrange = '#FF6B35';  // Canlı turuncu
const deepOrange = '#E85D2C';     // Koyu turuncu
const lightOrange = '#FFB088';    // Açık turuncu

const warmRed = '#D84727';        // Sıcak kırmızı
const lightRed = '#FF8866';       // Açık kırmızı

const goldenYellow = '#FFC857';   // Altın sarısı
const sunYellow = '#FFD885';      // Güneş sarısı
const paleYellow = '#FFF4E0';     // Soluk sarı

// Nötr renkler
const darkBrown = '#2C1810';      // Koyu kahverengi (text)
const mediumBrown = '#6B4423';    // Orta kahverengi
const lightBrown = '#A67C52';     // Açık kahverengi
const cream = '#FFF8F0';          // Krem

export const Colors = {
  light: {
    // Temel renkler
    text: darkBrown,
    background: cream,
    tint: primaryOrange,
    
    // UI elementleri
    primary: primaryOrange,
    secondary: warmRed,
    accent: goldenYellow,
    
    // Icon'lar
    icon: deepOrange,
    tabIconDefault: lightBrown,
    tabIconSelected: primaryOrange,
    
    // Kart ve border
    cardBackground: '#FFFFFF',
    border: '#FFE4D6',
    borderLight: '#FFF0E6',
    
    // Badge ve etiketler
    badgeOrange: '#FFDBC4',
    badgeYellow: '#FFF4D6',
    badgeRed: '#FFD4CC',
    
    // Text varyasyonları
    textSecondary: mediumBrown,
    textLight: lightBrown,
    
    // Başarı ve uyarı
    success: '#4CAF50',
    warning: goldenYellow,
    error: warmRed,
  },
  dark: {
    // Temel renkler
    text: '#FFF0E6',
    background: '#1A0F0A',
    tint: lightOrange,
    
    // UI elementleri
    primary: lightOrange,
    secondary: lightRed,
    accent: sunYellow,
    
    // Icon'lar
    icon: sunYellow,
    tabIconDefault: '#B38267',
    tabIconSelected: lightOrange,
    
    // Kart ve border
    cardBackground: '#2C1810',
    border: '#3D2416',
    borderLight: '#4D3420',
    
    // Badge ve etiketler
    badgeOrange: '#3D2416',
    badgeYellow: '#3D3020',
    badgeRed: '#3D1E16',
    
    // Text varyasyonları
    textSecondary: '#C9A793',
    textLight: '#8C6F60',
    
    // Başarı ve uyarı
    success: '#66BB6A',
    warning: sunYellow,
    error: lightRed,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
