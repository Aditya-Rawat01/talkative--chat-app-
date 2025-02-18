"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zodSchema_1 = require("./zodSchema");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const ws_1 = require("ws");
require('dotenv').config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = app.listen(5000);
app.get("/", (req, res) => {
    res.json({
        "msg": "hello"
    });
});
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
function imageUploader(avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield cloudinary_1.v2.uploader.upload(avatar, {
                transformation: [
                    { width: 500, height: 500, crop: "thumb", gravity: "face", zoom: 1.5 }
                ]
            });
            return result.secure_url;
        }
        catch (error) {
            console.log(error);
            throw new Error('Failed to upload the image');
        }
    });
}
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email, avatar } = req.body;
    const success = zodSchema_1.signupSchema.safeParse({ username, password, email });
    if (!username || !password || !email) {
        res.status(411).json({
            "msg": "Some fields are empty"
        });
        return;
    }
    if (success.error) {
        res.status(411).json({
            "msg": success.error.issues[0].message
        });
        return;
    }
    else {
        try {
            const user = yield prisma.user.create({
                data: {
                    username,
                    password,
                    email,
                    avatar: avatar ? yield imageUploader(avatar) : "placeholder"
                }
            });
            const token = jsonwebtoken_1.default.sign({ email, username, avatar: user.avatar }, process.env.SecretKey, { expiresIn: '24h' });
            res.json({
                "msg": "Signed up successfully.",
                "token": token
            });
            return;
        }
        catch (error) {
            res.status(403).json({
                "msg": "User Already Exists. Try Signing In",
                "error": error
            });
            return;
        }
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email } = req.body;
    const success = zodSchema_1.signupSchema.safeParse({ username: "placeholder", password, email });
    if (!password || !email) {
        res.status(411).json({
            "msg": "Some fields are empty"
        });
        return;
    }
    if (success.error) {
        res.status(411).json({
            "msg": success.error.issues[0].message
        });
        return;
    }
    else {
        try {
            const userFound = yield prisma.user.findFirst({
                where: {
                    email,
                }
            });
            if (userFound) {
                if (password !== userFound.password) {
                    res.status(403).json({
                        "msg": "Incorrect Password. Try Again"
                    });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({ email, username: userFound.username, avatar: userFound.avatar }, process.env.SecretKey, { expiresIn: '24h' });
                res.json({
                    "msg": "Signed in successfully.",
                    "token": token
                });
                return;
            }
            else {
                res.status(403).json({
                    "msg": "User doesn't exist. Try Signing Up",
                });
                return;
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                "msg": "Internal Server Error. Please Try Again Later"
            });
            return;
        }
    }
}));
/////// provide proper format to the messages like {type:"Error/Message", sender:null/someone, receiver:someone }
const wss = new ws_1.WebSocketServer({ server });
const totalUsers = new Map([]);
wss.on("connection", function (socket, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.headers["sec-websocket-protocol"];
        try {
            const currentUser = jsonwebtoken_1.default.verify(token, process.env.SecretKey);
            totalUsers.set(currentUser.email, { WebSocket: socket, active: true, username: currentUser.username, avatar: currentUser.avatar });
            const offlineMessages = yield prisma.messages.findMany({
                where: {
                    OR: [
                        {
                            receiver: currentUser.email
                        },
                        {
                            sender: currentUser.email
                        }
                    ]
                },
                orderBy: {
                    createdAt: "asc"
                }
            });
            socket.send(JSON.stringify({ type: "offlineMessages", message: offlineMessages }));
            // socket.send({}) //// we have to convert the object into strings as well ..it sends strings only
            totalUsers.forEach((value, key) => {
                if (value.active) {
                    value.WebSocket.send(JSON.stringify({
                        type: "UPDATE_USERS",
                        users: Array.from(totalUsers.entries())
                            .filter(([id, data]) => id !== key)
                            .map(([id, data]) => ({
                            username: data.username,
                            email: id,
                            active: data.active,
                            avatar: data.avatar
                        }))
                    }));
                }
            });
            socket.on("message", (e) => __awaiter(this, void 0, void 0, function* () {
                const messageObj = JSON.parse(e.toString());
                if (!messageObj.content || !messageObj.receiver) {
                    socket.send(JSON.stringify({ type: "error", message: "Receiver or content is missing" }));
                    return;
                }
                try {
                    const message = yield prisma.messages.create({
                        data: {
                            sender: currentUser.email,
                            receiver: messageObj.receiver,
                            content: messageObj.content
                        }
                    });
                    const receiver = messageObj.receiver;
                    totalUsers.forEach((value, key) => __awaiter(this, void 0, void 0, function* () {
                        if (key === receiver || key === messageObj.sender) {
                            value.WebSocket.send(JSON.stringify({ type: "message", message: messageObj.content, receiver: messageObj.receiver, sender: messageObj.sender }));
                            return;
                        }
                    }));
                    if (!totalUsers.has(receiver)) {
                        socket.send(JSON.stringify({ type: "error", message: "No such users found. Please use frontend interface only" }));
                        return;
                    }
                }
                catch (error) {
                    socket.send(JSON.stringify({ type: "error", message: "Db Error" }));
                    return; /// add return statement instead of socket.close
                }
            }));
            socket.on("close", function () {
                var _a;
                const userEmail = (_a = Array.from(totalUsers.entries())
                    .find(([_, data]) => data.WebSocket === socket)) === null || _a === void 0 ? void 0 : _a[0];
                if (userEmail) {
                    totalUsers.set(userEmail, {
                        WebSocket: socket,
                        active: false,
                        username: currentUser.username,
                        avatar: currentUser.avatar
                    });
                    totalUsers.forEach((value, key) => {
                        if (value.active) {
                            value.WebSocket.send(JSON.stringify({
                                type: "UPDATE_USERS",
                                users: Array.from(totalUsers.entries())
                                    .filter(([id, _]) => id !== key)
                                    .map(([id, data]) => ({
                                    username: data.username,
                                    email: id,
                                    active: data.active,
                                    avatar: data.avatar
                                }))
                            }));
                        }
                    });
                }
                //// remove this
            });
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                socket.send(JSON.stringify({ type: "error", message: "Token expired. Sign in again." }));
                socket.close();
            }
            else {
                socket.send(JSON.stringify({ type: "error", message: "Invalid Token. Sign in again." }));
                socket.send(JSON.stringify(error));
                socket.close();
            }
        }
    });
});
