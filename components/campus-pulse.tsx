'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

const floors = [
  { id: 'gf', title: 'Ground Floor', wing: 'Main Lobby', code: 'ROB-GF', ap: ':d6:b2', ping: '18s ago', rooms: ['Room 1', 'Room 2'], seats: '18 seats' },
  { id: 'f1', title: '1st Floor', wing: 'Central Wing', code: 'ROB-F1', ap: ':01:ed', ping: '35s ago', rooms: ['Room 21', 'Room 22', 'Room 25 · Study Hub'], seats: '14 seats' },
  { id: 'f2', title: '2nd Floor', wing: 'North Wing', code: 'ROB-F2', ap: ':03:17', ping: '6m 14s ago', rooms: ['Room 31', 'Room 32'], seats: '—', outage: true },
  { id: 'f3', title: '3rd Floor', wing: 'Central Wing', code: 'ROB-F3', ap: ':04:cd', ping: '22s ago', rooms: ['Room 41', 'Room 42', 'Room 43'], seats: '22 seats' },
  { id: 'f4', title: '4th Floor', wing: 'South Wing', code: 'ROB-F4', ap: ':06:cc', ping: '48s ago', rooms: ['Room 51', 'Room 52'], seats: '10 seats' },
]

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'rose' }) {
  return <div className="metric-card"><span className="metric-label">{label}</span><strong className={tone}>{value}</strong></div>
}

function RoomCard({ name, outage, seats }: { name: string; outage?: boolean; seats: string }) {
  return (
    <div className="room-card">
      <div className="room-top"><strong>{name}</strong><span className={outage ? 'room-state dead' : 'room-state'}>{outage ? 'No Power' : 'Available'}</span></div>
      <div className="room-details">
        <span><Zap size={13} /> {outage ? 'Sockets Dead' : 'Wall Sockets Active'}</span>
        <span><BatteryCharging size={13} /> {outage ? 'AC offline' : 'AC · Fan active'}</span>
      </div>
      <div className="room-bottom"><span className="occupancy-dot" /> {outage ? 'Unavailable' : `${seats} · Quiet zone`}<span className="wifi-quality"><Wifi size={12} /> {outage ? 'Offline' : 'Strong'}</span></div>
    </div>
  )
}

export function CampusPulse() {
  const [openFloor, setOpenFloor] = useState('f1')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All Floors')
  const [showSimulator, setShowSimulator] = useState(false)
  const [outages, setOutages] = useState(['f2'])
  const [refreshing, setRefreshing] = useState(false)

  const visibleFloors = useMemo(() => floors.filter((floor) => {
    const matchesQuery = `${floor.title} ${floor.code} ${floor.rooms.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const stable = !outages.includes(floor.id)
    const matchesFilter = filter === 'All Floors' || (filter === 'Power Stable' && stable) || (filter === 'Dumsor Alerts' && !stable)
    return matchesQuery && matchesFilter
  }), [query, filter, outages])

  const toggleOutage = (id: string) => setOutages((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const refresh = () => { setRefreshing(true); window.setTimeout(() => setRefreshing(false), 900) }

  return (
    <main className="pulse-shell">
      <div className="pulse-container">
        <header className="top-header">
          <div className="brand-lockup"><div className="brand-mark"><Zap size={19} fill="currentColor" /></div><div><p className="eyebrow">AAMUSTED CAMPUS PULSE</p><h1>Reynolds Okai Building</h1><p className="muted"><MapPin size={13} /> Kumasi Main Campus <span className="code-pill">ROB</span></p></div></div>
          <button className="icon-button" onClick={refresh} aria-label="Refresh telemetry"><RefreshCw size={17} className={refreshing ? 'spin' : ''} /></button>
        </header>

        <section className="live-strip"><span className="live-dot" /><div><strong>Passive Wi-Fi Telemetry Active</strong><p>Grid signal is being monitored without hardware</p></div><ShieldCheck size={18} /></section>

        <section className="metrics"><Metric label="Floors tracked" value="5" /><Metric label="Grid active" value={`${5 - outages.length}/5`} tone="green" /><Metric label="Active outages" value={`${outages.length}`} tone="rose" /></section>

        {outages.length > 0 && <section className="alert-banner"><div className="alert-icon"><AlertTriangle size={18} /></div><div><strong>Campus alert · Floor 2</strong><p>ROB-F2 reported silent for &gt; 6 mins. Power outage suspected.</p></div><span className="alert-live">LIVE</span></section>}

        <section className="toolbar"><div className="search-wrap"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search room or floor" aria-label="Search room or floor" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div><div className="filters">{['All Floors', 'Power Stable', 'Dumsor Alerts'].map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>{item}</button>)}</div></section>

        <div className="section-heading"><div><p className="eyebrow">BUILDING OVERVIEW</p><h2>Floor status</h2></div><span className="updated"><span className="live-dot small" /> Updated now</span></div>

        <section className="floor-list">{visibleFloors.map((floor) => { const isOutage = outages.includes(floor.id); const expanded = openFloor === floor.id; return <article className={isOutage ? 'floor-card outage' : 'floor-card'} key={floor.id}>
          <button className="floor-toggle" onClick={() => setOpenFloor(expanded ? '' : floor.id)} aria-expanded={expanded}>
            <div className="floor-status-icon">{isOutage ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}</div><div className="floor-main"><div className="floor-title-row"><h3>{floor.title}</h3><span className="wing">· {floor.wing}</span></div><div className="floor-meta"><span className={isOutage ? 'power-badge outage-badge' : 'power-badge'}>{isOutage ? 'Dumsor Detected' : 'Power Stable'}</span><span>AP {floor.ap}</span><span>Pinged {floor.ping}</span></div></div><ChevronDown size={18} className={expanded ? 'chevron open' : 'chevron'} />
          </button>
          {expanded && <div className="floor-content"><div className="content-rule" /><div className="room-grid">{floor.rooms.map((room) => <RoomCard key={room} name={room} outage={isOutage} seats={isOutage ? '—' : floor.seats} />)}</div><div className="floor-footer"><span><Wifi size={13} /> {isOutage ? 'AP signal decaying' : 'Wi-Fi coverage verified'}</span><span className={isOutage ? 'footer-alert' : ''}>{isOutage ? 'Needs attention' : 'All systems normal'}</span></div></div>}
        </article> })}</section>

        <button className="simulator-trigger" onClick={() => setShowSimulator(!showSimulator)}><span className="simulator-icon"><Zap size={16} /></span><span><strong>Demo Outage Simulator</strong><small>Test live campus states</small></span><ChevronDown size={18} className={showSimulator ? 'chevron open' : 'chevron'} /></button>
        {showSimulator && <section className="simulator-panel"><div className="simulator-heading"><div><p className="eyebrow">DEMO CONTROLS</p><h3>Simulate telemetry</h3></div><span className="demo-badge">DEMO</span></div><button className="sim-action" onClick={() => toggleOutage('f2')}><span className="action-icon green"><CheckCircle2 size={16} /></span><span><strong>{outages.includes('f2') ? 'Simulate Floor 2 Power Restored' : 'Simulate Floor 2 Blackout'}</strong><small>Updates the live floor state</small></span><span className="action-arrow">→</span></button><button className="sim-action" onClick={() => toggleOutage('f1')}><span className="action-icon rose"><AlertTriangle size={16} /></span><span><strong>{outages.includes('f1') ? 'Restore Floor 1 Power' : 'Trigger Floor 1 Blackout'}</strong><small>Test the alert banner</small></span><span className="action-arrow">→</span></button><button className="sim-action" onClick={refresh}><span className="action-icon blue"><RefreshCw size={16} /></span><span><strong>Simulate Student Phone Walk-by</strong><small>Trigger a live BSSID ping refresh</small></span><span className="action-arrow">→</span></button></section>}
        <p className="footer-note"><Wifi size={13} /> Zero-hardware telemetry · v0 prototype</p>
      </div>
    </main>
  )
}
