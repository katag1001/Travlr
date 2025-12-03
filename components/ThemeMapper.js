const themeKeywords = {
  'Africa': ['egypt', 'kenya', 'south africa', 'morocco', 'africa'],
  'Central Asia': ['kazakhstan', 'uzbekistan', 'turkmenistan', 'central asia'],
  'Middle East': ['dubai', 'uae', 'iran', 'middle east', 'israel'],
  'Europe': ['france', 'germany', 'italy', 'spain', 'uk', 'europe'],
  'North America': ['usa', 'canada', 'america', 'north'],
  'Southeast Asia': ['thailand', 'vietnam', 'indonesia', 'malaysia', 'southeast'],  
  'South America': ['brazil', 'argentina', 'chile', 'south america'],
};

export function getThemeFromTripName(tripName) {
  if (!tripName) return 'Travel';

  const lowerName = tripName.toLowerCase();

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some((kw) => lowerName.includes(kw))) {
      return theme;
    }
  }

  return 'Travel';
}
