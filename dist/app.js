"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const dotenv_1 = require("dotenv");
const product_route_1 = __importDefault(require("./routes/product.route"));
const post_route_1 = __importDefault(require("./routes/post.route"));
(0, dotenv_1.config)();
//body parser
exports.app.use(express_1.default.json({ limit: '50mb' }));
//cookie parser
exports.app.use((0, cookie_parser_1.default)());
//cors => cross origin sharing
exports.app.use((0, cors_1.default)({
    // origin: process.env.ORIGIN
    origin: '*',
    credentials: true,
}));
//routes
exports.app.use('/api/v1', auth_route_1.default);
exports.app.use('/api/v1', user_route_1.default);
exports.app.use('/api/v1', product_route_1.default);
exports.app.use('/api/v1', post_route_1.default);
//testing api
exports.app.get('/test', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Api is working'
    });
});
//unknow api
exports.app.all('*', (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleWare);
