import { type SVGProps } from 'react'

// A small, consistent inline-SVG icon set. All icons inherit `currentColor`
// and use a 24×24 viewBox with 2px round strokes so they sit together cleanly.

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
)

export const IconCompare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v18M3 7h18M6 7l-3 6h6zM18 7l-3 6h6z" />
    <path d="M3 13a3 3 0 0 0 6 0M15 13a3 3 0 0 0 6 0" />
  </Svg>
)

export const IconDay = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
    <path d="m9 15 2 2 4-4" />
  </Svg>
)

export const IconBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
)

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Svg>
)

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 13 4 4L19 7" />
  </Svg>
)

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
)

export const IconFlame = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 0-2-.5-2.5C15 9 17 11 17 14a5 5 0 0 1-10 0c0-4 3-6 5-11Z" />
  </Svg>
)

export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
)

export const IconSliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h8M16 18h4" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="14" cy="18" r="2" />
  </Svg>
)

// ---- Category / segment icons -------------------------------------------

export const IconBurger = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9a8 8 0 0 1 16 0Z" />
    <path d="M4 13h16M5 13c0 0 2 2 3.5 0 1.5 2 3.5 2 5 0 1.5 2 3.5 2 5 0" />
    <path d="M5 17h14a0 0 0 0 1 0 0 2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
  </Svg>
)

export const IconCoffee = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
    <path d="M17 9h2a2 2 0 0 1 0 6h-2" />
    <path d="M8 2v2M12 2v2" />
  </Svg>
)

export const IconBowl = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11h18a9 9 0 0 1-18 0Z" />
    <path d="M7 11a5 5 0 0 1 10 0" />
    <path d="M12 3v3" />
  </Svg>
)

export const IconUtensils = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11" />
    <path d="M16 3c-1.5 0-2.5 2-2.5 4.5S14.5 12 16 12v9" />
  </Svg>
)

export const IconLeaf = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20c0-8 6-14 16-14 0 10-6 15-14 15" />
    <path d="M4 20c4-6 8-8 12-9" />
  </Svg>
)

export const IconDumbbell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
  </Svg>
)
