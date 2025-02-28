import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#121212] border-b border-zinc-700 py-4 px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">File Manager</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full bg-[#282828] text-gray-300 hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#f0533e]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-[#282828] text-gray-300 hover:bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#f0533e]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-[#f0533e] flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#181818] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-[#121212] rounded-lg p-4 border border-zinc-700 hover:border-[#f0533e] transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="p-2 rounded-md bg-[#261a17] text-[#f0533e]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">Document {item}.pdf</h3>
                      <p className="text-gray-400 text-sm">Modified: Feb 28, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">2.4 MB</span>
                    <button className="text-[#ffa48f] hover:text-[#ffb7a5] transition-colors">
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Storage</h2>
              <button className="text-sm text-[#ffa48f] hover:text-[#ffb7a5] transition-colors">
                Upgrade Plan
              </button>
            </div>
            <div className="bg-[#121212] rounded-lg p-4 border border-zinc-700">
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">75% Used</span>
                  <span className="text-gray-400">15GB / 20GB</span>
                </div>
                <div className="w-full bg-[#3f3f3f] rounded-full h-2.5">
                  <div className="bg-[#f0533e] h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 bg-[#261a17] rounded-md">
                  <p className="text-[#ffa48f] text-sm">Documents</p>
                  <p className="text-white font-bold">7.5 GB</p>
                </div>
                <div className="p-3 bg-[#261a17] rounded-md">
                  <p className="text-[#ffa48f] text-sm">Images</p>
                  <p className="text-white font-bold">4.2 GB</p>
                </div>
                <div className="p-3 bg-[#261a17] rounded-md">
                  <p className="text-[#ffa48f] text-sm">Other</p>
                  <p className="text-white font-bold">3.3 GB</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;