import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex gap-3">
    <Link href={"/signup"}>Signup</Link>
    <Link href={"/signin"}>Signin</Link>
    </div>
    
  );
}
