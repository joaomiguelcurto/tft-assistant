import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../../consts";

// The desktop window is the window displayed while game is not running.
new AppWindow(kWindowNames.desktop);

const API_URL = 'http://localhost:3000';

// Check if user is already logged in
async function checkExistingSession() {
  const sessionToken = localStorage.getItem('sessionToken');
  
  if (sessionToken) {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: sessionToken })
      });

      const data = await response.json();

      if (data.success) {
        // User is logged in, redirect to logged page
        window.location.href = 'desktopLogged.html';
        return;
      } else {
        // Invalid session, clear it
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Error validating session:', error);
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userData');
    }
  }
}

// Handle login click
async function handleLogin(e: Event) {
  e.preventDefault();
  console.log('Login button clicked');
  
  try {
    // Get auth URL from server
    console.log('Fetching auth URL from:', `${API_URL}/auth/google/url`);
    const response = await fetch(`${API_URL}/auth/google/url`);
    const data = await response.json();

    console.log('Auth URL response:', data);

    if (!data.success) {
      console.error('Failed to get auth URL:', data);
      alert('Error generating login URL. Please try again.');
      return;
    }

    console.log('Opening Google OAuth window...');
    
    // Open Google OAuth in new window
    const authWindow = window.open(
      data.authUrl,
      'Google Login',
      'width=500,height=600,left=100,top=100'
    );

    if (!authWindow) {
      alert('Please allow popups for this site to login with Google.');
      return;
    }
    
    console.log('Auth window opened:', authWindow);

    // Listen for auth success message
    const messageHandler = async (event: MessageEvent) => {
      console.log('=== MESSAGE RECEIVED ===');
      console.log('Event:', event);
      console.log('Event data:', event.data);
      console.log('Event origin:', event.origin);
      console.log('Event source:', event.source);
      console.log('========================');
      
      // Log ALL messages for debugging
      if (event.data) {
        console.log('Message type:', event.data.type);
      }
      
      // More permissive origin check for development
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Auth success received!', event.data);
        
        const { token, user } = event.data;

        if (!token) {
          console.error('No token received:', event.data);
          alert('Login failed: No token received');
          return;
        }

        console.log('Token received:', token);
        console.log('User data received:', user);

        // Store session token
        localStorage.setItem('sessionToken', token);
        
        // Store user data (which should contain name, email, etc.)
        if (user) {
          // Store the user object
          localStorage.setItem('userData', JSON.stringify({
            name: user.name,
            email: user.email,
            picture: user.picture,
            googleId: user.googleId
          }));
          console.log('User data stored:', {
            name: user.name,
            email: user.email,
            picture: user.picture
          });
        } else {
          console.error('No user data in message');
        }

        // Verify it was stored
        const storedToken = localStorage.getItem('sessionToken');
        const storedUser = localStorage.getItem('userData');
        console.log('Verification - Token stored:', !!storedToken);
        console.log('Verification - User data stored:', storedUser);

        // Close auth window if still open
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }

        // Remove event listener
        window.removeEventListener('message', messageHandler);

        console.log('Redirecting to desktopLogged.html');
        // Redirect to logged page
        window.location.href = 'desktopLogged.html';
      }
    };

    // Add listener BEFORE opening window
    window.addEventListener('message', messageHandler);
    console.log('Message listener added');

    // Check if window was closed without completing auth
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        console.log('Auth window was closed');
      }
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    alert('Error during login. Please check if the server is running and try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Desktop page loaded');
  
  // Check for existing session on load
  checkExistingSession();

  // Login navigation
  const loginBtn = document.getElementById('loginBtn');
  console.log('Login button found:', loginBtn);
  
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
    console.log('Login click handler attached');
  }
});