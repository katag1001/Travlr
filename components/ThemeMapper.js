const themeKeywords = {
  'Africa': [
    'africa', 'algeria', 'angola', 'benin', 'botswana', 'burkina faso', 'burundi',
    'cameroon', 'cape verde', 'central african republic', 'chad', 'comoros', 
    'congo', 'dr congo', 'djibouti', 'egypt', 'equatorial guinea', 'eritrea', 
    'ethiopia', 'gabon', 'gambia', 'ghana', 'guinea', 'guinea-bissau', 'ivory coast', 
    'kenya', 'lesotho', 'liberia', 'libya', 'madagascar', 'malawi', 'mali', 'mauritania', 
    'mauritius', 'morocco', 'mozambique', 'namibia', 'niger', 'nigeria', 'rwanda', 
    'senegal', 'seychelles', 'sierra leone', 'somalia', 'south africa', 'south sudan', 
    'sudan', 'tanzania', 'togo', 'tunisia', 'uganda', 'zambia', 'zimbabwe',
    'cairo', 'lagos', 'nairobi', 'alexandria', 'kinshasa', 'johannesburg', 'casablanca', 'addis ababa'
  ],
  'Central Asia': [
    'central asia', 'kazakhstan', 'kyrgyzstan', 'tajikistan', 'turkmenistan', 'uzbekistan',
    'afghanistan', 'kazakhstan', 'tajikistan', 'uzbekistan', 'turkmenistan', 'kyrgyzstan',
    'astana', 'almaty', 'bishkek', 'dushanbe', 'ashgabat', 'tashkent'
  ],
  'Middle East': [
    'middle east', 'bahrain', 'cyprus', 'egypt', 'iran', 'iraq', 'israel', 'jordan', 
    'kuwait', 'lebanon', 'oman', 'qatar', 'saudi arabia', 'syria', 'united arab emirates', 'yemen',
    'riyadh', 'dubai', 'doha', 'jerusalem', 'tehran', 'baghdad', 'amman', 'beirut', 'muscat', 'kuwait city'
  ],
  'Europe': [
    'europe', 'albania', 'andorra', 'austria', 'belarus', 'belgium', 'bosnia & herzegovina',
    'bulgaria', 'croatia', 'czech republic', 'czechia', 'denmark', 'estonia', 'finland', 'france',
    'germany', 'greece', 'hungary', 'iceland', 'ireland', 'italy', 'latvia', 'lithuania',
    'luxembourg', 'malta', 'moldova', 'monaco', 'montenegro', 'netherlands', 'north macedonia',
    'norway', 'poland', 'portugal', 'romania', 'russia', 'san marino', 'serbia', 'slovakia',
    'slovenia', 'spain', 'sweden', 'switzerland', 'ukraine', 'united kingdom',
    'london', 'paris', 'berlin', 'madrid', 'rome', 'amsterdam', 'vienna', 'barcelona', 'moscow', 'athens'
  ],
  'North America': [
    'north america', 'canada', 'usa', 'mexico', 'greenland', 'bahamas', 'cuba',
    'new york', 'los angeles', 'chicago', 'houston', 'miami', 'toronto', 'vancouver', 
    'montreal', 'mexico city', 'boston', 'san francisco', 'washington dc'
  ],
  'Southeast Asia': [
    'southeast asia', 'brunei', 'cambodia', 'laos', 'malaysia', 'myanmar', 'philippines',
    'singapore', 'thailand', 'vietnam', 'indonesia', 'east timor', 'bangkok', 
    'jakarta', 'manila', 'kuala lumpur', 'singapore city', 'ho chi minh', 'hanoi', 
    'phnom penh', 'yangon', 'denpasar'
  ],
  'South America': [
    'south america', 'argentina', 'bolivia', 'brazil', 'chile', 'colombia', 'ecuador',
    'guyana', 'paraguay', 'peru', 'suriname', 'uruguay', 'venezuela', 'jamaica', 'haiti', 'dominican republic', 'guatemala', 'belize', 'el salvador',
    'honduras', 'nicaragua', 'costa rica', 'panama', 'buenos aires', 'rio de janeiro', 
    'sao paulo', 'santiago', 'lima', 'bogota', 'caracas', 'quito'
  ],
  'East Asia': [
    'east asia', 'china', 'japan', 'south korea', 'north korea', 'taiwan', 'hong kong', 'macau',
    'beijing', 'shanghai', 'tokyo', 'osaka', 'seoul', 'taipei', 'hong kong', 'kyoto', 'nagoya', 'incheon'
  ],
  'Indian Subcontinent': [
    'indian subcontinent', 'india', 'pakistan', 'bangladesh', 'nepal', 'bhutan', 'sri lanka', 'maldives',
    'delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'karachi', 'lahore', 'dhaka', 'colombo', 'kathmandu'
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
