import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth';
import fileRoutes from '../routes/fileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (_req, res) => {
  res.send('hello from server!');
});

app.listen(PORT, () => {
  console.log(` Server running at ${PORT} Port`);
});


