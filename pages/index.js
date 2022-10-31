import Head from 'next/head'
import { useEffect, useState, createElement } from 'react'
import bgColors from '../utils/painter'
import sortData from '../utils/sort'
import dateFormater from '../utils/date'
import objectToCSV from '../utils/csv'

function Row({ rdata, i, hidden, bgStyle, otherLeagues }) {
  const { id, player_name, leagues } = rdata
  const { fpl, md, xG, odds, variance } = rdata.scores

  return (
    <tr className={`${hidden} ${bgStyle} border-y border-slate-700 opacity-80`}>
      <td className='text-center'>{i}</td>
      <td className='relative text-left'>
        <a href={`https://fantasy.premierleague.com/entry/${id}/history`}
           title={id} rel="noreferrer" target='_blank'>{player_name}
        </a>
        <div className='absolute top-0 right-0 ...' width='0.75rem'>
          <div className='flex-col w-full h-full'>
            {otherLeagues && otherLeagues.map((l) => <svg key={l} className={`block h-2 ${bgColors[l]}`} width='1rem'></svg>)}
          </div>
        </div>
      </td>
      <td>{fpl}</td>
      <td>{md}</td>
      <td>{odds}</td>
      <td>{xG}</td>
      <td className='text-center ...'>{variance}</td>
    </tr>
  )
}

function Table({ sortOpts, setSortOpts, filter, toggledLeagues, filteredManagers }) {
  
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
          {Object.keys(mappedKeys).map((k) => {
            const order = sortOpts.order === -1 ? 'border-b' : 'border-t' 
            const columnBorder = sortOpts.key === k ? `border-x ${order} border-sky-600` : 'border-slate-600'
            return <th className={`relative px-2 py-1 ${columnBorder} ...`} key={k} id={k} onClick={handleClick}>{mappedKeys[k]}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {filteredManagers[0]?.id && filteredManagers.map((entry, i) => {
            let hidden
            let primeLeague = toggledLeagues.find(l=>entry.leagues.includes(l)) 
            let otherLeagues = ''
            if(!(primeLeague && filter.test(entry.player_name))) {
              hidden = 'hidden '
            } else {
              otherLeagues = toggledLeagues.filter(l=>entry.leagues.includes(l) && l!==primeLeague)
            }
            const leagueColor =  hidden !== 'hidden ' ? bgColors[primeLeague] : 'bg-inherit'
            return <Row key={entry.id} rdata={entry} i={i+1} hidden={hidden} bgStyle={leagueColor} otherLeagues={otherLeagues}/>
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

function CSVDownloader( { table } ) {

  function handleClick(e) {
    const blob = new Blob([objectToCSV(table, { type: 'text/csv' })])
    e.target.href = URL.createObjectURL(blob)
  }

  return createElement(
    'a',
    { className: 'p-0.5 bg-slate-50 text-sm rounded text-slate-800', download: 'fpl-leagues.csv', href: '#', onClick: handleClick },
    'Export to CSV'
  )
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
        <meta name="description" content="FPL rankings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='w-fit mx-auto flex flex-col justify-center'>
        <div className='m-1 flex flex-row justify-between'>
          <CSVDownloader table={filteredManagers}/>
          <span className='block text-sm self-start'>{timestmp}</span>
        </div>
        <LeagueToggler leagues={leagues}
                       toggledLeagues={toggledLeagues}
                       setToggledLeagues={setToggledLeagues}
                       sortOpts={sortOpts}
                       managers={managers}
                       setFilteredManagers={setFilteredManagers}/>
        <input className='w-1/3 mb-1 ml-0 text-lg bg-slate-700 focus:bg-slate-600 focus:outline-0 shadow-inner shadow-gray-800/100' onChange={handleChange}/>
        <Table sortOpts={sortOpts} setSortOpts={setSortOpts} filter={debounceFilter} toggledLeagues={toggledLeagues} managers={managers} filteredManagers={filteredManagers}/>
      </main>
      <footer>
        <p></p>
      </footer>
    </div>
  )
}