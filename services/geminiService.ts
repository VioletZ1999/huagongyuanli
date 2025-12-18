
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

// 安全获取 AI 实例的辅助函数
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  // SDK 抛出 "An API Key must be set" 报错是因为 apiKey 为空。
  // 注意：用户提供的 sk-... 密钥是 OpenAI 格式，Gemini 必须使用 AIza... 格式的密钥。
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("检测到 API Key 未配置。请在部署平台（如 Vercel）的环境变量中添加 API_KEY。请确保使用的是 Google Gemini API Key（以 AIza 开头）。");
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
        // 为资料整理启用基础思考能力
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });
  } catch (error: any) {
    console.error("Chat Creation Error:", error);
    // 抛出错误以便 UI 层捕获
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
        // 为化工计算启用更高额度的思考预算，以确保物理推导和单位换算的准确性
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });

    return response.text || "抱歉，无法生成解答。";
  } catch (error: any) {
    console.error("solveProblem Error:", error);
    if (error.message.includes("API Key")) {
      return `⚠️ 配置错误：${error.message}`;
    }
    return `请求失败：${error.message || "未知错误"}`;
  }
};
