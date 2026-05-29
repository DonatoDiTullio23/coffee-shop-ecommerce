// server/models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    number: { type: String, index: true },
    customer: {
      name: String,
      email: String,
      phone: String,
      address1: String,
      address2: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
    },
    items: [OrderItemSchema],
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    paymentStatus: { type: String, default: "paid" }, 
    status: { type: String, default: "new" },         
  },
  { timestamps: true }
);

OrderSchema.pre("save", function(next) {
  if (!this.number) this.number = String(this._id).slice(-6).toUpperCase();
  next();
});

export default mongoose.model("Order", OrderSchema);
