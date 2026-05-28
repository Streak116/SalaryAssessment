import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Salary Management API is running' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
