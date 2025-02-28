import express from 'express'
import cors from 'cors'
import { signupSchema } from './zodSchema'
import { PrismaClient } from '@prisma/client'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import { WebSocket, WebSocketServer } from 'ws'
require('dotenv').config();
const app=express()
const prisma=new PrismaClient()

app.use(cors(
{
    origin: 'https://talkative-chat-app-steel.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.use(express.json({limit: '50mb'}))
const totalUsers= new Map<string,{WebSocket:WebSocket,active:boolean,username:string,avatar:string}>([])


const port = process.env.PORT || 5000;
const server = app.listen(port);
app.get("/",(req,res)=>{
    res.json({
        "msg":"hello"
    })
})
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

async function imageUploader(avatar:string) {
    try {
        const result=await cloudinary.uploader.upload(avatar,{
            transformation:[
                { width: 500, height: 500, crop: "thumb", gravity: "face", zoom: 1.5 }
            ]
        })
        
        return {avatarUrl:result.secure_url,publicId:result.public_id}  
    } catch (error) {
        throw new Error('Failed to upload the image') // do res.json
        
    }
    
}

app.post("/signup",async (req,res)=>{
 const {username, password, email,avatar}=req.body
//  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp','null'];
 const success=signupSchema.safeParse({username, password, email})
//  const validImage=validExtensions.includes(avatar.substring(avatar.length-4,avatar.length))
 if (!username|| !password || !email) {
    res.status(411).json({
        "msg":"Some fields are empty"
    })
    return;
}
// if (!validImage) {
//     res.status(403).json({
//         "msg":"Image type is invalid"
//     })
//     return;
// }
 if (success.error) {
    res.status(411).json({
        "msg":success.error.issues[0].message
    })
    return;
 } else {
        let avatarUrl="placeholder"
        let publicId=""
        if (avatar) {
            try {
                let val=await imageUploader(avatar)
                avatarUrl=val.avatarUrl
                publicId=val.publicId
            } catch (error) {
                res.status(300).json({
                    "msg":error
                })   
                return
            }
            
        }
    
    try {
        const user=await prisma.user.create({
            data:{
                username,
                password,
                email,
                avatar:avatarUrl,
                publicId
            }})
        const token=jwt.sign({email,username,avatar:user.avatar,publicId},process.env.SecretKey as string,{expiresIn:'7d'})
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
                const token=jwt.sign({email,username:userFound.username,avatar:userFound.avatar,publicId:userFound.publicId},process.env.SecretKey as string,{expiresIn:'7d'})
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

app.post("/update",async(req,res)=>{
    let {avatar, username, email,publicId}=req.body
    if (!avatar || !username || !email || (publicId==null||undefined)) {
        res.status(403).json({
        "msg":"Avatar or username is missing.",
        "avatar":avatar,
        "publicId":publicId
    })
    return
}
    // checks for valid image type
    let avatarUrl="placeholder"
    try {
        const uploadAvatar=await cloudinary.uploader.upload(avatar,{
            public_id:publicId,
            invalidate:true
        })
        avatarUrl=uploadAvatar.secure_url
        publicId=uploadAvatar.public_id 
    } catch (error) {
        res.status(500).json({
            "msg":error
        })
        return
    }
    
    
// cloudinary upload image fn with replacing the original one
try {
    const updatedUser=await prisma.user.update({
        where: {
            email
        }, 
        data:{
            username,
            avatar:avatarUrl,// cloudinary image
            publicId
        }
    })
    const user=totalUsers.get(email)
        user!.username=updatedUser.username
        user!.avatar=updatedUser.avatar
    totalUsers.forEach((value,key) => {
        if (value.active) {
            value.WebSocket.send(JSON.stringify({
                type: "UPDATE_USERS",
                users: Array.from(totalUsers.entries())
                .filter(([id, data]) => id!==key)
                .map(([id, data]) => ({
                    username:data.username, //add the optional logic for the username ((id!==email from body)?data.username:updatedUser.username)
                    email:id,
                    active: data.active,
                    avatar:data.avatar //for avatar as well
                }))
            }));
        }    
    });
    const token=jwt.sign({email,username:updatedUser.username,avatar:updatedUser.avatar,publicId},process.env.SecretKey as string,{expiresIn:'24h'})
    // create a jwt token again in order to avoid inconsistencies while signing up.
    res.json({
        "msg":"User Updated Successfully",
        "token":token,
        
    })
} catch (error) {
    res.status(403).json({
        "msg":"Error occurred, check backend"
    })
}
    
})
/////// provide proper format to the messages like {type:"Error/Message", sender:null/someone, receiver:someone }



const wss=new WebSocketServer({server})
wss.on("connection",async function(socket,req) {
    const token=req.headers["sec-websocket-protocol"]
    try {
    const currentUser=jwt.verify(token as string,process.env.SecretKey as string)
    totalUsers.set((currentUser as JwtPayload).email,{WebSocket:socket,active:true,username:(currentUser as JwtPayload).username,avatar:(currentUser as JwtPayload).avatar})
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
    const offlineMsg=offlineMessages.map((index)=>{
            const createdAt:string=index.createdAt.toISOString()
            return {...index,createdAt}
        })
    socket.send(JSON.stringify({ type: "offlineMessages", message: offlineMsg}))
    
    totalUsers.forEach((value,key) => {
        if (value.active) {
            value.WebSocket.send(JSON.stringify({
                type: "UPDATE_USERS",
                users: Array.from(totalUsers.entries())
                .filter(([id, data]) => id!==key)
                .map(([id, data]) => ({
                    username:data.username,
                    email:id,
                    active: data.active,
                    avatar:data.avatar
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
                    value.WebSocket.send(JSON.stringify({type:"message", message:messageObj.content,receiver:messageObj.receiver,sender:messageObj.sender, createdAt:message.createdAt.toISOString()}))
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
        const user=totalUsers.get(userEmail)
        user!.active=false
        console.log(user?.username)
        totalUsers.forEach((value, key) => {
            if (value.active) {
                value.WebSocket.send(JSON.stringify({
                    type: "UPDATE_USERS",
                    users: Array.from(totalUsers.entries())
                        .filter(([id, _]) => id !== key)
                        .map(([id, data]) => ({
                            username: data.username,
                            email:id,
                            active: data.active,
                            avatar:data.avatar
                        }))
                }));
                
            }
        });
    }
           
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




