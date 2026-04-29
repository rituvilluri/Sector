const Icon = ({ d, size = 16, sw = 1.4, fill = 'none', style, viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

export const SectorMark = ({ size = 22, color = '#D4A843' }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 44 24" fill="none" style={{ display: 'block' }}>
    <path d="M2 18 C 10 18, 14 6, 22 6 S 34 18, 42 6"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <circle cx="2" cy="18" r="2.2" fill={color} />
    <circle cx="42" cy="6" r="2.2" fill={color} />
  </svg>
);

export const SectorLogo = ({ size = 22, color = '#D4A843', spacing = '0.42em', fontSize = 14 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
    <SectorMark size={size} color={color} />
    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: spacing, color, fontSize, paddingLeft: 2 }}>
      SECTOR
    </span>
  </div>
);

export const IconDashboard  = (p) => <Icon {...p} d="M3 13h7V3H3v10zM14 21h7V11h-7v10zM3 21h7v-6H3v6zM14 9h7V3h-7v6z" />;
export const IconGarage     = (p) => <Icon {...p} d="M3 21V8l9-5 9 5v13M3 21h18M7 21v-7h10v7M7 14h10" />;
export const IconSessions   = (p) => <Icon {...p} d="M4 6h16M4 12h16M4 18h10" />;
export const IconPlus       = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
export const IconChevron    = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
export const IconChevronDown= (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
export const IconCheck      = (p) => <Icon {...p} d="M5 12l5 5L20 7" />;
export const IconClose      = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
export const IconCalendar   = (p) => <Icon {...p} d="M3 7h18M5 5v4M19 5v4M5 9h14v11H5z" />;
export const IconClock      = (p) => <Icon {...p} d="M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z" />;
export const IconCar        = (p) => <Icon {...p} d="M3 13l2-6h14l2 6M3 13v5h2v-2h14v2h2v-5M3 13h18M7 16h.01M17 16h.01" />;
export const IconWrench     = (p) => <Icon {...p} d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z" />;
export const IconArrowRight = (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />;
export const IconArrowLeft  = (p) => <Icon {...p} d="M19 12H5M11 19l-7-7 7-7" />;
export const IconEdit       = (p) => <Icon {...p} d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />;
export const IconTrash      = (p) => <Icon {...p} d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />;
export const IconCamera     = (p) => <Icon {...p} d="M4 8h3l2-3h6l2 3h3v11H4V8zm8 9a4 4 0 100-8 4 4 0 000 8z" />;
export const IconSearch     = (p) => <Icon {...p} d="M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5" />;
export const IconFlag       = (p) => <Icon {...p} d="M5 21V4M5 4h12l-2 4 2 4H5" />;
export const IconStopwatch  = (p) => <Icon {...p} d="M12 22a8 8 0 100-16 8 8 0 000 16zM12 14V9M9 2h6M19 5l-2 2" />;
export const IconUpload     = (p) => <Icon {...p} d="M12 16V4M6 10l6-6 6 6M4 20h16" />;
export const IconWeather    = (p) => <Icon {...p} d="M5 17a4 4 0 014-4 5 5 0 019.6 1.5A3 3 0 0118 20H7a3 3 0 01-2-3z" />;

export const GoogleG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);
