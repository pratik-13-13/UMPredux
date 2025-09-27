// Network connectivity test utility
import { API_CONFIG, getCurrentConfig } from '../config/api.js';

export const testNetworkConnection = async () => {
  console.log('🔍 Testing network connection...');
  getCurrentConfig();
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_CONFIG.BASE_URL}/users/test`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Backend server is reachable');
      return { success: true, message: 'Backend server is reachable' };
    } else {
      console.log('❌ Backend server responded with error:', response.status);
      return { success: false, message: `Server error: ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Network connection failed:', error.message);
    
    if (error.message.includes('ERR_CONNECTION_TIMED_OUT')) {
      return { 
        success: false, 
        message: 'Connection timed out. Check if backend server is running.',
        suggestions: [
          '1. Start your backend server: cd Backend && npm run dev',
          '2. Check if your IP address changed',
          '3. Update LOCAL_IP in Frontend/src/config/api.js'
        ]
      };
    }
    
    return { success: false, message: error.message };
  }
};

// Quick IP detection helper
export const detectCurrentIP = () => {
  // This is a simple helper - you'll need to check manually
  console.log('💡 To find your current IP address:');
  console.log('Windows: Run "ipconfig" in command prompt');
  console.log('Mac/Linux: Run "ifconfig" in terminal');
  console.log('Look for your local network IP (usually 192.168.x.x)');
};