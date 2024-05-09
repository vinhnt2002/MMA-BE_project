import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  discount: number;
  points_required: number; // Số điểm cần để đổi voucher
  applicable_products: string[]; // Mảng ID sản phẩm có thể áp dụng voucher
}

const voucherSchema: Schema<IVoucher> = new Schema<IVoucher>({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  points_required: { type: Number, required: true },
  applicable_products: [{ type: String }]
});

const voucherModel = mongoose.model<IVoucher>('Voucher', voucherSchema);

export default voucherModel;
