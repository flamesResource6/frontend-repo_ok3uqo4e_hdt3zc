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
            Upload a file or paste a YouTube link, set duration, auto-generate subtitles with styles, and download instantly.
          </p>
          <ul className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <li className="rounded-full bg-white/10 px-3 py-1">AI Subtitles</li>
            <li className="rounded-full bg-white/10 px-3 py-1">Style Templates</li>
            <li className="rounded-full bg-white/10 px-3 py-1">Viral Score</li>
            <li className="rounded-full bg-white/10 px-3 py-1">One-click Download</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

const SUB_TEMPLATES = [
  { key: 'clean', name: 'Clean Minimal' },
  { key: 'karaoke', name: 'Karaoke Highlight' },
  { key: 'bold-shadow', name: 'Bold + Shadow' },
  { key: 'neon', name: 'Neon Glow' },
]

const EFFECTS = [
  { key: 'zoom', name: 'Auto Zoom/Punch' },
  { key: 'shake', name: 'Camera Shake' },
  { key: 'flash', name: 'Flash Beats' },
  { key: 'color-pop', name: 'Color Pop' },
  { key: 'bokeh', name: 'Bokeh Blur' },
]

function UploadPanel({ onCreated }) {
  const [sourceType, setSourceType] = useState('upload') // upload | youtube
  const [file, setFile] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [duration, setDuration] = useState(60)
  const [subtitleMode, setSubtitleMode] = useState('auto')
  const [customText, setCustomText] = useState('')
  const [language, setLanguage] = useState('en')
  const [template, setTemplate] = useState('clean')
  const [position, setPosition] = useState('bottom')
  const [offsetY, setOffsetY] = useState(0)
  const [effects, setEffects] = useState([])
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [resolution, setResolution] = useState('1080p')
  const [hardSub, setHardSub] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    const hasSource = sourceType === 'upload' ? !!file : (youtubeUrl.trim().length > 0)
    return hasSource && duration >= 5 && duration <= 180 && !loading
  }, [sourceType, file, youtubeUrl, duration, loading])

  const toggleEffect = (key) => {
    setEffects((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('source_type', sourceType)
      if (sourceType === 'upload') {
        form.append('file', file)
      } else {
        form.append('youtube_url', youtubeUrl.trim())
      }
      form.append('duration_seconds', String(duration))
      form.append('subtitle_mode', subtitleMode)
      if (subtitleMode === 'custom' && customText.trim()) form.append('custom_subtitle_text', customText.trim())
      if (language) form.append('subtitle_language', language)

      // styling
      form.append('subtitle_template', template)
      form.append('subtitle_position', position)
      form.append('subtitle_offset_y', String(offsetY))
      form.append('video_effects', effects.join(','))
      form.append('aspect_ratio', aspectRatio)
      form.append('resolution', resolution)
      form.append('hard_subtitles', String(hardSub))

      const res = await fetch(`${BACKEND}/api/jobs`, { method: 'POST', body: form })
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
      const data = await res.json()
      onCreated?.(data)
      // reset minimal
      setFile(null)
      setYoutubeUrl('')
      setCustomText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="-mt-20 mx-auto max-w-6xl px-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Source selection */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-white/80">Source</label>
            <div className="mt-2 flex gap-3 text-sm">
              <button type="button" onClick={()=>setSourceType('upload')} className={classNames('rounded-md px-3 py-2', sourceType==='upload' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70')}>Upload</button>
              <button type="button" onClick={()=>setSourceType('youtube')} className={classNames('rounded-md px-3 py-2', sourceType==='youtube' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70')}>YouTube</button>
            </div>
          </div>

          {sourceType === 'upload' ? (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-white/80">Upload file</label>
              <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="mt-2 block w-full rounded-md border border-white/20 bg-black/30 p-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white" />
              {file && <p className="mt-1 text-xs text-white/60">Selected: {file.name}</p>}
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-white/80">YouTube link</label>
              <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e)=>setYoutubeUrl(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white" />
              <p className="mt-1 text-xs text-white/50">We will fetch the video server-side.</p>
            </div>
          )}
        </div>

        {/* Core options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

          <div>
            <label className="block text-sm font-medium text-white/80">Language</label>
            <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white">
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="id">Indonesian</option>
              <option value="es">Spanish</option>
              <option value="hi">Hindi</option>
              <option value="jp">Japanese</option>
            </select>
          </div>
        </div>

        {subtitleMode === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-white/80">Custom subtitle text</label>
            <textarea value={customText} onChange={(e)=>setCustomText(e.target.value)} rows={3} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-3 text-white" placeholder="Type subtitle lines or script..." />
          </div>
        )}

        {/* Subtitle styling */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-white/80">Subtitle template</label>
            <select value={template} onChange={(e)=>setTemplate(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white">
              {SUB_TEMPLATES.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-white/50">Example styles: Clean, Karaoke highlight, Neon glow.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Subtitle position</label>
            <select value={position} onChange={(e)=>setPosition(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white">
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Vertical offset (px)</label>
            <input type="number" value={offsetY} onChange={(e)=>setOffsetY(parseInt(e.target.value || '0', 10))} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 p-2 text-white" />
          </div>
        </div>

        {/* Effects and output */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white/80">Video effects</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EFFECTS.map(eff => (
                <label key={eff.key} className={classNames('flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm', effects.includes(eff.key) && 'bg-indigo-500/20 border-indigo-500/40') }>
                  <input type="checkbox" checked={effects.includes(eff.key)} onChange={()=>toggleEffect(eff.key)} />
                  <span>{eff.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Output</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select value={aspectRatio} onChange={(e)=>setAspectRatio(e.target.value)} className="rounded-md border border-white/20 bg-black/30 p-2 text-white">
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
                <option value="4:5">4:5</option>
                <option value="16:9">16:9</option>
              </select>
              <select value={resolution} onChange={(e)=>setResolution(e.target.value)} className="rounded-md border border-white/20 bg-black/30 p-2 text-white">
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
              <label className="col-span-2 mt-1 flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" checked={hardSub} onChange={(e)=>setHardSub(e.target.checked)} />
                <span>Burn subtitles (hard-sub)</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">{error}</div>
        )}

        <div className="flex flex-wrap items-center gap-3">
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
