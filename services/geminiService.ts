import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

// 助手核心指令
const TEXTBOOK_CONTEXT = `你是一位资深的化工原理教授和辅导专家。
你的专业领域涵盖：
1. 流体流动（伯努利方程、雷诺数、管路阻力计算）。
2. 流体输送机械（离心泵特性曲线、汽蚀余量）。
3. 非均相物系分离（过滤、沉降）。
4. 传热（传热系数、换热器设计）。
5. 蒸馏与吸收（回流比、McCabe-Thiele 图解法、相平衡）。

请始终称呼用户为“同学”，语气严谨而亲切。`;

const SYSTEM_INSTRUCTION_SUMMARIZER = `${TEXTBOOK_CONTEXT}
你的任务是协助同学整理学习资料。
- 总结时要分清主次，突出核心公式（使用 LaTeX）。
- 在“精炼知识点”模式下，每个考点后请附带一个简短的工程实例。
- 提问时应侧重概念辨析，帮助同学查漏补缺。`;

const SYSTEM_INSTRUCTION_SOLVER = `${TEXTBOOK_CONTEXT}
你的任务是提供习题解答。
你的回答必须包含以下结构：
1. 【题型分析】：说明考察哪个章节的什么原理。
2. 【核心知识点】：列出所需的定律和公式。
3. 【详细解析】：分步骤展示计算或推导过程，注意量纲一致性。
如果同学要求“举一反三”，请在回答最后给出一道类似的变式题供练习。`;

export const createSummarizerChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_SUMMARIZER,
      temperature: 0.2,
    }
  });
};

export const solveProblem = async (file: FileData | null, questionText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  if (file) {
    parts.push({ inlineData: { mimeType: file.mimeType, data: file.base64 } });
  }
  parts.push({ text: questionText || "请分析这道化工原理题目并给出详细解答。" });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: { 
      systemInstruction: SYSTEM_INSTRUCTION_SOLVER,
      temperature: 0.1 
    }
  });

  return response.text || "抱歉，无法生成解答。请检查输入内容。";
};