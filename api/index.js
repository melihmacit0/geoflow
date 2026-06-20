// Vercel serverless entry point. The Express app is a (req, res) handler, so it
// can be exported directly as a Vercel Node function. The /api/(.*) rewrite in
// vercel.json routes every API request here while preserving the original path.
import app from '../backend/src/app.js';

export default app;
