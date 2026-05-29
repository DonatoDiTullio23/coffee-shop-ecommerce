// server/scripts/seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = "admin@coffee.local";
  const password = "demo1234";
  const passwordHash = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, passwordHash, role: "admin", name: "Admin" });
    console.log("Created admin:", user.email);
  } else {
    console.log("Admin already exists:", user.email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
