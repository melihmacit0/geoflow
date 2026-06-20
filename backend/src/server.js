// Local dev launcher. On Vercel the Express app is served as a serverless
// function via /api/index.js instead — see that file and vercel.json.
import app from './app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GeoFlow backend running on http://localhost:${PORT}`));
