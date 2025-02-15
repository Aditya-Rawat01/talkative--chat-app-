"use client"
import { useSignupHook } from "@/app/dataFetchingHooks/signup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form"
import {useDropzone} from 'react-dropzone'
import { toast } from "sonner"
type formFields ={
    email:string,
    username:string,
    password:string,
    avatar:string|null
    }
export default function Signup() {
    const router=useRouter()
    const {register, handleSubmit}=useForm<formFields>();
    const [preview,setPreview]=useState<ArrayBuffer|string|null>(null)
    const {mutate, isPending}=useSignupHook()

    const onsubmit:SubmitHandler<formFields>=async(data)=>{
        data.avatar=preview?(preview as string):null
        console.log(data)
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
    
    
    return (
    <div>
        <p>Signup</p>
        <form onSubmit={handleSubmit(onsubmit)} className="h-[500px] bg-red-400 flex flex-col items-center justify-center">
            <label>Set an Avatar</label>
            <div className="bg-white rounded-xl flex flex-col items-center justify-around h-[200px]">
                {preview?<div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                    <img src={preview as string} className="w-full h-full"/>
                </div>:<div className="w-[150px] h-[150px] rounded-full bg-gray-500"></div>}
                <div {...getRootProps()} className="bg-red-300">
                        <input {...getInputProps()}/>
                        {
                            isDragActive ?
                              <p>Drop the Image here ...</p> :
                              <p>Select Image or drag and drop</p>
                        }
                    </div>
            </div>
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