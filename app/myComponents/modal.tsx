import { Dispatch, SetStateAction } from "react";
import ChatIcon from "@/public/chat_bubble.png"
import Image from "next/image";
import placeholder from "@/public/profile.png"
export default function Modal({ username, active,email, avatar, setChatWindow}:{username:string,email:string, active:boolean, avatar:string, setChatWindow:Dispatch<SetStateAction<string|boolean>>}) {
    return (
    <div className="relative w-[85%] xl:w-[80%] h-[62px] bg-[#B1DDF1] rounded-lg flex gap-5 justify-center items-center text-[#112A46]" onClick={()=>setChatWindow(email)}>
        <p>{username}</p>
        <p className="absolute text-xs text-gray-500 bottom-1">{email}</p>
        <div className="w-10 h-10 bg-white rounded-full absolute left-[10%] drop-shadow-custom">
            <Image src={avatar!=="placeholder"?avatar:placeholder} width={100} height={100} alt="placeholder" className="rounded-full h-full"/>
            <div className={`w-3 h-3 absolute rounded-full ${active?"bg-green-600":"bg-gray-500"} bottom-0 right-0`}></div>

        </div>
        <Image src={ChatIcon} alt="chatIcon" className="w-[24px] absolute right-3 top-[40%]"/>
    </div>
    )
}