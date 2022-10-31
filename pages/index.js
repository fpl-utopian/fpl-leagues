import Head from 'next/head'
import { useEffect, useState } from 'react'
import bgColors from '../utils/painter'
import sortData from '../utils/sort'
import dateFormater from '../utils/date'

function Row({ rdata, i, hidden, bgStyle}) {
  const { id, player_name, leagues } = rdata
  const { fpl, md, xG, odds, variance } = rdata.scores
  const varc = Math.round(Number(variance) * 1000)/10

  return (
    <tr className={`${hidden} ${bgStyle} border-y border-slate-700 opacity-80`}>
      <td className='text-center'>{i}</td>
      <td className='text-left'>
        <a href={`https://fantasy.premierleague.com/entry/${id}/history`}
           title={id} rel="noreferrer" target='_blank'>{player_name}</a>
        </td>
      <td>{fpl}</td>
      <td>{md}</td>
      <td>{odds}</td>
      <td>{xG}</td>
      <td className='text-center ...'>{varc}</td>
    </tr>
  )
}

function Table({ setSortOpts, filter, toggledLeagues, filteredManagers }) {
  
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
    <table className="standingss text-right border border-slate-700 ...">
      <thead>
        <tr className='text-center hover:cursor-pointer'>
          {Object.keys(mappedKeys).map((k,i,arr) => {
            return <th className="px-2 py-1 border border-slate-600 ..." key={k} id={k} onClick={handleClick}>{mappedKeys[k]}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {filteredManagers[0]?.id && filteredManagers.map((entry, i) => {
            const hidden = (toggledLeagues.find(l=>entry.leagues.includes(l)) && filter.test(entry.player_name)) ? "" : "hidden "
            const leagueColor =  hidden !== 'hidden ' ? bgColors[toggledLeagues.find(l => entry.leagues.includes(l))] : 'bg-inherit'
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
    <h1 className="flex justify-evenly w-fit text-left text-xl my-6 font-blue-200 ...">
      <div>
      {leagues[0]?.id && leagues.map((league,id) => {
        return (
        <div key={id}>
          <input className='w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                 onChange={handleToggle} type="checkbox"
                 id={league.id} name={league.id} defaultChecked={toggledLeagues.includes(league.id) ? true : false}/>
          <label className={`ml-2 league-shadow pr-1 rounded ${bgColors[league.id]}`} htmlFor={league.id}>{league.name}</label>
          <span className='ml-2'></span>
        </div>
        )}
      )}
      </div>
      <div className='w-fit'><span></span></div>
    </h1>
  )
}

function useDebounceValue(value, time=500) {
  const [debounceValue, setDebounceValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value)
    }, time)

    return () => {
      clearTimeout(timer)
    }
  }, [value, time])

  return debounceValue

}

export default function Home() {
  const [managers, setManagers] = useState([])
  const [filteredManagers, setFilteredManagers] = useState([])
  const [leagues, setLeagues] = useState([])
  const [timestmp, setTimestmp] = useState(null)
  const [sortOpts, setSortOpts] = useState( { key: 'md', order: 1 } )
  const [filter, setFilter] = useState(new RegExp('', 'iu'))
  const [toggledLeagues, setToggledLeagues] = useState([])
  const debounceFilter = useDebounceValue(filter)

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
        setFilteredManagers(sorted)
        setLeagues(json.leagues)
        setToggledLeagues(json.leagues.map(l=>l.id))
        setTimestmp(dateFormater(json.timestamp))
      })
  },[])

  useEffect(() => {
    if(managers[0]?.id) {
      const unsorted = [...filteredManagers]
      const sorted = sortData(unsorted, sortOpts.key, sortOpts.order);
      setFilteredManagers(sorted)
    }
  },[sortOpts.order, sortOpts.key])

  useEffect(() => {
    if(managers[0]?.id) {
      const filtered = managers.filter(m => m.leagues.find(l => toggledLeagues.includes(l)))
      const unsorted = [...filtered]
      const sorted = sortData(unsorted, sortOpts.key, sortOpts.order);
      setFilteredManagers(sorted)
    }
  },[toggledLeagues])

  return (
    <div>
      <Head>
        <title>Analytics and friends</title>
        <meta name="description" content="Underlying FPL rankings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='w-fit mx-auto flex flex-col justify-center'>
        <div className='flex flex-row-reverse'>
          <span className='block text-sm self-end'>{timestmp}</span>
        </div>
        <LeagueToggler leagues={leagues}
                       toggledLeagues={toggledLeagues}
                       setToggledLeagues={setToggledLeagues}
                       sortOpts={sortOpts}
                       managers={managers}
                       setFilteredManagers={setFilteredManagers}/>
        <input className='w-1/3 mb-1 ml-0 text-lg bg-slate-700 focus:bg-slate-600 focus:outline-0 shadow-inner shadow-gray-800/100' onChange={handleChange}/>
        <Table setSortOpts={setSortOpts} filter={debounceFilter} toggledLeagues={toggledLeagues} managers={managers} filteredManagers={filteredManagers}/>
      </main>
      <footer>
        <p></p>
      </footer>
    </div>
  )
}