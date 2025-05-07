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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const argon2 = __importStar(require("argon2"));
const measurementSchema = new mongoose_1.Schema({
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
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], },
    password: { type: String, required: [true, 'Password is required'], minlength: [8, 'Password must be at least 8 characters long'] },
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
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        try {
            this.password = yield argon2.hash(this.password);
            return next();
        }
        catch (error) {
            return next(error);
        }
    });
});
// Method  to compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield argon2.verify(this.password, candidatePassword);
        }
        catch (error) {
            console.error("Error comparing passwords: ", error);
            return false;
        }
    });
};
exports.User = mongoose_1.default.model("User", userSchema);
