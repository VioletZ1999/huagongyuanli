import React, { useCallback, useState } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (fileData: FileData) => void;
  onClear: () => void;
  selectedFile: FileData | null;
  label: string;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  onClear, 
  selectedFile, 
  label,
  accept = "image/*,application/pdf" 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove Data URL prefix to get raw base64
      const base64 = result.split(',')[1]; 
      
      onFileSelect({
        base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  if (selectedFile) {
    return (
      <div className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</span>
            <span className="text-xs text-slate-500 uppercase">{selectedFile.mimeType.split('/')[1]}</span>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors"
          title="移除文件"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
    >
      <input 
        type="file" 
        onChange={handleInputChange} 
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-400 mt-1">支持 PDF, JPG, PNG (最大 10MB)</p>
    </div>
  );
};

export default FileUpload;