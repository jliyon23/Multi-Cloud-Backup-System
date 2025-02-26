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
    <div className="bg-zinc-950 h-screen flex justify-center items-center">
      <div className="flex justify-center items-center flex-col py-4 px-6 gap-4 border-[0.1px] border-slate-500 rounded">
        <h1 className="text-2xl text-white font-extrabold">VERIFY EMAIL</h1>
        <p className="text-white text-sm text-center">Enter the 6-digit code sent to your email.</p>
        <div className="flex gap-2">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-12 h-12 text-center text-lg font-bold text-white bg-zinc-900 border border-slate-500 rounded focus:border-sky-400 focus:outline-none"
              ref={(el) => (inputsRef.current[index] = el)}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button className="bg-sky-400 w-full py-2 text-white rounded hover:scale-105 duration-300 hover:bg-sky-500">
          VERIFY
        </button>
        <p className="text-white text-sm">
          Didn't receive a code? <a className="hover:font-extrabold duration-200 text-sky-300" href="#">Resend</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
