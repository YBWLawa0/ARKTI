import fs from 'fs';
import path from 'path';

const qs = [
  { id: "q1", prompt: "你在派对或者漫展聚会中通常会做什么？", scene: "社交场合", options: [
      { id: "a", label: "主动结识新朋友，聊得很开心", tone: "充满活力", weights: {} },
      { id: "b", label: "倾向于和少数熟人待在一起", tone: "保持安静", weights: {} }
    ], dimension: "E_I", sign: 1 },
  { id: "q2", prompt: "你如何恢复精力和活力？", scene: "休息时间", options: [
      { id: "a", label: "通过多社交、外出活动", tone: "获取外界输入", weights: {} },
      { id: "b", label: "通过独处、宅在家里", tone: "沉淀自我", weights: {} }
    ], dimension: "E_I", sign: 1 },
  { id: "q3", prompt: "你在集体讨论时通常更倾向于：", scene: "交流方式", options: [
      { id: "a", label: "先开口说出想法，边说边思考", tone: "思维外放", weights: {} },
      { id: "b", label: "在心里完全思考清楚了再发言", tone: "思维内敛", weights: {} }
    ], dimension: "E_I", sign: 1 },
  // S_N
  { id: "q4", prompt: "当你在描述一件事情的时候，你更喜欢：", scene: "信息处理", options: [
      { id: "a", label: "讲述发生的事实、具体细节", tone: "基于现实", weights: {} },
      { id: "b", label: "谈论背后的含义、隐喻和可能性", tone: "发散思维", weights: {} }
    ], dimension: "S_N", sign: 1 },
  { id: "q5", prompt: "你觉得哪种设定更吸引你？", scene: "关注点", options: [
      { id: "a", label: "现实感强、细节丰富的硬核设定", tone: "脚踏实地", weights: {} },
      { id: "b", label: "充满奇幻想象、打破常理的概念", tone: "天马行空", weights: {} }
    ], dimension: "S_N", sign: 1 },
  { id: "q6", prompt: "你更依仗哪种方式去理解世界？", scene: "观察事物", options: [
      { id: "a", label: "通过感官获得的直接经验", tone: "经验主义", weights: {} },
      { id: "b", label: "通过直觉带来的灵感或预感", tone: "直觉导向", weights: {} }
    ], dimension: "S_N", sign: 1 },
  // T_F
  { id: "q7", prompt: "如果你作为主角面临艰难抉择，你会：", scene: "决策准则", options: [
      { id: "a", label: "讲究逻辑和公平，即使显得冷酷", tone: "理智绝对", weights: {} },
      { id: "b", label: "考虑所有人的感受和心情哪怕不够高效", tone: "感性关怀", weights: {} }
    ], dimension: "T_F", sign: 1 },
  { id: "q8", prompt: "你觉得哪种评价更让你感到认可？", scene: "评价标准", options: [
      { id: "a", label: "你这个人非常有逻辑且聪明", tone: "能力认同", weights: {} },
      { id: "b", label: "你这个人非常善良且温暖", tone: "情感认同", weights: {} }
    ], dimension: "T_F", sign: 1 },
  { id: "q9", prompt: "在争论中，你更希望：", scene: "面对冲突", options: [
      { id: "a", label: "分出对错，找到最理性的结论", tone: "客观真理", weights: {} },
      { id: "b", label: "达成和解，维护人际关系的和谐", tone: "关系维护", weights: {} }
    ], dimension: "T_F", sign: 1 },
  // J_P
  { id: "q10", prompt: "在日常生活中，你更倾向于：", scene: "行动安排", options: [
      { id: "a", label: "做充分的计划，按部就班执行", tone: "秩序控制", weights: {} },
      { id: "b", label: "保持开放，随波逐流，随机应变", tone: "灵活随性", weights: {} }
    ], dimension: "J_P", sign: 1 },
  { id: "q11", prompt: "你的工作或者学习空间通常：", scene: "环境状态", options: [
      { id: "a", label: "有条理，每样东西都有自己的位置", tone: "清晰整洁", weights: {} },
      { id: "b", label: "可能有点乱，但你自己能找到需要的东西", tone: "杂乱无章", weights: {} }
    ], dimension: "J_P", sign: 1 },
  { id: "q12", prompt: "当面临任务截止日期时：", scene: "时间管理", options: [
      { id: "a", label: "你会早早规划好，提前完成", tone: "绝对控制", weights: {} },
      { id: "b", label: "你往往在最后期限爆发潜能", tone: "极限操作", weights: {} }
    ], dimension: "J_P", sign: 1 }
];

fs.writeFileSync(path.join(__dirname, 'src/data/questions.json'), JSON.stringify(qs, null, 2));
