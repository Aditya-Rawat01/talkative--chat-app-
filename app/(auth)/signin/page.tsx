"use client"
import { useSigninHook } from "@/app/dataFetchingHooks/signin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import signinImage from "@/public/signin.jpg"
import Image from "next/image";
import bg from "@/public/chatbg.jpg"
type formFields ={
    email:string,
    username:string,
    password:string
    }
export default function Signin() {
    const router=useRouter()
    const {register, handleSubmit}=useForm<formFields>();
    const {mutate, isPending}=useSigninHook()

    const onsubmit:SubmitHandler<formFields>=async(data)=>{
        const loadingToast=toast.loading("Loading...",{dismissible:true})
       mutate(data,{
        onSuccess:(data)=>{
            toast.dismiss(loadingToast)
            router.push("/chat")
            toast.success(data);
        },
        onError:(error)=>{
            toast.dismiss(loadingToast)
            toast.error(error.message)
        }
       })
    
    }
    return (
        <div className="flex items-center justify-center h-screen md:relative">
            <div className="hidden md:block -z-10 md:w-1/2 h-screen">
      <Image src={signinImage} alt="signupImage" className="w-full h-full"/>
    </div>
      <div className="w-full h-full text-black relative md:w-1/2 md:h-full bg-gradient-to-r from-red-500 to-orange-500 md:rounded-none">
      <div className="w-full h-full">
      <Image src={bg} alt="image" className="opacity-30 absolute -z-0 w-full h-full"/>
        <form onSubmit={handleSubmit(onsubmit)} className="h-full flex flex-col items-center justify-center gap-6 relative backdrop-blur-[1px]">
            
            <p className="text-4xl font-medium">Signin</p>
            <div className="flex flex-col items-center justify-center gap-1">
            <label>Email</label>
            <input {...register("email")} type='text'  className="w-56 p-2 rounded-lg" required/>
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
            <label>Password</label>
            <input {...register("password")} type='text'  className="w-56 p-2 rounded-lg" required/>
            </div>
            <button type='submit' className="w-56 bg-black text-white p-2 rounded-lg" disabled={isPending}>{isPending?"Submitting...":"Submit"}</button> 
        <p>New Here? Try <Link href={"/signup"} className="underline">Signing Up</Link></p>   

        </form>
    </div>
    </div>
    </div>
    )
}
