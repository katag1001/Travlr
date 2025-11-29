const themeKeywords = {
  'North America': ['usa', 'canada', 'america', 'north'],
  'South America': ['brazil', 'argentina', 'chile', 'south america'],
  'Indian Subcontinent': ['india', 'pakistan', 'bangladesh', 'nepal', 'subcontinent'],
  'Southeast Asia': ['thailand', 'vietnam', 'indonesia', 'malaysia', 'southeast'],
  'East Asia': ['china', 'japan', 'korea', 'taiwan', 'east asia'],
  'Oceania': ['australia', 'new zealand', 'oceania', 'fiji'],
  'Africa': ['egypt', 'kenya', 'south africa', 'morocco', 'africa'],
  'Middle East': ['dubai', 'uae', 'iran', 'middle east', 'israel'],
  'Russia': ['russia', 'siberia', 'moscow', 'st petersburg'],
  'Europe': ['france', 'germany', 'italy', 'spain', 'uk', 'europe'],
  'Central Asia': ['kazakhstan', 'uzbekistan', 'turkmenistan', 'central asia'],
};

export function getThemeFromTripName(tripName) {
  if (!tripName) return 'North America'; // default

  const lowerName = tripName.toLowerCase();

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some((kw) => lowerName.includes(kw))) {
      return theme;
    }
  }

  return 'Africa';
}
