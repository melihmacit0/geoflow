// GeoFlow seed dataset — cultural context + logistics for the discovery interface.
// In production these would come from RestCountries / Wikipedia + a flight aggregator
// (Amadeus / Skyscanner). For the local prototype we serve curated, structured data.

export const destinations = [
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    tagline: 'Land of the Rising Sun',
    continent: 'Asia',
    lat: 36.2048,
    lng: 138.2529,
    iata: 'HND',
    accent: '#D4A24C',
    cheapestFlight: 840,
    interests: ['History', 'Cuisine', 'Nature'],
    intro:
      'Japan is a land where ancient traditions meld seamlessly with futuristic technology. From the serene Zen gardens of Kyoto to the neon-lit streets of Shibuya, the archipelago offers a profound sensory journey through time and culture.',
    didYouKnow:
      'There are more than 6,800 islands in the Japanese archipelago, though most people only ever visit the four largest: Honshu, Hokkaido, Kyushu, and Shikoku.',
    facts: { capital: 'Tokyo', language: 'Japanese', currency: 'JPY (¥)', bestTime: 'Mar – May' },
    highlights: [
      { title: 'Tokyo Shibuya', note: "The world's busiest crossing" },
      { title: 'Kyoto Temples', note: 'Ancient spiritual heritage' },
      { title: 'Osaka Castle', note: 'Historic samurai fortress' },
      { title: 'Mt. Fuji Peaks', note: 'The iconic sacred summit' }
    ],
    comparison: {
      flightDuration: '11h 20m',
      bestSeason: 'Mar-May',
      culturalDraw: 'Zen Temples & Tech',
      dailyBudget: 150,
      visa: 'E-Visa'
    }
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    tagline: 'The Art of Living',
    continent: 'Europe',
    lat: 46.2276,
    lng: 2.2137,
    iata: 'CDG',
    accent: '#2D4677',
    cheapestFlight: 520,
    interests: ['History', 'Cuisine'],
    intro:
      'France is the global benchmark for art de vivre — a country where Gothic cathedrals, Impressionist galleries, Alpine peaks and sun-drenched Riviera coastlines coexist within a few hours of one another.',
    didYouKnow:
      'France is the most visited country in the world, welcoming around 90 million international tourists every year.',
    facts: { capital: 'Paris', language: 'French', currency: 'EUR (€)', bestTime: 'Apr – Jun' },
    highlights: [
      { title: 'Eiffel Tower', note: 'The iron heart of Paris' },
      { title: 'Louvre Museum', note: "World's largest art museum" },
      { title: 'French Riviera', note: 'Mediterranean glamour' },
      { title: 'Mont Saint-Michel', note: 'Medieval island abbey' }
    ],
    comparison: {
      flightDuration: '3h 30m',
      bestSeason: 'Apr-Jun',
      culturalDraw: 'Art, Wine & Architecture',
      dailyBudget: 130,
      visa: 'Schengen'
    }
  },
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    tagline: 'Cradle of Civilization',
    continent: 'Europe',
    lat: 39.0742,
    lng: 21.8243,
    iata: 'ATH',
    accent: '#2D707E',
    cheapestFlight: 610,
    interests: ['History', 'Nature'],
    intro:
      'Greece is where Western civilization was born. Beyond the philosophy and mythology, the country is a sun-bleached mosaic of whitewashed island villages, ancient ruins and the deep blue of the Aegean.',
    didYouKnow:
      'Greece has more than 6,000 islands and islets scattered across the Aegean and Ionian seas, of which only around 227 are inhabited.',
    facts: { capital: 'Athens', language: 'Greek', currency: 'EUR (€)', bestTime: 'May – Sep' },
    highlights: [
      { title: 'The Acropolis', note: 'Ancient citadel of Athens' },
      { title: 'Santorini', note: 'Iconic caldera sunsets' },
      { title: 'Meteora', note: 'Monasteries in the sky' },
      { title: 'Delphi', note: 'Oracle of the ancient world' }
    ],
    comparison: {
      flightDuration: '2h 05m',
      bestSeason: 'May-Sep',
      culturalDraw: 'Ancient Ruins & Islands',
      dailyBudget: 90,
      visa: 'Schengen'
    }
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    tagline: 'East Meets West',
    continent: 'Asia',
    lat: 38.9637,
    lng: 35.2433,
    iata: 'IST',
    accent: '#9B2C2C',
    cheapestFlight: 495,
    interests: ['History', 'Cuisine', 'Nature'],
    intro:
      'Straddling two continents, Turkey is a crossroads of empires — Roman, Byzantine and Ottoman. Istanbul alone bridges Europe and Asia, while Cappadocia and the Aegean coast offer otherworldly landscapes.',
    didYouKnow:
      'Istanbul is the only major city in the world that sits on two continents, divided by the Bosphorus strait.',
    facts: { capital: 'Ankara', language: 'Turkish', currency: 'TRY (₺)', bestTime: 'Apr – Jun' },
    highlights: [
      { title: 'Hagia Sophia', note: 'Byzantine masterpiece' },
      { title: 'Cappadocia', note: 'Fairy chimneys & balloons' },
      { title: 'Ephesus', note: 'Ancient Roman city' },
      { title: 'Pamukkale', note: 'White travertine terraces' }
    ],
    comparison: {
      flightDuration: '0h 00m',
      bestSeason: 'Apr-Jun',
      culturalDraw: 'Ottoman & Byzantine Heritage',
      dailyBudget: 70,
      visa: 'E-Visa'
    }
  },
  {
    code: 'IS',
    name: 'Iceland',
    flag: '🇮🇸',
    tagline: 'Fire and Ice',
    continent: 'Europe',
    lat: 64.9631,
    lng: -19.0208,
    iata: 'KEF',
    accent: '#3B6E8F',
    cheapestFlight: 310,
    interests: ['Nature'],
    intro:
      'Iceland is a raw, elemental island of glaciers, volcanoes, geysers and black-sand beaches. In winter the aurora dances overhead; in summer the midnight sun never sets.',
    didYouKnow:
      'Iceland runs almost entirely on renewable energy, with nearly 100% of its electricity generated from hydro and geothermal sources.',
    facts: { capital: 'Reykjavík', language: 'Icelandic', currency: 'ISK (kr)', bestTime: 'Jun – Aug' },
    highlights: [
      { title: 'Golden Circle', note: 'Geysers & waterfalls' },
      { title: 'Blue Lagoon', note: 'Geothermal spa waters' },
      { title: 'Vík Black Beach', note: 'Basalt columns & surf' },
      { title: 'Northern Lights', note: 'Aurora over the ice' }
    ],
    comparison: {
      flightDuration: '5h 10m',
      bestSeason: 'Jun-Aug',
      culturalDraw: 'Volcanic Landscapes & Aurora',
      dailyBudget: 180,
      visa: 'Schengen'
    }
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    tagline: 'Land of Smiles',
    continent: 'Asia',
    lat: 15.87,
    lng: 100.9925,
    iata: 'BKK',
    accent: '#B7791F',
    cheapestFlight: 690,
    interests: ['Cuisine', 'Nature'],
    intro:
      'Thailand pairs gilded Buddhist temples with tropical beaches and one of the most celebrated street-food cultures on earth. From bustling Bangkok to the limestone karsts of Krabi, it is endlessly varied.',
    didYouKnow:
      "Thailand is the only Southeast Asian country never colonized by a European power — its name means 'Land of the Free'.",
    facts: { capital: 'Bangkok', language: 'Thai', currency: 'THB (฿)', bestTime: 'Nov – Mar' },
    highlights: [
      { title: 'Grand Palace', note: 'Royal Bangkok splendor' },
      { title: 'Railay Beach', note: 'Emerald waters & cliffs' },
      { title: 'Chiang Mai', note: 'Northern temple city' },
      { title: 'Floating Markets', note: 'Canal-side commerce' }
    ],
    comparison: {
      flightDuration: '9h 40m',
      bestSeason: 'Nov-Mar',
      culturalDraw: 'Temples & Street Food',
      dailyBudget: 50,
      visa: 'Visa-free'
    }
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    tagline: 'Lost City of the Incas',
    continent: 'Americas',
    lat: -9.19,
    lng: -75.0152,
    iata: 'LIM',
    accent: '#7A6C2E',
    cheapestFlight: 725,
    interests: ['History', 'Nature'],
    intro:
      'Peru is the heartland of the Inca empire, crowned by the cloud-wreathed citadel of Machu Picchu. Beyond the Andes lie the Amazon rainforest, the Nazca lines and a deeply layered colonial culture.',
    didYouKnow:
      'Machu Picchu was built around 1450 and remained unknown to the outside world until 1911, hidden high in the Andes.',
    facts: { capital: 'Lima', language: 'Spanish', currency: 'PEN (S/)', bestTime: 'May – Sep' },
    highlights: [
      { title: 'Machu Picchu', note: 'Iconic Inca citadel' },
      { title: 'Sacred Valley', note: 'Andean heartland' },
      { title: 'Cusco', note: 'Former Inca capital' },
      { title: 'Lake Titicaca', note: "World's highest lake" }
    ],
    comparison: {
      flightDuration: '15h 30m',
      bestSeason: 'May-Sep',
      culturalDraw: 'Inca Ruins & Andes',
      dailyBudget: 65,
      visa: 'Visa-free'
    }
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    tagline: 'La Dolce Vita',
    continent: 'Europe',
    lat: 41.8719,
    lng: 12.5674,
    iata: 'FCO',
    accent: '#2D707E',
    cheapestFlight: 480,
    interests: ['History', 'Cuisine'],
    intro:
      'Italy is an open-air museum of the Renaissance, the Roman empire and the Mediterranean good life. From the canals of Venice to the Amalfi Coast, art, food and history are woven into every street.',
    didYouKnow:
      'Italy is home to more UNESCO World Heritage Sites than any other country on earth.',
    facts: { capital: 'Rome', language: 'Italian', currency: 'EUR (€)', bestTime: 'May – Sep' },
    highlights: [
      { title: 'Colosseum', note: 'Ancient Roman arena' },
      { title: 'Venice Canals', note: 'Floating Renaissance city' },
      { title: 'Amalfi Coast', note: 'Cliffside Mediterranean' },
      { title: 'Florence', note: 'Cradle of the Renaissance' }
    ],
    comparison: {
      flightDuration: '3h 15m',
      bestSeason: 'May-Sep',
      culturalDraw: 'Renaissance Art & Cuisine',
      dailyBudget: 120,
      visa: 'Schengen'
    }
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    tagline: 'Gift of the Nile',
    continent: 'Africa',
    lat: 26.8206,
    lng: 30.8025,
    iata: 'CAI',
    accent: '#B08D3C',
    cheapestFlight: 590,
    interests: ['History'],
    intro:
      'Egypt is the land of the pharaohs, where the pyramids of Giza have stood for 4,500 years beside the life-giving Nile. Temples, tombs and the treasures of Tutankhamun tell a 5,000-year story.',
    didYouKnow:
      'The Great Pyramid of Giza was the tallest man-made structure in the world for nearly 4,000 years.',
    facts: { capital: 'Cairo', language: 'Arabic', currency: 'EGP (£)', bestTime: 'Oct – Apr' },
    highlights: [
      { title: 'Pyramids of Giza', note: 'Last ancient wonder' },
      { title: 'Luxor Temples', note: 'Valley of the Kings' },
      { title: 'Nile Cruise', note: 'Sailing through history' },
      { title: 'Abu Simbel', note: 'Colossal rock temples' }
    ],
    comparison: {
      flightDuration: '2h 10m',
      bestSeason: 'Oct-Apr',
      culturalDraw: 'Pyramids & Pharaohs',
      dailyBudget: 55,
      visa: 'E-Visa'
    }
  },
  {
    code: 'MA',
    name: 'Morocco',
    flag: '🇲🇦',
    tagline: 'Gateway to Africa',
    continent: 'Africa',
    lat: 31.7917,
    lng: -7.0926,
    iata: 'CMN',
    accent: '#E07A5F',
    cheapestFlight: 520,
    interests: ['History', 'Cuisine', 'Nature'],
    intro:
      'Morocco is a feast for the senses — labyrinthine medinas, spice-laden souks, the dunes of the Sahara and the snow-capped Atlas Mountains, all within a single, vibrant country.',
    didYouKnow:
      'The medina of Fez is one of the largest car-free urban areas in the world, with thousands of narrow alleyways.',
    facts: { capital: 'Rabat', language: 'Arabic', currency: 'MAD (د.م.)', bestTime: 'Mar – May' },
    highlights: [
      { title: 'Marrakech Medina', note: 'Souks & riads' },
      { title: 'Sahara Dunes', note: 'Camel treks at dusk' },
      { title: 'Chefchaouen', note: 'The blue city' },
      { title: 'Atlas Mountains', note: 'Berber villages' }
    ],
    comparison: {
      flightDuration: '4h 45m',
      bestSeason: 'Mar-May',
      culturalDraw: 'Sahara Dunes & Souks',
      dailyBudget: 60,
      visa: 'Visa-free'
    }
  }
];

// Hero / card imagery (design-provided CDN assets) keyed by country code.
const images = {
  JP: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB-lZGbCFmCFM-a3P0WudzIakIk0mO79FYvlaTvDEkMHBgByI5sd5zOrUd4eJJaguQeGze9gzHdcCNY324CcMTNdvJB8PXcUJjuQopxkE0Hwg2cdNk4piZt1f3kXus-mHOkK0A3YBjVZMFn7kP4YsPKrYCodIVaePmNCiXfDWIpaw5dP6XKhJMUA2nCKc29XE5ZGq_BMGgVp2ht5_ZHJTzDUrfTGeYZFYJ2rGWVeBMujqJ8guXkx5n3QNoQL3FPQIvjRnDRAol0JUg',
  FR: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAStxe8QPeXYUig9Q-NOEOJoTcAWMwrmKdrkm2AexrkqdydSN_vAMU1M_bfGDbZg68NRiOkCr2N2YSMEIgx94fw7qoRhoJuYtA4f6OTUUfTAQ0DvnGthJY7CB_FNGnTZuBu7RnvIiqsWV4wAorhWxdIeyaOSOI3vnQ9mB4bLlp_CyIWwSzjgHPaOSviUBSa02zHTWuSmKIQRzcjaEcqokmbtJC4ZoFUDgVCl6kQsHKlL-XCcKVKIMUzY4a3QgkV1o1pwleov1hazAbp',
  GR: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-Q1Ba8QXHQ8CPqgEc0ymosVGMWUA6TiDdC5vcBM2UM1CWJnhjKsMXMZ1M-iwKanCiKMf0dzOB4oj3aDeZ8fTAMujkSjmdF6PHdx7UdlbskDjnFssuqm05Jf39dnYooPNru0fvQjycs3eI1GcPZJRi8mEzGApEC19IntYKhX6R9gqHPM7l7EuiYDets2MfF2V2P0OPCmaMHXKYRBSz0f6kmNuvdekzTIscshKI1ZCFemrMqX0lO5mFSTD1ZEXmPCW5coew7q30RD8w',
  TR: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMrYP1BOUWdxjnE1jj5MzaVHrXU1hQ0YVw7W9OTCdnV5u0ByJGZtcuBR2H6Fb7KiZSXyrU_NB_Fn87ujXhbmdf7Rtir76linJBAXXlLxNzuGbRYjL_ymC-UWnoYNYmNALreC7zbwqJq-eF9EdunaBaHAxQU0E8dPk2HhaAN3OyQIgC8VqGLwRz8klSNptC9WRoKXqES0ue-k6RDUp6KIsDhUU2SloV4QEa3mpGIS8w6QD1lokl5J2kVTKMXd6sj1ykGbjOnOs4Ry5i',
  IS: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3-KQAoWTxNlyAfKZDaV_PPzcqA1oiIn4jRi1ep2gLA9iTzXbssGWD4jftKJOnlaiAnsqontrK_ed9fngsryWJNHLznJSybMM6MiSgTNi1BRBu8kARgFYyxeK09j50HrcZw-_UTHpuc8HHBN4XCrr_4WPkggVlvzP23gKyqsgLHpOfqYrtGBR_c7bHi3fZ1dX-D2mMyMU5a9nUHTup1-iYz7JRejol67zAiBbBNshTvwSGHL3Vk-hve02ZSvzFVG6UYlVs0EXhMrR0',
  TH: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSZhg9nhNiqnvBI-w8ufFOKKZZw91NQf5DhToficCI_RQfOibm5wlhMaWfltEdBocMdBvXUeiwb8pvICWzeVSolmxsxsoQJZmhUx8QRBwgkvhlFK36yRDMf1FXvwNHeabBNYJolb0YzBSxdB27w1WdNmmjkgYyiQs2l6rGz0V9S10gQd-Vvs4tdIyqkOFjr_mOa5Fn971YwxEy9v8xAmLhsgOp-K83ksmnJD9oFzKBE46TRNviMbpkFFfkXZPJueRS3kNUloDC8n2p',
  PE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmkFDOLs-sn50nVcBcBb1eX-vGZq-b38YSEJi3cdaGz0Wh5T3UtnvbdoesRS7zECzFVjEfcopcvZXMR3wQywzmYk2LMiFEcuIONcMAXNRluKrZYD-zh1bcT6btG2NBhWYQIWxfPer410X2eu-usOJxNnJPcfLWfZgLnm8F2p98E58qWaHpm5GF6PC9bFGoYFohGLlt4IK1w9hWU4edhpF1OvzpIdd4o7UGm1-cpXeYhaRf4csbo096KpezDWi7rej0q2CcpkOi1gCe',
  IT: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgi2Wl45XbHcxm732NgkkIwG0x7IoRwEeGhG851jWmQUYYA3m3wqIgMf3BdYLVZQ-U0_s7AYOll1LqCmhezF4cLgRlW90fpyCFSyQoCYhzd8I39D6dy99YFX1GVfigL-VH-QFHi8fHUiG6NRzfedR6jVoxR7P3u-cI25K35NHu_uN_Cna_cg7Si8rfN3qcPwxv4g4Fa4Rj3PthIqaL_Uj6VNLOO9tT7WWGc5ooswAqmKeAMdPr-DhxEAANFXv6mnxWt2eDSPp7XOdT',
  EG: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGr8A9gSZodES1eIyQLOnOGXxja26dXTqsme1dWFuKNncG-PsYzAi4LPVRn3VSGOHh_D2GZJpc_hUPQbqevbj5_2io4hc2Ild8LcBQEHOmSuvokCpy2MmjUkXED1tibSzv5RRh04zVCC2yKOD3C3how-EZ9aFGkPoaxNP7arK97D01qtQkCaZfgtpSYg_kFZhYN5ZgFamakmV8hWoK7BB9s27ypfCCNmFNLkKbJqkyk3zSqwUQJXf_sXOJogzELyKPdUHF3Klr-Jiy',
  MA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwk08FJxXg6xZuWrUybPjTlJumAv4v2W0YAjMUerVTmPth-DSwQXpo8T2NbCluPjiMCQme3Zn13eZPAKEj2ClK5fonG6ZdUaPINCAwn3kn9JC4yekdGKD4wl6TJMRv0oA1wd1aZR3L7E-5rWz9ebP1ySMcQY8btXsfu1PF_T6f01Jr1QH5FvntYGbqfwiLYEkmYFvkOORUX8nB9H_YxB-cIMf0pQqEu9mf8iCx--BQsHAXaVVa3YMknFsRwCLMKn80JM75GDXMCw05'
};
destinations.forEach((d) => {
  d.image = images[d.code];
});

// Mock flight offers generated per destination from Istanbul (IST), the proposal's
// example home airport. A real build wires these to the Amadeus / Skyscanner API.
const airlines = ['Turkish Airlines', 'Pegasus', 'Lufthansa', 'Emirates', 'Qatar Airways'];

export function buildFlights(dest) {
  const base = dest.cheapestFlight;
  const stops = ['Direct', 'Direct', '1 Stop (DXB)', 'Direct'];
  const depTimes = ['09:40', '11:15', '14:50', '08:20'];
  const arrTimes = ['23:00', '01:20', '07:35', '21:35'];
  const durations = [dest.comparison.flightDuration, '12h 05m', '14h 45m', '11h 15m'];
  return depTimes.map((dep, i) => ({
    id: `${dest.code}-${i}`,
    airline: airlines[i % airlines.length],
    from: 'IST',
    to: dest.iata,
    depart: dep,
    arrive: arrTimes[i],
    duration: durations[i],
    stops: stops[i],
    price: base - 200 + i * 16 + (stops[i].includes('Stop') ? -50 : 0),
    deepLink: `https://www.skyscanner.net/transport/flights/ist/${dest.iata.toLowerCase()}/`
  })).sort((a, b) => a.price - b.price);
}

// Mock hotel offers per destination. In production replace with Amadeus Hotel Offers Search v3:
// GET /v3/shopping/hotel-offers?hotelIds=...&adults=1&checkInDate=...&checkOutDate=...
const hotelChains = ['Marriott', 'Hilton', 'Hyatt', 'Radisson', 'Accor'];
const hotelTypes = ['City Hotel', 'Resort', 'Boutique Hotel', 'Luxury Hotel', 'Budget Hotel'];
const amenitySets = [
  ['WiFi', 'Pool', 'Spa', 'Restaurant'],
  ['WiFi', 'Gym', 'Bar', 'Room Service'],
  ['WiFi', 'Breakfast', 'Airport Shuttle', 'Parking'],
  ['WiFi', 'Pool', 'Beach Access', 'Water Sports'],
  ['WiFi', 'Breakfast', 'Tour Desk', 'Laundry']
];
const hotelRatings = [5, 4, 4, 3, 3];

export function buildHotels(dest) {
  const basePrice = Math.round(dest.cheapestFlight * 0.15);
  const cityNames = {
    JP: 'Tokyo', FR: 'Paris', GR: 'Athens', TR: 'Istanbul', IS: 'Reykjavik',
    TH: 'Bangkok', PE: 'Lima', IT: 'Rome', EG: 'Cairo', MA: 'Marrakech'
  };
  const city = cityNames[dest.code] || dest.name;
  return hotelChains.map((chain, i) => ({
    id: `${dest.code}-hotel-${i}`,
    name: `${chain} ${city} ${hotelTypes[i].split(' ')[0]}`,
    chain,
    type: hotelTypes[i],
    stars: hotelRatings[i],
    rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
    reviews: 200 + i * 340,
    pricePerNight: basePrice + i * 18 - (i === 4 ? 40 : 0),
    currency: 'USD',
    amenities: amenitySets[i],
    address: `${city} City Centre`,
    deepLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`
  }));
}

// Mock car rental offers per destination. In production replace with Amadeus Car Rentals v2:
// GET /v2/shopping/availability/car-rentals?locationCode=...&pickUpDateTime=...&returnDateTime=...
const carAgencies = ['Hertz', 'Avis', 'Europcar', 'Sixt', 'Budget'];
const carCategories = ['Economy', 'Compact', 'SUV', 'Premium', 'Minivan'];
const carModels = [
  'Toyota Yaris or similar',
  'Volkswagen Golf or similar',
  'Toyota RAV4 or similar',
  'Mercedes C-Class or similar',
  'Ford Galaxy or similar'
];
const transmissions = ['Manual', 'Automatic', 'Automatic', 'Automatic', 'Automatic'];
const seatsOptions = [4, 5, 5, 5, 7];

export function buildCars(dest) {
  const basePrice = Math.round(dest.cheapestFlight * 0.03);
  return carAgencies.map((agency, i) => ({
    id: `${dest.code}-car-${i}`,
    agency,
    category: carCategories[i],
    model: carModels[i],
    transmission: transmissions[i],
    seats: seatsOptions[i],
    pricePerDay: basePrice + i * 8 - (i === 4 ? 15 : 0),
    currency: 'USD',
    features: ['AC', ...(i > 1 ? ['GPS'] : []), ...(i > 2 ? ['Bluetooth'] : [])],
    pickupLocation: `${dest.iata} Airport`,
    deepLink: `https://www.rentalcars.com/en/airport/${dest.iata}/`
  }));
}
