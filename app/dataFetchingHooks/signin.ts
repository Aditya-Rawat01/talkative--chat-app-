import axios, { AxiosError } from "axios";
import { httpURI } from "../URI";
import { useMutation } from "@tanstack/react-query";


async function signin(data:{username:string,email:string,password:string}) {
    try {
        const res=await axios.post(`${httpURI}/signin`,{
              email:data.email,
              password:data.password
            })
        return res.data.msg  
    } catch (error:any) {
        console.log(error.response.data.msg)
        throw new Error(error.response.data.msg || "Signin Failed. Please Try Again")
    }
    }

export function useSigninHook() {
    return useMutation({
        mutationKey:["signin"],
        mutationFn:signin
    })
}