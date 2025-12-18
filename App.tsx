
import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import Summarizer from './components/Summarizer';
import Solver from './components/Solver';

const ChemicalBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-20 -left-10 text-indigo-100 opacity-60 animate-float">
      <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      </svg>
    </div>
    <div className="absolute bottom-10 -right-10 text-blue-100 opacity-60">
      <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M10 2v7.31l-4.57 6.35C5.07 16.14 5 16.56 5 17c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3 0-.44-.07-.86-.43-1.35L14 9.31V2h-4z" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // 只要环境变量中有值，即认为已准备就绪
      const envKey = process.env.API_KEY;
      if (envKey && envKey.trim().length > 0) {
        setIsApiKeyReady(true);
        return;
      }

      // 如果是 AI Studio 环境，检查是否已选择 Key
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeyReady(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsApiKeyReady(true); 
    }
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
          掌握<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">化工原理</span>的核心奥秘
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          您的专业 AI 助教，已支持第三方 API 代理接入。
        </p>
        
        {!isApiKeyReady && (
          <div className="mt-8 p-6 bg-slate-100 border border-slate-200 rounded-2xl max-w-lg mx-auto shadow-sm">
            <p className="text-slate-800 text-sm mb-4 font-semibold flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              尚未检测到 API 密钥
            </p>
            <div className="text-xs text-slate-500 mb-6 bg-white/50 p-3 rounded-lg text-left">
              请确保在环境变量中设置了 <code className="bg-slate-200 px-1 rounded">API_KEY</code>。如果是中转接口，建议同时设置 <code className="bg-slate-200 px-1 rounded">BASE_URL</code> 以指向正确的代理地址。
            </div>
            <button 
              onClick={handleOpenSelectKey}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              配置 API 密钥
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
        <div 
          onClick={() => isApiKeyReady && setMode(AppMode.SUMMARIZER)}
          className={`group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 transition-all duration-300 ${isApiKeyReady ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl' : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">资料整理</h2>
          <p className="text-slate-500 mb-6">上传 PDF 或课件，AI 自动提炼流体、传热、分离等章节的结构化笔记。</p>
          <span className="text-indigo-600 font-semibold flex items-center gap-2">
            进入功能 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>

        <div 
          onClick={() => isApiKeyReady && setMode(AppMode.SOLVER)}
          className={`group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100 transition-all duration-300 ${isApiKeyReady ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl' : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">题目解答</h2>
          <p className="text-slate-500 mb-6">专攻物料衡算与设备设计难题，通过深度思考模型输出详尽推导过程。</p>
          <span className="text-blue-600 font-semibold flex items-center gap-2">
            进入功能 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 relative overflow-x-hidden">
      <ChemicalBackground />
      <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-xl hidden sm:inline">化工原理<span className="text-indigo-600"> AI</span>助教</span>
          </div>
          <div className="flex items-center gap-4">
            {mode !== AppMode.HOME && (
              <button onClick={() => setMode(AppMode.HOME)} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                返回首页
              </button>
            )}
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 font-bold">READY</span>
          </div>
        </div>
      </nav>

      <main className="pt-6 px-4 relative z-10">
        {mode === AppMode.HOME ? renderHome() : (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="hover:text-indigo-600 cursor-pointer" onClick={() => setMode(AppMode.HOME)}>首页</span> 
              <span>/</span>
              <span className="text-slate-600 font-medium">{mode === AppMode.SUMMARIZER ? '资料整理' : '题目解答'}</span>
            </div>
            {mode === AppMode.SUMMARIZER ? <Summarizer /> : <Solver />}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
