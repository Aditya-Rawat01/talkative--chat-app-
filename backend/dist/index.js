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
const ws_1 = require("ws");
require('dotenv').config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = app.listen(3000);
app.get("/", (req, res) => {
    res.json({
        "msg": "hello"
    });
});
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
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
            yield prisma.user.create({
                data: {
                    username,
                    password,
                    email: email
                }
            });
            const token = jsonwebtoken_1.default.sign({ email }, process.env.SecretKey, { expiresIn: '24h' });
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
            "msg": success.error.issues
        });
        return;
    }
    else {
        try {
            const userFound = yield prisma.user.findFirst({
                where: {
                    email: email,
                }
            });
            if (userFound) {
                if (password !== userFound.password) {
                    res.status(403).json({
                        "msg": "Incorrect Password. Try Again"
                    });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({ email }, process.env.SecretKey, { expiresIn: '24h' });
                res.json({
                    "msg": "Signed in successfully.",
                    "token": token
                });
                return;
            }
            else {
                res.status(403).json({
                    "msg": "User doesn't exists. Try Signing Up",
                });
                return;
            }
        }
        catch (error) {
            res.status(500).json({
                "msg": "Internal Server Error. Please Try Again Later"
            });
            return;
        }
    }
}));
/////// provide proper format to the messages like {type:"Error/Message", sender:null/someone, receiver:someone }
const wss = new ws_1.WebSocketServer({ server });
const onlineUsers = new Map([]);
const totalUsers = new Map([]);
wss.on("connection", function (socket, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.headers.authorization;
        try {
            const currentUser = jsonwebtoken_1.default.verify(token, process.env.SecretKey);
            const OfflineMessages = yield prisma.messages.findMany({
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
            socket.send(JSON.stringify(OfflineMessages));
            console.log(OfflineMessages); /// remove this as welll
            // socket.send({}) //// we have to convert the object into strings as well ..it sends strings only
            onlineUsers.set(currentUser.email, socket);
            totalUsers.set(currentUser.email, socket);
            socket.send("Connected. Ready To Chat 🚀");
            socket.on("message", (e) => {
                const messageObj = JSON.parse(e.toString());
                if (!messageObj.content || !messageObj.receiver) {
                    socket.send("Receiver or content is missing");
                    socket.close();
                }
                const receiver = messageObj.receiver;
                totalUsers.forEach((value, key) => __awaiter(this, void 0, void 0, function* () {
                    if (key === receiver) {
                        value.send(messageObj.content);
                        try {
                            yield prisma.messages.create({
                                data: {
                                    sender: currentUser.email,
                                    receiver: key,
                                    content: messageObj.content
                                }
                            });
                        }
                        catch (error) {
                            socket.send("Db error");
                            socket.close();
                        }
                        return;
                    }
                }));
                if (!totalUsers.has(messageObj.receiver)) {
                    socket.send("No such users found. Please use frontend interface only");
                }
            });
            socket.on("close", function () {
                onlineUsers.forEach((value, key) => {
                    if (value === socket) {
                        onlineUsers.delete(key);
                        return;
                    }
                });
                console.log({ onlineUsers, totalUsers }); //// remove this
            });
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                socket.send("Token Expired. Sign in again");
                socket.close();
            }
            else {
                socket.send("Invalid Token. Sign in again");
                socket.send(JSON.stringify(error));
                socket.close();
            }
        }
    });
});
