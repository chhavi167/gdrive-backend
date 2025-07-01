import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth';
import fileRoutes from '../routes/fileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "https://gdrive-frontend-dc57.vercel.app",
  "https://gdrive-frontend-dc57-n330p30k6-chhavis-projects-3aa15ac8.vercel.app",
  "https://gdrive-frontend-dc57-git-main-chhavis-projects-3aa15ac8.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (_req, res) => {
  res.send('hello from server!');
});

app.listen(PORT, () => {
  console.log(` Server running at ${PORT} Port`);
});


