import React, { useState, useRef, useEffect } from 'react';
import { createSummarizerChat } from '../services/geminiService';
import FileUpload from './FileUpload';
import { FileData } from '../types';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const exportPDF = async () => {
    if (messages.length === 0) return;
    setIsGeneratingPdf(true);
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(16);
    doc.text("化工原理学习笔记", 20, y);
    y += 15;

    messages.forEach((msg, i) => {
      doc.setFontSize(10);
      doc.setTextColor(msg.role === 'user' ? 100 : 0);
      const lines = doc.splitTextToSize(`${msg.role === 'user' ? '问' : '答'}: ${msg.content.substring(0, 500)}...`, 170);
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 20, y);
      y += lines.length * 5 + 10;
    });

    doc.save("化工原理笔记.pdf");
    setIsGeneratingPdf(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      <div className="lg:w-1/4 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">上传资料</h3>
          <FileUpload 
            label="上传 PDF 或 图片"
            selectedFile={file}
            onFileSelect={handleFileSelect}
            onClear={() => { setFile(null); setMessages([]); }}
          />
        </div>
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-3">
          <p className="text-xs font-bold text-indigo-800 uppercase">快捷指令</p>
          <button 
            disabled={!file || isLoading}
            onClick={() => handleSendMessage("请帮我梳理这份资料的知识点。")}
            className="w-full text-left p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-sm transition-all shadow-sm border border-indigo-100 disabled:opacity-50"
          >
            📑 知识总结
          </button>
          <button 
            disabled={!file || isLoading}
            onClick={() => handleSendMessage("请基于这份资料，对我进行复习提问。")}
            className="w-full text-left p-3 bg-white hover:bg-indigo-600 hover:text-white rounded-xl text-sm transition-all shadow-sm border border-indigo-100 disabled:opacity-50"
          >
            ❓ 复习抽测
          </button>
          <button 
            disabled={messages.length === 0 || isGeneratingPdf}
            onClick={exportPDF}
            className="w-full mt-4 p-3 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
          >
            {isGeneratingPdf ? '导出中...' : '📥 导出笔记 PDF'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p>请上传资料并点击快捷指令开始学习</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-100 text-slate-800'}`}>
                <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:my-1">
                  <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 p-4 rounded-2xl animate-pulse text-slate-400 text-sm">AI 导师正在思考...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="relative">
            <input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder={file ? "有问题随时问我..." : "请先上传文件"}
              disabled={!file || isLoading}
              className="w-full p-4 pr-12 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!file || isLoading || !inputText.trim()}
              className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summarizer;