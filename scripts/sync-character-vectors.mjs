/**
 * 将每个角色的六维 vector 与「原型基准向量 + signature.uniqueAxes」对齐：
 * - 先复制 archetypes.json 中对应 archetypeId 的 vector
 * - 再按 uniqueAxes 覆盖指定轴（与 quizEngine 中 uniqueAxes 语义一致）
 *
 * 用法：node scripts/sync-character-vectors.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const charactersPath = path.join(root, 'src/data/characters.json')
const archetypesPath = path.join(root, 'src/data/archetypes.json')

const VECTOR_AXES = ['expression', 'temperature', 'judgement', 'order', 'agency', 'aura']

const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'))
const archetypes = JSON.parse(fs.readFileSync(archetypesPath, 'utf8'))
const archetypeById = new Map(archetypes.map((a) => [a.id, a]))

for (const character of characters) {
  const archetype = archetypeById.get(character.archetypeId)
  if (!archetype?.vector) {
    console.error(`Missing archetype or vector for ${character.id} -> ${character.archetypeId}`)
    process.exit(1)
  }

  const next = { ...archetype.vector }
  const unique = character.signature?.uniqueAxes
  if (unique && typeof unique === 'object') {
    for (const axis of VECTOR_AXES) {
      if (Object.prototype.hasOwnProperty.call(unique, axis)) {
        next[axis] = unique[axis]
      }
    }
  }
  character.vector = next
}

fs.writeFileSync(charactersPath, `${JSON.stringify(characters, null, 2)}\n`, 'utf8')
console.log(`Updated vectors for ${characters.length} characters in ${path.relative(root, charactersPath)}`)
