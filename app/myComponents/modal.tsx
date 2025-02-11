import { Dispatch, SetStateAction } from "react";

export default function Modal({ username, active, setChatWindow}:{username:string, active:boolean, setChatWindow:Dispatch<SetStateAction<string|boolean>>}) {
    return (
    <div className="w-[90%] sm:w-[320px] md:w-[400px] lg:w-[500px] xl:w-[600px] h-[62px] bg-[#5EB1BF] rounded-lg flex gap-5 justify-center items-center text-white" onClick={()=>setChatWindow(username)}>
        <p>{username}</p>
        {<div className={`w-3 h-3 rounded-full ${active?"bg-green-700":"bg-gray-500"}`}></div>}
    </div>
    )
}