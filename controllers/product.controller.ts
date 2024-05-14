import { NextFunction, Request, Response } from 'express';
import { CatchAsyncErrors } from '../middleware/catchAsyncErrors';
import ErrorHandler from '../utils/error-handler';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../utils/cloudinary';
import { redis } from '../utils/redis';
import { createProductService, getAllProductServices } from '../services/product.service';
import productModel from '../models/product.modal';

export const createProduct = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (thumbnail) {
      const myCloud = await uploadImageToCloudinary(thumbnail, 'products');

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.url
      };
    }

    createProductService(data, res, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const updateProduct = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    const productId = req.params.id;

    if (thumbnail) {
      await deleteImageFromCloudinary(thumbnail.public_id);

      const myCloud = await uploadImageToCloudinary(thumbnail, 'products');

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.url
      };
    }

    const product = await productModel.findByIdAndUpdate(productId, { $set: data }, { new: true });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get singleProduct ----> without purchase
export const getSingleProduct = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;

    const isCachedProduct = await redis.get(productId);

    if (isCachedProduct) {
      // console.log("is was cached");

      const product = JSON.parse(isCachedProduct);
      res.status(200).json({
        success: true,
        product
      });
    } else {
      const product = await productModel.findById(productId);

      // console.log("is mongdb");
      await redis.set(productId, JSON.stringify(product));

      res.status(200).json({
        success: true,
        product
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get product with out purchase
export const getAllProduct = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productModel.find({});

    const isCachedProduct = await redis.get('allProduct');

    if (isCachedProduct) {
      console.log('store in redis');
      const products = JSON.parse(isCachedProduct);
      res.status(200).json({
        success: true,
        products
      });
    } else {
      console.log('store in mongodb');

      await redis.set('allProduct', JSON.stringify(products));
      res.status(200).json({
        success: true,
        products
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

//add revier product -- only user in product
interface IReviewBody {
  review: string;
  rating: number;
}

export const addReview = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { review, rating } = req.body as IReviewBody;
    const productId = req.params.id;

    const userInfo = req.user;

    //   const userproductList = req.user?.products;

    // check product exits
    //   const productExits = userproductList?.some((product: any) => product._id.toString() === productId)

    //   if(!productExits){
    //     return next(new ErrorHandler("You not stay in this product", 400))
    //   }

    const product = await productModel.findById(productId);
    console.log(userInfo);
    const reviewData: any = {
      user: {
        _id: userInfo?._id,
        name: userInfo?.name,
        email: userInfo?.email,
        avatar: userInfo?.avatar
      },
      comment: review,
      rating
    };

    product?.reviews.push(reviewData);

    // calculate the start of rating in 5
    let avg = 0;
    product?.reviews.forEach((review) => (avg += review.rating));

    if (product) {
      product.ratings = avg / product.reviews.length; // example: we have 2 reviews one is 5 and one is 4. So match working like 9 /2 = 4.5
    }

    await product?.save();

    //create notificate
    //   const notification = {
    //     title: "New Review Recived",
    //     message: `${req.user?.name} has given review in your ${product?.name}`
    //   }

    //TO DO TO CREATE NOTIFICATE

    res.status(200).json({
      success: true,
      product
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// add reply to review product -- only admin
interface IReplyReview {
  comment: string;
  productId: string;
  reviewId: string;
}

export const addReplyReview = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment, productId, reviewId } = req.body as IReplyReview;

    const userInfo = req.user;

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }

    const review = product.reviews.find((review) => review._id.toString() === reviewId);

    if (!review) {
      return next(new ErrorHandler('review not found', 404));
    }

    const replyReview: any = {
      user: {
        _id: userInfo?._id,
        name: userInfo?.name,
        email: userInfo?.email,
        avatar: userInfo?.avatar
      },
      comment
    };

    if (!review.commentReplies) {
      review.commentReplies = [];
    }

    review.commentReplies.push(replyReview);

    // await notificationModel.create({
    //   userId: req.user?._id,
    //   title: "New Question",
    //   message: `You have the new question in this ${Product.name}`
    // })

    await product?.save();

    res.status(200).json({
      success: true,
      product
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get all product --admin
export const adminGetAllProducts = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    getAllProductServices(res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// delete product  --admin
export const deleteProduct = CatchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return next(new ErrorHandler('product not found', 400));
    }

    await product.deleteOne({ id });

    await redis.del(id);

    res.status(200).json({
      success: true,
      message: 'delete successfully'
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
