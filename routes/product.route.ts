import express from 'express';
import { authorized, isAuthenticated } from '../middleware/auth';
import {
  addReplyReview,
  addReview,
  createProduct,
  deleteProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct
} from '../controllers/product.controller';

const productRouter = express.Router();

productRouter.post('/products', isAuthenticated, authorized('admin', 'staff'), createProduct);

productRouter.get('/products', getAllProduct);

productRouter.get('/products/:id', getSingleProduct);

productRouter.delete('/products', isAuthenticated, authorized('admin', 'staff'), deleteProduct);

productRouter.put('/products', isAuthenticated, authorized('admin', 'staff'), updateProduct);

productRouter.put('/add-reviews/:id', isAuthenticated, authorized('member'), addReview);

productRouter.put('/add-reply-review', isAuthenticated, authorized('admin', 'staff'), addReplyReview);

export default productRouter;
