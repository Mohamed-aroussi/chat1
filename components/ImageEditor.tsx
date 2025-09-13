
import React, { useState, useRef, useCallback } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { UploadIcon, DownloadIcon, SpinnerIcon, ResetIcon } from './icons';

export const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleReset(); // Clear previous state before setting new image
            setOriginalImage(file);
            setOriginalImageUrl(URL.createObjectURL(file));
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleEditRequest = async () => {
        if (!originalImage || !prompt) {
            setError('يرجى رفع صورة وكتابة طلب التعديل.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);

        try {
            const { imageUrl } = await editImageWithGemini(originalImage, prompt);
            if (imageUrl) {
                setEditedImageUrl(imageUrl);
            } else {
                setError('لم يتمكن الذكاء الاصطناعي من إنشاء صورة. قد يكون طلبك غير واضح.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!editedImageUrl) return;
        const link = document.createElement('a');
        link.href = editedImageUrl;
        link.download = `edited-${originalImage?.name || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = useCallback(() => {
        setOriginalImage(null);
        setOriginalImageUrl(null);
        setEditedImageUrl(null);
        setPrompt('');
        setError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-800 p-4 lg:p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-indigo-400">محرر الصور بالذكاء الاصطناعي</h2>
            
            <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                {!originalImageUrl ? (
                    <button onClick={handleImageUploadClick} className="w-full h-64 border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center hover:bg-gray-700 hover:border-indigo-400 transition-colors">
                        <UploadIcon className="w-12 h-12 text-gray-400" />
                        <span className="mt-2 text-gray-400">انقر لرفع صورة</span>
                    </button>
                ) : (
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <h3 className="text-center text-gray-300 mb-2">الأصلية</h3>
                            <img src={originalImageUrl} alt="Original" className="w-full h-auto object-contain rounded-lg max-h-80" />
                        </div>
                        <div className="relative">
                             <h3 className="text-center text-gray-300 mb-2">المعدلة</h3>
                            {isLoading && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center rounded-lg">
                                    <SpinnerIcon className="w-12 h-12 text-indigo-400" />
                                </div>
                            )}
                            {editedImageUrl ? (
                                <img src={editedImageUrl} alt="Edited" className="w-full h-auto object-contain rounded-lg max-h-80" />
                            ) : (
                                <div className="w-full h-full border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500">النتيجة ستظهر هنا</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {error && <p className="text-red-400 text-center my-2">{error}</p>}
            
            <div className="mt-4 flex flex-col space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="اكتب طلب التعديل هنا... مثلاً: 'أضف قبعة قرصان على رأسه' أو 'اجعل الخلفية تبدو كأنها في الفضاء'"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                    rows={3}
                    disabled={!originalImageUrl || isLoading}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                        onClick={handleEditRequest}
                        disabled={!originalImageUrl || !prompt || isLoading}
                        className="flex items-center justify-center p-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5"/> : 'نفذ التعديل'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!editedImageUrl || isLoading}
                        className="flex items-center justify-center gap-2 p-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        <span>تحميل</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 p-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        <ResetIcon className="w-5 h-5"/>
                        <span>إعادة تعيين</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
