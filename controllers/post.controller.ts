import { NextFunction, Request, Response } from 'express';
import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import ErrorHandler from '../utils/error-handler';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../utils/cloudinary';
import { redis } from '../utils/redis';

import { createPostService } from '../services/post.service';
import postModel from '../models/post.modal';

export const createPost = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const authorId = req.user?._id;
    const thumbnail = data.thumbnail;

    if (authorId) {
      data.authorId = authorId;
    }

    if (thumbnail) {
      const myCloud = await uploadImageToCloudinary(thumbnail, 'posts');

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.url
      };
    }

    createPostService(data, res, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const updatePost = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const postId = req.params.id;

    if (thumbnail) {
      await deleteImageFromCloudinary(thumbnail.public_id);

      const myCloud = await uploadImageToCloudinary(thumbnail, 'post');

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.url
      };
    }

    const post = await postModel.findByIdAndUpdate(postId, { $set: data }, { new: true });

    res.status(201).json({
      success: true,
      post
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getSinglePost = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id;

    const isCachedPost = await redis.get(postId);

    if (isCachedPost) {
      const post = JSON.parse(isCachedPost);
      res.status(200).json({
        success: true,
        post
      });
    } else {
      const post = await postModel.findById(postId);

      await redis.set(postId, JSON.stringify(post));

      res.status(200).json({
        success: true,
        post
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getAllPost = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId;

    const queryObject = userId ? { user: userId } : {};
    const posts = await postModel.find(queryObject);

    const isCachedPosts = await redis.get('allPost');

    if (isCachedPosts) {
      const posts = JSON.parse(isCachedPosts);
      res.status(200).json({
        success: true,
        posts
      });
    } else {
      await redis.set('allPost', JSON.stringify(posts));
      res.status(200).json({
        success: true,
        posts
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const deletePost = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById(id);

    if (!post) {
      return next(new ErrorHandler('post not found', 400));
    }

    await post.deleteOne({ id });

    await redis.del(id);

    res.status(200).json({
      success: true,
      message: 'delete successfully'
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
