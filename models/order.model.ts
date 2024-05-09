import mongoose, { Document, Schema, Model } from 'mongoose';

enum Status {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  SHIPPED = 'Shipped'
}

enum PaymentMethod {
  CASH = 'Cash',
  BANK = 'Bank'
}

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  products: Array<{ productId: Schema.Types.ObjectId }>;
  payment_info: PaymentMethod;
  status: Status;
  total_amount: number;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

const orderModel = mongoose.model<IOrder>('Order', OrderSchema);

export default orderModel;
