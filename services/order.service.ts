import { NextFunction, Request, Response } from 'express';
import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import orderModel, { IOrder } from '../models/order.model';
import { ParamsDictionary } from 'express-serve-static-core';

export const createOrderService = CatchAsyncErrors(
  async (req: Request<ParamsDictionary, any, IOrder>, res: Response, next: NextFunction) => {
    const order = await orderModel.create(req.body);

    res.status(201).json({
      success: true,
      order
    });
  }
);
