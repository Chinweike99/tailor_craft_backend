import cron from 'node-cron';
import axios from 'axios';
import config from '../config/config';

const KEEP_ALIVE_INTERVAL = '*/14 * * * *';

/**
 * Keep-Alive Service
 * Prevents Render free tier from sleeping by pinging the server every 14 minutes
 */
export const setupKeepAlive = () => {
  const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.port}`;
  
  cron.schedule(KEEP_ALIVE_INTERVAL, async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/v1/health`, {
        timeout: 10000,
      });
      
      console.log(`[Keep-Alive] ✓ Server pinged successfully at ${new Date().toISOString()}`);
      console.log(`[Keep-Alive] Status: ${response.status} - ${response.data?.status || 'OK'}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[Keep-Alive] ✗ Failed to ping server:`, error.message);
      } else {
        console.error(`[Keep-Alive] ✗ Unexpected error:`, error);
      }
    }
  });

  console.log(`[Keep-Alive] 🚀 Cron job started - Server will be pinged every 14 minutes`);
  console.log(`[Keep-Alive] Target URL: ${serverUrl}/api/v1/health`);
};
