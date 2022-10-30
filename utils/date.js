export default function dateFormater(s) {
    const d = new Date(s).toLocaleString()
    return d
}