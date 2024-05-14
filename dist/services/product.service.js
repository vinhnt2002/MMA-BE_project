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
exports.getAllProductServices = exports.updateProductService = exports.createProductService = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const product_modal_1 = __importDefault(require("../models/product.modal"));
exports.createProductService = (0, catchAsyncErrors_1.CatchAsyncErrors)((data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_modal_1.default.create(data);
    res.status(201).json({
        success: true,
        product,
    });
}));
exports.updateProductService = (0, catchAsyncErrors_1.CatchAsyncErrors)((data, productId, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_modal_1.default.findByIdAndUpdate(productId, { $set: data }, { new: true });
    res.status(201).json({
        success: true,
        product
    });
}));
// get all products 
const getAllProductServices = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_modal_1.default.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        products,
    });
});
exports.getAllProductServices = getAllProductServices;
