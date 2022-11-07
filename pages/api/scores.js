import path from 'path'
import { readFile } from 'node:fs/promises'
import axios from 'axios'

export default async function handler(req, res) {
    let data
    try {
        const response = await axios.get('https://api.npoint.io/725b6ba14cb01f954b3e', { transformResponse: (r) => r });
        data = response.data
    } catch (e) {
        const jsonDirectory = path.join(process.cwd(), 'json')
        const data = await readFile(jsonDirectory + '/scores.json', 'utf8' )
    }
    res.status(200).end(data)
}