import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import ejsLayouts from 'express-ejs-layouts';
import logger from './utils/logger';
import { PORT, HUGGINGFACE_API_TOKEN } from './config/config';
import indexRoutes from './routes/index';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS and layouts
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layout');

// Routes
app.use('/', indexRoutes);

// Validate API token
if (!HUGGINGFACE_API_TOKEN) {
  logger.warn('HUGGINGFACE_API_TOKEN is not set. API requests will fail.');
}

// Start server
const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running at http://0.0.0.0:${port}`);
});