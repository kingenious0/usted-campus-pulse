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

type Room = { name: string; seats?: string; lab?: boolean; verified?: boolean }
type Wing = { name: string; rooms: Room[] }
type Floor = { id: string; title: string; code: string; ap: string; ping: string; wings: Wing[]; outage?: boolean }

const floors: Floor[] = [
  { id: 'gf', title: 'Ground Floor', code: 'ROB-GF', ap: ':d6:b2', ping: '18s ago', wings: [
    { name: 'South Wing (Lecture Halls)', rooms: [{ name: 'Lecture Room 002', verified: true }, { name: 'Lecture Room 024', verified: true }, { name: 'Lecture Room 025', verified: true }] },
    { name: 'North Wing', rooms: [{ name: 'Lecture Room 001' }] },
  ] },
  { id: 'f1', title: '1st Floor', code: 'ROB-F1', ap: ':01:ed', ping: '35s ago', wings: [
    { name: 'South Wing (Lecture Halls)', rooms: [{ name: 'Lecture Room 003' }, { name: 'Lecture Room 022' }, { name: 'Lecture Room 023' }] },
    { name: 'North Wing', rooms: [{ name: 'Lecture Room 004' }, { name: 'Conference Room' }] },
  ] },
  { id: 'f2', title: '2nd Floor', code: 'ROB-F2', ap: ':03:17', ping: '6m 14s ago', outage: true, wings: [
    { name: 'South Wing (Lecture Halls)', rooms: [{ name: 'Lecture Room 006' }, { name: 'Lecture Room 020' }, { name: 'Lecture Room 021' }] },
    { name: 'North Wing', rooms: [{ name: 'Lecture Room 005' }] },
  ] },
  { id: 'f3', title: '3rd Floor', code: 'ROB-F3', ap: ':04:cd', ping: '22s ago', wings: [
    { name: 'South Wing (Lecture Halls)', rooms: [{ name: 'Lecture Room 017' }, { name: 'Lecture Room 018' }, { name: 'Lecture Room 019' }] },
    { name: 'North Wing', rooms: [{ name: 'Lecture Room 007' }, { name: 'Lecture Room 008' }, { name: 'Lecture Room 009' }] },
    { name: 'West & East Wings', rooms: [{ name: 'West Lecture Hall' }, { name: 'East Lecture Hall' }] },
  ] },
  { id: 'f4', title: '4th Floor', code: 'ROB-F4', ap: ':06:cc', ping: '48s ago', wings: [
    { name: 'South Wing (Lecture Halls)', rooms: [{ name: 'Computer Lab 016', lab: true, seats: '24 workstations' }, { name: 'Lecture Room 014' }, { name: 'Lecture Room 015' }] },
    { name: 'Computer Labs', rooms: [{ name: 'Lab 1 (Room 028)', lab: true, seats: '32 workstations' }, { name: 'Lab 2 (Room 027)', lab: true, seats: '32 workstations' }] },
    { name: 'North Wing', rooms: [{ name: 'Lecture Rooms 010–013' }] },
  ] },
]

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'rose' }) {
  return <div className="metric-card"><span className="metric-label">{label}</span><strong className={tone}>{value}</strong></div>
}

function RoomCard({ room, outage }: { room: Room; outage?: boolean }) {
  const unavailable = outage
  return <div className={room.lab ? 'room-card lab-card' : 'room-card'}>
    <div className="room-top"><strong>{room.name}</strong><span className={unavailable ? 'room-state dead' : 'room-state'}>{unavailable ? 'No Power' : room.lab ? 'Lab Ready' : 'Available'}</span></div>
    <div className="room-details">
      <span><Zap size={13} /> {unavailable ? 'Sockets Tripped' : room.lab ? 'Dedicated plugs active' : room.verified ? 'Sockets verified' : 'Wall Sockets Active'}</span>
      <span><BatteryCharging size={13} /> {unavailable ? 'AC offline' : room.lab ? `${room.seats} · workstation power` : 'AC · Fan active'}</span>
    </div>
    <div className="room-bottom"><span className="occupancy-dot" /> {unavailable ? 'Unavailable' : room.lab ? 'Workstations online' : `${room.seats ?? 'Quiet zone'} · Quiet zone`}<span className="wifi-quality"><Wifi size={12} /> {unavailable ? 'Offline' : 'Strong'}</span></div>
  </div>
}

export function CampusPulse() {
  const [openFloor, setOpenFloor] = useState('f1')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All Floors')
  const [showSimulator, setShowSimulator] = useState(false)
  const [outages, setOutages] = useState(['f2'])
  const [refreshing, setRefreshing] = useState(false)

  const visibleFloors = useMemo(() => floors.filter((floor) => {
    const searchable = `${floor.title} ${floor.code} ${floor.wings.map((wing) => `${wing.name} ${wing.rooms.map((room) => room.name).join(' ')}`).join(' ')}`
    const matchesQuery = searchable.toLowerCase().includes(query.toLowerCase())
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
        <section className="toolbar"><div className="search-wrap"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search official room number" aria-label="Search room or floor" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div><div className="filters">{['All Floors', 'Power Stable', 'Dumsor Alerts'].map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>{item}</button>)}</div></section>
        <div className="section-heading"><div><p className="eyebrow">BUILDING OVERVIEW</p><h2>Floor status</h2></div><span className="updated"><span className="live-dot small" /> Updated now</span></div>
        <section className="floor-list">{visibleFloors.map((floor) => { const isOutage = outages.includes(floor.id); const expanded = openFloor === floor.id; return <article className={isOutage ? 'floor-card outage' : 'floor-card'} key={floor.id}>
          <button className="floor-toggle" onClick={() => setOpenFloor(expanded ? '' : floor.id)} aria-expanded={expanded}><div className="floor-status-icon">{isOutage ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}</div><div className="floor-main"><div className="floor-title-row"><h3>{floor.title}</h3><span className="wing">· {floor.code}</span></div><div className="floor-meta"><span className={isOutage ? 'power-badge outage-badge' : 'power-badge'}>{isOutage ? 'Dumsor Detected' : 'Power Stable'}</span><span>AP {floor.ap}</span><span>Pinged {floor.ping}</span></div></div><ChevronDown size={18} className={expanded ? 'chevron open' : 'chevron'} /></button>
          {expanded && <div className="floor-content"><div className="content-rule" />{floor.wings.map((wing) => <div className="wing-group" key={wing.name}><div className="wing-heading"><span>{wing.name}</span><small>{wing.rooms.length} {wing.rooms.length === 1 ? 'space' : 'spaces'}</small></div><div className="room-grid">{wing.rooms.map((room) => <RoomCard key={room.name} room={room} outage={isOutage} />)}</div></div>)}<div className="floor-footer"><span><Wifi size={13} /> {isOutage ? 'AP signal decaying' : 'Wi-Fi coverage verified'}</span><span className={isOutage ? 'footer-alert' : ''}>{isOutage ? 'Needs attention' : 'All systems normal'}</span></div></div>}
        </article> })}</section>
        <button className="simulator-trigger" onClick={() => setShowSimulator(!showSimulator)}><span className="simulator-icon"><Zap size={16} /></span><span><strong>Demo Outage Simulator</strong><small>Test live campus states</small></span><ChevronDown size={18} className={showSimulator ? 'chevron open' : 'chevron'} /></button>
        {showSimulator && <section className="simulator-panel"><div className="simulator-heading"><div><p className="eyebrow">DEMO CONTROLS</p><h3>Simulate telemetry</h3></div><span className="demo-badge">DEMO</span></div><button className="sim-action" onClick={() => toggleOutage('f2')}><span className="action-icon green"><CheckCircle2 size={16} /></span><span><strong>{outages.includes('f2') ? 'Simulate Floor 2 Power Restored' : 'Simulate Floor 2 Blackout'}</strong><small>Updates the live floor state</small></span><span className="action-arrow">→</span></button><button className="sim-action" onClick={() => toggleOutage('f1')}><span className="action-icon rose"><AlertTriangle size={16} /></span><span><strong>{outages.includes('f1') ? 'Restore Floor 1 Power' : 'Trigger Floor 1 Blackout'}</strong><small>Test the alert banner</small></span><span className="action-arrow">→</span></button><button className="sim-action" onClick={refresh}><span className="action-icon blue"><RefreshCw size={16} /></span><span><strong>Simulate Student Phone Walk-by</strong><small>Trigger a live BSSID ping refresh</small></span><span className="action-arrow">→</span></button></section>}
        <p className="footer-note"><Wifi size={13} /> Zero-hardware telemetry · Official ROB directory dataset</p>
      </div>
    </main>
  )
}
