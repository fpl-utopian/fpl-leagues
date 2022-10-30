import Head from 'next/head'
import { useEffect, useState } from 'react'
import bgColors from '../utils/painter'
import sortData from '../utils/sort'

function Row({ rdata, i, hidden, bgStyle}) {
  const { id, player_name, leagues } = rdata
  const { fpl, md, xG, odds, variance } = rdata.scores

  return (
    <tr className={`${hidden} ${bgStyle} border-y border-slate-700`}>
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

function Table({ setSortOpts, filter, toggledLeagues, managers }) {
  
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
        {managers[0]?.id && managers.map((entry, i) => {
            const leagueColor = bgColors[toggledLeagues.find(l => entry.leagues.includes(l))]
            const hidden = (toggledLeagues.find(l=>entry.leagues.includes(l)) && filter.test(entry.player_name)) ? "" : "hidden "
            return <Row key={entry.id} rdata={entry} i={i+1} hidden={hidden} bgStyle={leagueColor}/>
          })
      }
      </tbody>
    </table>
  )
}

function LeagueToggler({ leagues, toggledLeagues, setToggledLeagues }) {
  
  function handleToggle(e) {
    const id = Number(e.target.name)
    e.target.checked
      ? !toggledLeagues.includes(id) && setToggledLeagues(l=>[...l, id])
      : setToggledLeagues(l=>l.filter(s => s !== id))
  }

  return (
    <h1 className="w-fit text-left text-xl my-6 font-blue-200 ...">
      {leagues[0]?.id && leagues.map((league,id) => {
        return (
        <div key={id}>
          <input onChange={handleToggle} type="checkbox"
                 id={league.id} name={league.id} defaultChecked={toggledLeagues.includes(league.id) ? true : false}/>
          <label className={bgColors[league.id]} htmlFor={league.id}> {league.name}</label>
        </div>
        )}
      )}
    </h1>
  )
}

export default function Home() {
  const [managers, setManagers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [timestamp, setTimestamp] = useState(0)
  const [sortOpts, setSortOpts] = useState( { key: 'md', order: 1 } )
  const [filter, setFilter] = useState(new RegExp('', 'iu'))
  const [toggledLeagues, setToggledLeagues] = useState([])

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
        const unsorted = [...json.managers]
        const sorted = sortData(unsorted, sortOpts.key, sortOpts.order);
        setManagers(sorted)
        setLeagues(json.leagues)
        setToggledLeagues(json.leagues.map(l=>l.id))
        setTimestamp(json.timestamp)
      })
  },[])

  useEffect(() => {
    if(managers[0]?.id) {
      const unsorted = [...managers]
      const sorted = sortData(unsorted, sortOpts.key, sortOpts.order);
      setManagers(sorted)
    }
  },[sortOpts.order, sortOpts.key])

  return (
    <div>
      <Head>
        <title>Analytics and friends</title>
        <meta name="description" content="Underlying FPL rankings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='w-fit mx-auto flex flex-col justify-center'>
        <LeagueToggler leagues={leagues} toggledLeagues={toggledLeagues} setToggledLeagues={setToggledLeagues}/>  
        <input className='w-1/3 mb-1 ml-0 text-lg bg-slate-700 focus:bg-slate-600 focus:outline-0 shadow-inner shadow-gray-800/100' onChange={handleChange}/>
        <Table setSortOpts={setSortOpts} filter={filter} toggledLeagues={toggledLeagues} managers={managers}/>
      </main>
      <footer>
        <p></p>
      </footer>
    </div>
  )
}