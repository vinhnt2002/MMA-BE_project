import { NextFunction, Request, Response } from 'express';
import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import ErrorHandler from '../utils/error-handler';
import { createOrderService } from '../services/order.service';
import { ParamsDictionary } from 'express-serve-static-core';
import { IOrder } from '../models/order.model';

export const createOrder = CatchAsyncErrors(
  async (req: Request<ParamsDictionary, any, IOrder>, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const authourize = req.user?._id;
      if (authourize) {
        data.userId = authourize;
      }
      createOrderService(req, res, next);
    } catch (error) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);
