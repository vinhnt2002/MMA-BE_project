"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.adminGetAllProducts = exports.addReplyReview = exports.addReview = exports.getAllProduct = exports.getSingleProduct = exports.updateProduct = exports.createProduct = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const error_handler_1 = __importDefault(require("../utils/error-handler"));
const cloudinary_1 = require("../utils/cloudinary");
const redis_1 = require("../utils/redis");
const product_service_1 = require("../services/product.service");
const product_modal_1 = __importDefault(require("../models/product.modal"));
exports.createProduct = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = yield (0, cloudinary_1.uploadImageToCloudinary)(thumbnail, 'products');
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.url
            };
        }
        (0, product_service_1.createProductService)(data, res, next);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
exports.updateProduct = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const productId = req.params.id;
        if (thumbnail) {
            yield (0, cloudinary_1.deleteImageFromCloudinary)(thumbnail.public_id);
            const myCloud = yield (0, cloudinary_1.uploadImageToCloudinary)(thumbnail, 'products');
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.url
            };
        }
        const product = yield product_modal_1.default.findByIdAndUpdate(productId, { $set: data }, { new: true });
        res.status(201).json({
            success: true,
            product
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
// get singleProduct ----> without purchase
exports.getSingleProduct = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const isCachedProduct = yield redis_1.redis.get(productId);
        if (isCachedProduct) {
            // console.log("is was cached");
            const product = JSON.parse(isCachedProduct);
            res.status(200).json({
                success: true,
                product
            });
        }
        else {
            const product = yield product_modal_1.default.findById(productId);
            // console.log("is mongdb");
            yield redis_1.redis.set(productId, JSON.stringify(product));
            res.status(200).json({
                success: true,
                product
            });
        }
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
// get product with out purchase
exports.getAllProduct = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_modal_1.default.find({});
        res.status(200).json({
            success: true,
            products
        });
        // const isCachedProduct = await redis.get('allProduct');
        // if (isCachedProduct) {
        //   console.log('store in redis');
        //   const products = JSON.parse(isCachedProduct);
        //   res.status(200).json({
        //     success: true,
        //     products
        //   });
        // } else {
        //   console.log('store in mongodb');
        //   await redis.set('allProduct', JSON.stringify(products));
        //   res.status(200).json({
        //     success: true,
        //     products
        //   });
        // }
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review, rating } = req.body;
        const productId = req.params.id;
        const userInfo = req.user;
        //   const userproductList = req.user?.products;
        // check product exits
        //   const productExits = userproductList?.some((product: any) => product._id.toString() === productId)
        //   if(!productExits){
        //     return next(new ErrorHandler("You not stay in this product", 400))
        //   }
        const product = yield product_modal_1.default.findById(productId);
        console.log(userInfo);
        const reviewData = {
            user: {
                _id: userInfo === null || userInfo === void 0 ? void 0 : userInfo._id,
                name: userInfo === null || userInfo === void 0 ? void 0 : userInfo.name,
                email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.email,
                avatar: userInfo === null || userInfo === void 0 ? void 0 : userInfo.avatar
            },
            comment: review,
            rating
        };
        product === null || product === void 0 ? void 0 : product.reviews.push(reviewData);
        // calculate the start of rating in 5
        let avg = 0;
        product === null || product === void 0 ? void 0 : product.reviews.forEach((review) => (avg += review.rating));
        if (product) {
            product.ratings = avg / product.reviews.length; // example: we have 2 reviews one is 5 and one is 4. So match working like 9 /2 = 4.5
        }
        yield (product === null || product === void 0 ? void 0 : product.save());
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
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.addReplyReview = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { comment, productId, reviewId } = req.body;
        const userInfo = req.user;
        const product = yield product_modal_1.default.findById(productId);
        if (!product) {
            return next(new error_handler_1.default('Product not found', 404));
        }
        const review = product.reviews.find((review) => review._id.toString() === reviewId);
        if (!review) {
            return next(new error_handler_1.default('review not found', 404));
        }
        const replyReview = {
            user: {
                _id: userInfo === null || userInfo === void 0 ? void 0 : userInfo._id,
                name: userInfo === null || userInfo === void 0 ? void 0 : userInfo.name,
                email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.email,
                avatar: userInfo === null || userInfo === void 0 ? void 0 : userInfo.avatar
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
        yield (product === null || product === void 0 ? void 0 : product.save());
        res.status(200).json({
            success: true,
            product
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
// get all product --admin
exports.adminGetAllProducts = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, product_service_1.getAllProductServices)(res);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
// delete product  --admin
exports.deleteProduct = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield product_modal_1.default.findById(id);
        if (!product) {
            return next(new error_handler_1.default('product not found', 400));
        }
        yield product.deleteOne({ id });
        yield redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: 'delete successfully'
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
