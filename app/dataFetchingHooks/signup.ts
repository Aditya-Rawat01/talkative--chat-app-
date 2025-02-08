import axios from "axios";
import { httpURI } from "../URI";
import { useMutation } from "@tanstack/react-query";


async function signup(data:{username:string,email:string,password:string}) {
    try {
        const res=await axios.post(`${httpURI}/signup`,{
              username:data.username,
              email:data.email,
              password:data.password
            })
        return res.data.msg  
    } catch (error) {
        throw error
    }
    }

export function useSignupHook() {
    return useMutation({
        mutationKey:["signup"],
        mutationFn:signup
    })
}