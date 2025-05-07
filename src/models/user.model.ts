import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";
import * as argon2 from 'argon2';


const measurementSchema = new Schema({
    neck: { type: Number },
  chest: { type: Number },
  waist: { type: Number },
  hip: { type: Number },
  shoulder: { type: Number },
  sleeve: { type: Number },
  inseam: { type: Number },
  outseam: { type: Number },
  thigh: { type: Number },
  calf: { type: Number },
  ankle: { type: Number },
  wrist: { type: Number },
  armLength: { type: Number },
  height: { type: Number },
  other: { type: String },
}, { _id: false });


const userSchema = new Schema<IUser>({
    name: {type: String, required: [true, 'Name is required'], trim: true },
    email: {type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],},
    password: {type: String, required: [true, 'Password is required'], minlength: [8, 'Password must be at least 8 characters long']},
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      profileImage: {
        type: String,
        default: null,
      },
    role: {
        type: String,
        emum: ['client', 'admin', 'tailor'],
        default: 'client'
    },
    measurements: {
        type: measurementSchema,
        default: {},
    },
}, { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  });


  userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    try {
        this.password = await argon2.hash(this.password);
        return next()
    } catch (error: any) {
        return next(error);
    }
  })



  // Method  to compare passwords
  userSchema.methods.comparePassword = async function(candidatePassword: string) : Promise<boolean>{
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        console.error("Error comparing passwords: ", error);
        return false;
    }
  };

  export const User = mongoose.model<IUser>("User", userSchema)

