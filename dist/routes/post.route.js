"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const post_controller_1 = require("../controllers/post.controller");
const postRouter = express_1.default.Router();
// fix to member admin staff later
postRouter.post('/posts', auth_1.isAuthenticated, (0, auth_1.authorized)('admin'), post_controller_1.createPost);
postRouter.get('/posts', post_controller_1.getAllPost);
postRouter.get('/posts/:id', post_controller_1.getSinglePost);
postRouter.put('/posts/:id', auth_1.isAuthenticated, (0, auth_1.authorized)('admin'), post_controller_1.updatePost);
postRouter.delete('/posts', auth_1.isAuthenticated, (0, auth_1.authorized)('admin'), post_controller_1.deletePost);
exports.default = postRouter;
