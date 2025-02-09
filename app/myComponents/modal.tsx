import { Dispatch, SetStateAction } from "react";

export default function Modal({avatar, username, status, setChatWindow}:{avatar:string,username:string, status:string, setChatWindow:Dispatch<SetStateAction<string|boolean>>}) {
    return (
    <div className="sm:w-[320px] md:w-[400px] lg:w-[500px] xl:w-[600px] h-[62px] bg-[#5EB1BF] rounded-lg flex gap-5 justify-center items-center text-white" onClick={()=>setChatWindow(username)}>
        <p>{avatar}</p>
        <p>{username}</p>
        <p>{status}</p>
    </div>
    )
}