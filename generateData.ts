import fs from 'fs';
import path from 'path';

const archetypes = [
  { id: 'INTJ', name: '调停者', subtitle: '诗意、善良的理想主义者', tags: ['理想主义', '共情', '治愈'], narrativeRole: '治愈者', spotlight: '安静的守护', weakness: '过于敏感', keywords: ['细腻'], accent: '#33a474', oneLiner: '诗意浪漫', description: '总是试图在最坏的人和事物中寻找好的一面。' },
  { id: 'INTP', name: '建筑师', subtitle: '富有想象力和战略性的思想家', tags: ['战略', '冷酷', '智慧'], narrativeRole: '幕后黑手', spotlight: '完美计划', weakness: '缺乏情感', keywords: ['理性'], accent: '#88619a', oneLiner: '一切皆在掌控', description: '高处不胜寒，拥有强大逻辑。' },
  { id: 'ENTJ', name: '指挥官', subtitle: '大胆、富有想象力且意志强大的领导者', tags: ['领导', '果断', '野心'], narrativeRole: '帝王', spotlight: '统帅全局', weakness: '冷酷无情', keywords: ['霸气'], accent: '#88619a', oneLiner: '只有我能领导', description: '天生的领导者，永不屈服。' },
  { id: 'ENTP', name: '逻辑学家', subtitle: '具有创造力的发明家', tags: ['发明', '真理', '怪才'], narrativeRole: '科学怪人', spotlight: '突破常规', weakness: '脱离现实', keywords: ['真理'], accent: '#88619a', oneLiner: '有趣的想法', description: '对已知的事物充满怀疑并试图创新。' },
  { id: 'INFJ', name: '提倡者', subtitle: '安静而神秘', tags: ['神秘', '信念', '先知'], narrativeRole: '引路人', spotlight: '深邃直觉', weakness: '自我牺牲', keywords: ['救赎'], accent: '#33a474', oneLiner: '拯救世界', description: '带着信念行动。' },
  { id: 'INFP', name: '调停者', subtitle: '诗意、善良的理想主义者', tags: ['理想主义', '共情', '治愈'], narrativeRole: '治愈者', spotlight: '安静的守护', weakness: '过于敏感', keywords: ['细腻'], accent: '#33a474', oneLiner: '寻找美好', description: '内心世界的探险家。' },
  { id: 'ENFJ', name: '主人公', subtitle: '富有魅力鼓舞人心的领导者', tags: ['魅力', '奉献', '光明'], narrativeRole: '勇者', spotlight: '引领众人', weakness: '过度负责', keywords: ['希望'], accent: '#33a474', oneLiner: '带领大家前进', description: '感染力极强的灵魂人物。' },
  { id: 'ENFP', name: '竞选者', subtitle: '热情、有创造力的自由精神', tags: ['热情', '自由', '活力'], narrativeRole: '旅人', spotlight: '充满活力', weakness: '三分钟热度', keywords: ['快乐'], accent: '#33a474', oneLiner: '世界很精彩', description: '自由奔放，点燃周围的人。' },
  { id: 'ISTJ', name: '物流师', subtitle: '实际而注重事实的个人', tags: ['秩序', '可靠', '冷酷'], narrativeRole: '守则者', spotlight: '绝对执行', weakness: '刻板', keywords: ['规则'], accent: '#4298b4', oneLiner: '遵守规矩', description: '脚踏实地，重视传统。' },
  { id: 'ISFJ', name: '守卫者', subtitle: '非常专注和温暖的守护者', tags: ['守护', '牺牲', '忠诚'], narrativeRole: '骑士', spotlight: '默默奉献', weakness: '自我压抑', keywords: ['守护'], accent: '#4298b4', oneLiner: '我来保护', description: '随时准备保护所爱之人。' },
  { id: 'ESTJ', name: '总经理', subtitle: '出色的管理者', tags: ['管理', '世俗', '权威'], narrativeRole: '会长', spotlight: '维持秩序', weakness: '控制欲', keywords: ['管理'], accent: '#4298b4', oneLiner: '按规矩办事', description: '带领大家遵循传统。' },
  { id: 'ESFJ', name: '执政官', subtitle: '极具同情心、爱交往的人', tags: ['热情', '照料', '中心'], narrativeRole: '大家长', spotlight: '社交中心', weakness: '渴望认同', keywords: ['同情'], accent: '#4298b4', oneLiner: '关心大家', description: '永远乐意提供帮助。' },
  { id: 'ISTP', name: '鉴赏家', subtitle: '大胆而实际的实验者', tags: ['手工', '冷淡', '实用'], narrativeRole: '独行侠', spotlight: '解决问题', weakness: '孤僻', keywords: ['机械'], accent: '#e4ae3a', oneLiner: '有趣的设计', description: '喜欢用双手和眼睛探索世界。' },
  { id: 'ISFP', name: '探险家', subtitle: '灵活有魅力的艺术家', tags: ['艺术', '随性', '审美'], narrativeRole: '艺术家', spotlight: '体验当下', weakness: '逃避冲突', keywords: ['美丽'], accent: '#e4ae3a', oneLiner: '感受生活', description: '生活就是画布。' },
  { id: 'ESTP', name: '企业家', subtitle: '聪明精力充沛的人', tags: ['冒险', '商业', '冲动'], narrativeRole: '搞事者', spotlight: '活在当下', weakness: '不顾后果', keywords: ['刺激'], accent: '#e4ae3a', oneLiner: '立刻行动', description: '喜欢冒险。' },
  { id: 'ESFP', name: '表演者', subtitle: '自发、精力充沛的热情艺人', tags: ['舞台', '闪耀', '欢乐'], narrativeRole: '大明星', spotlight: '聚焦目光', weakness: '注意力分散', keywords: ['快乐'], accent: '#e4ae3a', oneLiner: '全场焦点', description: '生活永远是一场派对。' },
];

const characters = archetypes.map((a, i) => ({
  id: `char_${i}`,
  name: `代表角色 ${a.id}`,
  series: `${a.id} 知名动漫`,
  archetypeId: a.id,
  tags: [a.narrativeRole, ...a.tags],
  note: a.description,
  vector: {}
}));

fs.writeFileSync(path.join(__dirname, 'src/data/archetypes.json'), JSON.stringify(archetypes, null, 2));
fs.writeFileSync(path.join(__dirname, 'src/data/characters.json'), JSON.stringify(characters, null, 2));
