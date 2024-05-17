import { Router } from 'express';
import { authorized, isAuthenticated } from '../middleware/auth';
import { createOrder } from '../controllers/order.controller';

const orderRouter = Router();

orderRouter.post('/order', isAuthenticated, authorized('member'), createOrder);

export default orderRouter;
