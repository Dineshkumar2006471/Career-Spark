/*
 * MatchCompass is CareerSpark's reusable signature score component.
 * It exists for the three approved surfaces: landing, dashboard score, and resume score.
 */

// Chooses the semantic arc color and returns the correct design token class.
function getScoreColor(score) {
  if (score > 70) return 'text-success'
  if (score >= 40) return 'text-warning'
  return 'text-hairline'
}

// Renders a radial progress gauge and returns a labeled career match summary.
function MatchCompass({ label, score, status }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const scoreColor = getScoreColor(score)

  return (
    <article className="rounded-lg border border-hairline bg-canvas p-lg text-center text-ink">
      <div className="relative mx-auto grid h-40 w-40 place-items-center">
        <svg aria-hidden="true" className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
          <circle className="text-hairline" cx="70" cy="70" fill="none" r={radius} stroke="currentColor" strokeWidth="12" />
          <circle
            className={scoreColor}
            cx="70"
            cy="70"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="12"
          />
        </svg>
        <span className="absolute font-mono text-[40px] font-medium leading-none">{score}%</span>
      </div>
      <h3 className="mt-base font-display text-lg font-semibold">{label}</h3>
      <p className="mt-xs text-sm text-body">{status}</p>
    </article>
  )
}

export default MatchCompass
