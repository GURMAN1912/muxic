"use client";
import { signIn, signOut, useSession } from 'next-auth/react';
import React from 'react';
import { useRouter } from 'next/navigation';

const Appbar = () => {
    const { data: session, status } = useSession();  // Destructured session and status
    const router = useRouter();

    const handleSignOut = async () => {
        router. push("/"); // Redirect to the homepage
        await signOut(); // Wait for sign out to complete
    };
    

    return (
        <div className='bg-dark DEFAULT z-10 fixed w-full shadow-2xl py-5'>
            <div className='flex justify-between items-center max-w-6xl mx-auto px-6'>
                <div onClick={() => router.push("/")} className='hover:cursor-pointer'>
                    <h1 className='text-3xl font-bold text-white'>
                        Muxic
                    </h1>
                </div>
                <div className='flex items-center'>
                    {status === "loading" ? (
                        <p className='text-white'>Loading...</p> // Handle loading state
                    ) : session?.user ? (
                        <button
                            className='bg-rose-600 text-white py-2 px-4 rounded-full hover:bg-rose-500 transition duration-300'
                            onClick={handleSignOut}
                        >
                            Sign out
                        </button>
                    ) : (
                        <button
                            className='bg-rose-600 text-white py-2 px-4 rounded-full hover:bg-rose-500 transition duration-300'
                            onClick={() => signIn()}
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Appbar;
