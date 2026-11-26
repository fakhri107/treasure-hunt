// ============================================================================
// PIRATE & TREASURE HUNT FLAT VECTOR EMBLEM COLLECTION (SVG)
// ============================================================================
window.TMD = window.TMD || {};

(function initHeroIcons() {
  const ICONS = [
    {
      id: 'pirate-red',
      label: 'Kapal Merah',
      first: 'KAPAL',
      second: 'MERAH',
      accent: '#EF4444',
      svg: `<svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#7F1D1D"/>
        <circle cx="48" cy="16" r="6" fill="#E69B19"/>
        <rect x="30" y="14" width="3" height="28" fill="#5C3A21"/>
        <path d="M33 16 Q48 22 45 34 L32 33 Z" fill="#1C161F"/>
        <circle cx="38" cy="25" r="3" fill="#F8FAFC"/>
        <path d="M14 40 L50 40 L44 50 L20 50 Z" fill="#8C522B"/>
        <rect x="16" y="42" width="32" height="2.5" fill="#E69B19"/>
      </svg>`
    },
    {
      id: 'pirate-blue',
      label: 'Armada Biru',
      first: 'ARMADA',
      second: 'BIRU',
      accent: '#38BDF8',
      svg: `<svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#0C4A6E"/>
        <polygon points="32,12 50,28 32,52 14,28" fill="#38BDF8"/>
        <polygon points="32,12 42,28 32,52 22,28" fill="#BAE6FD" opacity="0.6"/>
        <path d="M14 28h36" stroke="#E0F2FE" stroke-width="2"/>
      </svg>`
    },
    {
      id: 'pirate-gold',
      label: 'Kompas Emas',
      first: 'KOMPAS',
      second: 'EMAS',
      accent: '#E69B19',
      svg: `<svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#451A03"/>
        <circle cx="32" cy="32" r="20" fill="#1C161F" stroke="#E69B19" stroke-width="4"/>
        <polygon points="32,15 36,32 32,49 28,32" fill="#E69B19"/>
        <polygon points="15,32 32,28 49,32 32,36" fill="#F5B82E"/>
        <circle cx="32" cy="32" r="4" fill="#F8FAFC"/>
      </svg>`
    },
    {
      id: 'pirate-green',
      label: 'Zamrud Laut',
      first: 'ZAMRUD',
      second: 'LAUT',
      accent: '#10B981',
      svg: `<svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#064E3B"/>
        <polygon points="32,12 48,24 44,46 20,46 16,24" fill="#10B981"/>
        <polygon points="32,16 42,25 39,41 25,41 22,25" fill="#6EE7B7" opacity="0.5"/>
        <circle cx="32" cy="30" r="5" fill="#ECFDF5"/>
      </svg>`
    },
    {
      id: 'pirate-purple',
      label: 'Harta Ungu',
      first: 'HARTA',
      second: 'UNGU',
      accent: '#8B5CF6',
      svg: `<svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="12" fill="#2E1065"/>
        <path d="M16 26 Q32 14 48 26 L46 32 L18 32 Z" fill="#8C522B"/>
        <rect x="16" y="31" width="32" height="19" rx="3" fill="#6E3F20"/>
        <rect x="16" y="31" width="32" height="4" fill="#E69B19"/>
        <rect x="29" y="33" width="6" height="7" rx="1" fill="#F5B82E"/>
        <circle cx="24" cy="29" r="3.5" fill="#F5B82E"/>
        <circle cx="32" cy="28" r="4" fill="#C4B5FD"/>
        <circle cx="40" cy="29" r="3.5" fill="#F5B82E"/>
      </svg>`
    }
  ];

  function getHeroIconSvg(iconIdOrUrl) {
    const found = ICONS.find((ic) => ic.id === iconIdOrUrl);
    if (found) return found.svg;
    if (iconIdOrUrl && String(iconIdOrUrl).startsWith('http')) {
      return `<img src="${iconIdOrUrl}" alt="Squad" class="w-full h-full object-cover rounded-xl"/>`;
    }
    return ICONS[0].svg;
  }

  window.TMD.HERO_ICONS = ICONS;
  window.TMD.getHeroIconSvg = getHeroIconSvg;
})();
