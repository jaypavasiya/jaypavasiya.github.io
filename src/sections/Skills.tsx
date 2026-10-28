import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { skills } from '../content/profile'
import { prefersReducedMotion, scrollState } from '../lib/motion'
import { KineticHeading } from '../components/KineticHeading'
import './Skills.css'

type Group = keyof typeof skills

const GROUPS: { key: Group; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'tools', label: 'Tools' },
]

const ALL = GROUPS.flatMap(({ key }) => skills[key].map((name) => ({ name, group: key })))

// Matter's Mouse exposes its DOM handlers at runtime but not in the types.
type MouseHandlers = {
  mousemove: (e: Event) => void
  mousedown: (e: Event) => void
  mouseup: (e: Event) => void
  mousewheel: (e: Event) => void
}

type Item = { el: HTMLElement; body: Matter.Body; w: number; h: number; added: boolean }

const STEP = 1000 / 60
const WALL = 400
const rand = (a: number, b: number) => a + Math.random() * (b - a)

function Pill({ name, group }: { name: string; group: Group }) {
  return <span className={`sk-pill sk-pill--${group}`}>{name}</span>
}

export function Skills() {
  const [reduced] = useState(prefersReducedMotion)
  const stageRef = useRef<HTMLDivElement>(null)
  const shakeRef = useRef<() => void>(() => {})

  useEffect(() => {
    const stage = stageRef.current
    if (reduced || !stage) return
    const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter

    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0012 } })
    const world = engine.world
    let W = stage.clientWidth
    let H = stage.clientHeight

    // Floor, side walls reaching high above the stage, and a lid above the
    // spawn zone so thrown pills always come back down.
    let walls: Matter.Body[] = []
    const buildWalls = () => {
      Composite.remove(world, walls)
      const opts = { isStatic: true, friction: 0.4 }
      const tall = H * 3 + WALL
      walls = [
        Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opts),
        Bodies.rectangle(-WALL / 2, H - tall / 2, WALL, tall, opts),
        Bodies.rectangle(W + WALL / 2, H - tall / 2, WALL, tall, opts),
        Bodies.rectangle(W / 2, -H - WALL / 2, W + WALL * 2, WALL, opts),
      ]
      Composite.add(world, walls)
    }
    buildWalls()

    const makeBody = (w: number, h: number) =>
      Bodies.rectangle(0, -500, w, h, {
        chamfer: { radius: h * 0.48 },
        restitution: 0.4,
        friction: 0.15,
        frictionAir: 0.012,
        density: 0.0016,
      })

    const items: Item[] = Array.from(stage.querySelectorAll<HTMLElement>('.sk-pill')).map((el) => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      return { el, body: makeBody(w, h), w, h, added: false }
    })

    const spawnX = (w: number) => (w + 16 >= W ? W / 2 : rand(w / 2 + 8, W - w / 2 - 8))

    // Drop the pills in one by one from above the stage.
    const timers: number[] = []
    let dropped = false
    const drop = () => {
      if (dropped) return
      dropped = true
      const order = [...items].sort(() => Math.random() - 0.5)
      order.forEach((it, i) => {
        timers.push(
          window.setTimeout(() => {
            Body.setPosition(it.body, { x: spawnX(it.w), y: -it.h - rand(10, H * 0.5) })
            Body.setAngle(it.body, rand(-0.5, 0.5))
            Body.setVelocity(it.body, { x: rand(-2, 2), y: rand(2, 6) })
            Composite.add(world, it.body)
            it.added = true
            it.el.style.visibility = 'visible'
          }, i * 65),
        )
      })
    }

    // ---------- pointer input ----------
    const mouse = Mouse.create(stage)
    const m = mouse as unknown as MouseHandlers
    // Matter grabs wheel and every touch on the element, which would kill page
    // scroll. Drop those and only capture touches that start on a pill.
    stage.removeEventListener('wheel', m.mousewheel)
    stage.removeEventListener('touchstart', m.mousedown)
    stage.removeEventListener('touchmove', m.mousemove)
    stage.removeEventListener('touchend', m.mouseup)

    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } } as Matter.IConstraintDefinition,
    })
    Composite.add(world, mc)
    const onGrab = () => stage.classList.add('is-dragging')
    const onDrop = () => stage.classList.remove('is-dragging')
    Events.on(mc, 'startdrag', onGrab)
    Events.on(mc, 'enddrag', onDrop)

    const onTouchMove = (e: TouchEvent) => m.mousemove(e)
    const unbindTouch = () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
    const onTouchEnd = (e: TouchEvent) => {
      m.mouseup(e)
      unbindTouch()
    }
    const onTouchStart = (e: TouchEvent) => {
      if (!(e.target as Element | null)?.closest?.('.sk-pill')) return
      m.mousedown(e)
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: false })
      window.addEventListener('touchcancel', onTouchEnd, { passive: false })
    }
    stage.addEventListener('touchstart', onTouchStart, { passive: false })

    // Keep dragging (and release) working when the pointer leaves the stage.
    const onWinMove = (e: MouseEvent) => {
      if (mouse.button === 0 && !stage.contains(e.target as Node)) m.mousemove(e)
    }
    const onWinUp = (e: MouseEvent) => {
      if (mouse.button !== -1) m.mouseup(e)
    }
    window.addEventListener('mousemove', onWinMove)
    window.addEventListener('mouseup', onWinUp)

    // ---------- forces ----------
    const kick = (strength: number) => {
      flips.clear()
      for (const it of items) {
        if (!it.added) continue
        const v = it.body.velocity
        Body.setVelocity(it.body, {
          x: v.x + rand(-1, 1) * strength * 0.12,
          y: Math.max(Math.min(v.y, 0) - strength * 0.18, -16),
        })
        Body.setAngularVelocity(it.body, it.body.angularVelocity + rand(-1, 1) * strength * 0.0025)
      }
    }

    shakeRef.current = () => {
      if (!dropped) return drop()
      flips.clear()
      for (const it of items) {
        if (!it.added) continue
        Body.setVelocity(it.body, { x: rand(-12, 12), y: rand(-18, -8) })
        Body.setAngularVelocity(it.body, rand(-0.18, 0.18))
      }
    }

    // ---------- loop ----------
    let raf = 0
    let running = false
    let last = 0
    let acc = 0
    let lastLenisV = 0
    let lastY = window.scrollY
    let lastKick = 0

    const sync = () => {
      for (const it of items) {
        if (!it.added) continue
        const { position: p, angle } = it.body
        // Anything that escaped (tunnelled through a wall) goes back in the top.
        if (p.y > H + 200 || p.x < -200 || p.x > W + 200) {
          Body.setPosition(it.body, { x: spawnX(it.w), y: -it.h })
          Body.setVelocity(it.body, { x: 0, y: 0 })
        }
        it.el.style.transform = `translate3d(${p.x - it.w / 2}px, ${p.y - it.h / 2}px, 0) rotate(${angle}rad)`
      }
    }

    // Keep labels readable: tilted pills get a gentle nudge back upright, and
    // ones resting upside down hop and flip themselves over.
    // Attempts reset whenever the pile is disturbed, so a buried pill
    // doesn't keep hopping forever.
    const flipAt = new Map<Matter.Body, number>()
    const flips = new Map<Matter.Body, number>()
    const upright = (now: number) => {
      for (const it of items) {
        const b = it.body
        if (!it.added || b === mc.body) continue
        const a = Math.atan2(Math.sin(b.angle), Math.cos(b.angle))
        if (Math.abs(a) < 0.5 || b.speed > 4) continue
        if (Math.abs(a) > 2.2) {
          const tries = flips.get(b) ?? 0
          if (b.speed > 0.6 || tries >= 2 || now - (flipAt.get(b) ?? 0) < 1200) continue
          flipAt.set(b, now)
          flips.set(b, tries + 1)
          Body.setVelocity(b, { x: b.velocity.x, y: -7 })
          Body.setAngularVelocity(b, -Math.sign(a) * 0.22)
        } else {
          Body.setAngularVelocity(b, b.angularVelocity - Math.sin(a) * 0.0035)
        }
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // Stas-style: the pile jumps when the visitor scrolls fast. Lenis
      // velocity is the main signal; native scroll delta covers no-Lenis.
      const lenisV = scrollState.velocity !== lastLenisV ? Math.abs(scrollState.velocity) : 0
      lastLenisV = scrollState.velocity
      const y = window.scrollY
      const speed = Math.max(lenisV, Math.abs(y - lastY))
      lastY = y
      if (dropped && speed > 6 && now - lastKick > 140) {
        kick(Math.min(speed, 60))
        lastKick = now
      }

      acc += Math.min(now - last, 100)
      last = now
      let n = 0
      while (acc >= STEP && n < 4) {
        upright(now)
        Engine.update(engine, STEP)
        acc -= STEP
        n++
      }
      if (n === 4) acc = 0
      sync()
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      lastY = window.scrollY
      lastLenisV = scrollState.velocity
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    // Pause the engine whenever the stage is off-screen; drop on first view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          start()
          if (entry.intersectionRatio >= 0.35) drop()
        } else stop()
      },
      { threshold: [0, 0.35] },
    )
    io.observe(stage)

    // Rebuild walls to the new size and re-measure pills (font size is fluid).
    const ro = new ResizeObserver(() => {
      const nw = stage.clientWidth
      const nh = stage.clientHeight
      let changed = false
      if (nw !== W || nh !== H) {
        W = nw
        H = nh
        buildWalls()
        changed = true
      }
      for (const it of items) {
        const w = it.el.offsetWidth
        const h = it.el.offsetHeight
        if (w && h && (w !== it.w || h !== it.h)) {
          const angle = it.body.angle
          Body.setAngle(it.body, 0)
          Body.scale(it.body, w / it.w, h / it.h)
          Body.setAngle(it.body, angle)
          it.w = w
          it.h = h
          changed = true
        }
        if (changed && it.added) {
          const p = it.body.position
          Body.setPosition(it.body, {
            x: Math.min(Math.max(p.x, it.w / 2), W - it.w / 2),
            y: Math.min(p.y, H - it.h / 2),
          })
        }
      }
      if (changed) sync()
    })
    ro.observe(stage)

    return () => {
      stop()
      timers.forEach(clearTimeout)
      io.disconnect()
      ro.disconnect()
      shakeRef.current = () => {}
      stage.removeEventListener('mousemove', m.mousemove)
      stage.removeEventListener('mousedown', m.mousedown)
      stage.removeEventListener('mouseup', m.mouseup)
      stage.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('mousemove', onWinMove)
      window.removeEventListener('mouseup', onWinUp)
      unbindTouch()
      stage.classList.remove('is-dragging')
      Events.off(mc, 'startdrag', onGrab)
      Events.off(mc, 'enddrag', onDrop)
      Composite.clear(world, false, true)
      Engine.clear(engine)
      for (const it of items) {
        it.el.style.transform = ''
        it.el.style.visibility = ''
      }
    }
  }, [reduced])

  return (
    <section id="skills" className="section sk">
      <p className="section-label mono">04 · Skills</p>
      <div className="sk-head">
        <KineticHeading className="sk-title">The toolbox.</KineticHeading>
        <div className="sk-side">
          <ul className="sk-legend mono" aria-hidden="true">
            {GROUPS.map(({ key, label }) => (
              <li key={key}>
                <span className={`sk-swatch sk-swatch--${key}`} />
                {label}
                <span className="sk-legend-count">{String(skills[key].length).padStart(2, '0')}</span>
              </li>
            ))}
          </ul>
          {!reduced && (
            <button type="button" className="sk-shake mono" onClick={() => shakeRef.current()}>
              <span aria-hidden="true">↯</span> Shake
            </button>
          )}
        </div>
      </div>

      <ul className="visually-hidden" aria-label="Skills">
        {GROUPS.map(({ key, label }) => (
          <li key={key}>
            {label}
            <ul>
              {skills[key].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {reduced ? (
        <div className="sk-grid" aria-hidden="true">
          {ALL.map((s) => (
            <Pill key={s.name} {...s} />
          ))}
        </div>
      ) : (
        <div className="sk-stage" ref={stageRef} aria-hidden="true">
          <p className="sk-caption mono">Drag · throw · scroll fast</p>
          {ALL.map((s) => (
            <Pill key={s.name} {...s} />
          ))}
        </div>
      )}
    </section>
  )
}
