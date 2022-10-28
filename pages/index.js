import Head from 'next/head'
import { useEffect, useState } from 'react'

const bg = {
  '935263': 'indigo-800',
  '937008': 'fuchsia-800',
  '24490': 'teal-800',
  '171269': 'amber-800',
}

function sortData(data, key, s) {
  const unsorted = [...data]
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
  
  if(Object.keys(unsorted[0].scores).includes(key)) return unsorted.sort(compareScores)
  return unsorted.sort(compareKeys)
}

function Row({ rdata, i, hidden}) {
  const { id, player_name, team, leagues } = rdata
  const { fpl, md, xG, odds, variance } = rdata.scores

  function paintRow(arr) {
    let color = ''
    const l = arr.sort((a,b)=>b-a)
    const n = l.length
    switch (n) {
      case 1: color = `bg-${bg[l[0]]}`; break;
      case 2: color = `bg-gradient-to-r from-${bg[l[0]]} to-${bg[l[1]]}`; break;
      case 3: color = `bg-gradient-to-r from-${bg[l[0]]} via-${bg[l[1]]} to-${bg[l[2]]}`; break;
      case 4: color = `bg-gradient-to-r from-${bg[l[2]]} via-${bg[l[1]]} to-${bg[l[0]]}`; break;
      default: break;
    }
    return color
  }

  return (
    <tr className={`${hidden} border-y border-slate-700 ${paintRow(rdata.leagues)}`}>
      <td className='text-center'></td>
      <td className='text-left'>
        <a href={`https://fantasy.premierleague.com/entry/${id}/history`}
           title={id} rel="noreferrer" target='_blank'>{player_name}</a>
        </td>
      <td>{fpl}</td>
      <td>{md}</td>
      <td>{odds}</td>
      <td>{xG}</td>
      <td className='text-center ...'>{variance}</td>
    </tr>
  )
}

function Table({ setSortOpts, filter, toggledLeagues, filteredData }) {
  
  const mappedKeys = { nr: '#',
                    player_name: 'Manager',
                    fpl: 'FPL',
                    md: 'MD',
                    odds: 'Odds',
                    xG: 'xG',
                    variance: 'σ2'
                  }

  function handleClick(e) {
    setSortOpts((opts) => {
      const order = opts.key !== e.target.id ? { order: 1 } : { order: opts.order*-1 } 
      return {...opts, key: e.target.id, ...order }
    })
  }

  return (
    <table className="text-right border border-slate-700 ...">
      <thead>
        <tr className='text-center hover:cursor-pointer'>
          {Object.keys(mappedKeys).map((k,i,arr) => {
            return <th className="px-2 py-1 border border-slate-600 ..." key={k} id={k} onClick={handleClick}>{mappedKeys[k]}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {filteredData[0]?.managers
          ? filteredData[0].managers.map((entry, i) => {
            const hidden = (toggledLeagues.find(l=>entry.leagues.includes(l)) && filter.test(entry.player_name)) ? "" : "hidden "
            return <Row key={entry.id} rdata={entry} i={i+1} hidden={hidden}/>
          })
          : null
      }
      </tbody>
    </table>
  )
}

function LeagueToggler({ leagues, toggledLeagues, setToggledLeagues, setFilteredData }) {
  if(!leagues) return
  
  function handleToggle(e) {
    const id = Number(e.target.name)
    if(e.target.checked) {
      !toggledLeagues.includes(id) && setToggledLeagues(l=>[...l, id])
    }
    else {
      setToggledLeagues(l=>l.filter(s => s !== id))
    }
  }

  return (
    <h1 className="w-fit text-left text-xl my-6 font-blue-200 ...">
      {leagues.map((league,id) => {
        return (
        <div className={`bg-${bg[league.id]}`} key={id}>
          <input onChange={handleToggle} type="checkbox" id={league.id} name={league.id} defaultChecked={true}/>
          <label htmlFor={league.id}> {league.name}</label>
        </div>
        )}
      )}
    </h1>
  )
}

export default function Home() {
  const [data, setData] = useState([])
  const [sortOpts, setSortOpts] = useState( { key: 'fpl', order: 1 } )
  const [filter, setFilter] = useState(new RegExp('', 'iu'))
  const [toggledLeagues, setToggledLeagues] = useState([])
  const [filteredData, setFilteredData] = useState([])

  function handleChange(e) {
    const string = e.target.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const pattern = new RegExp(string, 'iu')
    setFilter(pattern)
  }

  useEffect(() => {
    fetch('/api/scores')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        setData([json]);
      })
  },[])

  useEffect(() => {
    data[0]?.leagues && setToggledLeagues(data[0].leagues.reduce((acc,v)=>{ acc.push(v.id); return acc },[]))
    setFilteredData([...data])
  },[data])

  useEffect(() => {
    filteredData[0]?.manager && setFilteredData(filtered => filtered[0].manager.filter(m => m.leagues.find(l => toggledLeagues.includes(l))) )
  },[toggledLeagues])

  useEffect(() => {
    let sorted
    if(filteredData[0]?.managers) {
      sorted = sortData(filteredData[0].managers, sortOpts.key, sortOpts.order);
      setFilteredData([{ ...sorted, managers: sorted }])
    }
  },[sortOpts.order, sortOpts.key])

  return (
    <div>
      <Head>
        <title>Analytics and friends</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='w-fit mx-auto flex flex-col justify-center'>
        <LeagueToggler leagues={data[0]?.leagues} toggledLeagues={toggledLeagues} setToggledLeagues={setToggledLeagues} setFilteredData={setFilteredData}/>  
        <input className='w-1/3 mb-1 ml-0 text-lg bg-slate-700 focus:bg-slate-600 focus:outline-0 shadow-inner shadow-gray-800/100' onChange={handleChange}/>
        <Table mdata={data} setSortOpts={setSortOpts} filter={filter} toggledLeagues={toggledLeagues} filteredData={filteredData}/>
      </main>
      <footer>
        <p></p>
      </footer>
    </div>
  )
}