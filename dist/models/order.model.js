"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
var Status;
(function (Status) {
    Status["PENDING"] = "Pending";
    Status["COMPLETED"] = "Completed";
    Status["SHIPPED"] = "Shipped";
})(Status || (Status = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "Cash";
    PaymentMethod["BANK"] = "Bank";
})(PaymentMethod || (PaymentMethod = {}));
const OrderSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Product'
            }
        }
    ],
    payment_info: {
        type: String,
        enum: Object.values(PaymentMethod)
        // default: PaymentMethod.CASH,
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.PENDING
    },
    total_amount: {
        type: Number,
        required: true
    }
}, { timestamps: true });
const orderModel = mongoose_1.default.model('Order', OrderSchema);
exports.default = orderModel;
