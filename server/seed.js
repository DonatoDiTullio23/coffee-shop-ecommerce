// server/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/Product.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "./.env") });

await connectDB();

// --- Coffee Beans / Products Seed Data ---
const products = [
  {
    name: "Bridge Head",
    description: "Smooth and balanced Honduras Arabica beans with hints of chocolate and nuts.",
    price: 17.99,
    stock: 10,
    category: "Coffee",
    image: "https://www.bridgehead.ca/cdn/shop/files/Honduras.jpg?v=1754505521&width=1000",
  },
  {
    name: "DrumRoaster Coffee Co.",
    description: "Rich medium roast with notes of red fruit and caramelized sugar. House blend perfection.",
    price: 49.99,
    stock: 0,
    category: "Coffee",
    image: "https://images.squarespace-cdn.com/content/v1/551b257ee4b072084061481f/03ee34a8-2caa-4464-a501-a885069d2040/house2024.jpg?format=750w",
  },
  {
    name: "Florentine",
    description: "Classic espresso roast with full body and a dark, nutty finish.",
    price: 36.99,
    stock: 5,
    category: "Coffee",
    image: "https://epacflexibles.com/wp-content/uploads/2018/01/coffee_bag_mockup-1536x1536.png",
  },
  {
    name: "Pure Intentions",
    description: "Black Hat espresso blend. Deep flavor with chocolate undertones and creamy texture.",
    price: 89.99,
    stock: 2,
    category: "Espresso",
    image: "https://pureintentionscoffee.com/cdn/shop/files/5LBBAG_ECOMM_2.jpg?v=1688141790&width=1200",
  },
  {
    name: "Red Bay Coffee",
    description: "Slow Burn blend — bold, smoky, and complex with a rich aroma for espresso lovers.",
    price: 99.99,
    stock: 7,
    category: "Coffee",
    image: "https://www.redbaycoffee.com/cdn/shop/files/5-lb-whole-bean-coffee-bag-448632_720x.jpg?v=1733327948",
  },
];


const importData = async () => {
  try {
    await Product.deleteMany(); 
    await Product.insertMany(products);
    console.log("✅ Data Imported!");
    process.exit();
  } catch (err) {
    console.error("❌ Error importing data:", err);
    process.exit(1);
  }
};

importData();
