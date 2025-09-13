
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { getChatResponseFromGemini } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { SendIcon, SpinnerIcon, SpeakerIcon } from './icons';

export const Chat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: 'أهلاً بك! كيف يمكنني مساعدتك اليوم؟' }
    ]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { speak } = useTextToSpeech();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
            speak(lastMessage.text);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await getChatResponseFromGemini(input);
            const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { sender: 'ai', text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 lg:p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-indigo-400">المساعد الصوتي</h2>
            <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {msg.sender === 'ai' && (
                           <button onClick={() => speak(msg.text)} className="text-gray-400 hover:text-indigo-400 p-1">
                                <SpeakerIcon className="w-5 h-5"/>
                           </button>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-700 rounded-bl-none">
                            <SpinnerIcon className="w-5 h-5 text-indigo-400" />
                            <span className="text-gray-400">يفكر...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                    <SendIcon className="w-6 h-6"/>
                </button>
            </form>
        </div>
    );
};
