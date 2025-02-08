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
                    "msg":"User doesn't exists. Try Signing Up",
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
    const token=req.headers.authorization
    try {
    const currentUser=jwt.verify(token as string,process.env.SecretKey as string)
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
    socket.send(JSON.stringify({ type: "message", message: offlineMessages}))
    console.log(offlineMessages)     /// remove this as welll
    // socket.send({}) //// we have to convert the object into strings as well ..it sends strings only
    totalUsers.set((currentUser as JwtPayload).email,{WebSocket:socket,active:true})
    socket.send(JSON.stringify({type:"Info",message:"Connected. Ready To Chat 🚀"}))
    //socket.send(JSON.stringify({type:"Info",message:totalUsers})) this doesnt work . this only sends to current socket only    
    socket.on("message",async(e)=>{
        const messageObj:{content:string, receiver:string}=JSON.parse(e.toString())
        if (!messageObj.content || !messageObj.receiver) {
            socket.send(JSON.stringify({type:"error",message:"Receiver or content is missing"}))
            socket.close()
        }
        try {
            await prisma.messages.create({
                data:{
                    sender:(currentUser as JwtPayload).email,
                    receiver:messageObj.receiver,
                    content:messageObj.content
                }
            }) 
        } catch (error) {
            socket.send(JSON.stringify({type:"error", message:"Db Error"}))
            return /// add return statement instead of socket.close
        }
        const receiver=messageObj.receiver
        totalUsers.forEach(async(value,key)=>{
            if (key===receiver) {
                value.WebSocket.send(JSON.stringify({type:"message", message:messageObj.content}))
                return
            }
        })
        if (!totalUsers.has(messageObj.receiver)) {
            socket.send(JSON.stringify({type:"error", message:"No such users found. Please use frontend interface only"}))
        }
    })
    socket.on("close",function() {
        totalUsers.forEach((value,key)=>{
            if (value.WebSocket===socket) {
                value.active=false
                return
            }
            
        })
        
        console.log({totalUsers})    //// remove this
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




