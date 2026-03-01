// TOC Plugin - Configuration file for Trial and Subscription settings
// Update these values with your actual Gumroad product information

const CONFIG = {
  // Gumroad Product Settings
  GUMROAD_PRODUCT_ID: 'bqqYJ_jE-zkEoFiryLblXQ==', // Your actual Gumroad product ID
  GUMROAD_PRODUCT_URL: 'https://mohihassan.gumroad.com/l/TOC-PRO', // Your actual product URL
  GUMROAD_ACCESS_TOKEN: 'YOUR_GUMROAD_ACCESS_TOKEN', // Replace with your actual Gumroad access token
  
  // Trial Settings - REAL TRIAL CONFIGURATION
  TRIAL_DAYS: 7, // 7-day trial
  TRIAL_START_ON_FIRST_USE: true, // Trial starts when user first opens the plugin
  TRIAL_PERSIST_ACROSS_SESSIONS: true, // Trial state persists between Figma sessions
  
  // UI Settings
  SHOW_TRIAL_BANNER: true,
  SHOW_UPGRADE_BUTTON: true,
  SHOW_TRIAL_COUNTDOWN: true, // Show real-time countdown
  SHOW_TRIAL_EXPIRY_WARNING: true, // Show warning when trial is about to expire
  
  // Feature Flags - What's available during trial
  ENABLE_PREMIUM_FEATURES: true, // All features available during trial
  ENABLE_ADVANCED_STYLING: true,
  ENABLE_MULTI_COLUMN: true,
  ENABLE_CUSTOM_LAYOUTS: true,
  ENABLE_UNLIMITED_TOC_GENERATION: true,
  
  // Trial Expiry Behavior
  BLOCK_FEATURES_AFTER_EXPIRY: true, // Block premium features after trial expires
  SHOW_UPGRADE_PROMPT_AFTER_EXPIRY: true, // Show upgrade prompt when trial expires
  
  // Messages - Professional trial messaging
  TRIAL_BANNER_TITLE: '🎉 Free Trial Active',
  TRIAL_EXPIRED_MESSAGE: '😔 Trial expired. Please upgrade to continue using premium features.',
  TRIAL_ENDING_SOON_MESSAGE: 'Trial ending soon. Upgrade now to keep all features.',
  LICENSE_ACTIVATED_MESSAGE: '✅ License activated successfully! Welcome to premium!',
  LICENSE_INVALID_MESSAGE: '❌ Invalid license key. Please check and try again.',
  UPGRADE_NOW_MESSAGE: 'Upgrade now to unlock unlimited TOC generation and advanced features.',
  
  // Trial Countdown Messages
  TRIAL_COUNTDOWN_FORMATS: {
    DAYS_REMAINING: '{days}d {hours}h {minutes}m {seconds}s left',
    HOURS_REMAINING: '{hours}h {minutes}m {seconds}s left',
    MINUTES_REMAINING: '{minutes}m {seconds}s left',
    SECONDS_REMAINING: '{seconds}s left',
    EXPIRED: '😔 Trial expired - Please upgrade'
  },
  
  // Colors - Professional color scheme
  TRIAL_BANNER_BG: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
  TRIAL_ENDING_BG: 'linear-gradient(135deg,#f59e0b,#d97706)',
  TRIAL_EXPIRED_BG: 'linear-gradient(135deg,#dc2626,#b91c1c)',
  SUCCESS_COLOR: '#1aef7a',
  ERROR_COLOR: '#ff4d4d',
  PRIMARY_COLOR: '#18A0FB',
  WARNING_COLOR: '#fbbf24',
  
  // Trial Features - What users get during trial
  TRIAL_FEATURES: [
    'Unlimited TOC Generation',
    'Advanced Styling Options',
    'Multi-column Layouts',
    'Custom Numbering Styles',
    'Real-time Preview',
    'Export & Share Features'
  ],
  
  // Premium Features - What users get after upgrade
  PREMIUM_FEATURES: [
    'All Trial Features',
    'Priority Support',
    'Regular Updates',
    'Advanced Templates',
    'Team Collaboration',
    'Custom Branding'
  ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 