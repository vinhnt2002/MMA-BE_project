"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const product_controller_1 = require("../controllers/product.controller");
const productRouter = express_1.default.Router();
productRouter.post('/products', auth_1.isAuthenticated, (0, auth_1.authorized)('admin', 'staff'), product_controller_1.createProduct);
productRouter.get('/products', product_controller_1.getAllProduct);
productRouter.get('/products/:id', product_controller_1.getSingleProduct);
productRouter.delete('/products', auth_1.isAuthenticated, (0, auth_1.authorized)('admin', 'staff'), product_controller_1.deleteProduct);
productRouter.put('/products', auth_1.isAuthenticated, (0, auth_1.authorized)('admin', 'staff'), product_controller_1.updateProduct);
productRouter.put('/add-reviews/:id', auth_1.isAuthenticated, (0, auth_1.authorized)('member'), product_controller_1.addReview);
productRouter.put('/add-reply-review', auth_1.isAuthenticated, (0, auth_1.authorized)('admin', 'staff'), product_controller_1.addReplyReview);
exports.default = productRouter;
