
import React from 'react';
import { ImageEditor } from './components/ImageEditor';
import { Chat } from './components/Chat';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          استوديو الإبداع الذكي
        </h1>
        <p className="text-gray-400 mt-2">عدّل صورك وتحدث مع الذكاء الاصطناعي باللغة العربية</p>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl w-full mx-auto">
        <div className="lg:h-[85vh]">
          <ImageEditor />
        </div>
        <div className="lg:h-[85vh]">
          <Chat />
        </div>
      </main>

      <footer className="text-center mt-6 text-gray-500 text-sm">
        <p>تم التطوير بواسطة الذكاء الاصطناعي. جميع الحقوق محفوظة © 2024</p>
      </footer>
    </div>
  );
};

export default App;
