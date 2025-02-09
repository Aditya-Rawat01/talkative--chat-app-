"use client"
import bg from "@/public/bg.png"
import sendBg from "@/public/Send.svg"
import placeholder from "@/public/placeholder.jpg"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Topbar from "../myComponents/Topbar"
import Modal from "../myComponents/modal"
import Image from "next/image"


const users=[
    {username:"Aditya", status:"online",avatar:"mr. bean"},
    {username:"Test 1", status:"online",avatar:"bheem"},
    {username:"Test 2", status:"offline",avatar:"chutki"}
]
interface individualInterface {
    username:string,
    status:string,
    avatar:string
}
export default function Chat() {
    const router=useRouter()
    const [windowState,setWindowstate]=useState<boolean|string>(false)
    const [individual,setIndividual]=useState<individualInterface|null>()
    const [text, setText] = useState("");
    useEffect(()=>{
        const token=localStorage.getItem("token")
        if (!token) {
            requestAnimationFrame(()=>toast("No token found. Redirecting to home page"))
            router.push("/")
        }

    },[])
    //state ke upr chats khulegi / nya route bnaane ki jaroorat ni.
    // websockets logic. Receive all the message and sort it according to the chats as well.
    //move the div to different component and have it receive the message as props.
    function SendMessage() {
        if (text.trim()!=="") {
            console.log(text.trim())
            setText("")
        }
        
    }

    return (
        <div className="h-screen w-screen bg-talkativeBg">
        <div className={`${windowState?"hidden sm:block":"block"}`}><Topbar/></div>
        <div className={`w-full ${windowState?"h-full sm:h-[calc(100vh-48px)]":"h-[calc(100vh-48px)]"} sm:flex`}>
        <div className="w-full sm:w-[320px] md:w-[400px] lg:w-[500px] xl:w-[600px] h-full flex flex-col items-center gap-2 p-3">
            {users.map((index,elem)=>{
                return (
                        <div key={elem} className={`${!windowState? "flex":"hidden sm:flex"} w-full justify-center cursor-pointer`} onClick={()=>setIndividual(index)}>
                            <Modal username={index.username} avatar={index.avatar} status={index.status} setChatWindow={setWindowstate}/>
                        </div>
                   
                    )
            })}
        <div className={`${windowState? "flex sm:hidden":"hidden"} flex-col h-screen w-screen relative`}>
                            <Image
                            className="w-full h-full absolute z-10"
                            src={bg}
                            alt="image"
                            />
                            <div className="absolute w-full z-20 text-white">
                                <p className="h-16 w-full flex items-center justify-center relative text-2xl backdrop-blur-[1px]">
                                    {individual?.username}

                                <span onClick={()=>setWindowstate(false)} className="bg-black h-8 w-8 absolute right-3 flex items-center justify-center rounded-full">x</span>
                                </p>
                                <div className="h-[calc(100vh-128px)] overflow-auto scroll-smooth hide-scrollbar">
                                <p>Scrollable div with messages</p>
                                </div>
                                <div className="h-12 m-2 text-black rounded-full flex items-center justify-center relative">
                                    <textarea
                                    className="w-full hide-scrollbar resize-none h-full border p-2 rounded-md bg-white bg-opacity-40 placeholder:text-black whitespace-pre-wrap"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Send Message"/>
                                    <Image src={sendBg} alt="send" width={24} className="absolute right-3" onClick={SendMessage}/>
                                </div>
                            </div>
                        </div>    
        </div>
        {windowState ? 
                <div className="hidden h-full sm:w-[calc(100vw-320px)] sm:flex bg-white relative">
                     <Image
                            className="w-full h-screen absolute z-10 -top-12"
                            src={bg}
                            alt="image"
                            />
                    <div className="absolute z-20 w-full h-full -top-12 text-white">
                        <p className="h-16 w-full flex items-center justify-center relative text-2xl backdrop-blur-[1px]">
                                    {individual?.username}
                                <span onClick={()=>setWindowstate(false)} className="bg-black h-8 w-8 absolute right-3 flex items-center justify-center rounded-full">x</span>
                                </p>
                                <div className="h-[calc(100vh-128px)] overflow-auto scroll-smooth hide-scrollbar">
                                <p>Scrollable div with messages</p>
                                </div>
                                <div className="h-12 m-2 text-black rounded-full flex items-center justify-center relative">
                                    <textarea
                                    className="w-full hide-scrollbar resize-none h-full border p-2 rounded-md bg-white bg-opacity-40 placeholder:text-black whitespace-pre-wrap"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Send Message"/>
                                    <Image src={sendBg} alt="send" width={24} className="absolute right-3" onClick={SendMessage}/>
                                </div>
                    </div>
                </div>
                :
                <div className="hidden sm:flex h-screen sm:w-[calc(100vw-320px)] relative justify-center items-center bg-green-600 rounded-b-[9999px] shadow-2xl -top-12">
                    
                    <p className="absolute z-20 text-white text-xl underline underline-offset-4 shadow-xl">Start Chatting</p>
                </div>
                }
        </div>
    </div>
    )
}