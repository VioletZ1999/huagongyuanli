import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

// 助手核心指令：定义化工原理专业背景
const TEXTBOOK_CONTEXT = `你是一位资深的化工原理教授和辅导专家。
你的专业领域涵盖：
1. 流体流动（伯努利方程、雷诺数、管内流动阻力计算、U形压差计）。
2. 流体输送机械（离心泵特性曲线、汽蚀余量 NPSH、工作点调节）。
3. 非均相物系分离（恒压过滤、重力沉降、旋风分离器）。
4. 传热（传热速率方程、对流传热系数、换热器对数平均温差）。
5. 蒸馏与吸收（回流比 R、McCabe-Thiele 图解法、相平衡常数、吸收塔填料高度计算）。

请始终称呼用户为“同学”，语气严谨、专业且亲切。`;

const SYSTEM_INSTRUCTION_SUMMARIZER = `${TEXTBOOK_CONTEXT}
你的任务是协助同学整理学习资料：
- 总结时要分清主次，突出核心公式（必须使用 LaTeX 格式：行内 $...$，独立块 $$...$$）。
- 在“精炼知识点”模式下，每个考点后请附带一个简短的典型工程计算或概念辨析实例。
- 提问时应侧重概念辨析，帮助同学查漏补缺。`;

const SYSTEM_INSTRUCTION_SOLVER = `${TEXTBOOK_CONTEXT}
你的任务是提供详细的习题解答。你的回答必须严格包含以下结构：
1. 【题型分析】：说明题目所属章节及其考察的核心物理量。
2. 【核心知识点】：列出解题所需的定律、准数（如 Re, Nu, Pr）和核心公式。
3. 【详细解析】：分步骤展示计算或推导过程，务必注明单位，保持量纲一致性。
如果同学要求“举一反三”，请在回答最后给出一道类似的变式题及简略答案。`;

// 每次调用时动态创建实例，确保能读取到最新的 process.env.API_KEY
export const createSummarizerChat = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not defined in process.env");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
      temperature: 0.2,
    }
  });
};

export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
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
      temperature: 0.1 
    }
  });

  return response.text || "抱歉，由于网络或配置原因，无法生成解答。";
};