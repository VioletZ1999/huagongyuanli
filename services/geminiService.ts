
import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

const TEXTBOOK_CONTEXT = `你是一位资深的化工原理教授。
你的专业领域：流体流动、流体输送机械、传热、蒸馏、吸收、提取及干燥等单元操作。
请始终称呼用户为“同学”，语气亲切、专业。`;

const SYSTEM_INSTRUCTION_SUMMARIZER = `${TEXTBOOK_CONTEXT}
你的任务是协助同学整理学习资料。
- 必须使用 LaTeX 渲染公式：行内 $...$，块级 $$...$$。
- 总结应结构清晰，重点突出伯努利方程、传热速率、回流比等核心计算。`;

const SYSTEM_INSTRUCTION_SOLVER = `${TEXTBOOK_CONTEXT}
你的任务是提供详细的习题解答。
结构要求：
1. 【题型分析】：说明考察知识点。
2. 【核心知识点】：列出相关公式。
3. 【详细解析】：展示推导过程，注意单位换算。`;

/**
 * 校验并获取 AI 实例
 * 严格遵守安全性规范：从 process.env.API_KEY 获取密钥
 */
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API Key 未配置。请在部署平台环境变量中设置 API_KEY。");
  }

  // 特别校验：防止用户误填 OpenAI 的 sk- 密钥
  if (apiKey.startsWith("sk-")) {
    throw new Error("检测到 OpenAI 格式密钥 (sk-...)。本应用基于 Google Gemini 开发，请使用以 'AIza' 开头的 Gemini API Key。");
  }

  return new GoogleGenAI({ apiKey });
};

export const createSummarizerChat = () => {
  try {
    const ai = getAIInstance();
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });
  } catch (error: any) {
    console.error("Chat Creation Error:", error);
    throw error;
  }
};

export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
  try {
    const ai = getAIInstance();
    const parts: any[] = [];
    
    if (file) {
      parts.push({ 
        inlineData: { 
          mimeType: file.mimeType, 
          data: file.base64 
        } 
      });
    }
    
    parts.push({ 
      text: questionText || "请分析这道化工原理题目并给出详细解答。" 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION_SOLVER,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });

    return response.text || "抱歉，无法生成解答。";
  } catch (error: any) {
    console.error("solveProblem Error:", error);
    // 向上层抛出更具体的错误信息
    if (error.message.includes("OpenAI")) return `⚠️ 密钥格式错误：${error.message}`;
    if (error.message.includes("API Key")) return `⚠️ 配置错误：${error.message}`;
    return `请求失败：${error.message || "未知错误"}`;
  }
};
