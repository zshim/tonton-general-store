import serverless from 'serverless-http';
import app from '../../backend/server';

// Ensure you install serverless-http: npm install serverless-http
export const handler = serverless(app);
