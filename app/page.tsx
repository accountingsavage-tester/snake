'use client'
import { useEffect, useRef, useState } from 'react'

const CUES = [
  [14.14, 'Litrato man natin ay kumupas'],
  [21.08, 'Ikaw aking noon, ngayon, at bukas'],
  [27.96, "Kung paboritong kuwento nati'y magwakas"],
  [34.85, 'Ay uulitin kong ikuwento bukas'],
  [41.82, 'Sa pagdating ay siyang ating'],
  [48.65, 'Buong pusong salubungin'],
  [55.50, "'Di man ngayon tulad ng dati"],
  [62.76, "Ang panata ko'y mananatili"],
  [69.85, 'Kun ika man mapungaw'],
  [76.86, 'Sa sakuyang paghali'],
  [83.94, 'Dae makakalingaw'],
  [90.95, 'Na ako mauli'],
  [98.03, 'Kun ika man mahadit'],
  [105.16, 'Na mapara ining ngirit'],
  [112.18, 'Kada aldaw na ikinurit'],
  [119.23, 'Pinili kang daing pirit'],
  [126.48, 'Sa pag abot kan panahon'],
  [133.51, 'Sato ining aakuon'],
  [140.23, 'Dawa ngunyan lain kan dati'],
  [146.96, "Ang panata ko'y mananatili"],
  [154.09, 'Kaya tahan na'],
  [160.89, 'Aking tahanan'],
  [167.65, 'Kaya tahan na'],
  [174.57, 'Aking tahanan'],
  [214.97, 'Oh, sa pagdating ay siyang ating'],
  [221.63, 'Taos pusong tatanggapin'],
  [228.28, "'Di man ngayon tulad ng dati"],
  [234.96, "Ang panata ko'y mananatili"],
] as const

const N = 21
const CELL = 20
const MUSIC_START = 13

export default function Home() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [started, setStarted] = useState(false)
  const [over, setOver] = useState(false)
  const [disco, setDisco] = useState(false)
  const [lyric, setLyric] = useState('')
  const [score, setScore] = useState(0)
  const state = useRef<any>(null)

  const draw = () => {
    const c = canvas.current
    if (!c || !state.current) return
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 420, 420)
    ctx.fillStyle = '#f4df35'
    ctx.fillRect(state.current.food.x * CELL + 1, state.current.food.y * CELL + 1, 18, 18)
    state.current.snake.forEach((p: any, i: number) => {
      ctx.fillStyle = i ? '#20b8d5' : '#8be9ff'
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, 18, 18)
    })
  }

  const placeFood = () => {
    let p: { x: number; y: number }
    do {
      p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }
    } while (state.current.snake.some((s: any) => s.x === p.x && s.y === p.y))
    state.current.food = p
  }

  const syncLyrics = () => {
    const current = audio.current?.currentTime ?? 0
    let active = ''
    for (const [time, text] of CUES) {
      if (current >= time) active = text
      else break
    }
    setLyric(active ? `♪ ${active} ♪` : '')
  }

  const playPanata = () => {
    const player = audio.current
    if (!player) return
    player.currentTime = MUSIC_START
    player.play().catch(() => {})
    syncLyrics()
  }

  const finish = () => {
    if (timer.current) clearInterval(timer.current)
    setOver(true)
    setTimeout(() => {
      setOver(false)
      setDisco(true)
      playPanata()
    }, 900)
  }

  const start = () => {
    setStarted(true)
    setOver(false)
    setDisco(false)
    setLyric('')
    audio.current?.pause()
    if (timer.current) clearInterval(timer.current)

    state.current = {
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 15, y: 10 },
    }
    setScore(0)

    let s = 0
    const tick = () => {
      const q = state.current
      q.dir = q.next
      const h = { x: q.snake[0].x + q.dir.x, y: q.snake[0].y + q.dir.y }
      if (
        h.x < 0 || h.x >= N || h.y < 0 || h.y >= N ||
        q.snake.some((p: any, i: number) => i && p.x === h.x && p.y === h.y)
      ) {
        finish()
        return
      }
      q.snake.unshift(h)
      if (h.x === q.food.x && h.y === q.food.y) {
        s++
        setScore(s)
        placeFood()
      } else {
        q.snake.pop()
      }
      draw()
    }

    timer.current = setInterval(tick, 120)
    draw()
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const q = state.current
      if (!q) return
      const d =
        k === 'arrowup' || k === 'w' ? { x: 0, y: -1 } :
        k === 'arrowdown' || k === 's' ? { x: 0, y: 1 } :
        k === 'arrowleft' || k === 'a' ? { x: -1, y: 0 } :
        k === 'arrowright' || k === 'd' ? { x: 1, y: 0 } : null
      if (d && !(d.x === -q.dir.x && d.y === -q.dir.y)) q.next = d
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
      audio.current?.pause()
    }
  }, [])

  return <>
    {!started && <div className="start"><h1>SNAKE</h1><button onClick={start}>START GAME</button></div>}
    <main>
      <header><span>SNAKE</span><b>{score}</b></header>
      <canvas ref={canvas} width={420} height={420} />
      <small>Arrow keys / WASD</small>
    </main>
    {over && <div className="gameover">GAME OVER</div>}
    {disco && <div className="disco"><i /><i /><i /><i /></div>}
    {lyric && <div className="lyrics">{lyric}</div>}
    {disco && <button className="again" onClick={start}>PLAY AGAIN</button>}
    <audio ref={audio} preload="auto" src="/Panata.mp3" onTimeUpdate={syncLyrics} />
  </>
}
