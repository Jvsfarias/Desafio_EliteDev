export const ROLES = {
  cliente: {
    id: 'cliente',
    label: 'Cliente',
  },
  organizador: {
    id: 'organizador',
    label: 'Organizador',
  },
  portaria: {
    id: 'portaria',
    label: 'Portaria',
  },
}

export function getRoleLabel(role) {
  return ROLES[role]?.label ?? role
}
