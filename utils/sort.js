export default function sortData(data, key, s) {
  if(!data || data.length < 1) return []

    function compareScores(a, b) {
      if (a.scores[key] > b.scores[key]) return -1*s;
      if (a.scores[key] < b.scores[key]) return s;
      return 0;
    }
    function compareKeys(a, b) {
      if (a[key] > b[key]) return -1*s;
      if (a[key] < b[key]) return s;
      return 0;
    }

    if(Object.keys(data[0].scores).includes(key)) return data.sort(compareScores)
    return data.sort(compareKeys)
}