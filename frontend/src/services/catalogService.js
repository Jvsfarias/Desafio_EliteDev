/**
 * Catálogo temporário até a API externa ser definida.
 * Troque apenas esta implementação quando a API real estiver disponível.
 */
const MOCK_CATALOG = [
  {
    id: 'movie-1',
    title: 'Duna: Parte Dois',
    type: 'filme',
    rating: '14',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  },
  {
    id: 'movie-2',
    title: 'Oppenheimer',
    type: 'filme',
    rating: '16',
    image:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
  },
  {
    id: 'show-1',
    title: 'Festival de Jazz no Parque',
    type: 'show',
    image:
      'https://images.unsplash.com/photo-1514320291840-3095421d4596?w=600&h=400&fit=crop',
  },
  {
    id: 'show-2',
    title: 'Rock na Praça',
    type: 'show',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf529eec07?w=600&h=400&fit=crop',
  },
]

export const catalogService = {
  async listCatalog() {
    return MOCK_CATALOG
  },
}
