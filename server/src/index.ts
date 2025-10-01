

import express from 'express';
import authRoutes from "./routes/authRoutes.js"
import scrapeRoutes from "./routes/scrapeRoutes.js"
import statsRoutes from './routes/statsRoutes.js';
import proxyRoutes from './routes/proxyRoutes.js';
import connectDB from './lib/db.js';
import cors from 'cors';
import job from './lib/cron.js';
import axios from 'axios';
job.start();
const app = express();
connectDB();
const PORT = 3000;
const allowedOrigins = ["http://localhost:5173", "https://igauto-fe.vercel.app"];
const corsOptions : cors.CorsOptions = {
    origin: allowedOrigins
}
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/proxy', proxyRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
