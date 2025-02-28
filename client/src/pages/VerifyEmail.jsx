import React from 'react'
import { useRef } from "react";

const VerifyEmail = () => {
  const inputsRef = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length === 1 && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-lg overflow-hidden border-[0.1px] border-zinc-700">
        <div className="p-8">
          <h1 className="text-2xl text-white font-bold text-center mb-4">Verify Email</h1>
          <p className="text-gray-300 text-sm text-center mb-6">
            Enter the 6-digit code sent to your email.
          </p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-lg font-bold text-white bg-[#282828] border border-zinc-600 rounded-md focus:border-[#f0533e] focus:ring-2 focus:ring-[#f0533e] focus:outline-none"
                ref={(el) => (inputsRef.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-[#f0533e] hover:bg-[#f56952] text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa7e66] focus:ring-offset-2 focus:ring-offset-[#121212]"
          >
            Verify
          </button>
        </div>
        
        <div className="py-4 px-8 bg-[#282828] text-center">
          <p className="text-gray-300 text-sm">
            Didn't receive a code?{" "}
            <a href="#" className="text-[#ffa48f] hover:text-[#ffb7a5] font-medium transition-colors">
              Resend
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;