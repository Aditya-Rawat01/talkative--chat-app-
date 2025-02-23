"use client"
import bg from "@/public/bg.png"
import sendBg from "@/public/Send.svg"
import cancel from "@/public/cancel.png"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import Topbar from "../myComponents/Topbar"
import Modal from "../myComponents/modal"
import Image from "next/image"
import chatbg from "@/public/chatbg.jpg"
import { wsURI } from "../URI"
import jwt from "jsonwebtoken"
import placeholder from "@/public/profile.png"
import Search from "@/public/Search.png"
import placeholderbg from "@/public/placeholder.png"
interface activeUsers {
    username:string,
    email:string,
    active:boolean,
    avatar:string
}
export default function Chat() {
    const router=useRouter()
    const [windowState,setWindowstate]=useState<boolean|string>(false)
    const [individual,setIndividual]=useState<{username:string,email:string,avatar:string}|null>()
    const [text, setText] = useState("");
    const [socket,setSocket]=useState<WebSocket|undefined>()
    const [messages,setMessages]=useState<{
        id: string;
        sender: string;
        receiver: string;
        content: string;
        time: string;
    }[]|undefined>()
    const [activeUsers,setActiveUsers]=useState<activeUsers[]>()
    const allUsersArr=useRef<activeUsers[]|null>(null) // for search functionality
    const observerDiv1=useRef<HTMLDivElement>(null)
    const observerDiv2=useRef<HTMLDivElement>(null)
    function expireToken(token:string) {
        const tokenObj:any=jwt.decode(token)
        const expiry=tokenObj?.exp*1000
        return Date.now()>=expiry
    }    
    useEffect(()=>{
        const token=sessionStorage.getItem("token")
        
        if (expireToken(token as string)) {
            sessionStorage.removeItem("token")
        }
        if (!sessionStorage.getItem("token") || !token) {
            requestAnimationFrame(()=>toast("No token found. Redirecting to home page"))
            router.push("/")
            return
        }
        const ws=new WebSocket(wsURI, [token])
        setSocket(ws)
        ws.onopen=()=>{
            requestAnimationFrame(()=>toast("Connected. Ready To Chat 🚀"))
        }
        ws.onmessage=(e)=>{
            const content=JSON.parse(e.data)
            if (content.type==="offlineMessages") { // handles offline messages
                setMessages(content.message)
            }
            else if (content.type==="message") { // handle realtime messages
                setMessages((prev)=>[...(prev??[]),{id:content.id,content:content.message,sender:content.sender,receiver:content.receiver,time:content.time}])
            }
            else if(content.type==="UPDATE_USERS") {
                setActiveUsers(content.users)
                allUsersArr.current=content.users
                }
            else if (content.type==="error") {
                requestAnimationFrame(()=>toast(content.message))
            }
            
        }
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close()
            }
            
        }
    },[])
    useEffect(()=>{
        observerDiv1.current?.scrollIntoView({behavior:"smooth"})
        observerDiv2.current?.scrollIntoView({behavior:"smooth"})
    },[messages,individual?.email])
    const individualMessages=messages?.filter((index)=>index.receiver===individual?.email || index.sender===individual?.email)
    
    function SendMessage() {
        if (text.trim()!=="") {
            
            const senderToken=sessionStorage.getItem("token")
            const senderObj:any=jwt.decode(senderToken as string)
            const sender=senderObj?.email
            socket?.send(JSON.stringify({type:"message",content:text,sender:sender,receiver:individual?.email}))
            setText("")
            
        }
        
    }
    return (
        <div className="h-screen w-screen bg-black">
            <div className="md:flex items-start justify-start">
                <div>
                <div className={`${windowState?"hidden md:block":"block"} w-full md:w-[412px] lg:w-[500px] xl:w-[600px]`}><Topbar/></div>
                <div className={`w-full flex items-center justify-center relative ${windowState?"hidden":"flex"} md:flex mt-10`}>
                    <input className={`bg-[#868686] text-white rounded-md w-[85%]  h-[40px] bg-opacity-25 focus:outline-none pl-8 sm:pl-10 `} placeholder="Search Users" onSubmit={(e)=>e.preventDefault()} onChange={(e)=>setActiveUsers(allUsersArr.current?.filter((index)=>index.email.startsWith(e.target.value)||index.username.startsWith(e.target.value)))}/>
                    <Image src={Search}  alt="searchIcon" className="w-[18px] absolute left-[9%]"/>
                </div>
                <div className={`w-full ${windowState?"h-full md:h-[calc(100vh-157px)]":"h-[calc(100vh-157px)]"} md:flex overflow-auto hide-scrollbar`}>
                    <div className={`w-full md:w-[412px] lg:w-[500px] xl:w-[600px] h-full flex flex-col items-center gap-2 ${!windowState?"pt-3":"md:pt-3"}`}>
                            {activeUsers?.map((key:any,value)=>{
                                return (
                                    <div key={value} className={`${!windowState? "flex":"hidden md:flex"} w-full md:w-[412px] lg:w-[480px] xl:w-[600px] justify-center cursor-pointer`} onClick={()=>setIndividual({username:key.username,email:key.email,avatar:key.avatar})}>
                                        <Modal username={key.username} email={key.email} active={key.active} avatar={key.avatar} setChatWindow={setWindowstate}/>
                                    </div>
                                )})}
                            <div className={`${windowState? "flex md:hidden":"hidden"} flex-col h-screen w-screen relative`}>
                            <Image
                            className="w-full h-full absolute z-10"
                            src={chatbg}
                            alt="image"
                            />
                                <div className="absolute w-full z-20 text-white">
                                <div className="h-16 w-full flex items-center justify-center relative text-2xl bg-white text-black shadow-md shadow-gray-500 rounded-b-[50px] ">
                                <div className="w-10 h-10 rounded-full absolute left-[10%] drop-shadow-custom overflow-hidden bg-red-600 outline outline-1 outline-purple-500">
                                <Image src={(individual?.avatar!=="placeholder" && individual?.avatar)?individual.avatar:placeholder} width={90} height={90} alt="placeholder" className="w-[40px] h-[41px]"/></div>
                                    {individual?.username}
                                    {<span className={` text-sm absolute bottom-0 ${((activeUsers?.find((key:any,value)=>key.email===individual?.email)?.active))?"text-[#3aad20]":"text-gray-600"}`}>{(activeUsers?.find((key:any,value)=>key.email===individual?.email)?.active)?"online":"offline"}</span>}
                                <Image src={cancel} alt="cancel" onClick={()=>setWindowstate(false)} className="w-8 right-6 top-1/3 absolute cursor-pointer"/>
                                </div>
                                
                                <div className="h-[calc(100vh-128px)] overflow-auto scroll-smooth hide-scrollbar">
                                {individualMessages?.map((index,num)=><div key={num} className={`p-1 w-full  text-black flex px-2 relative  ${index.sender===individual?.email?"justify-start ":"justify-end "}`}>
                                    <div className={`p-2  rounded-full text-wrap max-w-[85%] bg-white shadow-md outline outline-1 ${index.receiver===individual?.email?"ps-3 rounded-br-none shadow-[#3E98FF] outline-[#3E98FF]":"shadow-[#FF6F6F] outline-[#FF6F6F] rounded-bl-none"}`}>
                                        <p>{index.content}</p>
                                        <p className={`text-[10px] ${index.receiver===individual?.email?"place-self-end":"place-self-start"}`}>{index.time}</p>
                                    </div>
                                    
                                    </div>)}
                                    <div ref={observerDiv1} className="scroll-mt-10"></div>
                                </div>
                                <div className="h-12 mx-2 text-black rounded-full flex items-center justify-center relative">
                                    <textarea
                                    className="w-full hide-scrollbar resize-none h-full border p-2 rounded-md bg-white placeholder:text-gray-800 placeholder:font-semibold whitespace-pre-wrap"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Send Message"/>
                                    <Image src={sendBg} alt="send" width={24} className={`absolute right-3 ${text?"":"opacity-35"} cursor-pointer`} onClick={SendMessage} />
                                </div>
                            </div>
                        </div>    
                    </div>
                    
                </div>
        </div>
        {windowState ? 
                    <div className="hidden h-screen md:w-[calc(100vw-412px)] md:flex relative">
                            <Image
                            className="h-full absolute z-10"
                            src={chatbg}
                            alt="image"
                            />
                            <div className="absolute z-20 w-full h-full text-white">
                                <div className="h-16 w-full flex items-center justify-center relative text-2xl bg-white text-black shadow-md shadow-gray-500 rounded-b-[50px]">
                                <div className="w-10 h-10 rounded-full absolute left-[10%] drop-shadow-custom overflow-hidden outline outline-2 outline-purple-500">
                                <Image src={(individual?.avatar!=="placeholder" && individual?.avatar)?individual.avatar:placeholder} width={90} height={90} alt="placeholder" className="w-[40px] h-[41px]"/></div>
                                    {individual?.username}
                                    {<span className={` text-sm absolute bottom-0 ${((activeUsers?.find((key:any,value)=>key.email===individual?.email)?.active))?"text-[#3aad20]":"text-gray-600"}`}>{(activeUsers?.find((key:any,value)=>key.email===individual?.email)?.active)?"online":"offline"}</span>}
                                <Image src={cancel} alt="cancel" onClick={()=>setWindowstate(false)} className="w-8 right-6 top-1/3 absolute cursor-pointer"/>
                                </div>
                                <div className="h-[calc(100vh-128px)] overflow-auto scroll-smooth hide-scrollbar">
                                {individualMessages?.map((index,num)=><div key={num} className={`p-1 w-full  text-black flex px-2 lg:px-5  ${index.sender===individual?.email?"justify-start ":"justify-end "}`}>
                                    <div className={`p-2  rounded-full text-wrap max-w-[85%] bg-white shadow-md outline outline-1 ${index.receiver===individual?.email?"ps-3 rounded-br-none shadow-[#3E98FF] outline-[#3E98FF]":"shadow-[#FF6F6F] outline-[#FF6F6F] rounded-bl-none"}`}>
                                        <p>{index.content}</p>
                                        <p className={`text-[10px] ${index.receiver===individual?.email?"place-self-end":"place-self-start"}`}>{index.time}</p>
                                    </div>
                                    </div>)}
     {/**/}                           <div ref={observerDiv2} className="scroll-mt-10"></div>
                                </div>
                                <div className="h-12 m-2 text-black rounded-full flex items-center justify-center relative">
                                    <textarea
                                    className="w-full hide-scrollbar resize-none h-full border p-2 rounded-md bg-white placeholder:text-gray-800 placeholder:font-semibold whitespace-pre-wrap"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Send Message"/>
                                    <Image src={sendBg} alt="send" width={24} className={`absolute right-3 ${text?"":"opacity-35"} cursor-pointer`} onClick={SendMessage}/>
                                </div>
                    </div>
                </div>
                :
                <div className="hidden md:flex h-screen md:w-[calc(100vw-412px)] relative justify-center items-end shadow-2xl overflow-hidden">
                    <Image alt="placeholderBg" src={placeholderbg} className="w-96 md:w-[500px]"/>
                </div>
                }
        </div>
    </div>
    )
}