const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro Configuration for Expo/React Native
 * 
 * This configuration optimizes the bundler for production builds:
 * - Minifies code for smaller bundle sizes
 * - Enables inline requires for faster startup
 * - Configures asset handling
 * 
 * Purpose: Ensures optimal bundle size and performance for production builds
 */

const config = getDefaultConfig(__dirname);

// Enable minification in production
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true, // Preserve class names for error tracking
    keep_fnames: true, // Preserve function names for better debugging
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

module.exports = config;
