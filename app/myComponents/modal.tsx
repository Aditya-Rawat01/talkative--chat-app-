import { Dispatch, SetStateAction } from "react";

export default function Modal({ username, active,email, setChatWindow}:{username:string,email:string, active:boolean, setChatWindow:Dispatch<SetStateAction<string|boolean>>}) {
    return (
    <div className="relative w-[90%] sm:w-[320px] md:w-[400px] lg:w-[500px] xl:w-[600px] h-[62px] bg-[#5EB1BF] rounded-lg flex gap-5 justify-center items-center text-white" onClick={()=>setChatWindow(username)}>
        <p>{username}</p>
        <p className="absolute text-xs text-gray-500 bottom-1">{email}</p>
        <div className="w-10 h-10 bg-white rounded-full absolute left-[10%]">
            <div className={`w-3 h-3 absolute rounded-full ${active?"bg-green-700":"bg-gray-500"} bottom-0 right-0`}></div>

        </div>
    </div>
    )
}