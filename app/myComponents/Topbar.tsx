import Icon from "@/public/chatIcon.png"
import jwt from "jsonwebtoken"

import Image from "next/image"
import Settings from "@/public/settings.png"
import placeholder from "@/public/profile.png"
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react"
import { updateUserHook } from "../dataFetchingHooks/update"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
export default function Topbar() {
    const [settings,setSettings]=useState(false)
    const [myAvatar,setMyAvatar]=useState<string>('')
    const [username, setUsername] = useState("");
    const currentName=useRef<string>('')
    const currentAvatar=useRef<string>('')
    const token=useRef<string>(sessionStorage.getItem("token"))
    const [preview,setPreview]=useState<ArrayBuffer|string|null>(null)
    const email=useRef(null)
    const {mutate}=updateUserHook()
    useEffect(()=>{
        
        if (!token.current) {
            <div>"Error Occurred. Sign in Later"</div>
            return}
        const decoded:any=jwt.decode(token.current as string)
        setMyAvatar(decoded?.avatar)
        email.current=decoded?.email
        currentName.current=decoded.username
    },[token.current])
    function setProfile() {
        console.log("name")
    }
    const decoded:any=jwt.decode(token.current as string)
    mutate({username:decoded.username,email:decoded?.email,avatar:decoded.avatar,publicId:decoded.publicId},{
        onSuccess:(data)=>{
            token.current=sessionStorage.getItem("token")
            toast.success(data)
        }
    })
        const onDrop = useCallback((acceptedFiles:File[]) => {
            
            const file=new FileReader;
            
            file.onload=()=>{
                console.log(acceptedFiles[0])
                setPreview(file.result)
            }
            file.readAsDataURL(acceptedFiles[0])
          }, [])
          const {getRootProps, getInputProps, isDragActive} = useDropzone({
            onDrop,
            maxSize:3*1024*1024,
            accept:{"image/*":[]},  
            onFileDialogCancel() {
                setPreview(null)
            },
        })
        
    if (!settings && username!='') {
        setUsername('')
        setMyAvatar('')
    }
    // the only thing is remaining that the image tag should show the uploaded file from the system
    return (
        <div className="w-full max-h-screen relative z-50 h-[65px] font-primary font-bold text-2xl md:text-3xl bg-[#17BEBB] flex justify-between p-2 md:p-4 items-center ">
            <div className="flex gap-2 items-end">
                <Image src={Icon} alt="icon" className="w-[50px]"/>
                <p>Talkative</p>
            </div>
            <Image src={Settings} alt="icon" className={`w-[20px] mr-2 cursor-pointer transition-all duration-1000 ${!settings?"rotate-90":"rotate-0"}`} onClick={()=>setSettings((prev)=>!prev)}/>
            {
            <div className={`absolute transition-all duration-1000 bg-[#17BEBB]  left-0 h-[calc(100vh-65px)] w-full top-[65px] origin-top-right -z-10 ${!settings?"rotate-90 ":"rotate-0"}`}>
                <div className="w-full h-12 md:h-16 bg-white flex items-center justify-center font-medium">Settings</div>
                {<div className="w-full flex flex-col font-medium items-center justify-center">
                    <Image src={(myAvatar!=="placeholder" && myAvatar)?myAvatar:placeholder} height={2000} width={2000} alt="avatar" className="border-2 border-white rounded-full h-32 w-32 mt-2"/>
                    <p>{username?username:currentName.current}</p>
                    <p className="text-sm font-mono font-semibold">{email.current}</p>
                </div>}
                <div className="w-full h-[1px] mt-1 bg-black"></div>
                <form className="flex flex-col text-base md:text-lg items-center justify-around h-72 md:h-[280px] w-full font-primary font-medium" onSubmit={(e)=>{e.preventDefault(); setProfile()}}>
                    <div className="flex flex-col items-center gap-2 w-full">
                    <label>New Username</label>
                    <input type="text" value={username} className="w-44 p-1 md:px-2 rounded-lg focus:outline-none" onChange={(e)=>setUsername(e.target.value)} required></input>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                    <label>New Avatar</label>
                    
                    <div {...getRootProps()} className="bg-red-300">
                        <input {...getInputProps()}/>
                        {
                            isDragActive ?
                              <p>Drop the Image here ...</p> :
                              <p>Select Image or drag and drop</p>
                        }
                    </div>
                    </div>
                    <button className="rounded-lg w-32 h-12 bg-black text-[#17BEBB] hover:bg-white hover:text-black transition-all duration-200">Submit</button>
                </form>
            </div>
            }
        </div>
    )
}