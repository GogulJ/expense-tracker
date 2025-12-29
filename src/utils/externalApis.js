// External API integrations for Calendar

// Fetch Indian Public Holidays from Calendarific (or fallback to static data)
export async function fetchHolidays(year = new Date().getFullYear(), country = 'IN') {
  try {
    // Using Nager.Date API (free, no API key required)
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch holidays');
    
    const data = await response.json();
    return data.map(h => ({
      date: h.date,
      name: h.localName || h.name,
      type: 'holiday'
    }));
  } catch (error) {
    console.error('Error fetching holidays:', error);
    // Return some common Indian holidays as fallback
    return getStaticHolidays(year);
  }
}

// Static holidays fallback
function getStaticHolidays(year) {
  return [
    { date: `${year}-01-26`, name: 'Republic Day', type: 'holiday' },
    { date: `${year}-08-15`, name: 'Independence Day', type: 'holiday' },
    { date: `${year}-10-02`, name: 'Gandhi Jayanti', type: 'holiday' },
    { date: `${year}-11-01`, name: 'Diwali', type: 'holiday' },
    { date: `${year}-12-25`, name: 'Christmas', type: 'holiday' },
  ];
}

// Fetch Weather for a location (Using Open-Meteo - free, no API key)
export async function fetchWeather(latitude = 13.0827, longitude = 80.2707) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`
    );
    
    if (!response.ok) throw new Error('Failed to fetch weather');
    
    const data = await response.json();
    
    return data.daily.time.map((date, i) => ({
      date,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weathercode[i],
      description: getWeatherDescription(data.daily.weathercode[i])
    }));
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
}

// Weather code to description
function getWeatherDescription(code) {
  const descriptions = {
    0: '☀️ Clear',
    1: '🌤️ Mainly Clear',
    2: '⛅ Partly Cloudy',
    3: '☁️ Overcast',
    45: '🌫️ Foggy',
    48: '🌫️ Icy Fog',
    51: '🌧️ Light Drizzle',
    53: '🌧️ Drizzle',
    55: '🌧️ Heavy Drizzle',
    61: '🌧️ Light Rain',
    63: '🌧️ Rain',
    65: '🌧️ Heavy Rain',
    71: '🌨️ Light Snow',
    73: '🌨️ Snow',
    75: '🌨️ Heavy Snow',
    80: '🌦️ Rain Showers',
    81: '🌦️ Moderate Showers',
    82: '⛈️ Heavy Showers',
    95: '⛈️ Thunderstorm',
    96: '⛈️ Thunderstorm + Hail',
    99: '⛈️ Heavy Thunderstorm'
  };
  return descriptions[code] || '🌡️ Unknown';
}

// Get weather icon based on code
export function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '🌨️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}
