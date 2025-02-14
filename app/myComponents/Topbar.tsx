import Icon from "@/public/chatIcon.png"
import Image from "next/image"
import Settings from "@/public/settings.png"
export default function Topbar() {
    return (
        <div className="w-full h-[65px] font-secondary font-bold text-2xl md:text-3xl bg-[#17BEBB] flex justify-between p-2 md:p-4 items-center ">
            <div className="flex gap-2 items-end">
                <Image src={Icon} alt="icon" className="w-[50px]"/>
                <p>Talkative</p>
            </div>
            <Image src={Settings} alt="icon" className="w-[20px] mr-2"/>
        </div>
    )
}