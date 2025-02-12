import express from 'express'
import cors from 'cors'
import { signupSchema } from './zodSchema'
import { PrismaClient } from '@prisma/client'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { WebSocket, WebSocketServer } from 'ws'
require('dotenv').config();
const app=express()
const prisma=new PrismaClient()
app.use(express.json())
app.use(cors())
const server=app.listen(5000)
app.get("/",(req,res)=>{
    res.json({
        "msg":"hello"
    })
})

app.post("/signup",async (req,res)=>{
 const {username, password, email}=req.body
 const success=signupSchema.safeParse({username, password, email})
 if (!username|| !password || !email) {
    res.status(411).json({
        "msg":"Some fields are empty"
    })
    return;
}
 if (success.error) {
    res.status(411).json({
        "msg":success.error.issues[0].message
    })
    return;
 } else {
    try {
        await prisma.user.create({
            data:{
                username,
                password,
                email
            }})
        const token=jwt.sign({email},process.env.SecretKey as string,{expiresIn:'24h'})
        res.json({
            "msg":"Signed up successfully.",
            "token":token
        })
        return    
    } catch (error) {
       res.status(403).json({
        "msg":"User Already Exists. Try Signing In",
        "error":error
       })
       return
    }

 }

})

app.post("/signin",async(req,res)=>{
    const {password, email}=req.body
    const success=signupSchema.safeParse({username:"placeholder",password, email})
    if (!password || !email) {
       res.status(411).json({
           "msg":"Some fields are empty"
       })
       return;
   }
    if (success.error) {
       res.status(411).json({
           "msg":success.error.issues[0].message
       })
       return;
    } else {
       try {
           const userFound=await prisma.user.findFirst({
               where:{
                   email,
               }})
            if (userFound) {
                if (password!==userFound.password) {
                    res.status(403).json({
                        "msg":"Incorrect Password. Try Again"
                    })
                    return
                }
                const token=jwt.sign({email},process.env.SecretKey as string,{expiresIn:'24h'})
                res.json({
                    "msg":"Signed in successfully.",
                    "token":token
                })
                return
            }
            else {
                res.status(403).json({
                    "msg":"User doesn't exist. Try Signing Up",
                   })
                   return
                 
            }   
       } catch (error) {
          res.status(500).json({
           "msg":"Internal Server Error. Please Try Again Later"
          })
          return
       }
    }  
})


/////// provide proper format to the messages like {type:"Error/Message", sender:null/someone, receiver:someone }



const wss=new WebSocketServer({server})
const totalUsers= new Map<string,{WebSocket:WebSocket,active:boolean}>([])
wss.on("connection",async function(socket,req) {
    const token=req.headers["sec-websocket-protocol"]
    try {
    const currentUser=jwt.verify(token as string,process.env.SecretKey as string)
    totalUsers.set((currentUser as JwtPayload).email,{WebSocket:socket,active:true})
    const offlineMessages=await prisma.messages.findMany({
        
        where:{
            OR:[
                {
                    receiver:(currentUser as JwtPayload).email
                },
                {
                    sender:(currentUser as JwtPayload).email
                }
            ]
        },
        orderBy: {
            createdAt: "asc"
        }
    })
    socket.send(JSON.stringify({ type: "offlineMessages", message: offlineMessages}))
    // socket.send({}) //// we have to convert the object into strings as well ..it sends strings only
    
    totalUsers.forEach((value,key) => {
        if (value.active) {
            value.WebSocket.send(JSON.stringify({
                type: "UPDATE_USERS",
                users: Array.from(totalUsers.entries())
                .filter(([id, data]) => id!==key)
                .map(([id, data]) => ({
                    username:id,
                    active: data.active
                }))
            }));
        }    
    });
    
    socket.on("message",async(e)=>{
        const messageObj:{content:string, receiver:string, sender:string}=JSON.parse(e.toString())
        if (!messageObj.content || !messageObj.receiver) {
            socket.send(JSON.stringify({type:"error",message:"Receiver or content is missing"}))
            return
        }
        try {
            const message=await prisma.messages.create({
                data:{
                    sender:(currentUser as JwtPayload).email,
                    receiver:messageObj.receiver,
                    content:messageObj.content
                }
            })
            const receiver=messageObj.receiver
        
            totalUsers.forEach(async(value,key)=>{
                if (key===receiver || key===messageObj.sender) {
                    value.WebSocket.send(JSON.stringify({type:"message", message:messageObj.content,receiver:messageObj.receiver,sender:messageObj.sender,createdAt:message.createdAt}))
                    return
                }
            })
            if (!totalUsers.has(receiver)) {
            socket.send(JSON.stringify({type:"error", message:"No such users found. Please use frontend interface only"}))
            return
        }    
        } catch (error) {
            socket.send(JSON.stringify({type:"error", message:"Db Error"}))
            return /// add return statement instead of socket.close
        }
        
    })
    socket.on("close",function() {
        const userEmail = Array.from(totalUsers.entries())
        .find(([_, data]) => data.WebSocket === socket)?.[0];
    
    if (userEmail) {
        totalUsers.set(userEmail, {
            WebSocket: socket,
            active: false
        }
    )
       

        totalUsers.forEach((value, key) => {
            if (value.active) {
                value.WebSocket.send(JSON.stringify({
                    type: "UPDATE_USERS",
                    users: Array.from(totalUsers.entries())
                        .filter(([id, _]) => id !== key)
                        .map(([id, data]) => ({
                            username: id,
                            active: data.active
                        }))
                }));
            }
        });
    }
        
           //// remove this
    })
    
    








    } catch (error) {
        if ((error as JwtPayload).name==="TokenExpiredError") {
            socket.send(JSON.stringify({ type: "error", message: "Token expired. Sign in again." }))
            socket.close()
        }
        else {
            socket.send(JSON.stringify({ type: "error", message: "Invalid Token. Sign in again." }))
            socket.send(JSON.stringify(error))
            socket.close()
        }
    }
})




