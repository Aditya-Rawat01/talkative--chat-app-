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


/*"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Add your sign-in logic here
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <MessageCircle className="h-6 w-6" />
        <span className="font-bold text-xl">ChatProject</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="john@example.com" type="email" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-muted-foreground/20" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-muted-foreground/20" />
            </div>
            <Button variant="outline" className="w-full" type="button">
              Continue with Google
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

*/