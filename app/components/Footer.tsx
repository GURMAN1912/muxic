import React from 'react';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'; // Make sure react-icons is installed

const Footer = () => {
  return (
    <footer className='border-t-2 border-white/10 bg-gradient-to-br from-dark-gradient-from via-dark-gradient-via to-dark-gradient-to p-6'>
      <div className='max-w-6xl mx-auto text-gray-300 flex md:flex-row flex-col items-center justify-between'>
        {/* Logo or Brand Name */}
        <div className='flex flex-col items-center mb-4'>
          <h1 className='text-white text-4xl font-bold'>Muxic</h1>
        </div>

        {/* Social Media Links */}
        <div className='flex justify-center space-x-6 mb-4'>
          <a href="#" className='text-gray-300 hover:text-white transition'>
            <FaTwitter size={28} />
          </a>
          <a href="#" className='text-gray-300 hover:text-white transition'>
            <FaFacebook size={28} />
          </a>
          <a href="#" className='text-gray-300 hover:text-white transition'>
            <FaInstagram size={28} />
          </a>
        </div>

        {/* Copyright */}
        <div className='mt-2 text-center text-sm'>
          <p>&copy; 2024 Muxic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
