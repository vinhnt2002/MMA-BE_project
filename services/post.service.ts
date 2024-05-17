import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import postModel from '../models/post.modal';
import { Request, Response } from 'express';

export const createPostService = CatchAsyncErrors(async (data: any, res: Response) => {
  const post = await postModel.create(data);

  res.status(201).json({
    success: true,
    post
  });
});
