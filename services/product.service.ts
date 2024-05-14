import { Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import productModel from "../models/product.modal";

export const createProductService = CatchAsyncErrors(
  async (data: any, res: Response) => {
    const product = await productModel.create(data);

    res.status(201).json({
      success: true,
      product,
    });
  }
);

export const updateProductService = CatchAsyncErrors(
  async (data: any,productId: string , res: Response) => {
    const product = await productModel.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true }
    );

    res.status(201).json({
      success: true,
      product
    })
  }
);

// get all products 
export const getAllProductServices = async (res: Response) => {
  const products = await productModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    products,
  });
};
