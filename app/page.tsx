import Image from "next/image";
import Link from "next/link";
{/* <div className="flex gap-3">
    
    <Link href={"/signin"}>Signin</Link>
    </div> */}
import Prisma from "@/public/prisma.png"
import Mongodb from "@/public/mongodb.svg"
import websockets from "@/public/ws.svg"
import ReactQuery from "@/public/reactQuery.png"
import cloud from "@/public/Cloudinary.svg"
import { Button } from "@/components/ui/button"
import express from "@/public/express.svg"
import next from "@/public/nextjs.svg"
import { Github, Twitter, Linkedin, MessageCircle, Upload, UserCircle, ArrowRight } from "lucide-react"
import { AvatarUpload } from "./myComponents/upload";
import { Message } from "./myComponents/message";
import ss from "@/public/ss.png"
import GitIcon from "./myComponents/githubIcon";
import { TwitterIcon } from "./myComponents/twitterIcon";
import { LinkedInIcon } from "./myComponents/linkedinIcon";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MessageCircle className="h-6 w-6" />
            <span className="font-bold text-xl">talkative</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#tech" className="text-sm font-medium hover:text-primary">
              Tech Stack
            </Link>
            <Link href="https://github.com/Aditya-Rawat01/talkative--chat-app-" className="text-sm font-medium hover:text-primary">
              GitHub
            </Link>
          </nav>
          <Link href={"/signup"}><Button>Try Demo</Button></Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              A Modern Chat App Built with Next.js
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              My personal project exploring real-time communication using Next.js, WebSockets, and modern web
              technologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/signup"}>
              <Button size="lg">
                Try the Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
              <Link href={"https://github.com/Aditya-Rawat01/talkative--chat-app-"}>
              <Button variant="outline" size="lg">
                View on GitHub
              </Button>
              </Link>
              
            </div>
            <div className="mt-16">
              <Image
                src={ss}
                width={1000}
                height={600}
                alt="Chat App Interface"
                className="rounded-lg shadow-xl mx-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Implemented using WebSocket connections for instant message delivery and updates.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="h-6 w-6 text-primary" />

                </div>
                <h3 className="text-xl font-semibold mb-2">Online/Offline Status</h3>
                <p className="text-muted-foreground">
                  See the status of the receipents.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <AvatarUpload/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Avatars</h3>
                <p className="text-muted-foreground">Personalize your profile with custom avatars and user settings.</p>
              </div>
              <div className="flex flex-col md:col-start-2 items-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Message/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Offline Message Support</h3>
                <p className="text-muted-foreground">Stores the messages, so you dont miss any message while offline ;)</p>
              </div>
            </div>
          </div>
        </section>

        
        <section id="tech" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Tech Stack Used:</h2>

            <div  className="grid md:grid-cols-3 gap-8 md:gap-0 justify-center mb-8 max-w-4xl mx-auto">

              <div className="p-6 gap-1 rounded-lg border place-self-end flex flex-col items-center w-72 h-72  md:w-[160px] md:h-[320px] lg:w-[200px] lg:h-[313px]">
                  <Image src={next} alt="image" className="w-3/4 h-1/2"/>
                  <h2>NextJs</h2>
                  <p className="mb-4 text-muted-foreground text-center">
                    Provides SSR, SSG, CDNs for images.
                  </p>

              </div>

              <div className="p-6 gap-1 rounded-lg border place-self-center flex flex-col items-center w-72 h-72 md:w-[160px] md:h-[320px] lg:w-[200px] lg:h-[313px]">
                  <Image src={express} alt="image" className="w-3/4 h-1/2"/>
                  <h2>Express</h2>
                  <p className="mb-4 text-muted-foreground text-center">
                    Provides ease in developing http api endpoints.
                  </p>
              </div>

              <div className="p-6 gap-1 rounded-lg border flex flex-col items-center w-72 h-72 md:w-[160px] md:h-[320px] lg:w-[200px] lg:h-[313px]">
                <Image src={websockets} alt="image" className="w-3/4 h-1/2"/>
                <h2>WebSockets</h2>
                <p className="mb-4 text-muted-foreground text-center">
                  Ws library used for real time updates and messages.
                </p>
              </div>
            </div>



            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto justify-center">

              <div className="p-6 gap-1 rounded-lg border flex flex-col items-center w-72 h-72 md:w-auto md:h-auto justify-center">
                <Image src={Mongodb} alt="image" className="w-3/4 h-1/2"/>
                <h2>MongoDb</h2>
                <p className="mb-4 text-muted-foreground text-center">
                  Provides flexible schema, faster write operations.
                </p>
              </div>

              <div className="p-6 gap-1 rounded-lg border flex flex-col items-center w-72 h-72 md:w-auto md:h-auto justify-center">
                <Image src={Prisma} alt="image" className="w-3/4 h-1/2"/>
                <h2>Prisma</h2>
                <p className="mb-4 text-muted-foreground text-center">
                  ORM, provides better interface for database.
                </p>
              </div>

              <div className="p-6 gap-1 rounded-lg border flex flex-col items-center w-72 h-72 md:w-auto md:h-auto justify-center">
                <Image src={cloud} alt="image" className="w-3/4 h-1/2"/>
                <h2>Cloudinary</h2>
                <p className="mb-4 text-muted-foreground text-center">
                  Used for uploading the avatars securely.
                </p>
              </div>

              

              <div className="p-6 gap-1 rounded-lg border flex flex-col items-center w-72 h-72 md:w-auto md:h-auto justify-center">
                <Image src={ReactQuery} alt="image" className="w-3/4 h-1/2 "/>
                <h2>React Query</h2>
                <p className="mb-4 text-muted-foreground text-center">
                  for fetching and managing data easily.
                </p>
              </div>
              
             
            </div>
            
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Try It Out?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Check out the live demo or explore the code on GitHub. Feel free to contribute!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/signup"}>
              <Button size="lg">
                Launch Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
            <Link href="https://github.com/Aditya-Rawat01/talkative--chat-app-">
              <Button variant="outline" size="lg">
                View Source
              </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <MessageCircle className="h-6 w-6" />
              <span className="font-bold text-xl">talkative</span>
            </div>
            <div className="flex space-x-6">
              <Link href="https://github.com/Aditya-Rawat01" className="text-muted-foreground hover:text-primary">
                <GitIcon/>
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="https://x.com/adityarawat240" className="text-muted-foreground hover:text-primary">
                <TwitterIcon/>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://www.linkedin.com/in/aditya-rawat-qwerty" className="text-muted-foreground hover:text-primary">
                <LinkedInIcon/>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Built with Next.js and Tailwind CSS. Open source on GitHub.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

