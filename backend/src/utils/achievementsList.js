const achievements = [
  {
    id: 'perfect_module',
    title: 'Maestro del Módulo',
    description: 'Completaste un módulo con el 100% de puntuación.',
    icon: '🏆'
  },
  {
    id: 'first_module',
    title: 'Primer Paso',
    description: 'Completaste tu primer módulo.',
    icon: '🚀'
  }
];

const getAchievementById = (id) => {
  return achievements.find(a => a.id === id);
};

module.exports = {
  achievements,
  getAchievementById
};
