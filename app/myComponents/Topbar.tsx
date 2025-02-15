import Icon from "@/public/chatIcon.png"
import Image from "next/image"
import Settings from "@/public/settings.png"
import placeholder from "@/public/profile.png"
import { Dispatch, SetStateAction, useState } from "react"
export default function Topbar({avatar,setMyAvatar}:{avatar:string|null, setMyAvatar:Dispatch<SetStateAction<string|null>>}) {
    const [settings,setSettings]=useState(false)
    return (
        <div className="w-full relative z-50 h-[65px] font-secondary font-bold text-2xl md:text-3xl bg-[#17BEBB] flex justify-between p-2 md:p-4 items-center ">
            <div className="flex gap-2 items-end">
                <Image src={Icon} alt="icon" className="w-[50px]"/>
                <p>Talkative</p>
            </div>
            <Image src={Settings} alt="icon" className={`w-[20px] mr-2 cursor-pointer transition-all duration-1000 ${!settings?"rotate-90":"rotate-0"}`} onClick={()=>setSettings((prev)=>!prev)}/>
            {
            <div className={`absolute transition-all duration-1000 bg-[#17BEBB]  left-0 h-[calc(100vh-65px)] w-full top-[65px] origin-top-right -z-10 ${!settings?"rotate-90 ":"rotate-0"}`}>
                <div className="w-full h-12 md:h-16 bg-white flex items-center justify-center">Settings</div>
                {<div className="w-full flex items-center justify-center">
                    <Image src={avatar?avatar:placeholder} height={10} width={80} alt="avatar" className="bg-green-500 rounded-full"/>

                </div>}
                <form className="flex flex-col text-sm bg-red-400 items-center justify-around h-72 w-full">
                    <div className="flex flex-col items-center gap-2">
                    <label>New Username</label>
                    <input type="text" className="w-40 p-1 rounded-lg"></input>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                    <label>New Avatar</label>
                    <input type="file" className="w-40 p-1 rounded-lg bg-white cursor-pointer"></input>
                    </div>
                    <button className="rounded-lg w-32 h-12 bg-black text-[#17BEBB]">Submit</button>
                </form>
            </div>
            }
        </div>
    )
}