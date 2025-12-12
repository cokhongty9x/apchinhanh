import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng tải lên tệp hình ảnh.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onImageSelected(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 p-6">
      <div 
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          flex flex-col items-center justify-center min-h-[400px] cursor-pointer
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
            : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-800/30'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`p-4 rounded-full bg-slate-800 mb-6 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`}>
          <ImageIcon size={48} />
        </div>
        
        <h3 className="text-2xl font-semibold mb-2 text-white">Tải ảnh lên để chỉnh sửa</h3>
        <p className="text-slate-400 mb-8 max-w-sm">
          Kéo và thả ảnh của bạn vào đây, hoặc nhấp để chọn tệp.
          <br/>
          Định dạng hỗ trợ: JPG, PNG, WEBP.
        </p>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-colors shadow-lg shadow-indigo-500/25 flex items-center">
          <Upload size={20} className="mr-2" />
          Chọn ảnh
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};