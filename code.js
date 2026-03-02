// Main Figma plugin code for Table of Contents Generator
figma.showUI(__html__, { width: 680, height: 800 });

// --- PROFESSIONAL TRIAL AND SUBSCRIPTION MANAGEMENT ---
const TRIAL_DAYS = 7; // 7-day trial
const GUMROAD_PRODUCT_ID = 'bqqYJ_jE-zkEoFiryLblXQ=='; // Gumroad product ID

// Direct messaging approach - no promise callbacks needed

/**
 * Check if a subscription is active based on purchase data
 * @param {Object} purchase - Purchase object from Gumroad API
 * @returns {boolean} - True if subscription is active
 */
function isSubscriptionActive(purchase) {
  // Check if purchase was refunded or chargebacked
  if (purchase.refunded === true || purchase.chargebacked === true) {
    return false;
  }

  // Check if subscription was ended, cancelled, or failed
  const hasEnded = purchase.subscription_ended_at !== null && purchase.subscription_ended_at !== undefined;
  const hasCancelled = purchase.subscription_cancelled_at !== null && purchase.subscription_cancelled_at !== undefined;
  const hasFailed = purchase.subscription_failed_at !== null && purchase.subscription_failed_at !== undefined;

  return !hasEnded && !hasCancelled && !hasFailed;
}

/**
 * Verify license key with Gumroad API
 * @param {string} licenseKey - License key to verify
 * @returns {Promise<Object>} - Validation result
 */
async function verifyLicense(licenseKey) {
  try {
    // Only use Gumroad API for real license verification
    const apiResult = await verifyLicenseWithGumroadAPI(licenseKey);

    if (apiResult && apiResult.success) {
      return {
        success: true,
        message: 'License is valid'
      };
    }

    return {
      success: false,
      message: (apiResult && apiResult.message) || 'That license does not exist for the provided product.'
    };

  } catch (error) {
    console.error('License verification error:', error);
    return {
      success: false,
      message: 'License verification failed due to an error.'
    };
  }
}

/**
 * Verify license with Gumroad API using the /licenses/verify endpoint
 * @param {string} licenseKey - License key to verify
 * @returns {Promise<Object>} - Validation result
 */
async function verifyLicenseWithGumroadAPI(licenseKey) {
  console.log('🔍 Making Gumroad API call for license verification');

  // This function is no longer used with direct messaging approach
  // The verification is now handled directly in the message handlers
  return {
    success: false,
    message: 'Direct messaging approach - this function is deprecated'
  };
}

// Note: We only need the verify endpoint for license activation
// The enable, disable, and decrement endpoints are not needed for basic license validation







// Professional trial and subscription state
let trialState = {
  isTrialActive: false,
  trialStartDate: null,
  trialEndDate: null,
  isSubscribed: false,
  subscriptionExpiry: null,
  remainingDays: 0,
  remainingHours: 0,
  remainingMinutes: 0,
  remainingSeconds: 0
};

// Safe storage structure for premium license management
let pluginStorage = {
  isPremium: false,
  expirationTimestamp: null,
  usedLicenseKeys: []
};

// Safe storage functions for premium license management
async function loadPluginStorage() {
  try {
    const stored = await figma.clientStorage.getAsync('pluginAccess');
    if (stored) {
      pluginStorage = Object.assign({}, pluginStorage, stored);
    }
  } catch (error) {
    console.error('Error loading plugin storage:', error);
  }
}

async function savePluginStorage() {
  try {
    await figma.clientStorage.setAsync('pluginAccess', pluginStorage);
  } catch (error) {
    console.error('Error saving plugin storage:', error);
  }
}

/**
 * Safe premium license activation with reuse prevention and time extension
 * @param {string} licenseKey - License key to activate
 * @returns {Promise<Object>} - Activation result
 */
async function activatePremiumLicense(licenseKey) {
  try {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    // CRITICAL: Validate license key format (basic security)
    if (!licenseKey || licenseKey.length < 10) {
      return {
        success: false,
        message: 'Invalid license key format.'
      };
    }

    // CRITICAL: Check for secret hack pattern
    if (licenseKey.includes('🎉')) {
      return {
        success: false,
        message: 'Invalid license key format.'
      };
    }

    // Scenario 1: Same License Key - Error (already used)
    if (pluginStorage.usedLicenseKeys.includes(licenseKey)) {
      return {
        success: false,
        message: 'This license has already been used.'
      };
    }

    // Scenario 2: Stored License Key - Error (already used)
    if (trialState.licenseKey === licenseKey && trialState.isSubscribed) {
      return {
        success: false,
        message: 'This license was already activated.'
      };
    }

    // Scenario 3: New License Key with existing premium time - Extend by 30 days
    if (pluginStorage.isPremium && pluginStorage.expirationTimestamp && now < pluginStorage.expirationTimestamp) {
      // Extend existing premium by 30 days
      pluginStorage.expirationTimestamp = Math.max(
        pluginStorage.expirationTimestamp,
        now
      ) + thirtyDaysMs;

      // Add new license key to used keys
      pluginStorage.usedLicenseKeys.push(licenseKey);
      await savePluginStorage();

      // Update trial state
      trialState.isSubscribed = true;
      trialState.isTrialActive = false;
      trialState.licenseKey = licenseKey;
      trialState.licenseActivationDate = new Date().toISOString();
      trialState.subscriptionExpiry = new Date(pluginStorage.expirationTimestamp).toISOString();
      await saveTrialState();

      return {
        success: true,
        message: 'Premium extended by 30 days!',
        expirationDate: new Date(pluginStorage.expirationTimestamp)
      };
    }

    // Scenario 4: New License Key without premium time - Create new premium with 30 days
    // Create new premium with 30 days
    pluginStorage.expirationTimestamp = now + thirtyDaysMs;
    pluginStorage.isPremium = true;

    // Add license key to used keys
    pluginStorage.usedLicenseKeys.push(licenseKey);
    await savePluginStorage();

    // Update trial state
    trialState.isSubscribed = true;
    trialState.isTrialActive = false;
    trialState.licenseKey = licenseKey;
    trialState.licenseActivationDate = new Date().toISOString();
    trialState.subscriptionExpiry = new Date(pluginStorage.expirationTimestamp).toISOString();
    await saveTrialState();

    return {
      success: true,
      message: 'Premium license activated successfully!',
      expirationDate: new Date(pluginStorage.expirationTimestamp)
    };

  } catch (error) {
    console.error('Error activating premium license:', error);
    return {
      success: false,
      message: 'Failed to activate license due to an error.'
    };
  }
}

// Initialize trial and subscription state
async function initializeTrialAndSubscription() {
  try {
    // Load plugin storage first
    await loadPluginStorage();

    // Load saved trial state
    const savedTrialState = await figma.clientStorage.getAsync('trialState');
    if (savedTrialState) {
      trialState = Object.assign({}, trialState, savedTrialState);
    }

    // CRITICAL: Check if premium has expired and reset to expired trial if needed
    if (pluginStorage.isPremium && pluginStorage.expirationTimestamp) {
      const now = Date.now();
      if (now >= pluginStorage.expirationTimestamp) {
        // Premium has expired - reset to expired trial status (NOT new trial)
        console.log('⚠️ Premium expired - resetting to expired trial status');
        pluginStorage.isPremium = false;
        pluginStorage.expirationTimestamp = null;
        await savePluginStorage();

        // Reset trial state to expired (NOT new trial)
        trialState.isSubscribed = false;
        trialState.isTrialActive = false; // IMPORTANT: Set to false for expired status
        trialState.subscriptionExpiry = null;
        trialState.licenseKey = null;
        await saveTrialState();

        // Continue with expired trial initialization
      } else {
        // Premium is still active
        trialState.isSubscribed = true;
        trialState.isTrialActive = false;
        trialState.subscriptionExpiry = new Date(pluginStorage.expirationTimestamp).toISOString();

        // Try to get license key from old storage for backward compatibility
        const licenseState = await figma.clientStorage.getAsync('licenseState');
        if (licenseState && licenseState.licenseKey) {
          trialState.licenseKey = licenseState.licenseKey;
          trialState.licenseActivationDate = licenseState.activationDate;
        }

        await saveTrialState();
      }
    } else {
      // Check old storage system for backward compatibility
      const licenseState = await figma.clientStorage.getAsync('licenseState');
      if (licenseState && licenseState.isSubscribed) {
        // User has premium - disable trial completely
        trialState.isSubscribed = true;
        trialState.isTrialActive = false;
        trialState.licenseKey = licenseState.licenseKey;
        trialState.licenseActivationDate = licenseState.activationDate;
        trialState.subscriptionExpiry = licenseState.expiryDate;

        // Check if premium subscription has expired
        const now = new Date();
        const expiry = new Date(trialState.subscriptionExpiry);
        if (now >= expiry) {
          // Premium expired - set to expired status (NOT new trial)
          trialState.isSubscribed = false;
          trialState.isTrialActive = false; // IMPORTANT: Set to false for expired status
        }

        await saveTrialState();
      } else {
        // No premium - DEFAULT TO TRIAL STATUS
        if (!trialState.trialStartDate) {
          // Start trial on first use - REAL TRIAL START
          trialState.trialStartDate = new Date().toISOString();
          trialState.trialEndDate = new Date(Date.now() + (TRIAL_DAYS * 24 * 60 * 60 * 1000)).toISOString();
          trialState.isTrialActive = true; // DEFAULT TO TRIAL
          await saveTrialState();

          // Notify user that trial has started
          figma.notify('🎉 Welcome! Your 7-day free trial has started. Enjoy all premium features!', { timeout: 4000 });
        } else {
          // Check if trial is still active
          const now = new Date();
          const trialEnd = new Date(trialState.trialEndDate);
          const isExpired = now >= trialEnd;

          // Only set trial as inactive if it's actually expired
          trialState.isTrialActive = !isExpired;

          // Show warning if trial is ending soon (last 3 days)
          if (trialState.isTrialActive) {
            const remainingMs = trialEnd.getTime() - now.getTime();
            const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

            if (remainingDays <= 3 && remainingDays > 0) {
              figma.notify(`⚠️ Trial ending in ${remainingDays} day${remainingDays > 1 ? 's' : ''}. Upgrade now to keep all features!`, { timeout: 5000 });
            }
          }
        }
      }
    }

    // Calculate remaining time
    updateTrialRemainingTime();

    // Validate subscription status
    await validateSubscription();

    // Set up periodic license validation for premium users
    if (trialState.isSubscribed && trialState.licenseKey) {
      // Check license validity every 24 hours
      setInterval(async () => {
        await validatePremiumLicense();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }

    // CRITICAL: Set up premium expiration check every hour
    setInterval(async () => {
      if (pluginStorage.isPremium && pluginStorage.expirationTimestamp) {
        const now = Date.now();
        if (now >= pluginStorage.expirationTimestamp) {
          // Premium has expired - reset to expired trial status (NOT new trial)
          console.log('⚠️ Premium expired - resetting to expired trial status');
          pluginStorage.isPremium = false;
          pluginStorage.expirationTimestamp = null;
          await savePluginStorage();

          // Reset trial state to expired (NOT new trial)
          trialState.isSubscribed = false;
          trialState.isTrialActive = false; // IMPORTANT: Set to false for expired status
          trialState.subscriptionExpiry = null;
          trialState.licenseKey = null;
          await saveTrialState();

          // Notify user
          figma.notify('😔 Premium subscription has expired. Please renew to continue using premium features.', { timeout: 5000 });

          // Update UI
          figma.ui.postMessage({
            type: 'trial-status',
            trialState: {
              isTrialActive: false, // IMPORTANT: Set to false for expired status
              isSubscribed: false,
              trialStartDate: null,
              trialEndDate: null,
              subscriptionExpiry: null,
              remainingDays: 0,
              remainingHours: 0,
              remainingMinutes: 0,
              remainingSeconds: 0
            }
          });
        }
      }
    }, 60 * 60 * 1000); // Check every hour

    // Send trial/subscription status to UI
    figma.ui.postMessage({
      type: 'trial-status',
      trialState: {
        isTrialActive: trialState.isTrialActive,
        isSubscribed: trialState.isSubscribed,
        trialStartDate: trialState.trialStartDate,
        trialEndDate: trialState.trialEndDate,
        subscriptionExpiry: trialState.subscriptionExpiry,
        licenseKey: trialState.licenseKey,
        remainingDays: trialState.remainingDays,
        remainingHours: trialState.remainingHours,
        remainingMinutes: trialState.remainingMinutes,
        remainingSeconds: trialState.remainingSeconds
      }
    });

  } catch (error) {
    console.error('Error initializing trial:', error);
    // Fallback to basic trial state if initialization fails
    trialState.isTrialActive = true;
    trialState.trialStartDate = new Date().toISOString();
    trialState.trialEndDate = new Date(Date.now() + (TRIAL_DAYS * 24 * 60 * 60 * 1000)).toISOString();
  }
}

// Update remaining trial time
function updateTrialRemainingTime() {
  if (!trialState.trialEndDate) {
    trialState.remainingDays = 0;
    trialState.remainingHours = 0;
    trialState.remainingMinutes = 0;
    trialState.remainingSeconds = 0;
    return;
  }

  const now = new Date();
  const trialEnd = new Date(trialState.trialEndDate);
  const remainingMs = trialEnd.getTime() - now.getTime();

  if (remainingMs <= 0) {
    trialState.remainingDays = 0;
    trialState.remainingHours = 0;
    trialState.remainingMinutes = 0;
    trialState.remainingSeconds = 0;
    // Don't set isTrialActive to false here - let the main logic handle it
  } else {
    trialState.remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    trialState.remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    trialState.remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    trialState.remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  }
}

// Save trial state
async function saveTrialState() {
  await figma.clientStorage.setAsync('trialState', trialState);
}

// Validate subscription with Gumroad
async function validateSubscription() {
  try {
    // Get stored subscription data
    const subscriptionData = await figma.clientStorage.getAsync('subscriptionData');

    if (subscriptionData && subscriptionData.licenseKey) {
      // Use production-grade license verification
      const result = await verifyLicense(subscriptionData.licenseKey);

      if (result.success) {
        trialState.isSubscribed = true;
        // Set expiry for monthly product (30 days)
        const expiryDays = 30;
        trialState.subscriptionExpiry = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000)).toISOString();
        await saveTrialState();
      } else {
        trialState.isSubscribed = false;
        await saveTrialState();
      }
    }
  } catch (error) {
    console.error('Error validating subscription:', error);
  }
}

// Validate premium license with Gumroad API
async function validatePremiumLicense() {
  if (!trialState.isSubscribed || !trialState.licenseKey) {
    return;
  }

  try {
    // Send validation request to UI
    figma.ui.postMessage({
      type: 'validate-premium-license',
      licenseKey: trialState.licenseKey,
      productId: 'bqqYJ_jE-zkEoFiryLblXQ=='
    });

  } catch (error) {
    console.error('Error validating premium license:', error);
  }
}

// Check if user can use premium features
function canUsePremiumFeatures() {
  // CRITICAL: Check if premium has expired
  if (pluginStorage.isPremium && pluginStorage.expirationTimestamp) {
    const now = Date.now();
    if (now >= pluginStorage.expirationTimestamp) {
      // Premium has expired - reset to expired trial status (NOT new trial)
      console.log('⚠️ Premium expired during feature check - resetting to expired trial status');
      pluginStorage.isPremium = false;
      pluginStorage.expirationTimestamp = null;
      savePluginStorage();

      // Reset trial state to expired (NOT new trial)
      trialState.isSubscribed = false;
      trialState.isTrialActive = false; // IMPORTANT: Set to false for expired status
      trialState.subscriptionExpiry = null;
      trialState.licenseKey = null;
      saveTrialState();

      return false;
    }
  }

  // If subscribed, always allow premium features regardless of trial status
  if (trialState.isSubscribed) {
    return true;
  }
  // If not subscribed, only allow if trial is active
  return trialState.isTrialActive;
}

// Check if trial is expired and show warning
function checkTrialStatus() {
  // If user is subscribed, always allow access regardless of trial status
  if (trialState.isSubscribed) {
    return true;
  }

  // Only show trial expired message if not subscribed and trial is not active
  if (!trialState.isTrialActive && !trialState.isSubscribed) {
    figma.notify('😔 Trial expired. Please upgrade to continue using premium features.', { error: true });
    return false;
  }
  return true;
}

// Get trial status for UI display
function getTrialStatus() {
  return {
    isTrialActive: trialState.isTrialActive,
    isSubscribed: trialState.isSubscribed,
    trialStartDate: trialState.trialStartDate,
    trialEndDate: trialState.trialEndDate,
    remainingDays: trialState.remainingDays,
    remainingHours: trialState.remainingHours,
    remainingMinutes: trialState.remainingMinutes,
    remainingSeconds: trialState.remainingSeconds,
    isExpired: !trialState.isTrialActive && !trialState.isSubscribed,
    isEndingSoon: trialState.isTrialActive && trialState.remainingDays <= 3
  };
}

// Get remaining trial days
function getRemainingTrialDays() {
  if (!trialState.isTrialActive) return 0;

  const now = new Date();
  const trialEnd = new Date(trialState.trialEndDate);
  const remainingMs = trialEnd.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  return Math.max(0, remainingDays);
}

// Test functions removed for production



// Helper: Recursively scan all frames named with 'Z' in a node
function scanFrames(node, parentPath = [], results = []) {
  // Only include frames whose name contains 'Z' (case-insensitive)
  if (node.type === 'FRAME' && /z/i.test(node.name)) {
    results.push({
      id: node.id,
      name: node.name,
      type: node.type,
      parentPath: parentPath.slice(),
      pageId: figma.currentPage.id
    });
  }
  if ('children' in node) {
    for (const child of node.children) {
      // Only scan top-level frames (not nested frames)
      if (node.type === 'PAGE') {
        scanFrames(child, [], results);
      }
    }
  }
  return results;
}

// Helper: Get all pages and frames
function getDocumentStructure() {
  const pages = figma.root.children;
  let structure = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    structure.push({
      id: page.id,
      name: page.name,
      type: 'PAGE',
      index: i,
      children: scanFrames(page)
    });
  }
  return structure;
}

// Helper: Generate TOC text
function generateTOC(structure, options) {
  let lines = [];
  let sectionNum = 1;
  for (const page of structure) {
    let pageLine = '';
    if (options.autoNumber) pageLine += sectionNum + '. ';
    pageLine += page.name;
    if (options.showPageNumbers) pageLine += '  ' + (page.index + 1);
    lines.push(pageLine);
    let subNum = 1;
    for (const frame of page.children) {
      let indent = ' '.repeat(options.indent || 2);
      let frameLine = '';
      if (options.autoNumber) frameLine += sectionNum + '.' + subNum + ' ';
      frameLine += indent + frame.name;
      if (options.showPageNumbers) frameLine += '  ' + (page.index + 1);
      lines.push(frameLine);
      subNum++;
    }
    sectionNum++;
  }
  return lines.join('\n');
}

// Helper: Create or update TOC node
function createOrUpdateTOC(tocText, options) {
  let tocNode = figma.currentPage.findOne(n => n.type === 'TEXT' && n.name === '__TOC__');
  if (!tocNode) {
    tocNode = figma.createText();
    tocNode.name = '__TOC__';
    figma.currentPage.appendChild(tocNode);
  }
  tocNode.characters = tocText;
  tocNode.fontSize = options.fontSize || 16;
  tocNode.fontName = { family: 'Inter', style: options.fontWeight || 'Regular' };
  tocNode.x = 80;
  tocNode.y = 80;
  tocNode.textAutoResize = 'WIDTH_AND_HEIGHT';
  return tocNode;
}

// Load fonts before editing text
async function ensureFont(fontWeight) {
  try {
    await figma.loadFontAsync({ family: 'Inter', style: fontWeight || 'Regular' });
  } catch (error) {
    console.error('Font loading error:', error);
    // Fallback to system font if Inter fails to load
    try {
      await figma.loadFontAsync({ family: 'SF Pro Text', style: 'Regular' });
    } catch (fallbackError) {
      console.error('Fallback font loading also failed:', fallbackError);
    }
  }
}

// Helper: Get all top-level frames on the current page
function getFramesOnCurrentPage() {
  // Get only presentation slides on the current page
  const allFrames = [];

  function collectFrames(node) {
    // Only collect frames that are likely to be presentation slides
    if (node.type === 'FRAME' && node.name !== '__TOC_AUTO__') {
      // Filter criteria for slides:
      // 1. Must be a top-level frame (not nested inside another frame)
      // 2. Must have reasonable dimensions (not too small)
      // 3. Must not be a component or instance
      // 4. Must not be inside a group
      // 5. Must not be a TOC frame or other special frame

      const isTopLevel = node.parent && node.parent.type === 'PAGE';
      const hasReasonableSize = node.width >= 200 && node.height >= 200; // Minimum slide size
      const isNotComponent = node.type === 'FRAME' && !node.name.startsWith('_');
      const isNotNested = !node.parent || node.parent.type === 'PAGE';
      const isNotSpecialFrame = node.name !== '__TOC_AUTO__' && !node.name.startsWith('__');

      // Additional check: if it's nested, only include if it's a direct child of the page
      const isDirectChild = node.parent === figma.currentPage;

      // Additional check: prefer frames with slide-like names (optional, not strict)
      const hasSlideLikeName = /slide|page|frame/i.test(node.name) || node.name.match(/^\d+$/);

      if (isTopLevel && hasReasonableSize && isNotComponent && isDirectChild && isNotSpecialFrame) {
        allFrames.push(node);
      }
    }

    // Only recurse into children if we're at the page level
    if ('children' in node && (node.type === 'PAGE' || node.type === 'FRAME')) {
      for (const child of node.children) {
        collectFrames(child);
      }
    }
  }

  // Start from the current page
  collectFrames(figma.currentPage);

  console.log('Found presentation slides on current page:', allFrames.length);
  if (allFrames.length > 0) {
    console.log('Slide names:', allFrames.map(f => f.name));
  }
  return allFrames;
}

// Helper: Group frames into rows by Y (within a threshold)
function groupFramesByRows(frames, threshold = 40) {
  // Sort by Y first
  const sorted = frames.slice().sort((a, b) => a.y - b.y);
  const rows = [];
  sorted.forEach(frame => {
    // Try to find a row this frame belongs to
    let row = rows.find(r => Math.abs(r[0].y - frame.y) < threshold);
    if (row) {
      row.push(frame);
    } else {
      rows.push([frame]);
    }
  });
  return rows;
}

// Helper: Order frames by mode
function orderFrames(frames, direction) {
  if (direction === 'z') {
    // Z: left-to-right, top-to-bottom
    const rows = groupFramesByRows(frames);
    return rows.flatMap(row => row.sort((a, b) => a.x - b.x));
  } else if (direction === 'z-flip') {
    // Z Flipped: right-to-left, top-to-bottom
    const rows = groupFramesByRows(frames);
    return rows.flatMap(row => row.sort((a, b) => b.x - a.x));
  } else if (direction === 'vertical') {
    // Top-to-bottom
    return frames.slice().sort((a, b) => a.y - b.y);
  } else if (direction === 'horizontal') {
    // Left-to-right
    return frames.slice().sort((a, b) => a.x - b.x);
  } else if (direction === 'horizontal-rtl') {
    // Right-to-left
    return frames.slice().sort((a, b) => b.x - a.x);
  } else {
    // Default: Z-order (topmost first)
    return frames.slice().reverse();
  }
}

// Send ordered frame list to UI
function sendFramesToUI(direction = 'z', filterForTOC = false) {
  const frames = getFramesOnCurrentPage();
  const ordered = orderFrames(frames, direction);
  console.log('sendFramesToUI called with filterForTOC:', filterForTOC, 'frames found:', frames.length);

  if (filterForTOC) {
    // Helper: Get slide number from __SLIDE_NUMBER__ node
    function getSlideNumber(frame) {
      const numNode = frame.findOne && frame.findOne(n => n.type === 'TEXT' && /^__SLIDE_NUMBER__\d+$/.test(n.name));
      if (numNode) {
        // Try to parse the number from the node's characters
        const match = numNode.characters.match(/^\d+/);
        if (match) return parseInt(match[0], 10);
      }
      return null;
    }
    // Recursive filter: Only include frames (and their children) that have a slide number node
    function filterFramesWithNumber(framesArr) {
      return framesArr.map(function (frame) {
        var hasNumber = frame.findOne && frame.findOne(function (n) { return n.type === 'TEXT' && /^__SLIDE_NUMBER__\d+$/.test(n.name); });
        var filteredChildren = [];
        if (frame.children && Array.isArray(frame.children)) {
          filteredChildren = filterFramesWithNumber(frame.children);
        }
        if (hasNumber || filteredChildren.length > 0) {
          console.log('Frame with number found:', frame.name, 'hasNumber:', hasNumber);
          return {
            id: frame.id,
            name: frame.name,
            number: getSlideNumber(frame), // Use actual slide number
            children: filteredChildren
          };
        }
        return null;
      }).filter(Boolean);
    }
    const frameData = filterFramesWithNumber(ordered);
    console.log('Filtered frames with numbers:', frameData);
    console.log('Sending frames-list with', frameData.length, 'frames');
    figma.ui.postMessage({ type: 'frames-list', frames: frameData });
  } else {
    // Send only presentation slides (already filtered by getFramesOnCurrentPage)
    const frameData = ordered.map(function (frame, idx) {
      return {
        id: frame.id,
        name: frame.name,
        number: idx + 1
      };
    });
    console.log('Presentation slides (filtered):', frameData);
    figma.ui.postMessage({ type: 'frames-list', frames: frameData });
  }
}

// --- TOC Persistence and Custom Structure ---

// Save TOC structure to Figma clientStorage
async function saveTOCStructure(tocStructure) {
  await figma.clientStorage.setAsync('customTOC', tocStructure);
}

// Load TOC structure from Figma clientStorage
async function loadTOCStructure() {
  return await figma.clientStorage.getAsync('customTOC');
}

// Send saved TOC structure to UI
async function sendSavedTOCToUI() {
  const saved = await loadTOCStructure();
  if (saved) {
    figma.ui.postMessage({ type: 'custom-toc-loaded', toc: saved });
  }
}

// --- Reusable function to generate TOC frame ---
async function generateTOCFrame(slides, options, startFrameId) {
  console.log('generateTOCFrame called with:', { slides, options, startFrameId });

  // Only generate if a frame is selected
  const selection = figma.currentPage.selection;
  console.log('Current selection:', selection);

  let parentFrame = null;
  if (selection.length === 1 && selection[0].type === 'FRAME') {
    parentFrame = selection[0];
    console.log('Selected parent frame:', parentFrame.name);
  }

  if (!parentFrame) {
    console.log('No frame selected');
    figma.notify('Please select a frame to generate the TOC inside.');
    figma.ui.postMessage({ type: 'toc-error', error: 'Please select a frame to generate the TOC inside. Click on any frame in your document, then try again.' });
    return;
  }
  // Remove all existing TOC auto layout frames from all pages
  for (const page of figma.root.children) {
    if (page.type !== 'PAGE') continue;
    const tocs = page.findAll(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
    for (const toc of tocs) toc.remove();
  }
  // --- [ENFORCED] Use custom structure if provided ---
  let tocSlides = Array.isArray(slides) && slides.length > 0 ? slides : [];

  console.log('Initial tocSlides:', tocSlides);

  // Ensure all slides have proper structure
  tocSlides = tocSlides.map(slide => ({
    id: slide.id,
    name: slide.name || 'Untitled Slide',
    number: slide.number || 1,
    children: Array.isArray(slide.children) ? slide.children : []
  }));

  console.log('Processed tocSlides:', tocSlides);

  // If slides is empty, fallback to detected slides with numbers
  if (tocSlides.length === 0) {
    console.log('No slides provided, detecting slides with numbers...');
    const frames = getFramesOnCurrentPage();
    const ordered = orderFrames(frames, 'z');

    // Filter frames that have slide numbers
    function filterFramesWithNumber(framesArr) {
      return framesArr.map(function (frame) {
        var hasNumber = frame.findOne && frame.findOne(function (n) { return n.type === 'TEXT' && /^__SLIDE_NUMBER__\d+$/.test(n.name); });
        if (hasNumber) {
          const numNode = frame.findOne(n => n.type === 'TEXT' && /^__SLIDE_NUMBER__\d+$/.test(n.name));
          const match = numNode.characters.match(/^\d+/);
          const number = match ? parseInt(match[0], 10) : 1;
          return {
            id: frame.id,
            name: frame.name,
            number: number,
            children: []
          };
        }
        return null;
      }).filter(Boolean);
    }

    tocSlides = filterFramesWithNumber(ordered);
    console.log('Detected slides with numbers:', tocSlides);
  }
  // If a startFrameId is specified, only include slides at or after that frame
  if (startFrameId) {
    var flat = [];
    function flatten(slides) {
      for (var i = 0; i < slides.length; i++) {
        var s = slides[i];
        flat.push(s);
        if (s.children && Array.isArray(s.children)) flatten(s.children);
      }
    }
    flatten(tocSlides);
    var startIdx = flat.findIndex(function (s) { return s.id === startFrameId; });
    if (startIdx !== -1) {
      var allowedIds = {};
      flat.slice(startIdx).forEach(function (s) { allowedIds[s.id] = true; });
      function filterByIds(slides) {
        return slides.map(function (s) {
          var filteredChildren = [];
          if (s.children && Array.isArray(s.children)) {
            filteredChildren = filterByIds(s.children);
          }
          if (allowedIds[s.id] || filteredChildren.length > 0) {
            return Object.assign({}, s, { children: filteredChildren });
          }
          return null;
        }).filter(Boolean);
      }
      tocSlides = filterByIds(tocSlides);
    }
  }

  // Check if we have any slides to generate TOC from
  if (tocSlides.length === 0) {
    console.log('No slides found for TOC generation');
    figma.notify('No slides with numbers found. Please add slide numbers first.');
    figma.ui.postMessage({ type: 'toc-error', error: 'No slides with numbers found. Please add slide numbers first.' });
    return;
  }

  console.log('Generating TOC with', tocSlides.length, 'slides');

  let tocStyle = options || { numbered: true, indent: 2 };
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  let heroFontSize = 18, heroFontWeight = 'Bold', heroFontColor = { r: 0, g: 0, b: 0 };
  let nestedFontSize = 18, nestedFontWeight = 'Regular', nestedFontColor = { r: 0, g: 0, b: 0 };
  let nestedNumberColor = { r: 0.25, g: 0.25, b: 0.25 };
  if (tocStyle.heroFontSize) heroFontSize = parseFloat(tocStyle.heroFontSize);
  if (tocStyle.heroFontWeight) heroFontWeight = tocStyle.heroFontWeight;
  if (tocStyle.heroFontColor) heroFontColor = hexToRgb(tocStyle.heroFontColor);
  if (tocStyle.nestedFontSize) nestedFontSize = parseFloat(tocStyle.nestedFontSize);
  if (tocStyle.nestedFontWeight) nestedFontWeight = tocStyle.nestedFontWeight;
  if (tocStyle.nestedFontColor) nestedFontColor = hexToRgb(tocStyle.nestedFontColor);
  const showNesting = tocStyle.showNesting !== false;
  function mapFontWeight(style) {
    if (style === '700' || style === 700) return 'Bold';
    if (style === '600' || style === 600) return 'Semi Bold';
    if (style === '400' || style === 400) return 'Regular';
    return style;
  }
  async function safeLoadFont(style) {
    const mapped = mapFontWeight(style);
    try {
      await figma.loadFontAsync({ family: 'Inter', style: mapped });
    } catch (e) {
      if (mapped !== 'Regular') {
        try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }); } catch (e2) { }
      }
      if (mapped !== 'Bold') {
        try { await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }); } catch (e2) { }
      }
    }
  }
  // --- Font load cache for performance ---
  const loadedFonts = new Set();
  async function loadFontIfNeeded(family, style) {
    const key = family + '__' + style;
    if (!loadedFonts.has(key)) {
      try {
        await figma.loadFontAsync({ family: family, style: style });
        loadedFonts.add(key);
        return { family, style };
      } catch (e) {
        console.warn(`Could not load font ${family} ${style}, falling back to Inter Regular`);
        try {
          await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
          loadedFonts.add('Inter__Regular');
        } catch (e2) { } // Should be safe
        return { family: 'Inter', style: 'Regular' };
      }
    }
    return { family, style };
  }
  // --- Only Layout: Two-Column Grid ---
  async function buildMultiColTOC(slides, parentFrame) {
    // Ensure slides is a nested structure: each top-level slide has .children array
    function ensureHierarchy(slidesArr) {
      // If any slide has a .children array, assume already nested
      if (slidesArr.some(function (s) { return Array.isArray(s.children) && s.children.length > 0; })) return slidesArr;
      // Otherwise, treat all as top-level (no grouping)
      return slidesArr.map(function (s) {
        var copy = {};
        for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) copy[k] = s[k];
        copy.children = [];
        return copy;
      });
    }
    slides = ensureHierarchy(slides);

    // Preserve original slide order and create groups
    let groupedSlides = [];

    // Debug: Log the original slide order and structure
    console.log('Original slides order:', slides.map(s => s.number + ' ' + s.name));
    console.log('Original slides structure:', slides.map(s => ({
      number: s.number,
      name: s.name,
      hasChildren: s.children && s.children.length > 0,
      childrenCount: s.children ? s.children.length : 0
    })));

    // Check for missing numbers
    const numbers = slides.map(s => s.number).sort((a, b) => a - b);
    console.log('All slide numbers found:', numbers);
    const expectedNumbers = [];
    for (let i = 1; i <= Math.max.apply(null, numbers); i++) {
      expectedNumbers.push(i);
    }
    const missingNumbers = expectedNumbers.filter(n => !numbers.includes(n));
    console.log('Missing slide numbers:', missingNumbers);

    // Process slides in their original order
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      if (slide.children && slide.children.length > 0) {
        // This is a title with subtitles - create a group
        groupedSlides.push({
          type: 'group',
          title: slide,
          subtitles: slide.children,
          index: i
        });
      } else {
        // This is a standalone slide - create a single item
        groupedSlides.push({
          type: 'single',
          slide: slide,
          index: i
        });
      }
    }

    // Debug: Log the grouped slides order
    console.log('Grouped slides order:', groupedSlides.map(g =>
      g.type === 'group' ? g.title.number + ' ' + g.title.name : g.slide.number + ' ' + g.slide.name
    ));

    // Split groups into multiple columns based on layout mode and preserve order
    const layoutMode = tocStyle.layoutMode || 'auto';
    const maxItemsPerCol = tocStyle.maxItemsPerCol || 6; // Default to 6 items per column
    const maxColumnHeight = tocStyle.maxColumnHeight || 800;

    // Calculate how many columns we need based on maxItemsPerCol
    const totalItems = groupedSlides.length;
    const numColumns = Math.max(1, Math.ceil(totalItems / maxItemsPerCol));

    let columns = Array.from({ length: numColumns }, () => []);
    let columnHeights = Array.from({ length: numColumns }, () => 0);

    // Distribute slides sequentially across columns respecting maxItemsPerCol
    let currentCol = 0;
    let currentColItemCount = 0;
    let actualNumColumns = numColumns;

    for (const group of groupedSlides) {
      // Calculate items in this group (title + subtitles)
      const groupItemCount = group.type === 'group' ?
        (1 + group.subtitles.length) : 1;

      // Check if this group would exceed the column limit
      if (currentColItemCount + groupItemCount > maxItemsPerCol) {
        // Move to next column
        currentCol++;
        currentColItemCount = 0;
        if (currentCol >= actualNumColumns) {
          // Create a new column if needed
          columns.push([]);
          actualNumColumns++;
        }
      }

      // Special handling: If the group itself is too large for any column, 
      // create a new column just for this group
      if (groupItemCount > maxItemsPerCol) {
        // Find a column that can fit this group, or create a new one
        let targetCol = currentCol;
        while (targetCol < actualNumColumns && columns[targetCol].length > 0) {
          targetCol++;
        }
        if (targetCol >= actualNumColumns) {
          // Create a new column for this large group
          columns.push([]);
          actualNumColumns++;
        }
        columns[targetCol].push(group);
        // Reset to the next column after this large group
        currentCol = targetCol + 1;
        currentColItemCount = 0;
        if (currentCol >= actualNumColumns) {
          columns.push([]);
          actualNumColumns++;
        }
      } else {
        // Add group to current column
        columns[currentCol].push(group);
        currentColItemCount += groupItemCount;
      }
    }

    // Debug: Log the column distribution
    console.log('Max items per column:', maxItemsPerCol);
    console.log('Number of columns created:', numColumns);
    for (let i = 0; i < columns.length; i++) {
      console.log(`Column ${i + 1}:`, columns[i].map(g =>
        g.type === 'group' ? g.title.number + ' ' + g.title.name : g.slide.number + ' ' + g.slide.name
      ));
    }

    // Debug: Log the distribution logic
    console.log('Distribution details:', {
      totalItems: groupedSlides.length,
      maxItemsPerCol: maxItemsPerCol,
      numColumns: numColumns,
      groupedSlides: groupedSlides.map(g => ({
        type: g.type,
        number: g.type === 'group' ? g.title.number : g.slide.number,
        itemCount: g.type === 'group' ? (1 + g.subtitles.length) : 1
      }))
    });



    // Create horizontal frame for columns
    const rowFrame = figma.createFrame();
    rowFrame.layoutMode = 'HORIZONTAL';
    rowFrame.primaryAxisSizingMode = 'AUTO';
    rowFrame.counterAxisSizingMode = 'AUTO';
    rowFrame.itemSpacing = tocStyle.columnSpacing || 48;
    rowFrame.fills = [];

    // --- Throttle progress updates ---
    let lastProgressTime = Date.now();
    async function maybeSendProgress(current, total) {
      const now = Date.now();
      if (now - lastProgressTime > 80 || current === total) {
        figma.ui.postMessage({ type: 'toc-progress', current, total });
        lastProgressTime = now;
      }
    }

    // Helper to add groups to a column
    async function addGroupsToCol(colArr, colFrame, colOffset, totalCount, progressBase) {

      for (let idx = 0; idx < colArr.length; idx++) {
        const group = colArr[idx];

        if (group.type === 'group') {
          // Create a group frame with title and subtitles
          const groupFrame = figma.createFrame();
          groupFrame.layoutMode = 'VERTICAL';
          groupFrame.primaryAxisSizingMode = 'AUTO';
          groupFrame.counterAxisSizingMode = 'AUTO';
          groupFrame.fills = [];
          groupFrame.itemSpacing = 12; // Spacing between title and subtitles
          groupFrame.paddingTop = tocStyle.groupPadding || 24; // Space above group
          groupFrame.paddingBottom = tocStyle.groupPadding || 24; // Space below group

          // Title row
          const titleRow = figma.createFrame();
          titleRow.layoutMode = 'HORIZONTAL';
          titleRow.primaryAxisSizingMode = 'AUTO';
          titleRow.counterAxisSizingMode = 'AUTO';
          titleRow.itemSpacing = 16;
          titleRow.fills = [];

          // Apply row alignment settings
          if (tocStyle.textAlignHorizontal) {
            titleRow.counterAxisAlignItems = tocStyle.textAlignHorizontal === 'TOP' ? 'MIN' :
              tocStyle.textAlignHorizontal === 'BOTTOM' ? 'MAX' : 'CENTER';
          }
          // Default horizontal positioning to Left
          titleRow.primaryAxisAlignItems = 'MIN';

          // Number node for title
          const numFont = tocStyle.titleNumberFont || 'Inter';
          const numFontSize = tocStyle.titleNumberSize || 18;
          const numFontWeight = tocStyle.titleNumberWeight || 'Bold';
          const numColor = tocStyle.titleNumberColor ? hexToRgb(tocStyle.titleNumberColor) : { r: 0, g: 0, b: 0 };
          const numPos = tocStyle.titleNumberPos || 'left';
          const numLeadingZero = !!tocStyle.titleNumberLeadingZero;

          const safeNumFont = await loadFontIfNeeded(numFont, numFontWeight);
          const numText = figma.createText();
          // Use the original slide number from the UI
          let slideNumber = group.title.number;
          let numStr = numLeadingZero && slideNumber < 10 ? ('0' + slideNumber) : String(slideNumber);
          if (!numLeadingZero) numStr = String(slideNumber);
          numText.characters = numStr;
          numText.fontSize = numFontSize || 18;
          numText.fontName = safeNumFont;
          numText.fills = [{ type: 'SOLID', color: numColor }];
          numText.textAutoResize = 'WIDTH_AND_HEIGHT';
          numText.textAlignHorizontal = 'RIGHT';
          numText.setPluginData('tocType', 'hero-number');

          // Title text node
          const nameFont = tocStyle.heroFontFamily || 'Inter';
          const nameFontStyle = mapFontWeight(heroFontWeight);
          const safeNameFont = await loadFontIfNeeded(nameFont, nameFontStyle);
          const nameText = figma.createText();
          nameText.characters = group.title.name || '[NO NAME]';
          nameText.fontSize = heroFontSize || 18;
          nameText.fontName = safeNameFont;
          nameText.fills = [{ type: 'SOLID', color: tocStyle.heroFontColor ? hexToRgb(tocStyle.heroFontColor) : { r: 0, g: 0, b: 0 } }];
          nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
          nameText.textAlignHorizontal = 'LEFT';
          nameText.setPluginData('linkedFrameId', group.title.id);
          nameText.setPluginData('tocType', 'hero');

          if (numPos === 'right') {
            titleRow.appendChild(nameText);
            titleRow.appendChild(numText);
          } else {
            titleRow.appendChild(numText);
            titleRow.appendChild(nameText);
          }
          groupFrame.appendChild(titleRow);

          // Subtitle rows
          for (const child of group.subtitles) {
            const subRow = figma.createFrame();
            subRow.layoutMode = 'HORIZONTAL';
            subRow.primaryAxisSizingMode = 'AUTO';
            subRow.counterAxisSizingMode = 'AUTO';
            subRow.itemSpacing = 16;
            subRow.fills = [];
            subRow.paddingLeft = tocStyle.subIndent || 24;

            // Apply row alignment settings
            if (tocStyle.textAlignHorizontal) {
              subRow.counterAxisAlignItems = tocStyle.textAlignHorizontal === 'TOP' ? 'MIN' :
                tocStyle.textAlignHorizontal === 'BOTTOM' ? 'MAX' : 'CENTER';
            }
            // Default horizontal positioning to Left
            subRow.primaryAxisAlignItems = 'MIN';

            // Subtitle number
            const subNumFont = tocStyle.subNumberFont || 'Inter';
            const subNumFontSize = tocStyle.subNumberSize || 18;
            const subNumFontWeight = tocStyle.subNumberWeight || 'Regular';
            const subNumColor = tocStyle.subNumberColor ? hexToRgb(tocStyle.subNumberColor) : { r: 0, g: 0, b: 0 };
            const subNumPos = tocStyle.subNumberPos || 'left';
            const subNumLeadingZero = !!tocStyle.subNumberLeadingZero;

            const safeSubNumFont = await loadFontIfNeeded(subNumFont, subNumFontWeight);
            const subNumText = figma.createText();
            // Use the original slide number from the UI
            let subSlideNumber = child.number;
            let subNumStr = subNumLeadingZero && subSlideNumber < 10 ? ('0' + subSlideNumber) : String(subSlideNumber);
            if (!subNumLeadingZero) subNumStr = String(subSlideNumber);
            subNumText.characters = subNumStr;
            subNumText.fontSize = subNumFontSize || 18;
            subNumText.fontName = safeSubNumFont;
            subNumText.fills = [{ type: 'SOLID', color: subNumColor }];
            subNumText.textAutoResize = 'WIDTH_AND_HEIGHT';
            subNumText.textAlignHorizontal = 'RIGHT';
            subNumText.setPluginData('tocType', 'sub-number');

            // Subtitle text
            const subNameFont = tocStyle.subTitleFont || 'Inter';
            const subNameFontStyle = mapFontWeight(tocStyle.subTitleWeight || 'Regular');
            const safeSubNameFont = await loadFontIfNeeded(subNameFont, subNameFontStyle);
            const subNameText = figma.createText();
            subNameText.characters = child.name || '[NO NAME]';
            subNameText.fontSize = tocStyle.subTitleSize || nestedFontSize || 18;
            subNameText.fontName = safeSubNameFont;
            subNameText.fills = [{ type: 'SOLID', color: tocStyle.subTitleColor ? hexToRgb(tocStyle.subTitleColor) : nestedFontColor }];
            subNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
            subNameText.textAlignHorizontal = 'LEFT';
            subNameText.setPluginData('linkedFrameId', child.id);
            subNameText.setPluginData('tocType', 'sub');

            if (subNumPos === 'right') {
              subRow.appendChild(subNameText);
              subRow.appendChild(subNumText);
            } else {
              subRow.appendChild(subNumText);
              subRow.appendChild(subNameText);
            }
            groupFrame.appendChild(subRow);
          }
          colFrame.appendChild(groupFrame);

        } else {
          // Single slide (no subtitles)
          const row = figma.createFrame();
          row.layoutMode = 'HORIZONTAL';
          row.primaryAxisSizingMode = 'AUTO';
          row.counterAxisSizingMode = 'AUTO';
          row.itemSpacing = 16;
          row.fills = [];
          row.paddingTop = 12; // Space above single items
          row.paddingBottom = 12; // Space below single items

          // Apply row alignment settings
          if (tocStyle.textAlignHorizontal) {
            row.counterAxisAlignItems = tocStyle.textAlignHorizontal === 'TOP' ? 'MIN' :
              tocStyle.textAlignHorizontal === 'BOTTOM' ? 'MAX' : 'CENTER';
          }
          // Default horizontal positioning to Left
          row.primaryAxisAlignItems = 'MIN';

          const numFont = tocStyle.titleNumberFont || 'Inter';
          const numFontSize = tocStyle.titleNumberSize || 18;
          const numFontWeight = tocStyle.titleNumberWeight || 'Bold';
          const numColor = tocStyle.titleNumberColor ? hexToRgb(tocStyle.titleNumberColor) : { r: 0, g: 0, b: 0 };
          const numPos = tocStyle.titleNumberPos || 'left';
          const numLeadingZero = !!tocStyle.titleNumberLeadingZero;

          const safeNumFont = await loadFontIfNeeded(numFont, numFontWeight);
          const numText = figma.createText();
          // Use the original slide number from the UI
          let slideNumber = group.slide.number;
          let numStr = numLeadingZero && slideNumber < 10 ? ('0' + slideNumber) : String(slideNumber);
          if (!numLeadingZero) numStr = String(slideNumber);
          numText.characters = numStr;
          numText.fontSize = numFontSize || 18;
          numText.fontName = safeNumFont;
          numText.fills = [{ type: 'SOLID', color: numColor }];
          numText.textAutoResize = 'WIDTH_AND_HEIGHT';
          numText.textAlignHorizontal = 'RIGHT';
          numText.setPluginData('tocType', 'hero-number');

          const nameFont = tocStyle.heroFontFamily || 'Inter';
          const nameFontStyle = mapFontWeight(heroFontWeight);
          const safeNameFont = await loadFontIfNeeded(nameFont, nameFontStyle);
          const nameText = figma.createText();
          nameText.characters = group.slide.name || '[NO NAME]';
          nameText.fontSize = heroFontSize || 18;
          nameText.fontName = safeNameFont;
          nameText.fills = [{ type: 'SOLID', color: tocStyle.heroFontColor ? hexToRgb(tocStyle.heroFontColor) : { r: 0, g: 0, b: 0 } }];
          nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
          nameText.textAlignHorizontal = 'LEFT';
          nameText.setPluginData('linkedFrameId', group.slide.id);
          nameText.setPluginData('tocType', 'hero');

          if (numPos === 'right') {
            row.appendChild(nameText);
            row.appendChild(numText);
          } else {
            row.appendChild(numText);
            row.appendChild(nameText);
          }
          colFrame.appendChild(row);
        }

        // --- Progress update (throttled) ---
        const current = progressBase + idx + 1;
        await maybeSendProgress(current, totalCount);
      }
    }

    // Create multiple columns
    const colFrames = [];
    for (let i = 0; i < actualNumColumns; i++) {
      const colFrame = figma.createFrame();
      colFrame.layoutMode = 'VERTICAL';
      colFrame.primaryAxisSizingMode = 'AUTO';
      colFrame.counterAxisSizingMode = 'FIXED';
      colFrame.resize(tocStyle.columnWidth || 350, tocStyle.maxColumnHeight || 800);
      colFrame.itemSpacing = tocStyle.groupSpacing || 24;
      colFrame.fills = [];

      // Calculate offset for progress tracking
      const offset = columns.slice(0, i).reduce((sum, col) => sum + col.length, 0);
      await addGroupsToCol(columns[i], colFrame, offset, groupedSlides.length, offset);

      colFrames.push(colFrame);
      rowFrame.appendChild(colFrame);
    }
    parentFrame.appendChild(rowFrame);
  }
  // --- Root frame for the layout ---
  const tocRoot = figma.createFrame();
  tocRoot.name = '__TOC_AUTO__';
  tocRoot.setPluginData('isTOCFrame', 'true');
  tocRoot.layoutMode = 'VERTICAL';
  tocRoot.primaryAxisSizingMode = 'AUTO'; // Changed to AUTO for better height management
  tocRoot.counterAxisSizingMode = 'AUTO'; // Changed to AUTO for responsive width
  tocRoot.resize(1200, 800); // Initial size, will adjust based on content
  tocRoot.itemSpacing = tocStyle.groupSpacing || 24;
  tocRoot.paddingTop = 0;
  tocRoot.paddingBottom = 0;
  tocRoot.paddingLeft = 0;
  tocRoot.paddingRight = 0;
  tocRoot.fills = []; // No background
  // --- Build the selected layout ---
  await buildMultiColTOC(tocSlides, tocRoot);
  // --- Placement logic ---
  parentFrame.appendChild(tocRoot);
  try {
    if (parentFrame.layoutMode === 'NONE') {
      tocRoot.x = (parentFrame.width - tocRoot.width) / 2;
      tocRoot.y = (parentFrame.height - tocRoot.height) / 2;
    }
  } catch (e) {
    console.log('Could not set x/y on parent frame', e);
  }
  figma.viewport.scrollAndZoomIntoView([tocRoot]);
  figma.notify('TOC generated inside selected frame!');
  await saveTOCStructure(tocSlides);
  // --- Final progress update ---
  figma.ui.postMessage({ type: 'toc-progress', current: 1, total: 1 }); // fallback for empty
  figma.ui.postMessage({ type: 'toc-updated' });

  // Save the TOC structure for future use
  await saveTOCStructure(tocSlides);
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  // Trial and subscription messages
  if (msg.type === 'activate-license') {
    try {
      const { licenseKey } = msg;

      // Send request to UI for Gumroad API call
      figma.ui.postMessage({
        type: 'verify-gumroad-license',
        licenseKey: licenseKey,
        productId: 'bqqYJ_jE-zkEoFiryLblXQ=='
      });

    } catch (error) {
      console.error('Error in license activation:', error);
      figma.ui.postMessage({
        type: 'license-activated',
        success: false,
        error: 'Network error'
      });
    }
  }

  if (msg.type === 'gumroad-license-response') {
    // Handle Gumroad API response from UI

    // Simple result processing to avoid memory issues
    const result = {
      success: (msg.result && msg.result.success) || false,
      message: (msg.result && msg.result.message) || 'Unknown response'
    };

    // Smart license validation with expiry checking
    if (result.success) {
      // Check if we have purchase data for expiry validation
      if (msg.result && msg.result.purchase) {
        const purchase = msg.result.purchase;

        // Check Gumroad expiry date
        if (purchase.expires_at) {
          const expiryDate = new Date(purchase.expires_at);
          const now = new Date();

          if (expiryDate < now) {
            figma.ui.postMessage({
              type: 'license-activated',
              success: false,
              error: 'License has expired. Please purchase a new license.'
            });
            return;
          }
        }

        // Check if license is disabled
        if (purchase.disabled) {
          figma.ui.postMessage({
            type: 'license-activated',
            success: false,
            error: 'License has been disabled. Please contact support.'
          });
          return;
        }

        // Check if license is already in use (single-user protection)
        if (msg.result.uses && msg.result.uses > 1) {
          figma.ui.postMessage({
            type: 'license-activated',
            success: false,
            error: 'This license is already in use by another user. Please purchase your own license.'
          });
          return;
        }

        // Check if this is a single-user license
        if (purchase.uses_count && purchase.uses_count > 1) {
          figma.ui.postMessage({
            type: 'license-activated',
            success: false,
            error: 'This license has already been activated on another device. Please purchase a new license.'
          });
          return;
        }
      }

      // Use new safe premium license activation system
      const activationResult = await activatePremiumLicense(msg.licenseKey);

      if (activationResult.success) {
        // Update remaining time calculation
        updateTrialRemainingTime();

        // Send updated trial status immediately after successful activation
        figma.ui.postMessage({
          type: 'trial-status',
          trialState: {
            isTrialActive: trialState.isTrialActive,
            isSubscribed: trialState.isSubscribed,
            trialStartDate: trialState.trialStartDate,
            trialEndDate: trialState.trialEndDate,
            subscriptionExpiry: trialState.subscriptionExpiry,
            licenseKey: trialState.licenseKey,
            remainingDays: trialState.remainingDays,
            remainingHours: trialState.remainingHours,
            remainingMinutes: trialState.remainingMinutes,
            remainingSeconds: trialState.remainingSeconds
          }
        });

        figma.ui.postMessage({
          type: 'license-activated',
          success: true,
          message: activationResult.message,
          expirationDate: activationResult.expirationDate
        });
      } else {
        figma.ui.postMessage({
          type: 'license-activated',
          success: false,
          error: activationResult.message
        });
      }
    } else {
      // Convert technical error messages to user-friendly messages
      let userFriendlyMessage = 'Invalid license key';
      if (result.message) {
        if (result.message.includes('That license does not exist for the provided product')) {
          userFriendlyMessage = 'Invalid license key. Please check your license key and try again.';
        } else if (result.message.includes('License has expired')) {
          userFriendlyMessage = 'This license has expired. Please purchase a new license.';
        } else if (result.message.includes('License has been disabled')) {
          userFriendlyMessage = 'This license has been disabled. Please contact support.';
        } else if (result.message.includes('already in use by another user')) {
          userFriendlyMessage = 'This license is already in use by another user. Please purchase your own license.';
        } else if (result.message.includes('already been activated on another device')) {
          userFriendlyMessage = 'This license has already been activated on another device. Please purchase a new license.';
        } else if (result.message.includes('API call timed out')) {
          userFriendlyMessage = 'Connection timeout. Please check your internet connection and try again.';
        } else if (result.message.includes('Network error')) {
          userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          userFriendlyMessage = 'License verification failed. Please try again or contact support.';
        }
      }

      figma.ui.postMessage({
        type: 'license-activated',
        success: false,
        error: userFriendlyMessage
      });
    }
  }

  if (msg.type === 'validate-premium-license-response') {
    // Handle premium license validation response

    const result = {
      success: (msg.result && msg.result.success) || false,
      message: (msg.result && msg.result.message) || 'Unknown response'
    };

    if (!result.success) {
      // Reset to non-premium status
      trialState.isSubscribed = false;
      trialState.licenseKey = null;
      trialState.licenseActivationDate = null;
      trialState.subscriptionExpiry = null;

      await saveTrialState();

      // Notify user
      figma.notify('Premium license has expired. Please purchase a new license.', { error: true });
    }
  }

  if (msg.type === 'save-license-state') {
    // Save license state to Figma storage
    try {
      await figma.clientStorage.setAsync('licenseState', msg.licenseData);
    } catch (error) {
      console.error('Error saving license state:', error);
    }
  }

  if (msg.type === 'get-license-state') {
    // Get saved license state from Figma storage
    try {
      const licenseState = await figma.clientStorage.getAsync('licenseState');
      if (licenseState) {
        figma.ui.postMessage({
          type: 'license-state-loaded',
          licenseState: licenseState
        });
      }
    } catch (error) {
      console.error('Error getting license state:', error);
    }
  }

  if (msg.type === 'remove-license-state') {
    // Remove license state from Figma storage - SIMULATES PREMIUM EXPIRY
    try {
      await figma.clientStorage.deleteAsync('licenseState');

      // Reset trial state to EXPIRED status (not new trial)
      trialState.isSubscribed = false;
      trialState.isTrialActive = false; // IMPORTANT: Set to false to simulate expired status
      trialState.licenseKey = null;
      trialState.licenseActivationDate = null;
      trialState.subscriptionExpiry = null;

      await saveTrialState();

      // Send updated trial status to UI
      figma.ui.postMessage({
        type: 'trial-status',
        trialState: {
          isTrialActive: false, // IMPORTANT: Set to false for expired status
          isSubscribed: false,
          trialStartDate: trialState.trialStartDate,
          trialEndDate: trialState.trialEndDate,
          subscriptionExpiry: null,
          licenseKey: null,
          remainingDays: 0,
          remainingHours: 0,
          remainingMinutes: 0,
          remainingSeconds: 0
        }
      });

    } catch (error) {
      console.error('Error simulating premium expiry:', error);
    }
  }

  if (msg.type === 'clear-all-storage') {
    // Clear ALL storage completely (for reset command)
    try {
      // Clear safe storage system completely
      pluginStorage = {
        isPremium: false,
        expirationTimestamp: null,
        usedLicenseKeys: []
      };
      await savePluginStorage();

      // Clear all Figma client storage
      await figma.clientStorage.deleteAsync('pluginAccess');
      await figma.clientStorage.deleteAsync('trialState');
      await figma.clientStorage.deleteAsync('licenseState');
      await figma.clientStorage.deleteAsync('customTOC');
      await figma.clientStorage.deleteAsync('pendingTOCOptions');

      // Reset trial state to default
      trialState = {
        isTrialActive: false,
        trialStartDate: null,
        trialEndDate: null,
        isSubscribed: false,
        subscriptionExpiry: null,
        remainingDays: 0,
        remainingHours: 0,
        remainingMinutes: 0,
        remainingSeconds: 0
      };

      console.log('ALL storage and licenses cleared successfully');

    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }

  if (msg.type === 'clear-plugin-storage') {
    // Clear safe storage system (for reset command)
    try {
      pluginStorage.isPremium = false;
      pluginStorage.expirationTimestamp = null;
      pluginStorage.usedLicenseKeys = [];
      await savePluginStorage();

      console.log('Plugin storage cleared successfully');

    } catch (error) {
      console.error('Error clearing plugin storage:', error);
    }
  }

  if (msg.type === 'save-trial-state') {
    // Save trial state from UI (for admin commands)
    try {
      trialState = Object.assign({}, trialState, msg.trialState);
      await saveTrialState();

      // Send updated trial status to UI
      figma.ui.postMessage({
        type: 'trial-status',
        trialState: {
          isTrialActive: trialState.isTrialActive,
          isSubscribed: trialState.isSubscribed,
          trialStartDate: trialState.trialStartDate,
          trialEndDate: trialState.trialEndDate,
          subscriptionExpiry: trialState.subscriptionExpiry,
          licenseKey: trialState.licenseKey,
          remainingDays: trialState.remainingDays,
          remainingHours: trialState.remainingHours,
          remainingMinutes: trialState.remainingMinutes,
          remainingSeconds: trialState.remainingSeconds
        }
      });

    } catch (error) {
      console.error('Error saving trial state:', error);
    }
  }

  if (msg.type === 'set-premium-expiration') {
    // Set premium expiration for testing (#end command)
    try {
      const { expirationTimestamp } = msg;

      // Set plugin storage with short expiration
      pluginStorage.isPremium = true;
      pluginStorage.expirationTimestamp = expirationTimestamp;
      await savePluginStorage();

      // Update trial state to match
      trialState.isSubscribed = true;
      trialState.isTrialActive = false;
      trialState.subscriptionExpiry = new Date(expirationTimestamp).toISOString();
      await saveTrialState();

      // Update remaining time calculation
      updateTrialRemainingTime();

      // Send updated trial status to UI
      figma.ui.postMessage({
        type: 'trial-status',
        trialState: {
          isTrialActive: trialState.isTrialActive,
          isSubscribed: trialState.isSubscribed,
          trialStartDate: trialState.trialStartDate,
          trialEndDate: trialState.trialEndDate,
          subscriptionExpiry: trialState.subscriptionExpiry,
          licenseKey: trialState.licenseKey,
          remainingDays: trialState.remainingDays,
          remainingHours: trialState.remainingHours,
          remainingMinutes: trialState.remainingMinutes,
          remainingSeconds: trialState.remainingSeconds
        }
      });

      console.log('⚡ Premium expiration set to:', new Date(expirationTimestamp));

    } catch (error) {
      console.error('Error setting premium expiration:', error);
    }
  }

  if (msg.type === 'validate-premium-license') {
    // Handle premium license validation request
    try {
      const { licenseKey } = msg;

      // Send request to UI for Gumroad API call
      figma.ui.postMessage({
        type: 'verify-gumroad-license',
        licenseKey: licenseKey,
        productId: 'bqqYJ_jE-zkEoFiryLblXQ=='
      });

    } catch (error) {
      console.error('Error in premium license validation:', error);
    }
  }

  if (msg.type === 'get-trial-status') {
    updateTrialRemainingTime();
    figma.ui.postMessage({
      type: 'trial-status',
      trialState: {
        isTrialActive: trialState.isTrialActive,
        isSubscribed: trialState.isSubscribed,
        trialStartDate: trialState.trialStartDate,
        trialEndDate: trialState.trialEndDate,
        remainingDays: trialState.remainingDays,
        remainingHours: trialState.remainingHours,
        remainingMinutes: trialState.remainingMinutes,
        remainingSeconds: trialState.remainingSeconds
      }
    });
  }

  // Test message handlers removed for production

  if (msg.type === 'get-frames') {
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Trial expired.' });
      return;
    }
    // If msg.forTOC is true, filter for TOC; otherwise, show all slides
    console.log('get-frames called with forTOC:', !!msg.forTOC, 'thenGenerateTOC:', !!msg.thenGenerateTOC);
    sendFramesToUI(msg.direction, !!msg.forTOC);

    // If thenGenerateTOC is true, we'll generate TOC after sending frames
    if (msg.thenGenerateTOC) {
      // Store the options for later use
      figma.clientStorage.setAsync('pendingTOCOptions', msg.options);
    }
  }
  if (msg.type === 'clear-toc-data') {
    // Clear saved TOC data
    figma.clientStorage.deleteAsync('customTOC');
    figma.ui.postMessage({ type: 'toc-data-cleared' });
  }
  if (msg.type === 'generate-toc') {
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'toc-error', error: 'Trial expired.' });
      return;
    }
    const structure = getDocumentStructure();
    const tocText = generateTOC(structure, msg.options);
    await ensureFont(msg.options.fontWeight);
    createOrUpdateTOC(tocText, msg.options);
    figma.ui.postMessage({ type: 'toc-updated' });
  }
  if (msg.type === 'get-structure') {
    const structure = getDocumentStructure();
    figma.ui.postMessage({ type: 'structure', structure });
  }
  if (msg.type === 'notify') {
    figma.notify(msg.message, msg.options || {});
  }
  if (msg.type === 'close') {
    figma.closePlugin();
  }
  if (msg.type === 'add-slide-numbers') {
    // Check trial status
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Trial expired. Please upgrade.' });
      return;
    }
    // Use direction and numberStyle from UI
    const frames = getFramesOnCurrentPage();
    // Only use visible and unlocked frames
    const orderedFrames = orderFrames(frames.filter(f => !f.locked && f.visible !== false), msg.direction);
    const style = msg.numberStyle || { font: 'Inter', size: 16, weight: 'Regular', color: '#111111', pos: 'top-left', leadingZero: true };
    if (!orderedFrames.length) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'No frames found on this page.' });
      return;
    }
    // Remove all old number nodes
    clearAllSlideNumbers();
    let added = 0;
    for (let i = 0; i < orderedFrames.length; i++) {
      const frame = orderedFrames[i];
      try {
        // Map UI weight to Figma font style
        let fontStyle = style.weight;
        if (fontStyle === 'Regular' || fontStyle === 'Bold') {
          // Use as is
        } else {
          fontStyle = 'Regular';
        }
        await figma.loadFontAsync({ family: style.font, style: fontStyle });
        const numNode = figma.createText();
        let numStr = String(i + 1);
        let numLeadingZero = style.leadingZero !== false;
        numStr = numLeadingZero && numStr.length < 2 ? '0' + numStr : String(numStr);
        numNode.name = `__SLIDE_NUMBER__${i + 1}`;
        numNode.characters = numStr;
        console.log('Created slide number node:', numNode.name, 'with characters:', numNode.characters);
        numNode.fontSize = style.size;
        numNode.fontName = { family: style.font, style: fontStyle };
        // Robust hex color conversion
        let rgb;
        try {
          rgb = hexToRgb(style.color);
        } catch (e) {
          rgb = { r: 0, g: 0, b: 0 };
        }
        numNode.fills = [{ type: 'SOLID', color: rgb }];
        numNode.textAutoResize = 'WIDTH_AND_HEIGHT';
        frame.appendChild(numNode);
        // Place number node according to selected position
        const pos = getNumberPosition(style.pos, frame, numNode, style.size);
        numNode.x = pos.x;
        numNode.y = pos.y;
        added++;
      } catch (e) {
        console.log('Error adding number to frame:', frame.name, e);
        figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Font load or node creation failed.' });
      }
    }
    if (added === 0) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'No numbers added. Check if frames are locked or invisible.' });
    } else {
      figma.ui.postMessage({ type: 'slide-numbers-added' });
    }
  }
  if (msg.type === 'fix-slide-numbers') {
    // Check trial status
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Trial expired. Please upgrade.' });
      return;
    }
    // Fix numbering by renumbering all slides sequentially (removes gaps)
    const frames = getFramesOnCurrentPage();
    // Only use visible and unlocked frames
    const orderedFrames = orderFrames(frames.filter(f => !f.locked && f.visible !== false), msg.direction);
    const style = msg.numberStyle || { font: 'Inter', size: 16, weight: 'Regular', color: '#111111', pos: 'top-left', leadingZero: true };

    if (!orderedFrames.length) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'No frames found on this page.' });
      return;
    }

    // Remove all old number nodes first
    clearAllSlideNumbers();
    let added = 0;

    // Renumber all frames sequentially starting from 1
    for (let i = 0; i < orderedFrames.length; i++) {
      const frame = orderedFrames[i];
      try {
        // Map UI weight to Figma font style
        let fontStyle = style.weight;
        if (fontStyle === 'Regular' || fontStyle === 'Bold') {
          // Use as is
        } else {
          fontStyle = 'Regular';
        }
        await figma.loadFontAsync({ family: style.font, style: fontStyle });
        const numNode = figma.createText();
        let numStr = String(i + 1); // Sequential numbering starting from 1
        let numLeadingZero = style.leadingZero !== false;
        numStr = numLeadingZero && numStr.length < 2 ? '0' + numStr : String(numStr);
        numNode.name = `__SLIDE_NUMBER__${i + 1}`;
        numNode.characters = numStr;
        console.log('Fixed slide number node:', numNode.name, 'with characters:', numNode.characters);
        numNode.fontSize = style.size;
        numNode.fontName = { family: style.font, style: fontStyle };
        // Robust hex color conversion
        let rgb;
        try {
          rgb = hexToRgb(style.color);
        } catch (e) {
          rgb = { r: 0, g: 0, b: 0 };
        }
        numNode.fills = [{ type: 'SOLID', color: rgb }];
        numNode.textAutoResize = 'WIDTH_AND_HEIGHT';
        frame.appendChild(numNode);
        // Place number node according to selected position
        const pos = getNumberPosition(style.pos, frame, numNode, style.size);
        numNode.x = pos.x;
        numNode.y = pos.y;
        added++;
      } catch (e) {
        console.log('Error fixing number for frame:', frame.name, e);
        figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Font load or node creation failed.' });
      }
    }

    if (added === 0) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'No numbers fixed. Check if frames are locked or invisible.' });
    } else {
      figma.ui.postMessage({ type: 'slide-numbers-fixed', count: added });
    }
  }
  if (msg.type === 'remove-all-numbers') {
    // Check trial status
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Trial expired.' });
      return;
    }
    clearAllSlideNumbers();
    figma.ui.postMessage({ type: 'slide-numbers-removed' });
  }
  if (msg.type === 'start-numbering-from') {
    // Check trial status
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Trial expired.' });
      return;
    }
    // New: Start numbering from the selected frameId
    const frames = getFramesOnCurrentPage();
    // Only use visible and unlocked frames
    const direction = typeof msg.direction === 'string' ? msg.direction : 'z';
    const numberStyle = msg.numberStyle || { font: 'Inter', size: 16, weight: 'Regular', color: '#111111', pos: 'top-left', leadingZero: true };
    const orderedFrames = orderFrames(frames.filter(f => !f.locked && f.visible !== false), direction);
    const startIdx = orderedFrames.findIndex(f => f.id === msg.frameId);
    if (startIdx === -1) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Frame not found.' });
      return;
    }
    clearAllSlideNumbers();
    let added = 0;
    for (let i = startIdx; i < orderedFrames.length; i++) {
      const frame = orderedFrames[i];
      try {
        let fontStyle = numberStyle.weight;
        if (fontStyle !== 'Regular' && fontStyle !== 'Bold') fontStyle = 'Regular';
        await figma.loadFontAsync({ family: numberStyle.font, style: fontStyle });
        const numNode = figma.createText();
        let numStr = String(i - startIdx + 1);
        let numLeadingZero = numberStyle.leadingZero !== false;
        numStr = numLeadingZero && numStr.length < 2 ? '0' + numStr : String(numStr);
        numNode.name = `__SLIDE_NUMBER__${i - startIdx + 1}`;
        numNode.characters = numStr;
        numNode.fontSize = numberStyle.size;
        numNode.fontName = { family: numberStyle.font, style: fontStyle };
        let rgb;
        try {
          rgb = hexToRgb(numberStyle.color);
        } catch (e) {
          rgb = { r: 0, g: 0, b: 0 };
        }
        numNode.fills = [{ type: 'SOLID', color: rgb }];
        numNode.textAutoResize = 'WIDTH_AND_HEIGHT';
        frame.appendChild(numNode);
        const pos = getNumberPosition(numberStyle.pos, frame, numNode, numberStyle.size);
        numNode.x = pos.x;
        numNode.y = pos.y;
        added++;
      } catch (e) {
        console.log('Error adding number to frame:', frame.name, e);
        figma.ui.postMessage({ type: 'slide-numbers-error', error: 'Font load or node creation failed.' });
      }
    }
    if (added === 0) {
      figma.ui.postMessage({ type: 'slide-numbers-error', error: 'No numbers added. Check if frames are locked or invisible.' });
    } else {
      figma.ui.postMessage({ type: 'slide-numbers-added' });
    }
  }
  if (msg.type === 'update-slide-names') {
    // msg.slides: [{id, name}]
    const frames = getFramesOnCurrentPage();
    let updated = 0;
    for (const slide of msg.slides) {
      const frame = frames.find(f => f.id === slide.id);
      if (frame && frame.name !== slide.name) {
        frame.name = slide.name;
        updated++;
      }
    }
    // After updating, send the new frame list to UI
    sendFramesToUI('z');
  }
  if (msg.type === 'get-saved-toc') {
    // Try to load from clientStorage
    const saved = await loadTOCStructure();
    if (saved && Array.isArray(saved) && saved.length > 0) {
      figma.ui.postMessage({ type: 'custom-toc-loaded', toc: saved });
    } else {
      // If no saved TOC, try to read from the __TOC_AUTO__ frame if it exists (optional, for advanced restoration)
      // Otherwise, fallback to detected slides
      figma.ui.postMessage({ type: 'custom-toc-loaded', toc: [] });
    }
  }
  if (msg.type === 'save-toc-structure') {
    await saveTOCStructure(msg.toc);
  }
  // --- [ENFORCED] Always use UI-provided slides for TOC generation ---
  // In generate-toc-autolayout and regenerate-toc, always use msg.slides as the source of truth for TOC structure.
  // Never fallback to auto-detection unless slides is empty or not provided.
  if (msg.type === 'generate-toc-autolayout' || msg.type === 'regenerate-toc') {
    console.log('=== TOC GENERATION REQUEST RECEIVED ===');
    console.log('Message type:', msg.type);
    console.log('Slides count:', msg.slides ? msg.slides.length : 0);
    console.log('Slides data:', msg.slides);
    console.log('Options:', msg.options);
    console.log('Start frame ID:', msg.startFrameId);

    // Check trial status for premium features
    if (!canUsePremiumFeatures()) {
      figma.ui.postMessage({
        type: 'toc-error',
        error: '😔 Trial expired. Please upgrade to continue using premium TOC features.'
      });
      return;
    }

    try {
      await generateTOCFrame(msg.slides, msg.options, msg.startFrameId);
    } catch (error) {
      console.error('TOC generation error:', error);
      figma.ui.postMessage({ type: 'toc-error', error: 'Failed to generate TOC: ' + error.message });
    }
  }
  if (msg.type === 'save-styling-settings') {
    await figma.clientStorage.setAsync('tocStylingSettings', msg.settings);
  }
  if (msg.type === 'save-toc-settings') {
    await figma.clientStorage.setAsync('tocSettings', msg.settings);
  }
  if (msg.type === 'get-styling-settings') {
    const settings = await figma.clientStorage.getAsync('tocStylingSettings');
    figma.ui.postMessage({ type: 'styling-settings', settings });
  }
  if (msg.type === 'get-toc-settings') {
    const settings = await figma.clientStorage.getAsync('tocSettings');
    figma.ui.postMessage({ type: 'toc-settings', settings });
  }
  if (msg.type === 'update-toc-style-targeted') {
    // Check trial status
    if (!canUsePremiumFeatures()) return;

    const targetType = msg.targetType || '';
    const options = msg.options || {};

    console.log('🎯 DEBUG: Target Type:', targetType);
    console.log('🎯 DEBUG: Options received:', options);

    const tocRoot = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
    console.log('🎯 DEBUG: tocRoot found?', !!tocRoot);
    if (!tocRoot) {
      console.log('🎯 No TOC frame found on current page:', figma.currentPage.name);
      // Only regenerate if the frame is missing
      figma.ui.postMessage({ type: 'regenerate-toc', options, slides: msg.slides });
      return;
    }

    // MAGIC: Only update the specific target type
    function mapFontWeight(style) {
      if (style === 'Bold' || style === '700') return 'Bold';
      if (style === 'Semi Bold' || style === '600') return 'Semi Bold';
      return 'Regular';
    }

    async function updateSpecificNodes(node, depth = 0) {
      if (node.type === 'TEXT') {
        const tocType = node.getPluginData('tocType');

        // Match logging
        if (tocType === targetType) {
          console.log(`✅ MATCH: Updating ${targetType} node: "${node.characters}"`);
          switch (targetType) {
            case 'hero':
              try {
                if (options.heroFontFamily && options.heroFontWeight) {
                  const style = mapFontWeight(options.heroFontWeight);
                  const safeNameFont = await loadFontIfNeeded(options.heroFontFamily, style);
                  node.fontName = safeNameFont;
                }
              } catch (e) {
                console.log(`⚠️ Failed to load font ${options.heroFontFamily}:`, e);
              }
              if (options.heroFontColor) node.fills = [{ type: 'SOLID', color: hexToRgb(options.heroFontColor) }];
              if (options.heroFontSize) node.fontSize = options.heroFontSize;
              node.textAutoResize = 'WIDTH_AND_HEIGHT';
              console.log(`✨ Applied hero style to: "${node.characters}"`);
              break;

            case 'hero-number':
              try {
                if (options.titleNumberFont && options.titleNumberWeight) {
                  const style = mapFontWeight(options.titleNumberWeight);
                  const safeNumFont = await loadFontIfNeeded(options.titleNumberFont, style);
                  node.fontName = safeNumFont;
                }
              } catch (e) {
                console.log('⚠️ Failed to load hero-number font:', e);
              }
              if (options.titleNumberColor) node.fills = [{ type: 'SOLID', color: hexToRgb(options.titleNumberColor) }];
              if (options.titleNumberSize) node.fontSize = options.titleNumberSize;
              node.textAutoResize = 'WIDTH_AND_HEIGHT';

              // Update number text for leading zero
              var num = node.characters.replace(/^(0?\d+)$/, '$1');
              var numVal = parseInt(num, 10);
              if (!!options.titleNumberLeadingZero && numVal < 10) {
                node.characters = (numVal < 10 ? ('0' + numVal) : String(numVal));
              } else {
                node.characters = String(numVal);
              }
              break;

            case 'sub':
              try {
                if (options.subTitleFont && options.subTitleWeight) {
                  const style = mapFontWeight(options.subTitleWeight);
                  const safeSubNameFont = await loadFontIfNeeded(options.subTitleFont, style);
                  node.fontName = safeSubNameFont;
                }
              } catch (e) {
                console.log('⚠️ Failed to load subtitle font:', e);
              }
              if (options.subTitleColor) node.fills = [{ type: 'SOLID', color: hexToRgb(options.subTitleColor) }];
              if (options.subTitleSize) node.fontSize = options.subTitleSize;
              if (typeof options.subIndent === 'number' && node.parent && node.parent.type === 'FRAME') {
                node.parent.paddingLeft = options.subIndent; // Fixed: No depth multiplier needed for this layout
              }
              break;

            case 'sub-number':
              try {
                if (options.subNumberFont && options.subNumberWeight) {
                  const style = mapFontWeight(options.subNumberWeight);
                  const safeSubNumFont = await loadFontIfNeeded(options.subNumberFont, style);
                  node.fontName = safeSubNumFont;
                }
              } catch (e) {
                console.log('⚠️ Failed to load sub-number font:', e);
              }
              if (options.subNumberColor) node.fills = [{ type: 'SOLID', color: hexToRgb(options.subNumberColor) }];
              if (options.subNumberSize) node.fontSize = options.subNumberSize;

              // Update number text for leading zero
              var sNum = node.characters.replace(/^(0?\d+)$/, '$1');
              var sNumVal = parseInt(sNum, 10);
              if (!!options.subNumberLeadingZero && sNumVal < 10) {
                node.characters = (sNumVal < 10 ? ('0' + sNumVal) : String(sNumVal));
              } else {
                node.characters = String(sNumVal);
              }
              break;
          }
        }
      }
      if ('children' in node) {
        const promises = [];
        for (const child of node.children) {
          promises.push(updateSpecificNodes(child, node.type === 'FRAME' && node.parent === tocRoot ? 0 : depth + 1));
        }
        await Promise.all(promises);
      }
    }

    await updateSpecificNodes(tocRoot, 0);
    figma.notify(`TOC ${targetType} style updated!`);
    return;
  }

  if (msg.type === 'update-toc-text') {
    const tocRoot = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
    if (!tocRoot) return;

    function updateNodeText(node) {
      if (node.type === 'TEXT' && node.getPluginData('linkedFrameId') === msg.slideId) {
        node.characters = msg.newName;
      }
      if ('children' in node) {
        node.children.forEach(updateNodeText);
      }
    }
    updateNodeText(tocRoot);
  }
  if (msg.type === 'update-all-text-style') {
    const tocRoot = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
    if (tocRoot) {
      await updateTextNodesStyle(tocRoot, msg.styleOptions || {});
      figma.notify('All TOC text nodes updated!');
    } else {
      figma.notify('TOC frame not found.');
    }
    return;
  }
  if (msg.type === 'update-slide-number-style') {
    // Update style of all slide number nodes (__SLIDE_NUMBER__*) on the current page
    const nodes = figma.currentPage.findAll(n => n.type === 'TEXT' && /^__SLIDE_NUMBER__\d+$/.test(n.name));
    for (const node of nodes) {
      if (msg.styleOptions.fontFamily && msg.styleOptions.fontWeight) {
        await safeSetFont(node, msg.styleOptions.fontFamily, msg.styleOptions.fontWeight);
      }
      if (msg.styleOptions.fontSize) node.fontSize = msg.styleOptions.fontSize;
      if (msg.styleOptions.color) node.fills = [{ type: 'SOLID', color: msg.styleOptions.color }];
      if (msg.styleOptions.textAutoResize) node.textAutoResize = msg.styleOptions.textAutoResize;
      if (msg.styleOptions.textAlignHorizontal) node.textAlignHorizontal = msg.styleOptions.textAlignHorizontal;
      // Update position if requested
      if (msg.styleOptions.pos && node.parent && node.parent.type === 'FRAME') {
        // Use getNumberPosition to recalculate x/y
        const frame = node.parent;
        const pos = getNumberPosition(msg.styleOptions.pos, frame, node, node.fontSize);
        node.x = pos.x;
        node.y = pos.y;
      }

      // Update leading zero if requested
      if (msg.styleOptions.leadingZero !== undefined) {
        const currentNumber = parseInt(node.characters.replace(/\D/g, ''), 10);
        if (!isNaN(currentNumber)) {
          if (msg.styleOptions.leadingZero) {
            // Add leading zero for numbers < 10
            node.characters = currentNumber < 10 ? `0${currentNumber}` : String(currentNumber);
          } else {
            // Remove leading zero
            node.characters = String(currentNumber);
          }
        }
      }
    }
    figma.notify('Slide number style updated!');
    return;
  }
  if (msg.type === 'update-toc-layout') {
    await figma.clientStorage.setAsync('tocLayoutOptions', msg.layoutOptions);
    const slides = await figma.clientStorage.getAsync('customTOC') || [];
    const styleOptions = await figma.clientStorage.getAsync('tocStylingSettings') || {};
    var options = {};
    for (var k in styleOptions) if (Object.prototype.hasOwnProperty.call(styleOptions, k)) options[k] = styleOptions[k];
    for (var k in msg.layoutOptions) if (Object.prototype.hasOwnProperty.call(msg.layoutOptions, k)) options[k] = msg.layoutOptions[k];
    if (slides.length > 0) {
      await generateTOCFrame(slides, options);
    }
    figma.ui.postMessage({ type: 'toc-layout-updated', layoutOptions: msg.layoutOptions });
  }
  if (msg.type === 'update-toc-layout-live') {
    const tocRoot = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
    if (!tocRoot) return;

    // Helper to map UI alignment to Figma enum
    function mapAlign(val) {
      if (!val) return undefined;
      if (val === 'left' || val === 'start') return 'MIN';
      if (val === 'right' || val === 'end') return 'MAX';
      if (val === 'center') return 'CENTER';
      if (val === 'space-between') return 'SPACE_BETWEEN';
      return undefined;
    }

    // --- Apply root frame padding ---
    if (typeof msg.layoutOptions.paddingTop === 'number') tocRoot.paddingTop = msg.layoutOptions.paddingTop;
    if (typeof msg.layoutOptions.paddingBottom === 'number') tocRoot.paddingBottom = msg.layoutOptions.paddingBottom;
    if (typeof msg.layoutOptions.paddingLeft === 'number') tocRoot.paddingLeft = msg.layoutOptions.paddingLeft;
    if (typeof msg.layoutOptions.paddingRight === 'number') tocRoot.paddingRight = msg.layoutOptions.paddingRight;

    // --- Columns frame (horizontal row containing columns) ---
    const rowFrame = tocRoot.children.find(n => n.type === 'FRAME' && n.layoutMode === 'HORIZONTAL');
    if (rowFrame) {
      // Update column spacing
      if (typeof msg.layoutOptions.columnSpacing === 'number') rowFrame.itemSpacing = msg.layoutOptions.columnSpacing;
      if (msg.layoutOptions.counterAxisAlign) rowFrame.counterAxisAlignItems = mapAlign(msg.layoutOptions.counterAxisAlign);
    }

    // --- Update column frames (vertical frames containing groups) ---
    const colFrames = rowFrame ? rowFrame.children.filter(n => n.type === 'FRAME' && n.layoutMode === 'VERTICAL') : [];
    colFrames.forEach(colFrame => {
      // Update group spacing
      if (typeof msg.layoutOptions.groupSpacing === 'number') colFrame.itemSpacing = msg.layoutOptions.groupSpacing;

      // Update column width and height
      if (typeof msg.layoutOptions.columnWidth === 'number' || typeof msg.layoutOptions.maxColumnHeight === 'number') {
        const newWidth = msg.layoutOptions.columnWidth || colFrame.width;
        const newHeight = msg.layoutOptions.maxColumnHeight || colFrame.height;
        colFrame.resize(newWidth, newHeight);
      }

      // Update group frames (frames containing title + subtitles)
      colFrame.children.forEach(groupFrame => {
        if (groupFrame.type === 'FRAME' && groupFrame.layoutMode === 'VERTICAL') {
          // Update group padding
          if (typeof msg.layoutOptions.groupPadding === 'number') {
            groupFrame.paddingTop = msg.layoutOptions.groupPadding;
            groupFrame.paddingBottom = msg.layoutOptions.groupPadding;
          }

          // Update title row spacing
          const titleRow = groupFrame.children.find(n => n.type === 'FRAME' && n.layoutMode === 'HORIZONTAL');
          if (titleRow && typeof msg.layoutOptions.titleSpacing === 'number') {
            titleRow.itemSpacing = msg.layoutOptions.titleSpacing;
          }

          // Update subtitle rows
          groupFrame.children.forEach(child => {
            if (child.type === 'FRAME' && child.layoutMode === 'HORIZONTAL' && child !== titleRow) {
              // This is a subtitle row
              if (typeof msg.layoutOptions.subtitleSpacing === 'number') {
                child.itemSpacing = msg.layoutOptions.subtitleSpacing;
              }
              if (typeof msg.layoutOptions.subIndent === 'number') {
                child.paddingLeft = msg.layoutOptions.subIndent;
              }
            }
          });

          // Also update the subIndent in tocSettings for style updates
          if (typeof msg.layoutOptions.subIndent === 'number') {
            // Send a targeted style update for subtitle indentation
            figma.ui.postMessage({
              type: 'update-toc-style-targeted',
              targetType: 'sub',
              options: {
                subIndent: msg.layoutOptions.subIndent
              },
              slides: slides
            });
          }
        }
      });
    });

    // --- Update row alignment ---
    if (msg.layoutOptions.textAlignHorizontal) {
      // Apply alignment to all row frames (horizontal frames containing number + text)
      function updateRowAlignment(node) {
        if (node.type === 'FRAME' && node.layoutMode === 'HORIZONTAL') {
          // New "Row Alignment" controls vertical positioning (counter-axis)
          node.counterAxisAlignItems = msg.layoutOptions.textAlignHorizontal === 'TOP' ? 'MIN' :
            msg.layoutOptions.textAlignHorizontal === 'BOTTOM' ? 'MAX' : 'CENTER';
          // Fixed horizontal positioning (primary-axis)
          node.primaryAxisAlignItems = 'MIN';
        }
        // Recurse through children
        if (node.children) {
          node.children.forEach(updateRowAlignment);
        }
      }
      updateRowAlignment(tocRoot);
    }

    // Always enforce 0 padding in live updates now
    tocRoot.paddingTop = 0;
    tocRoot.paddingBottom = 0;
    tocRoot.paddingLeft = 0;
    tocRoot.paddingRight = 0;

    // --- Live number positioning: reorder children in title/subtitle rows ---
    function reorderNumberPosition(frame, options) {
      if (!frame || !frame.children) return;
      for (const child of frame.children) {
        if (child.type === 'FRAME' && child.layoutMode === 'HORIZONTAL' && child.children.length === 2) {
          // Find which child is number and which is text
          const n0 = child.children[0];
          const n1 = child.children[1];
          const t0 = n0.getPluginData ? n0.getPluginData('tocType') : '';
          const t1 = n1.getPluginData ? n1.getPluginData('tocType') : '';

          // Title row
          if ((t0 === 'hero-number' && t1 === 'hero') || (t0 === 'hero' && t1 === 'hero-number')) {
            const wantRight = options.titleNumberPos === 'right';
            if ((t0 === 'hero-number' && wantRight && child.children[1] !== n0) ||
              (t1 === 'hero-number' && !wantRight && child.children[0] !== n1)) {
              child.insertChild(0, child.children[1]);
            }
          }

          // Subtitle row
          if ((t0 === 'sub-number' && t1 === 'sub') || (t0 === 'sub' && t1 === 'sub-number')) {
            const wantRight = options.subtitleNumberPos === 'right' || options.subNumberPos === 'right';
            if ((t0 === 'sub-number' && wantRight && child.children[1] !== n0) ||
              (t1 === 'sub-number' && !wantRight && child.children[0] !== n1)) {
              child.insertChild(0, child.children[1]);
            }
          }
        }

        // Recurse (but limit to depth 1 to prevent sub-sub-slides)
        if (!frame.getPluginData || frame.getPluginData('tocType') !== 'sub') {
          reorderNumberPosition(child, options);
        }
      }
    }
    reorderNumberPosition(tocRoot, msg.layoutOptions);

    figma.notify('TOC layout updated!');
    return;
  }

  if (msg.type === 'regenerate-toc') {
    // Regenerate the entire TOC with new settings
    const existingTOC = figma.currentPage.findOne(node => node.getPluginData && node.getPluginData('isTOCFrame') === 'true');
    if (existingTOC) {
      const parentNode = existingTOC.parent;
      existingTOC.remove();
      if (parentNode && parentNode.type === 'FRAME') {
        figma.currentPage.selection = [parentNode];
      }
    }

    // Get current TOC settings, prioritizing freshly sent UI options over stored settings to avoid race conditions
    let optionsToUse = msg.options;
    if (!optionsToUse) {
      optionsToUse = await figma.clientStorage.getAsync('tocSettings') || {};
    }

    const slides = msg.slides || [];

    if (slides.length > 0) {
      await generateTOCFrame(slides, optionsToUse);
      figma.notify('TOC regenerated with new settings!');
    }
    return;
  }
};

// On plugin open, send initial frame list (Z-order) and saved TOC
try {
  sendFramesToUI('z');
  sendSavedTOCToUI();
} catch (error) {
  console.error('Error sending initial data to UI:', error);
}

// Initialize trial and subscription
try {
  initializeTrialAndSubscription();
} catch (error) {
  console.error('Error initializing trial and subscription:', error);
  // Set basic trial state as fallback
  trialState.isTrialActive = true;
  trialState.trialStartDate = new Date().toISOString();
  trialState.trialEndDate = new Date(Date.now() + (TRIAL_DAYS * 24 * 60 * 60 * 1000)).toISOString();
}

// --- On plugin startup: synchronize TOC text nodes with current slide names ---
(function syncTOCWithSlides() {
  try {
    const tocTextNodeMap = getTOCTextNodeMap();
    for (const frameId in tocTextNodeMap) {
      const textNode = tocTextNodeMap[frameId];
      // Find the frame by ID in the current page (or all pages for robustness)
      let frame = null;
      for (const page of figma.root.children) {
        if (page.type !== 'PAGE') continue;
        frame = page.findOne && page.findOne(n => n.id === frameId && n.type === 'FRAME');
        if (frame) break;
      }
      if (frame && textNode.characters.replace(/^([\d.]+\s)?(.+)$/, '$2') !== frame.name) {
        // Preserve numbering if present, only replace the name part
        textNode.characters = textNode.characters.replace(/^([\d.]+\s)?(.+)$/, (m, num, oldName) => {
          if (num) return num + frame.name;
          return frame.name;
        });
        textNode.name = frame.name;
      }
    }
  } catch (e) {
    console.error('TOC sync error:', e);
  }
})();

// Cleanup function to prevent memory leaks
function cleanup() {
  // No global variables to clean up with direct messaging approach
}

// Call cleanup when plugin is closed
figma.on('close', cleanup);

// --- Persistent TOC text node mapping for renaming ---
function getTOCTextNodeMap() {
  // Find the TOC frame by pluginData or fallback to name
  let tocFrame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.getPluginData && n.getPluginData('isTOCFrame') === 'true');
  if (!tocFrame) {
    tocFrame = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
  }
  if (!tocFrame) return {};
  const allTextNodes = tocFrame.findAll(n => n.type === 'TEXT' && n.getPluginData('linkedFrameId'));
  const map = {};
  for (const textNode of allTextNodes) {
    const frameId = textNode.getPluginData('linkedFrameId');
    if (frameId) map[frameId] = textNode;
  }
  return map;
}

// --- Live-linking: Listen for frame name changes and update TOC text ---
// Load all pages first to enable document change handler in incremental mode
figma.loadAllPagesAsync().then(() => {
  figma.on('documentchange', (event) => {
    const tocTextNodeMap = getTOCTextNodeMap();
    for (const change of event.documentChanges) {
      if (change.type === 'PROPERTY_CHANGE' && change.propertyName === 'name' && change.node.type === 'FRAME') {
        const changedFrame = change.node;
        // Find the TOC text node with matching linkedFrameId
        const textNode = tocTextNodeMap[changedFrame.id];
        if (textNode) {
          textNode.characters = textNode.characters.replace(/^([\d.]+\s)?(.+)$/, (m, num, oldName) => {
            if (num) return num + changedFrame.name;
            return changedFrame.name;
          });
          textNode.name = changedFrame.name;
        }
      }
    }
  });
}).catch(error => {
  console.error('Error loading pages for document change handler:', error);
});

// Helper: Convert hex color to Figma RGB
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

function getNumberPosition(pos, frame, numNode, size) {
  const pad = 80;
  let x = pad, y = pad;
  if (pos === 'top-right') {
    x = frame.width - numNode.width - pad;
    y = pad;
  } else if (pos === 'bottom-left') {
    x = pad;
    y = frame.height - size - pad;
  } else if (pos === 'bottom-right') {
    x = frame.width - numNode.width - pad;
    y = frame.height - size - pad;
  }
  return { x, y };
}

function clearAllSlideNumbers() {
  let removedCount = 0;
  // Helper to recursively remove slide number nodes
  function removeSlideNumbersRecursive(node) {
    if (node.type === 'TEXT' && node.name) {
      // Remove if name matches __SLIDE_NUMBER__ followed by any number (with or without leading zeros)
      const normName = node.name.trim();
      if (/^__SLIDE_NUMBER__\d+$/.test(normName)) {
        try { node.remove(); removedCount++; } catch (e) { /* ignore if already removed */ }
        return;
      }
    }
    if ('children' in node) {
      Array.from(node.children).forEach(child => removeSlideNumbersRecursive(child));
    }
  }
  // Loop through all pages and all descendants
  for (const page of figma.root.children) {
    if (page.type !== 'PAGE') continue;
    removeSlideNumbersRecursive(page);
  }
  // Also check for any orphaned slide number nodes on the document root (rare edge case)
  if ('children' in figma.root) {
    Array.from(figma.root.children).forEach(child => {
      if (child.type === 'TEXT' && child.name) {
        const normName = child.name.trim();
        if (/^__SLIDE_NUMBER__\d+$/.test(normName)) {
          try { child.remove(); removedCount++; } catch (e) { /* ignore */ }
        }
      }
    });
  }
  // Optional: log for debugging
  console.log(`Removed ${removedCount} slide number node(s).`);
}

// Utility: Safely set font on a text node with fallback and notification
async function safeSetFont(node, family, style) {
  try {
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
  } catch (e) {
    console.error('Font loading error:', e);
    // Fallback to Regular if style is not available
    if (style !== 'Regular') {
      try {
        await figma.loadFontAsync({ family, style: 'Regular' });
        node.fontName = { family, style: 'Regular' };
        console.log('Font style not available, using Regular.');
      } catch (e2) {
        console.error('Font load failed:', family, style);
        // Try system font as last resort
        try {
          await figma.loadFontAsync({ family: 'SF Pro Text', style: 'Regular' });
          node.fontName = { family: 'SF Pro Text', style: 'Regular' };
        } catch (e3) {
          console.error('All font loading attempts failed');
        }
      }
    } else {
      console.error('Font load failed:', family, style);
      // Try system font as last resort
      try {
        await figma.loadFontAsync({ family: 'SF Pro Text', style: 'Regular' });
        node.fontName = { family: 'SF Pro Text', style: 'Regular' };
      } catch (e2) {
        console.error('All font loading attempts failed');
      }
    }
  }
}

// Utility: Update style of all TEXT nodes in a parent node (frame/page)
async function updateTextNodesStyle(parentNode, styleOptions = {}) {
  // styleOptions: { fontSize, fontFamily, fontWeight, color }
  const textNodes = parentNode.findAll ? parentNode.findAll(n => n.type === 'TEXT') : [];
  for (const node of textNodes) {
    if (styleOptions.fontFamily && styleOptions.fontWeight) {
      await safeSetFont(node, styleOptions.fontFamily, styleOptions.fontWeight);
    }
    if (styleOptions.fontSize) node.fontSize = styleOptions.fontSize;
    if (styleOptions.color) node.fills = [{ type: 'SOLID', color: styleOptions.color }];
    if (styleOptions.textAutoResize) node.textAutoResize = styleOptions.textAutoResize;
    if (styleOptions.textAlignHorizontal) node.textAlignHorizontal = styleOptions.textAlignHorizontal;
    // Add more style properties as needed
  }
}

// NEW: Update specific TOC text node types based on style section
async function updateSpecificTOCStyles(parentNode, styleSection, styleOptions = {}) {
  const textNodes = parentNode.findAll ? parentNode.findAll(n => n.type === 'TEXT') : [];

  for (const node of textNodes) {
    const tocType = node.getPluginData ? node.getPluginData('tocType') : '';
    let shouldUpdate = false;

    // Determine which nodes to update based on style section
    switch (styleSection) {
      case 'hero':
        shouldUpdate = (tocType === 'hero');
        break;
      case 'hero-number':
        shouldUpdate = (tocType === 'hero-number');
        break;
      case 'sub':
        shouldUpdate = (tocType === 'sub');
        break;
      case 'sub-number':
        shouldUpdate = (tocType === 'sub-number');
        break;
      default:
        // Fallback to old behavior for backward compatibility
        shouldUpdate = true;
    }

    if (shouldUpdate) {
      if (styleOptions.fontFamily && styleOptions.fontWeight) {
        await safeSetFont(node, styleOptions.fontFamily, styleOptions.fontWeight);
      }
      if (styleOptions.fontSize) node.fontSize = styleOptions.fontSize;
      if (styleOptions.color) node.fills = [{ type: 'SOLID', color: styleOptions.color }];
      if (styleOptions.textAutoResize) node.textAutoResize = styleOptions.textAutoResize;
      if (styleOptions.textAlignHorizontal) node.textAlignHorizontal = styleOptions.textAlignHorizontal;
    }
  }
}

// Example usage: Update all text nodes in the generated TOC frame
// const tocRoot = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === '__TOC_AUTO__');
// if (tocRoot) {
//   await updateTextNodesStyle(tocRoot, { fontSize: 24, fontFamily: 'Inter', fontWeight: 'Bold', color: { r: 0, g: 0, b: 0 } });
// } 
// } 