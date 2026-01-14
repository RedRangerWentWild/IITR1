import express from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import draftRoutes from './routes/draftRoutes';
import metricsRoutes from './routes/metricsRoutes';
import extensionRoutes from './routes/extensionRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(apiLimiter); // Apply global rate limiter

app.use('/auth', authRoutes);
app.use('/drafts', draftRoutes);
app.use('/metrics', metricsRoutes);
app.use('/extension', extensionRoutes);




app.get('/', (req, res) => {
    res.send('EmailFlow Backend API');
});

app.use(errorHandler); // Last middleware

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
