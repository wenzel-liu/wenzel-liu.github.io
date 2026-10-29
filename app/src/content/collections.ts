export const collections = {
  medprism: {
    title: 'MedPrism',
    subtitle: 'Biopharma Insight',
    kicker: 'Research & analysis',
    description: 'Research notes on biopharma companies, development pipelines, and clinical evidence.',
    path: 'medprism/',
    tags: ['Biopharma', 'Clinical Research']
  },
  'sci-industrialist': {
    title: 'Sci-Industrialist',
    subtitle: 'Technology, Manufacturing & Historical Materialism',
    kicker: 'Ideas & industry',
    description: 'Essays and reading notes on industrial change, institutions, labor, and the material conditions behind them.',
    path: 'sci-industrialist/',
    tags: ['Industry', 'Political Economy']
  },
  notes: {
    title: 'Notes & essays',
    subtitle: '',
    kicker: 'From the notebook',
    description: 'Personal notes on everyday life, learning, and working in Tokyo.',
    path: 'notes/',
    tags: ['Life', 'Learning']
  }
};

export type CollectionId = keyof typeof collections;
