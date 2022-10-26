import path from 'path'
import { readFile } from 'node:fs/promises'

export default async function handler(req, res) {
    const jsonDirectory = path.join(process.cwd(), 'json')
    const scores = await readFile(jsonDirectory + '/scores.json', 'utf8' )
    res.status(200).end(scores)
}