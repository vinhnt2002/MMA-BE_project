import express, { NextFunction, Request, Response } from 'express';

export const app = express();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ErrorMiddleWare } from './middleware/error';

import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import { config } from 'dotenv';
import productRouter from './routes/product.route';
import postRouter from './routes/post.route';
config();

//body parser
app.use(express.json({ limit: '50mb' }));

//cookie parser
app.use(cookieParser());

//cors => cross origin sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
    // origin: '*',
    // origin: 'http://localhost:8081',
    // origin: 'http://192.168.1.173:8081',
    // origin: '192.168.1.173',
    credentials: true
  })
);

//routes

app.use('/api/v1', authRouter);

app.use('/api/v1', userRouter);

app.use('/api/v1', productRouter);

app.use('/api/v1', postRouter);

//testing api
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'Api is working'
  });
});

//unknow api
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleWare);
