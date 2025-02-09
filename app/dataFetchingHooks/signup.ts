import axios, { AxiosError } from "axios";
import { httpURI } from "../URI";
import { useMutation } from "@tanstack/react-query";


async function signup(data:{username:string,email:string,password:string}) {
    try {
        const res=await axios.post(`${httpURI}/signup`,{
              username:data.username,
              email:data.email,
              password:data.password
            })
            localStorage.setItem("token",res.data.token)
        return res.data.msg  
    } catch (error:any) {
        throw new Error(error.response.data.msg || "Signup Failed. Please Try Again")
    }
    }

export function useSignupHook() {
    return useMutation({
        mutationKey:["signup"],
        mutationFn:signup
    })
}