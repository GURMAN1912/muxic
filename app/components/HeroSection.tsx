"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';
import heroImage from '../assests/heroImage.jpeg'; // Ensure the correct path is used
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
    const session = useSession();
    const router = useRouter();
  return (
    <div className='min-h-screen bg-gradient-to-b from-dark-gradient-from via-dark-gradient-via to-dark-gradient-to flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className='text-center text-gray-light max-w-4xl'
        >
          <div className='flex justify-center my-4'>
            <Image src={heroImage} className='max-w-sm' alt='Muxic Logo' />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className='text-6xl font-bold mb-4'
          >
            Let Your Audience Choose the Beat
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className='text-lg mb-6 text-gray-400'
          >
            Muxic is a platform that allows your audience to choose the music they want to listen to.
          </motion.p>

          {!session.data?.user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            >
              <button
                className='bg-rose-500 text-white py-2 px-6 rounded-full hover:bg-rose-400 text-2xl'
                onClick={() => router.push("/api/auth/signin")} // Directs to sign-in if not logged in
              >
                Get Started
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
            >
              <button
                className='bg-rose-500 text-white py-2 px-6 rounded-full hover:bg-rose-400 text-2xl'
                onClick={() => router.push("/dashboard")} // Directs to the dashboard if logged in
              >
               Join a Stream
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
  )
}

export default HeroSection
