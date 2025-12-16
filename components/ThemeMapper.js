const themeKeywords = {
  'Africa': [
    'egypt', 'kenya', 'south africa', 'morocco', 'nigeria', 'ghana', 'ethiopia', 
    'tanzania', 'uganda', 'algeria', 'senegal', 'ivory coast', 'zambia', 'zimbabwe', 
    'botswana', 'cameroon', 'libya', 'sudan', 'angola', 'africa', 'casablanca', 'cairo', 'nairobi', 'cape town'
  ],
  'Central Asia': [
    'kazakhstan', 'uzbekistan', 'turkmenistan', 'tajikistan', 'kyrgyzstan', 'central asia',
    'ashgabat', 'tashkent', 'almaty', 'bishkek', 'dushanbe', 'samarkand', 'bukhara', 
    'mongolia', 'karaganda', 'urumqi', 'aktau', 'ferghana', 'termez', 'kazakhstan city'
  ],
  'Middle East': [
    'dubai', 'uae', 'iran', 'israel', 'qatar', 'kuwait', 'saudi arabia', 'iraq', 
    'oman', 'bahrain', 'middle east', 'jerusalem', 'doha', 'riyadh', 'tehran', 
    'baghdad', 'muscat', 'jordan', 'abudhabi', 'abu dhabi', 'beirut', 'amman'
  ],
  'Europe': [
    'france', 'germany', 'italy', 'spain', 'uk', 'portugal', 'netherlands', 
    'belgium', 'switzerland', 'sweden', 'norway', 'denmark', 'finland', 'austria', 
    'ireland', 'greece', 'europe', 'paris', 'rome', 'berlin', 'madrid', 'london', 'amsterdam', 'vienna'
  ],
  'North America': [
    'usa', 'canada', 'mexico', 'america', 'north', 'new york', 'los angeles', 
    'toronto', 'vancouver', 'mexico city', 'chicago', 'houston', 'miami', 
    'montreal', 'calgary', 'atlanta', 'washington', 'boston', 'dallas', 'san francisco'
  ],
  'Southeast Asia': [
    'thailand', 'vietnam', 'indonesia', 'malaysia', 'southeast asia', 'bali', 'laos',
    'singapore', 'philippines', 'cambodia', 'myanmar', 'brunei', 'jakarta', 'bangkok', 
    'ho chi minh', 'hanoi', 'kuala lumpur', 'phnom penh', 'yangon', 'manila', 'denpasar'
  ],
  'South America': [
    'brazil', 'argentina', 'chile', 'colombia', 'peru', 'ecuador', 'uruguay', 
    'paraguay', 'venezuela', 'bolivia', 'guyana', 'suriname', 'french guiana', 
    'south america', 'rio de janeiro', 'sao paulo', 'buenos aires', 'santiago', 
    'lima', 'caracas', 'quito'
  ]
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
