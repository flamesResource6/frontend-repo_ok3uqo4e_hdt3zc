import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

function classNames(...c) { return c.filter(Boolean).join(' ') }

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Realtime AI Video Clipper
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Turn long videos into viral-ready Shorts
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Upload any video, set duration, auto-generate subtitles, and download instantly. Get a viral score to predict performance.
          </p>
          <ul className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <li className="rounded-full bg-white/10 px-3 py-1">AI Subtitle Modes</li>
            <li className="rounded-full bg-white/10 px-3 py-1">Smart Duration</li>
            <li className="rounded-full bg-white/10 px-3 py-1">Viral Score</li>
            <li className="rounded-full bg-white/10 px-3 py-1">One-click Download</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function UploadPanel({ onCreated }) {
  const [file, setFile] = useState(null)
  const [duration, setDuration] = useState(60)
  const [subtitleMode, setSubtitleMode] = useState('auto')
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => !!file && duration >= 5 && duration <= 180 && (!loading), [file, duration, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('duration_seconds', String(duration))
      form.append('subtitle_mode', subtitleMode)
      if (subtitleMode === 'custom' && customText.trim()) form.append('custom_subtitle_text', customText.trim())

      const res = await fetch(`${BACKEND}/api/jobs`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      onCreated?.(data)
      setFile(null)
      setCustomText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="-mt-20 mx-auto max-w-5xl px-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-2">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-medium text-white/80">Source video</label>
          <div className="mt-2 flex items-center gap-3">
            <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="block w-full rounded-md border border-white/20 bg-black/30 p-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white" />
          </div>
          {file && <p className="mt-1 text-xs text-white/60">Selected: {file.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80">Duration (seconds)</label>
          <input type="number" min={5} max={180} value={duration} onChange={e=>setDuration(parseInt(e.target.value||'0',10))} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white" />
          <p className="mt-1 text-xs text-white/60">Recommended 30-60 for Shorts</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80">Subtitles</label>
          <select value={subtitleMode} onChange={(e)=>setSubtitleMode(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white">
            <option value="none">None</option>
            <option value="auto">Auto</option>
            <option value="custom">Custom text</option>
          </select>
        </div>

        {subtitleMode === 'custom' && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80">Custom subtitle text</label>
            <textarea value={customText} onChange={(e)=>setCustomText(e.target.value)} rows={3} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-3 text-white" placeholder="Type subtitle lines or script..." />
          </div>
        )}

        {error && (
          <div className="sm:col-span-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">{error}</div>
        )}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={!canSubmit} className={classNames('inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition', canSubmit ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-white/10 text-white/40')}>{loading ? 'Processing...' : 'Create Clip'}</button>
          <a href="#recent" className="text-sm text-white/70 hover:text-white">See recent jobs</a>
        </div>
      </form>
    </div>
  )
}

function JobCard({ job }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">Status</p>
          <p className="text-white font-semibold">{job.status}</p>
        </div>
        {typeof job.viral_score === 'number' && (
          <div className="text-right">
            <p className="text-sm text-white/60">Viral Score</p>
            <p className="text-2xl font-extrabold text-emerald-400">{Math.round(job.viral_score)}</p>
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {job.download_url && (
          <a href={`${BACKEND}${job.download_url}`} className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600" download>
            Download Video
          </a>
        )}
        {job.subtitle_url && (
          <a href={`${BACKEND}${job.subtitle_url}`} className="inline-flex items-center justify-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20" download>
            Download Subtitles
          </a>
        )}
      </div>
    </div>
  )
}

function RecentJobs({ trigger }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BACKEND}/api/jobs`)
      const data = await res.json()
      setItems(data.items || [])
    } catch(e) {
      // noop
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [trigger])

  return (
    <section id="recent" className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recent Clips</h2>
          <p className="text-white/70 text-sm">Latest jobs you created</p>
        </div>
        <button onClick={load} className="text-sm text-white/70 hover:text-white">Refresh</button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-white/70">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-white/60">No jobs yet.</p>
        ) : (
          items.map((j)=> <JobCard key={j.id} job={j} />)
        )}
      </div>
    </section>
  )
}

export default function App() {
  const [lastCreated, setLastCreated] = useState(null)

  return (
    <div className="min-h-screen w-full bg-[#0b0b10] text-white">
      <Hero />
      <UploadPanel onCreated={setLastCreated} />
      <RecentJobs trigger={lastCreated} />

      <footer className="border-t border-white/10 py-10 text-center text-white/50">
        Built with AI. Backend at {BACKEND}
      </footer>
    </div>
  )
}
