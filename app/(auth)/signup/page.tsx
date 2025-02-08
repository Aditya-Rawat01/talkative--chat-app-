"use client"
import { useSignupHook } from "@/app/dataFetchingHooks/signup";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form"
type formFields ={
    email:string,
    username:string,
    password:string
    }
export default function Signup() {
    const router=useRouter()
    const {register, handleSubmit}=useForm<formFields>();
    const {mutate}=useSignupHook()
    const onsubmit:SubmitHandler<formFields>=async(data)=>{
       mutate(data,{

        onSuccess:()=>{
            console.log(data)
            router.push("/chat")
        },// toast message with redirect logic
        onError:(data)=>{
            console.log(data)
        }
       })
    
    }
    return (
    <div>
        <form onSubmit={handleSubmit(onsubmit)} className="h-60 bg-red-400 flex flex-col items-center justify-center">
            <label>Email</label>
            <input {...register("email")} type='text'  className="w-56 p-2" required/>
            <label>Username</label>
            <input {...register("username")} type='text' className="w-56 p-2" required/>
            <label>Password</label>
            <input {...register("password")} type='text'  className="w-56 p-2" required/>
            <button type='submit' className="w-56 bg-black text-white p-2">Submit</button> 
        </form>   
    </div>
    )
}