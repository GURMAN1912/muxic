import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion';
import feature1 from '../assests/features1.jpeg'
import feature2 from '../assests/features2.jpeg'
import feature3 from '../assests/features3.jpeg'

const Features = () => {
  // Animation variants for entering the viewport
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className='min-h-screen bg-gradient-to-t from-dark-gradient-from via-dark-gradient-via to-dark-gradient-to py-12 px-6'>
      <div className='text-center mb-10'>
        <h1 className='text-white text-4xl font-bold mb-4'>Key Features</h1>
        <p className='text-gray-300 text-lg'>Explore the unique features that make Muxic stand out!</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto'>
        {/* Feature 1 */}
        <motion.div 
          className='flex flex-col items-center bg-white bg-opacity-10 p-6 rounded-lg hover:bg-opacity-20 transition-shadow shadow-lg hover:shadow-xl'
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5 }}
        >
          <Image src={feature1} width={200} height={200} alt="Fan Interaction" className='mb-4 rounded-lg shadow-md'/>
          <div className='text-center'>
            <h2 className='text-white text-2xl font-semibold mb-2'>Fan Interaction</h2>
            <p className='text-gray-300'>Let fans choose the music they want to listen to.</p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          className='flex flex-col items-center bg-white bg-opacity-10 p-6 rounded-lg hover:bg-opacity-20 transition-shadow shadow-lg hover:shadow-xl'
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5 }}
        >
          <Image src={feature2} width={200} height={200} alt="Live Streaming" className='mb-4 rounded-lg shadow-md'/>
          <div className='text-center'>
            <h2 className='text-white text-2xl font-semibold mb-2'>Live Streaming</h2>
            <p className='text-gray-300'>Stream with real-time input from your audience.</p>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          className='flex flex-col items-center bg-white bg-opacity-10 p-6 rounded-lg hover:bg-opacity-20 transition-shadow shadow-lg hover:shadow-xl'
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5 }}
        >
          <Image src={feature3} width={200} height={200} alt="High-Quality Audio" className='mb-4 rounded-lg shadow-md'/>
          <div className='text-center'>
            <h2 className='text-white text-2xl font-semibold mb-2'>High-Quality Audio</h2>
            <p className='text-gray-300'>Crystal clear audio for an immersive experience.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Features;
