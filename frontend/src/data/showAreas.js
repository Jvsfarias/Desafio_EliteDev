export const SHOW_AREAS = [
  { key: 'pista',           label: 'Pista',           color: '#22c55e' },
  { key: 'pistaPremium',    label: 'Pista Premium',   color: '#16a34a' },
  { key: 'cadeiraInferior', label: 'Cadeira Inferior', color: '#3b82f6' },
  { key: 'cadeiraSuperior', label: 'Cadeira Superior', color: '#ec4899' },
  { key: 'lounge',          label: 'Lounge Premium',  color: '#f97316' },
  { key: 'vipA',            label: 'VIP A',           color: '#a78bfa' },
  { key: 'vipB',            label: 'VIP B',           color: '#6366f1' },
]

export function createEmptyAreas() {
  return SHOW_AREAS.map((area) => ({
    key: area.key,
    label: area.label,
    capacity: '',
    price: '',
  }))
}

export function areasFromEvent(eventAreas = []) {
  return SHOW_AREAS.map((area) => {
    const saved = eventAreas.find((item) => item.key === area.key)
    return {
      key: area.key,
      label: area.label,
      capacity: saved?.capacity != null ? String(saved.capacity) : '',
      price: saved?.price != null ? String(saved.price) : '',
    }
  })
}
