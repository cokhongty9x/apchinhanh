import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { Button } from './components/Button';
import { generateImageEdit } from './services/geminiService';
import { Wand2, Download, RefreshCw, AlertCircle, ArrowRight, X, Image as ImageIcon, Upload } from 'lucide-react';
import { AppState } from './types';

const INITIAL_STATE: AppState = {
  originalImage: null,
  originalMimeType: '',
  generatedImage: null,
  isGenerating: false,
  error: null,
  prompt: '',
};

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleImageSelected = (base64: string, mimeType: string) => {
    setState(prev => ({
      ...prev,
      originalImage: base64,
      originalMimeType: mimeType,
      generatedImage: null,
      error: null,
    }));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, prompt: e.target.value }));
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn chọn ảnh khác? Tiến trình hiện tại sẽ bị mất.")) {
      setState(INITIAL_STATE);
    }
  };

  const handleSoftReset = () => {
     // Keep the image, reset the edit
     setState(prev => ({
       ...prev,
       generatedImage: null,
       error: null,
       isGenerating: false
     }));
  };

  const handleGenerate = async () => {
    if (!state.originalImage || !state.prompt.trim()) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      // Extract the raw base64 string (remove data URL prefix)
      // data:image/png;base64,.....
      const base64Data = state.originalImage.split(',')[1];
      
      const generatedImageUrl = await generateImageEdit(
        base64Data,
        state.originalImage.startsWith('data:image/') ? state.originalMimeType : 'image/jpeg',
        state.prompt
      );

      setState(prev => ({
        ...prev,
        generatedImage: generatedImageUrl,
        isGenerating: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Đã xảy ra lỗi khi tạo hình ảnh.",
      }));
    }
  };

  const handleDownload = () => {
    if (!state.generatedImage) return;
    const link = document.createElement('a');
    link.href = state.generatedImage;
    link.download = `dangngoc-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View: Upload Screen
  if (!state.originalImage) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <header className="py-6 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Wand2 className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Đặng Ngọc edit AI
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Chỉnh sửa ảnh bằng <span className="text-indigo-400">lời nói</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Được hỗ trợ bởi Gemini 2.5 Flash Image. Chỉ cần tải lên và mô tả những thay đổi bạn muốn.
            </p>
          </div>
          
          <ImageUpload onImageSelected={handleImageSelected} />
        </main>
      </div>
    );
  }

  // View: Editor Screen
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
           <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-md">
            <Wand2 className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-200 hidden sm:block">Đặng Ngọc edit AI</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="ghost" onClick={handleReset} title="Chọn ảnh khác">
            <Upload size={18} className="mr-2" />
            <span className="hidden sm:inline">Chọn ảnh khác</span>
          </Button>
          {state.generatedImage && (
            <Button variant="primary" onClick={handleDownload} icon={<Download size={18} />}>
              Tải xuống
            </Button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950 relative overflow-y-auto lg:overflow-hidden p-4 sm:p-8 flex items-center justify-center">
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 max-w-7xl mx-auto">
            
            {/* Original Image */}
            <div className={`relative group transition-all duration-500 ${state.generatedImage ? 'flex-1 lg:flex-1 h-64 lg:h-auto w-full' : 'flex-none w-full max-w-3xl'}`}>
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/10 font-medium z-10 flex items-center">
                 <ImageIcon size={12} className="mr-1.5" /> Ảnh gốc
              </div>
              <img 
                src={state.originalImage} 
                alt="Original" 
                className={`w-full h-full object-contain rounded-xl shadow-2xl border border-slate-800 bg-slate-900/50 ${state.generatedImage ? 'max-h-[40vh] lg:max-h-[70vh]' : 'max-h-[60vh]'}`}
              />
            </div>

            {/* Arrow Divider (Desktop only when Generated exists) */}
            {state.generatedImage && (
              <div className="hidden lg:flex items-center justify-center text-slate-600">
                <ArrowRight size={32} />
              </div>
            )}

            {/* Generated Image */}
            {state.generatedImage && (
               <div className="relative flex-1 h-64 lg:h-auto w-full group animate-in fade-in zoom-in duration-500">
                <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-indigo-400/30 font-medium z-10 flex items-center shadow-lg shadow-indigo-500/20">
                   <Wand2 size={12} className="mr-1.5" /> Đã chỉnh sửa
                </div>
                <img 
                  src={state.generatedImage} 
                  alt="Generated" 
                  className="w-full h-full object-contain rounded-xl shadow-2xl shadow-indigo-900/20 border border-indigo-500/30 bg-slate-900/50 max-h-[40vh] lg:max-h-[70vh]"
                />
              </div>
            )}

             {/* Loading State Overlay (if generating but no previous result) */}
            {state.isGenerating && !state.generatedImage && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                  <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center max-w-sm mx-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-semibold text-white mb-2">Gemini đang xử lý...</h3>
                    <p className="text-slate-400 text-center text-sm">Đang thực hiện chỉnh sửa ảnh.<br/>Việc này thường mất vài giây.</p>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Controls Sidebar / Bottom Bar */}
        <div className="lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col z-20 shadow-xl">
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-1">Yêu cầu chỉnh sửa</h3>
            <p className="text-sm text-slate-400 mb-6">Mô tả cách bạn muốn thay đổi hình ảnh.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Mô tả (Prompt)</label>
                <input
                  type="text"
                  value={state.prompt}
                  onChange={handlePromptChange}
                  placeholder="ví dụ: 'Thêm bộ lọc cổ điển', 'Làm cho trời có tuyết'..."
                  className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !state.isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {state.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={!state.prompt.trim() || state.isGenerating}
                isLoading={state.isGenerating}
                className="w-full py-3 text-lg"
              >
                {state.isGenerating ? 'Đang tạo...' : 'Tạo bản sửa'}
              </Button>
            </div>

            {/* Suggestions */}
            {!state.generatedImage && (
              <div className="mt-8">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Thử những mẫu này</p>
                <div className="flex flex-wrap gap-2">
                  {['Phong cách cyberpunk', 'Thêm pháo hoa trên trời', 'Chuyển thành bản phác thảo', 'Chuyển thành hoàng hôn'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setState(prev => ({ ...prev, prompt: suggestion }))}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {state.generatedImage && (
               <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                  <h4 className="text-sm font-medium text-white">Tinh chỉnh kết quả</h4>
                  <p className="text-xs text-slate-400">Chưa hài lòng? Hãy thử điều chỉnh mô tả và tạo lại.</p>
                  
                  <Button variant="secondary" onClick={handleSoftReset} className="w-full text-sm" icon={<RefreshCw size={14}/>}>
                    Hủy & Thử lại
                  </Button>

                   {/* Added explicit re-upload button here as requested */}
                  <Button variant="ghost" onClick={handleReset} className="w-full text-sm border border-slate-700" icon={<Upload size={14}/>}>
                    Chọn ảnh khác
                  </Button>
               </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
             <div className="text-xs text-center text-slate-500">
                Được hỗ trợ bởi <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Gemini 2.5 Flash Image</a>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;