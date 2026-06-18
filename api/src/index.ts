import http from "http";
import express from 'express';
import cors from 'cors';
import healthRouter from '@/routes/health';
import userRouter from '@/routes/user';
import gameRouter from '@/routes/game';
import authRouter from '@/routes/auth';
import messageRouter from '@/routes/message';
import { errorHandler } from '@/middlewares';
import config from '@/config';
import { setupSocket } from '@/lib/socket';

const app = express();
const server = http.createServer(app);

// CORS — allow Vite dev server + any origin in development
app.use(cors({
    origin: config.isProduction ? 'http://localhost:5173' : true,
    credentials: true,
}));

app.use(express.json());
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/games', gameRouter);
app.use('/api/games', messageRouter);
app.use(errorHandler);

// Setup Socket.IO
setupSocket(server);

server.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});

export default app;
