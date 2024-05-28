"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const orderRouter = (0, express_1.Router)();
orderRouter.post('/order', auth_1.isAuthenticated, (0, auth_1.authorized)('member'), order_controller_1.createOrder);
exports.default = orderRouter;
