"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTokenFromHeader = exports.extractUserIdFromToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// Generate JWT token
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret);
};
exports.generateToken = generateToken;
// Verify JWT token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Extract user ID from token
const extractUserIdFromToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        return decoded.id;
    }
    catch (error) {
        return null;
    }
};
exports.extractUserIdFromToken = extractUserIdFromToken;
// Parse Bearer token from Authorization header
const parseTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};
exports.parseTokenFromHeader = parseTokenFromHeader;
