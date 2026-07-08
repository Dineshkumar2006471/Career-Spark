/*
 * Button centralizes the CareerSpark button styles from DESIGN.md Section 4.
 * It exists so CTAs and text buttons share one accessible implementation.
 */
import { Link } from 'react-router-dom'

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-hairline bg-canvas text-ink hover:bg-surface-soft',
  text: 'text-primary underline-offset-4 hover:underline',
}

// Renders a button or link and returns a styled interactive control.
function Button({ children, className = '', href, to, type = 'button', variant = 'primary', ...props }) {
  const classes = `inline-flex h-11 items-center justify-center rounded-md px-lg text-sm font-medium transition ${variantClasses[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
