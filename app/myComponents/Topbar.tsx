export default function Topbar() {
    return (
        <div className="w-full h-12 bg-white flex justify-around items-center sm:w-[320px] md:w-[400px] lg:w-[500px] xl:w-[600px]">
            <div className="flex gap-2">
                <p>Icon</p>
                <p>Talkative</p>
            </div>
            <p>Settings</p>
        </div>
    )
}