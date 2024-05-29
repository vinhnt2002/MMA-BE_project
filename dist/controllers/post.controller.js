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
exports.deletePost = exports.getAllPost = exports.getSinglePost = exports.updatePost = exports.createPost = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const error_handler_1 = __importDefault(require("../utils/error-handler"));
const cloudinary_1 = require("../utils/cloudinary");
const redis_1 = require("../utils/redis");
const post_service_1 = require("../services/post.service");
const post_modal_1 = __importDefault(require("../models/post.modal"));
exports.createPost = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = req.body;
        const authorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const thumbnail = data.thumbnail;
        if (authorId) {
            data.authorId = authorId;
        }
        if (thumbnail) {
            const myCloud = yield (0, cloudinary_1.uploadImageToCloudinary)(thumbnail, 'posts');
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.url
            };
        }
        (0, post_service_1.createPostService)(data, res, next);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
exports.updatePost = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const postId = req.params.id;
        if (thumbnail) {
            yield (0, cloudinary_1.deleteImageFromCloudinary)(thumbnail.public_id);
            const myCloud = yield (0, cloudinary_1.uploadImageToCloudinary)(thumbnail, 'post');
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.url
            };
        }
        const post = yield post_modal_1.default.findByIdAndUpdate(postId, { $set: data }, { new: true });
        res.status(201).json({
            success: true,
            post
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
exports.getSinglePost = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const isCachedPost = yield redis_1.redis.get(postId);
        if (isCachedPost) {
            const post = JSON.parse(isCachedPost);
            res.status(200).json({
                success: true,
                post
            });
        }
        else {
            const post = yield post_modal_1.default.findById(postId);
            yield redis_1.redis.set(postId, JSON.stringify(post));
            res.status(200).json({
                success: true,
                post
            });
        }
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.getAllPost = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        const queryObject = userId ? { user: userId } : {};
        const posts = yield post_modal_1.default.find(queryObject);
        res.status(200).json({
            success: true,
            posts
        });
        // const isCachedPosts = await redis.get('allPost');
        // if (isCachedPosts) {
        //   const posts = JSON.parse(isCachedPosts);
        //   res.status(200).json({
        //     success: true,
        //     posts
        //   });
        // } else {
        //   await redis.set('allPost', JSON.stringify(posts));
        //   res.status(200).json({
        //     success: true,
        //     posts
        //   });
        // }
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.deletePost = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const post = yield post_modal_1.default.findById(id);
        if (!post) {
            return next(new error_handler_1.default('post not found', 400));
        }
        yield post.deleteOne({ id });
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
