import Icon from "@/public/chatIcon.png"
import jwt from "jsonwebtoken"

import Image from "next/image"
import Settings from "@/public/settings.png"
import placeholder from "@/public/profile.png"
import { useCallback, useEffect, useRef, useState } from "react"
import { useUpdateUserHook } from "../dataFetchingHooks/update"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
export default function Topbar() {
    const [settings,setSettings]=useState(false)
    const [myAvatar,setMyAvatar]=useState<ArrayBuffer|string>('')
    const [username, setUsername] = useState("");
    const currentName=useRef<string>('')
    const currentAvatar=useRef<string>('')
    const token=useRef<string>('')
    const email=useRef(null)
    const {mutate, isPending}=useUpdateUserHook()
    const router=useRouter()
    useEffect(()=>{
        token.current=sessionStorage.getItem("token") as string
        if (!token.current) {
            requestAnimationFrame(()=>toast("No token found. Redirecting to home page"))
            router.push("/")
            return}
        const decoded:any=jwt.decode(token.current as string)
        setMyAvatar(decoded?.avatar)
        email.current=decoded?.email
        currentAvatar.current=decoded?.avatar
        currentName.current=decoded.username
    },[token.current])
    function setProfile() {
        const decoded:any=jwt.decode(token.current as string)
        mutate({username,email:decoded?.email,avatar:myAvatar as string,publicId:decoded.publicId},{
            
        onSuccess:(data)=>{
            
            token.current=sessionStorage.getItem("token") as string
            toast.success(data)
            
        },
        onError:(error)=>{
            toast.error(error as unknown as string)
        }
    })
    }
   
    if (isPending) {
        toast.info("Updating User...")
    }
    
        
        const onDrop = useCallback((acceptedFiles:File[]) => {
            
            const file=new FileReader;
            
            file.onload=()=>{
                setMyAvatar(file.result as string)
            }
            file.readAsDataURL(acceptedFiles[0])
          }, [])
          const {getRootProps, getInputProps, isDragActive} = useDropzone({
            onDrop,
            maxSize:3*1024*1024,
            accept:{"image/*":[]},  
            onFileDialogCancel() {
                setMyAvatar(currentAvatar.current)
            },
        })
        
    if (!settings && (username!="" || myAvatar!=currentAvatar.current)) {
        setUsername('')
        setMyAvatar(currentAvatar.current)
    }
    return (
        <div className="w-full max-h-screen relative z-50 h-[65px] font-primary font-bold text-2xl md:text-3xl bg-[#17BEBB] flex justify-between p-2 md:p-4 items-center">
            <div className="flex gap-2 items-end">
                <Image src={Icon} alt="icon" className="w-[50px]"/>
                <p>Talkative</p>
            </div>
            <Image src={Settings} alt="icon" className={`w-[20px] mr-2 cursor-pointer transition-all duration-1000 ${!settings?"rotate-90":"rotate-0"}`} onClick={()=>setSettings((prev)=>!prev)}/>
            {
            <div className={`absolute transition-all duration-1000 bg-[#17BEBB]  left-0 h-[calc(100vh-65px)] w-full top-[65px] origin-top-right -z-10 ${!settings?"rotate-90":"rotate-0"}`}>
                <div className="w-full h-[52px] md:h-[68px] bg-white flex items-center justify-center font-medium">Settings</div>
                {<div className="w-full flex flex-col font-medium items-center justify-center">
                    <Image src={((myAvatar as string)!=="placeholder" && myAvatar as string)?myAvatar as string:placeholder} height={2000} width={2000} alt="avatar" className="border-2 border-white rounded-full h-32 w-32 mt-2"/>
                    <p>{username?username:currentName.current}</p>
                    <p className="text-sm font-mono font-semibold">{email.current}</p>
                </div>}
                <div className="w-[50%] place-self-center h-[1px] mt-1 bg-black"></div>
                <form className="flex flex-col text-base md:text-lg items-center justify-around h-72 md:h-[280px] w-full font-primary font-medium" onSubmit={(e)=>{e.preventDefault(); setProfile()}}>
                    <div className="flex flex-col items-center gap-2 w-full">
                    <label>New Username</label>
                    <input type="text" value={username} className="w-44 p-1 md:px-2 rounded-lg focus:outline-none" onChange={(e)=>setUsername(e.target.value)} required></input>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                    <label>New Avatar</label>
                    
                    <div {...getRootProps()} className="outline text-white outline-1 outline-white rounded-full p-1 cursor-pointer">
                        <input {...getInputProps()}/>
                        {
                            isDragActive ?
                              <p>Drop the Image here ...</p> :
                              <p>Select Image or drag and drop</p>
                        }
                    </div>
                    </div>
                    <button className="rounded-lg w-32 h-12 bg-black text-[#17BEBB] hover:bg-white hover:text-black transition-all duration-200" disabled={isPending}>Submit</button>
                </form>
            </div>
            }
        </div>
    )
}