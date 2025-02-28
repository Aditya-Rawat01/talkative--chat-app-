
import axios from "axios"
import { httpURI } from "../URI"
export async function ping() {
        try {

            console.log("requested cron job")
            //const res=await axios.get(`${httpURI}`)
            //console.log(res.data.msg)
        } catch (error) {
            console.log("Error occured.")
            
        }
        
}