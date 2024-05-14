import express from 'express';
import { authorized, isAuthenticated } from '../middleware/auth';
import { createPost, deletePost, getAllPost, getSinglePost, updatePost } from '../controllers/post.controller';

const postRouter = express.Router();

// fix to member admin staff later

postRouter.post('/posts', isAuthenticated, authorized('admin'), createPost);

postRouter.get('/posts', getAllPost);

postRouter.get('/posts/:id', getSinglePost);

postRouter.put('/posts/:id', isAuthenticated, authorized('admin'), updatePost);

postRouter.delete('/posts', isAuthenticated, authorized('admin'), deletePost);

export default postRouter;
