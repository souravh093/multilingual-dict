import dotenv from 'dotenv';
import { startServer } from './server';

dotenv.config();

const PORT = process.env.PORT || 5000;

startServer(Number(PORT)).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});