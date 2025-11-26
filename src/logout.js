/**
 * Logout utility for LabSaver extension
 * Clears cached OAuth tokens to force re-authentication
 */

// Function to remove cached OAuth token
function logout() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        console.log('No token to remove:', chrome.runtime.lastError.message);
        resolve({ success: true, message: 'No cached token found' });
        return;
      }
      
      if (!token) {
        console.log('No token found');
        resolve({ success: true, message: 'No cached token found' });
        return;
      }
      
      // Remove the token from cache
      chrome.identity.removeCachedAuthToken({ token }, () => {
        console.log('✓ Removed cached auth token');
        
        // Revoke the token on Google's servers
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
          .then(() => {
            console.log('✓ Revoked token on Google servers');
            resolve({ 
              success: true, 
              message: 'Successfully logged out. Next export will require re-authentication.' 
            });
          })
          .catch((err) => {
            console.warn('Warning: Could not revoke token on server:', err);
            resolve({ 
              success: true, 
              message: 'Logged out locally. Next export will require re-authentication.' 
            });
          });
      });
    });
  });
}

// Make logout function available globally
window.labsaverLogout = logout;

console.log('LabSaver logout utility loaded. Call labsaverLogout() to log out.');