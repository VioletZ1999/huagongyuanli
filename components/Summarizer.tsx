import React, { useState, useRef, useEffect } from 'react';
import { createSummarizerChat } from '../services/geminiService';
import FileUpload from './FileUpload';
import { FileData } from '../types';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Chat, GenerateContentResponse } from "@google/genai";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    // Slight delay to ensure DOM is updated (especially with Markdown rendering)
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleFileSelect = (uploadedFile: FileData) => {
    setFile(uploadedFile);
    setMessages([]);
    setChatSession(null);
    // Initialize chat session immediately
    const chat = createSummarizerChat();
    setChatSession(chat);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if ((!textToSend.trim() && !file) || isLoading) return;
    if (!file && !chatSession) return; // Must have file to start

    // If no chat session yet (should exist if file selected, but safety check)
    let currentChat = chatSession;
    if (!currentChat) {
        currentChat = createSummarizerChat();
        setChatSession(currentChat);
    }

    const newUserMsg: Message = { role: 'user', content: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let response: GenerateContentResponse;
      
      // Determine if this is the VERY first message which needs to attach the file
      const isFirstMessage = messages.length === 0;

      if (isFirstMessage && file) {
        // Send file + text
        response = await currentChat.sendMessage({
            message: [
                { inlineData: { mimeType: file.mimeType, data: file.base64 } },
                { text: textToSend }
            ]
        });
      } else {
        // Just send text
        response = await currentChat.sendMessage({ message: textToSend });
      }

      const aiText = response.text || "抱歉，我没有理解您的意思。";
      const newAiMsg: Message = { role: 'model', content: aiText, timestamp: Date.now() };
      setMessages(prev => [...prev, newAiMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { role: 'model', content: "抱歉，发生了错误，请重试。", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (mode: 'default' | 'refine' | 'quiz') => {
    let prompt = "";
    switch (mode) {
        case 'default':
            prompt = "请帮我梳理这份资料的知识脉络，总结核心概念。";
            break;
        case 'refine':
            prompt = "请帮我精炼这份资料的知识点（附带精简例题）。";
            break;
        case 'quiz':
            prompt = "请基于课件内容向我提问，帮助我复习。";
            break;
    }
    handleSendMessage(prompt);
  };

  const handleDownloadPDF = async () => {
    if (messages.length === 0 || !chatContainerRef.current) return;
    setIsGeneratingPdf(true);

    try {
        // Clone the chat container to render it fully expanded (no scroll) for capture
        const originalElement = chatContainerRef.current;
        const clone = originalElement.cloneNode(true) as HTMLElement;
        
        // Setup styling for the clone to be A4-like and fully visible
        clone.style.width = '794px'; // ~A4 width at 96 DPI
        clone.style.height = 'auto';
        clone.style.overflow = 'visible';
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.left = '0';
        clone.style.background = '#ffffff';
        clone.style.padding = '40px';
        
        // Append clone to body to let it render
        document.body.appendChild(clone);

        // Wait for fonts and layout to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(clone, {
            scale: 2, // Retain high quality
            useCORS: true,
            logging: false,
            windowWidth: 794
        });

        document.body.removeChild(clone);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const doc = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add subsequent pages if content is long
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        doc.save('化工原理复习笔记.pdf');

    } catch (error) {
        console.error("PDF generation failed:", error);
        alert("PDF 生成失败，请重试。");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto lg:h-[calc(100vh-140px)] h-auto">
      {/* Left Sidebar: Upload & Controls */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 mb-2">资料整理</h2>
          <p className="text-xs text-slate-500 mb-4">上传课件后，您可以点击下方按钮快速开始，也可以在右侧对话框中自由提问。</p>
          
          <FileUpload 
            label="上传课件/笔记"
            selectedFile={file}
            onFileSelect={handleFileSelect}
            onClear={() => { setFile(null); setMessages([]); setChatSession(null); }}
          />
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex-grow flex flex-col gap-3">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">快捷指令</h3>
            <button
                onClick={() => handleQuickAction('default')}
                disabled={!file || isLoading}
                className="w-full py-2.5 px-3 bg-white text-indigo-700 text-sm font-medium rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
            >
                📑 生成总结
            </button>
            <button
                onClick={() => handleQuickAction('refine')}
                disabled={!file || isLoading}
                className="w-full py-2.5 px-3 bg-white text-indigo-700 text-sm font-medium rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
            >
                ✨ 精炼知识点 (+例题)
            </button>
            <button
                onClick={() => handleQuickAction('quiz')}
                disabled={!file || isLoading}
                className="w-full py-2.5 px-3 bg-white text-purple-700 text-sm font-medium rounded-lg shadow-sm border border-purple-100 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
            >
                ❓ 帮我复习提问
            </button>

            <div className="mt-auto pt-4 border-t border-indigo-200">
                 <button 
                    onClick={handleDownloadPDF}
                    disabled={messages.length === 0 || isGeneratingPdf}
                    className="w-full py-2.5 px-3 bg-green-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingPdf ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            生成 PDF 中...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            下载对话笔记 (PDF)
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Right Content: Chat Interface */}
      <div className="lg:col-span-9 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden h-[600px] lg:h-full relative">
        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 min-h-0 bg-white"
        >
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <p className="text-sm">上传课件后，AI 导师将在此为您服务</p>
                </div>
            )}
            
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                        : 'bg-slate-50 border border-slate-100 rounded-bl-none shadow-sm text-slate-800'
                    }`}>
                        {msg.role === 'user' ? (
                            <div className="text-sm">{msg.content}</div>
                        ) : (
                            <div className="prose prose-sm prose-slate max-w-none leading-relaxed prose-headings:text-slate-800 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                                <Markdown 
                                    remarkPlugins={[remarkMath]} 
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </Markdown>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 z-10">
            <div className="relative flex items-center gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    placeholder={file ? "有问题随时问我，例如：解释一下什么是回流比？" : "请先上传课件..."}
                    disabled={!file || isLoading}
                    className="flex-grow p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button
                    onClick={() => handleSendMessage()}
                    disabled={!file || !inputText.trim() || isLoading}
                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Summarizer;