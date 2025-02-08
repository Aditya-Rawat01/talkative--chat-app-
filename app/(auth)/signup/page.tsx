"use client"
import { useSignupHook } from "@/app/dataFetchingHooks/signup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
type formFields ={
    email:string,
    username:string,
    password:string
    }
export default function Signup() {
    const router=useRouter()
    const {register, handleSubmit}=useForm<formFields>();
    const {mutate, isPending}=useSignupHook()

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
    <div>
        <p>Signup</p>
        <form onSubmit={handleSubmit(onsubmit)} className="h-60 bg-red-400 flex flex-col items-center justify-center">
            <label>Email</label>
            <input {...register("email")} type='text'  className="w-56 p-2" required/>
            <label>Username</label>
            <input {...register("username")} type='text' className="w-56 p-2" required/>
            <label>Password</label>
            <input {...register("password")} type='text'  className="w-56 p-2" required/>
            <button type='submit' className="w-56 bg-black text-white p-2" disabled={isPending}>{isPending?"Submitting...":"Submit"}</button> 
        </form>
        <p>Signed up Already? Try <Link href={"/signin"} className="underline">Signing In</Link></p>   
    </div>
    )
}