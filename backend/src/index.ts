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
const server=app.listen(3000)
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
                email:email
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
           "msg":success.error.issues
       })
       return;
    } else {
       try {
           const userFound=await prisma.user.findFirst({
               where:{
                   email:email,
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

const wss=new WebSocketServer({server})
const onlineUsers=new Map<String,WebSocket>([])
const totalUsers= new Map<String,WebSocket>([])
wss.on("connection",async function(socket,req) {
    const token=req.headers.authorization
    try {
    const currentUser=jwt.verify(token as string,process.env.SecretKey as string)
    const OfflineMessages=await prisma.messages.findMany({
        where:{
            receiver:(currentUser as JwtPayload).email
        },
        orderBy: {
            createdAt: "asc"
        }
    })
    console.log(OfflineMessages)     /// remove this as welll
    // socket.send({}) //// we have to convert the object into strings as well ..it sends strings only
    onlineUsers.set((currentUser as JwtPayload).email,socket)
    totalUsers.set((currentUser as JwtPayload).email,socket)
    socket.send("Connected. Ready To Chat 🚀")    
    socket.on("message",(e)=>{
        const messageObj=JSON.parse(e.toString())
        const receiver=messageObj.receiver
        totalUsers.forEach((value,key)=>{
            if (key===receiver) {
                value.send(messageObj.content)
            }
        })
        if (!totalUsers.has(messageObj.receiver)) {
            socket.send("No such users found. Please use frontend interface only")
        }
    })
    socket.on("close",function() {
        
        onlineUsers.forEach((value,key)=>{
            if (value===socket) {
                onlineUsers.delete(key)
            }
        })
        console.log({onlineUsers,totalUsers})    //// remove this
    })
    
    








    } catch (error) {
        if ((error as JwtPayload).name==="TokenExpiredError") {
            socket.send("Token Expired. Sign in again")
            socket.close()
        }
        else {
            socket.send("Invalid Token. Sign in again")
            socket.send(JSON.stringify(error))
            socket.close()
        }
    }
})




