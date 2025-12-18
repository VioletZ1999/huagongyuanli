
import React, { useState, useRef, useEffect } from 'react';
import { createSummarizerChat } from '../services/geminiService';
import FileUpload from './FileUpload';
import { FileData } from '../types';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import html2canvas from 'html2canvas';

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileSelect = (uploadedFile: FileData) => {
    setFile(uploadedFile);
    setMessages([]);
    setChatSession(createSummarizerChat());
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isLoading || !chatSession) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let response;
      if (messages.length === 0 && file) {
        response = await chatSession.sendMessage({
          message: [
            { inlineData: { mimeType: file.mimeType, data: file.base64 } },
            { text: textToSend }
          ]
        });
      } else {
        response = await chatSession.sendMessage({ message: textToSend });
      }

      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "连接服务器失败，请检查网络或 API Key 设置。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsImage = async () => {
    if (messages.length === 0 || !exportRef.current) return;
    
    setIsExporting(true);
    try {
      // 截图配置：提高缩放倍数以保证清晰度，开启跨域支持
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc', // 使用与消息列表相同的背景色
        windowWidth: exportRef.current.scrollWidth,
        windowHeight: exportRef.current.scrollHeight,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `化工原理学习笔记_${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出图片失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] min-h-[500px]">
      {/* Sidebar */}
      <div className="lg:w-1/4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            上传资料
          </h3>
          <FileUpload 
            label="上传 PDF 或 图片"
            selectedFile={file}
            onFileSelect={handleFileSelect}
            onClear={() => { setFile(null); setMessages([]); }}
          />
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">快捷指令</p>
          <button 
            disabled={!file || isLoading}
            onClick={() => handleSendMessage("请帮我梳理这份资料的知识点。")}
            className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-sm transition-all border border-slate-100 disabled:opacity-50 group"
          >
            <span className="mr-2 group-hover:scale-110 inline-block transition-transform">📑</span> 知识总结
          </button>
          <button 
            disabled={!file || isLoading}
            onClick={() => handleSendMessage("请基于这份资料，对我进行复习提问。")}
            className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-sm transition-all border border-slate-100 disabled:opacity-50 group"
          >
            <span className="mr-2 group-hover:scale-110 inline-block transition-transform">❓</span> 复习抽测
          </button>
          <div className="pt-2">
            <button 
              disabled={messages.length === 0 || isExporting}
              onClick={exportAsImage}
              className="w-full p-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isExporting ? '正在生成截图...' : '保存学习笔记'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Export Target Wrapper */}
        <div 
          ref={exportRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="font-medium">准备好开始学习了吗？</p>
              <p className="text-sm opacity-60 mt-1">请先上传资料，然后使用快捷指令 or 直接提问</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1 first:prose-headings:mt-0`}>
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-slate-400 text-xs font-medium">AI 导师正在思考...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto relative flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder={file ? "有问题随时问我..." : "请先在侧边栏上传文件"}
                disabled={!file || isLoading}
                className="w-full p-4 pr-12 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 text-slate-700"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded uppercase">Enter</kbd>
              </div>
            </div>
            <button 
              onClick={() => handleSendMessage()}
              disabled={!file || isLoading || !inputText.trim()}
              className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          {!file && (
            <p className="text-[10px] text-center text-slate-400 mt-2">提示：上传学习资料后即可开始对话</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
