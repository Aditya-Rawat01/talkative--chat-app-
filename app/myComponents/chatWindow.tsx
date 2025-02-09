import { useState } from "react"

export default function chatWindow() {
    const [windowState,setChatWindowstate]=useState(false)
    return (
        <div className="sm:flex">
        <div className={`all-Users w-full sm:w-1/2 h-fit p-2 bg-red-300 ${windowState?"hidden sm:block":"block"}`} onClick={()=>setChatWindowstate((prev)=>!prev)}>
            <div className="individuals rounded-full h-20 bg-black text-white flex gap-2">
                <p>Avatar online/offline</p>
                <p>Name</p>
            </div>
            </div>
            <div className={`chatWindow w-full sm:w-1/2 h-64 ${!windowState?"hidden sm:block":"block"} bg-green-400 `}>
            <p>User's name fixed pos</p>
            <span className="sm:hidden bg-black text-white rounded-full p-1" onClick={()=>setChatWindowstate((prev)=>!prev)}>X</span>
            <div>Scrollabe div with messages</div>
            <div>Send messages</div>
            
            </div>
        
        </div>
    )
}