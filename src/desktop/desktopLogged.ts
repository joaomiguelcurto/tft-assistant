import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../../consts";

console.log('===== DESKTOPLOGGED.TS IS LOADING =====');

// Initialize the AppWindow for window controls and dragging
new AppWindow(kWindowNames.desktop);

const API_URL = 'http://localhost:3000';

// Check if user is authenticated
async function checkAuthentication() {
  const sessionToken = localStorage.getItem('sessionToken');
  const userDataStr = localStorage.getItem('userData');
  
  console.log('Checking authentication...');
  console.log('Session token exists:', !!sessionToken);
  console.log('User data exists:', !!userDataStr);
  
  if (!sessionToken) {
    console.log('No session token, redirecting to login');
    window.location.href = 'desktop.html';
    return null;
  }

  // First, try to use cached user data if available
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      console.log('Parsed cached user data:', userData);
      console.log('User name from cache:', userData.name);
      
      if (userData.name) {
        return {
          name: userData.name,
          email: userData.email,
          picture: userData.picture
        };
      } else {
        console.error('No name found in userData. Full object:', userData);
      }
    } catch (e) {
      console.error('Error parsing cached user data:', e);
    }
  }

  // If no cached data, validate with server
  try {
    console.log('Validating session with server...');
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken })
    });

    const data = await response.json();
    console.log('Validation response:', data);

    if (!data.success) {
      console.log('Session invalid, clearing and redirecting');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
      window.location.href = 'desktop.html';
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error validating session:', error);
    // Don't redirect on network error if we have cached data
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return {
          name: userData.name,
          email: userData.email,
          picture: userData.picture
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userData');
    window.location.href = 'desktop.html';
    return null;
  }
}

// Update welcome text with user name
function updateWelcomeText(userName: string) {
  console.log('Updating welcome text for:', userName);
  const welcomeText = document.getElementById('welcomeText');
  
  if (welcomeText) {
    welcomeText.textContent = `Welcome ${userName}!`;
    console.log('Welcome text updated successfully');
  } else {
    console.error('Welcome text element not found!');
  }
}

// Handle logout
async function handleLogout(e: Event) {
  e.preventDefault();
  console.log('Logout initiated');
  
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (!sessionToken) {
    console.log('No session token, redirecting to login');
    window.location.href = 'desktop.html';
    return;
  }

  try {
    console.log('Calling logout endpoint...');
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken })
    });
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear local storage regardless of response
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('userData');
  console.log('Local storage cleared');

  // Redirect to login page
  window.location.href = 'desktop.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Desktop logged page loaded');
  console.log('=== LocalStorage Contents ===');
  const sessionToken = localStorage.getItem('sessionToken');
  const userDataStr = localStorage.getItem('userData');
  console.log('sessionToken:', sessionToken);
  console.log('userData (raw):', userDataStr);
  
  if (userDataStr) {
    try {
      const parsed = JSON.parse(userDataStr);
      console.log('userData (parsed):', parsed);
      console.log('userData.name:', parsed.name);
      console.log('userData.email:', parsed.email);
      console.log('userData keys:', Object.keys(parsed));
      
      // Try to display name immediately if it exists
      if (parsed.name) {
        console.log('Found name in localStorage, updating welcome text');
        updateWelcomeText(parsed.name);
      } else {
        console.error('NAME IS MISSING from userData!');
      }
    } catch (e) {
      console.error('Error parsing userData:', e);
    }
  } else {
    console.error('NO USERDATA IN LOCALSTORAGE!');
  }
  console.log('============================');
  
  // Check authentication on load
  const user = await checkAuthentication();
  
  if (user) {
    console.log('User authenticated from server:', user);
    console.log('User name to display:', user.name);
    updateWelcomeText(user.name);
  } else {
    console.log('No user data available from authentication check');
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  console.log('Logout button found:', !!logoutBtn);
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
    console.log('Logout handler attached');
  }

  // Comps navigation
  const compsCardContainer = document.getElementById('compsCardContainer');
  if (compsCardContainer) {
    compsCardContainer.addEventListener('click', () => {
      console.log('Navigating to comps');
      window.location.href = 'comps.html';
    });
  }

  // Assistant navigation
  const assistantCardContainer = document.getElementById('assistantCardContainer');
  if (assistantCardContainer) {
    assistantCardContainer.addEventListener('click', () => {
      console.log('Navigating to assistant');
      window.location.href = 'assistant.html';
    });
  }

  // Builder navigation
  const builderCardContainer = document.getElementById('builderCardContainer');
  if (builderCardContainer) {
    builderCardContainer.addEventListener('click', () => {
      console.log('Navigating to builder');
      window.location.href = 'builder.html';
    });
  }
});