import PropTypes from 'prop-types'

// Íconos SVG de línea; heredan el color del texto (currentColor)
const Icon = ({ size = 20, children, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {children}
  </svg>
)

Icon.propTypes = {
  size: PropTypes.number,
  children: PropTypes.node,
}

export const IconCoffee = (props) => (
  <Icon {...props}>
    <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
    <path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M8 3v3M12 3v3" />
  </Icon>
)

export const IconSearch = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Icon>
)

export const IconCart = (props) => (
  <Icon {...props}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6.2" />
    <circle cx="9" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </Icon>
)

export const IconUser = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
)

export const IconMoon = (props) => (
  <Icon {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
)

export const IconSun = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
)

export const IconGrid = (props) => (
  <Icon {...props}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
)

export const IconGlass = (props) => (
  <Icon {...props}>
    <path d="M6 3h12l-1.6 17.1a1 1 0 0 1-1 .9H8.6a1 1 0 0 1-1-.9L6 3z" />
    <path d="M6.6 9h10.8" />
  </Icon>
)

export const IconEgg = (props) => (
  <Icon {...props}>
    <path d="M12 3c3.5 0 6.5 5.5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.5 8.5 3 12 3z" />
  </Icon>
)

export const IconUtensils = (props) => (
  <Icon {...props}>
    <path d="M5 3v5a2 2 0 0 0 4 0V3M7 3v18" />
    <path d="M18 21V3c-2.2 1.4-3.5 4-3.5 7.5V13H18" />
  </Icon>
)

export const IconBowl = (props) => (
  <Icon {...props}>
    <path d="M3 11h18a9 9 0 0 1-18 0z" />
    <path d="M9 4c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5M15 4c-.6.8-.6 1.7 0 2.5" />
  </Icon>
)

export const IconLeaf = (props) => (
  <Icon {...props}>
    <path d="M4 20c.8-9.5 6-15 16-16-.8 10-6.5 15.2-16 16z" />
    <path d="M4 20l8.5-8.5" />
  </Icon>
)

export const IconTag = (props) => (
  <Icon {...props}>
    <path d="M3 4a1 1 0 0 1 1-1h8l9 9-9 9-9-9V4z" />
    <circle cx="7.5" cy="7.5" r="1.4" />
  </Icon>
)

export const IconBread = (props) => (
  <Icon {...props}>
    <path d="M4 10.5a8 5.5 0 0 1 16 0 2 2 0 0 1-1 1.7V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-6.8a2 2 0 0 1-1-1.7z" />
    <path d="M9 14v2M15 14v2" />
  </Icon>
)

export const IconClock = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconMapPin = (props) => (
  <Icon {...props}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
)

export const IconPlus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconCheck = (props) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const IconLogout = (props) => (
  <Icon {...props}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </Icon>
)

export const IconRefresh = (props) => (
  <Icon {...props}>
    <path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" />
    <path d="M20 20v-4h-4" />
  </Icon>
)

export const IconEdit = (props) => (
  <Icon {...props}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
)

export const IconX = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const IconBell = (props) => (
  <Icon {...props}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Icon>
)

export const IconStore = (props) => (
  <Icon {...props}>
    <path d="M4 9l1.5-5h13L20 9" />
    <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
    <path d="M5 11.5V20h14v-8.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
)

export const IconBox = (props) => (
  <Icon {...props}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
  </Icon>
)

export const IconHistory = (props) => (
  <Icon {...props}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </Icon>
)

export const IconClipboard = (props) => (
  <Icon {...props}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V3h6v1" />
    <path d="M9 10h6M9 14h6M9 18h3" />
  </Icon>
)

export const IconImage = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M21 16l-5-5-9 9" />
  </Icon>
)

export const IconAlert = (props) => (
  <Icon {...props}>
    <path d="M12 3l9.5 17h-19L12 3z" />
    <path d="M12 10v4M12 17.5v.01" />
  </Icon>
)

export const IconNote = (props) => (
  <Icon {...props}>
    <path d="M5 4h14v11l-5 5H5V4z" />
    <path d="M14 20v-5h5" />
  </Icon>
)
