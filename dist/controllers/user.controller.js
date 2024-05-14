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
exports.updateProfilePicture = exports.updatePasswordUser = exports.updateUser = exports.getUserInfo = exports.deleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
require("dotenv").config();
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const user_model_1 = __importDefault(require("../models/user.model"));
const error_handler_1 = __importDefault(require("../utils/error-handler"));
const user_service_1 = require("../services/user.service");
const redis_1 = require("../utils/redis");
const cloudinary_1 = require("../utils/cloudinary");
// get all user --admin
exports.getAllUsers = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, user_service_1.getAllUsersServices)(res);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
// update user role --admin
exports.updateUserRole = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.body;
        (0, user_service_1.updateUserRoleServices)(res, id, role);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
// delete user  --admin
exports.deleteUser = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findById(id);
        if (!user) {
            return next(new error_handler_1.default("User not found", 400));
        }
        yield user.deleteOne({ id });
        yield redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "delete successfully",
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
exports.getUserInfo = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.updateUser = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { email, name } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const user = yield user_model_1.default.findById(userId);
        if (email && user) {
            const isEmailExist = yield user_model_1.default.findOne({ email });
            if (isEmailExist) {
                return next(new error_handler_1.default("Email aldready exits", 400));
            }
            user.email = email;
        }
        if (name && user) {
            user.name = name;
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set(userId, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.updatePasswordUser = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new error_handler_1.default("Please enter the old and new password", 400));
        }
        const user = yield user_model_1.default.findById((_c = req.user) === null || _c === void 0 ? void 0 : _c._id).select("+password");
        if ((user === null || user === void 0 ? void 0 : user.password) === undefined) {
            return next(new error_handler_1.default("Invalid User", 400));
        }
        const isPasswordMatch = yield (user === null || user === void 0 ? void 0 : user.comparePassword(oldPassword));
        if (!isPasswordMatch) {
            return next(new error_handler_1.default("Invalid Old pasword", 400));
        }
        user.password = newPassword;
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set((_d = req.user) === null || _d === void 0 ? void 0 : _d._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 500));
    }
}));
exports.updateProfilePicture = (0, catchAsyncErrors_1.CatchAsyncErrors)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const { avatar } = req.body;
        const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
        const user = yield user_model_1.default.findById(userId);
        if (avatar && user) {
            if (user.avatar.public_id) {
                yield (0, cloudinary_1.deleteImageFromCloudinary)(user.avatar.public_id);
            }
            const myCloud = yield (0, cloudinary_1.uploadImageToCloudinary)(avatar, "avatars", 150);
            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.url,
            };
        }
        res.status(200).json({
            success: true,
            user,
        });
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set(userId, JSON.stringify(user));
    }
    catch (error) {
        return next(new error_handler_1.default(error.message, 400));
    }
}));
