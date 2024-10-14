"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import  { useEffect } from 'react'

const Redirects = () => {
    const session = useSession();
    const router=useRouter();
    useEffect(()=>{
        if(session.data?.user){
            router.push("/dashboard")
        }
    },[session])
  return null;
}

export default Redirects
