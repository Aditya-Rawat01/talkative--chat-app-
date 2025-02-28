"use client"
import { useSignupHook } from "@/app/dataFetchingHooks/signup";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form"
import {useDropzone} from 'react-dropzone'
import { toast } from "sonner"
import placeholder from "@/public/profile.png"
import signupImage from "@/public/signup.jpg"
import bg from "@/public/chatbg.jpg"
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
            setPreview(file.result)
        }
        file.readAsDataURL(acceptedFiles[0])
      }, [])
      const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        maxSize:3*1024*1024,
        accept:{"image/*":[]},
      onError:(error)=>{
        toast.error("Image size exceed 3MB")

      } , 
        onFileDialogCancel() {
            setPreview(null)
        },
    })
    
    
    return (
      <div className="flex items-center justify-center h-screen md:relative">
      <div className="w-full h-full text-[#00154e] relative md:w-1/2 md:h-full bg-gradient-to-r from-lime-500 via-green-500 to-sky-500 md:rounded-none">
      <div className="w-full h-full">
        <Image src={bg} alt="image" className="opacity-30 absolute -z-0 w-full h-full"/>
        <form onSubmit={handleSubmit(onsubmit)} className="h-[90%] flex flex-col items-center justify-around relative">
        <p className="text-4xl font-medium">Signup</p>
            <div className=" rounded-xl flex flex-col items-center justify-around h-[200px]">
            <div className="w-[130px] h-[130px] rounded-full overflow-hidden outline outline-2 outline-yellow-400">
                {<Image alt="profilePic" width={100} height={100} src={(preview as string)?preview as string:placeholder as unknown as string} className="w-full h-full "/>}
            </div>
            <label className="mt-1">Set an Avatar</label>

                <div {...getRootProps()} className="outline outline-1 outline-white p-2 rounded-full  cursor-pointer">
                        <input {...getInputProps()}/>
                        {
                            isDragActive ?
                              <p>Drop the Image here ...</p> :
                              <p>Select Image or drag and drop</p>
                        }
                    </div>
            </div>
            <div className="flex gap-2 items-center justify-between w-[285px]">
            <label className="pl-5">Email: </label>
            <input {...register("email")} type='text'  className="w-48 p-2 rounded-lg" required/>
            </div>
            <div className="flex gap-2 items-center justify-between w-[285px]">
            <label>Username:</label>
            <input {...register("username")} type='text' className="w-48 p-2 rounded-lg" required/>
            </div>
            <div className="flex gap-2 items-center justify-between w-[285px]">
            <label>Password: </label>
            <input {...register("password")} type='text'  className="w-48 p-2 rounded-lg" required/>
            </div>
            <button type='submit' className="w-[285px] bg-black text-white  p-2 rounded-lg" disabled={isPending}>{isPending?"Submitting...":"Submit"}</button> 
            <p>Signed up Already? Try <Link href={"/signin"} className="underline">Signing In</Link></p>   
            
        </form>
    </div>
    </div> 
    <div className="hidden md:block -z-10 md:w-1/2 h-screen">
      <Image src={signupImage} alt="signupImage" className="w-full h-full"/>
    </div>
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