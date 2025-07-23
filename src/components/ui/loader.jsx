'use client';

import React from 'react';
import { TypeAnimation } from 'react-type-animation';

const Loader = ({ message = "Preparing Files", size = 100 }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <div className="flex flex-col items-center justify-center space-y-6 text-white">
                <div
                    className="animate-spin rounded-full border-4 border-gray-300 border-t-purple-500"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderWidth: `${size * 0.05}px`,
                    }}
                />
                <TypeAnimation
                    sequence={[
                        message,         
                        2000,            
                        ' ',             
                        500,             
                    ]}
                    speed={50}
                    repeat={Infinity}
                    wrapper="span"
                    className="text-lg px-5 sm:text-xl font-medium"
                />
            </div>
        </div>
    );
};

export default Loader;
