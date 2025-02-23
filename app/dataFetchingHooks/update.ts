import axios, { AxiosError } from "axios";
import { httpURI } from "../URI";
import { useMutation } from "@tanstack/react-query";

//avatar, username, email,publicId
async function updateUser({username,email,avatar,publicId}:{username:string,email:string,avatar:string,publicId:string}) {
    try {
        const res=await axios.post(`${httpURI}/update`,{
              username:username,
              email:email,
              publicId:publicId,
              avatar:avatar
            })
            sessionStorage.setItem("token",res.data.token)
        return res.data.msg  
    } catch (error:any) {
        throw new Error(error.response.data.msg || "Update failed. Please Try Again")
    }
    }

export function useUpdateUserHook() {
    return useMutation({
        mutationKey:["update"],
        mutationFn:updateUser
    })
}