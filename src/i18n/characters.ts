import type { CharacterMatch } from '../types/quiz'
import type { AppLocale } from './types'

type LocalizedText = Record<AppLocale, string>

const characterNameI18n: Record<string, LocalizedText> = {
  amiya: {
    'zh-CN': '阿米娅',
    'zh-TW': '阿米婭',
    en: 'Amiya',
    ja: 'アーミヤ',
  },
  theresa: {
    'zh-CN': '特蕾西娅',
    'zh-TW': '特蕾西婭',
    en: 'Theresa',
    ja: 'テレジア',
  },
  lemuen: {
    'zh-CN': '蕾缪安',
    'zh-TW': '蕾繆安',
    en: 'Lemuen',
    ja: 'レミュアン',
  },
  nearl: {
    'zh-CN': '临光',
    'zh-TW': '臨光',
    en: 'Nearl',
    ja: 'ニアール',
  },
  rosmontis: {
    'zh-CN': '迷迭香',
    'zh-TW': '迷迭香',
    en: 'Rosmontis',
    ja: 'ロスモンティス',
  },
  mudrock: {
    'zh-CN': '泥岩',
    'zh-TW': '泥岩',
    en: 'Mudrock',
    ja: 'マドロック',
  },
  muelsyse: {
    'zh-CN': '缪尔赛斯',
    'zh-TW': '繆爾賽思',
    en: 'Muelsyse',
    ja: 'ミュルジス',
  },
  kaltsit: {
    'zh-CN': '凯尔希',
    'zh-TW': '凱爾希',
    en: "Kal'tsit",
    ja: 'ケルシー',
  },
  pepe: {
    'zh-CN': '佩佩',
    'zh-TW': '佩佩',
    en: 'Pepe',
    ja: 'ペペ',
  },
  ulpius: {
    'zh-CN': '乌尔比安',
    'zh-TW': '烏爾比安',
    en: 'Ulpian',
    ja: 'ウルピアヌス',
  },
  mostima: {
    'zh-CN': '莫斯提马',
    'zh-TW': '莫斯提馬',
    en: 'Mostima',
    ja: 'モスティマ',
  },
  logos: {
    'zh-CN': '逻各斯',
    'zh-TW': '邏各斯',
    en: 'Logos',
    ja: 'ロゴス',
  },
  silverash: {
    'zh-CN': '银灰',
    'zh-TW': '銀灰',
    en: 'SilverAsh',
    ja: 'シルバーアッシュ',
  },
  zima: {
    'zh-CN': '凛冬',
    'zh-TW': '凜冬',
    en: 'Zima',
    ja: 'ズィマー',
  },
  nian: {
    'zh-CN': '年',
    'zh-TW': '年',
    en: 'Nian',
    ja: 'ニェン',
  },
  mlynar: {
    'zh-CN': '玛恩纳',
    'zh-TW': '瑪恩納',
    en: 'Młynar',
    ja: 'ムリナール',
  },
  saria: {
    'zh-CN': '塞雷娅',
    'zh-TW': '塞雷婭',
    en: 'Saria',
    ja: 'サリア',
  },
  shu: {
    'zh-CN': '黍',
    'zh-TW': '黍',
    en: 'Shu',
    ja: 'シュウ',
  },
  eyjafjalla: {
    'zh-CN': '艾雅法拉',
    'zh-TW': '艾雅法拉',
    en: 'Eyjafjalla',
    ja: 'エイヤフィヤトラ',
  },
  chen: {
    'zh-CN': '陈',
    'zh-TW': '陳',
    en: 'Ch\'en',
    ja: 'チェン',
  },
  arc: {
    'zh-CN': '电弧',
    'zh-TW': '電弧',
    en: 'Arc',
    ja: 'アーク',
  },
  yu: {
    'zh-CN': '余',
    'zh-TW': '余',
    en: 'Yu',
    ja: 'ユー',
  },
  thorns: {
    'zh-CN': '棘刺',
    'zh-TW': '棘刺',
    en: 'Thorns',
    ja: 'ソーンズ',
  },
  crownslayer: {
    'zh-CN': '弑君者',
    'zh-TW': '弒君者',
    en: 'Crownslayer',
    ja: 'クラウンスレイヤー',
  },
  skadi: {
    'zh-CN': '斯卡蒂',
    'zh-TW': '斯卡蒂',
    en: 'Skadi',
    ja: 'スカジ',
  },
  ling: {
    'zh-CN': '令',
    'zh-TW': '令',
    en: 'Ling',
    ja: 'リン',
  },
  yao: {
    'zh-CN': '遥',
    'zh-TW': '遙',
    en: 'Haruka',
    ja: 'ハルカ',
  },
  exusiai: {
    'zh-CN': '能天使',
    'zh-TW': '能天使',
    en: 'Exusiai',
    ja: 'エクシア',
  },
  wang: {
    'zh-CN': '望',
    'zh-TW': '望',
    en: 'Wang',
    ja: 'ワン',
  },
  shmang: {
    'zh-CN': '死芒',
    'zh-TW': '死芒',
    en: 'Necrass',
    ja: 'ネクラス',
  },
  w: {
    'zh-CN': '维什戴尔',
    'zh-TW': '維什戴爾',
    en: "Wis'adel",
    ja: 'ウィシャデル',
  },
  hypergryph: {
    'zh-CN': '海猫络合物',
    'zh-TW': '海貓絡合物',
    en: 'Hypergryph',
    ja: '海猫',
  },
}

const seriesI18n: Record<string, LocalizedText> = {
  '明日方舟': {
    'zh-CN': '明日方舟',
    'zh-TW': '明日方舟',
    en: 'Arknights',
    ja: 'アークナイツ',
  },
}

function resolveLocalizedText(
  table: Record<string, LocalizedText>,
  key: string,
  locale: AppLocale,
  fallback: string,
) {
  return table[key]?.[locale] ?? fallback
}

export function getLocalizedCharacterName(character: Pick<CharacterMatch, 'id' | 'name'>, locale: AppLocale) {
  return resolveLocalizedText(characterNameI18n, character.id, locale, character.name)
}

export function getLocalizedCharacterSeries(character: Pick<CharacterMatch, 'series'>, locale: AppLocale) {
  return resolveLocalizedText(seriesI18n, character.series, locale, character.series)
}
