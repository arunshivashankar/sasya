/**
 * Weather Service (Browser version)
 * Fetches weather directly from OpenWeatherMap API.
 */
const WeatherService = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',

  async getConfig() {
    const settings = await DB.getAllSettings();
    return {
      apiKey: settings.weather_api_key || '',
      lat: settings.weather_lat || '-37.8136',
      lon: settings.weather_lon || '144.9631',
      city: settings.weather_city || 'Melbourne',
    };
  },

  async fetchCurrentWeather() {
    const config = await this.getConfig();
    if (!config.apiKey) {
      throw new Error('Weather API key not configured. Add it in Settings.');
    }

    const url = `${this.BASE_URL}/weather?lat=${config.lat}&lon=${config.lon}&appid=${config.apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseCurrentWeather(data);
  },

  async fetchForecast() {
    const config = await this.getConfig();
    if (!config.apiKey) {
      throw new Error('Weather API key not configured. Add it in Settings.');
    }

    const url = `${this.BASE_URL}/forecast?lat=${config.lat}&lon=${config.lon}&appid=${config.apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseForecast(data);
  },

  parseCurrentWeather(data) {
    return {
      temp: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      humidity: data.main.humidity,
      windSpeed: (data.wind.speed * 3.6),
      windGust: data.wind.gust ? (data.wind.gust * 3.6) : 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      rain: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
      clouds: data.clouds.all,
      city: data.name,
      timestamp: new Date(data.dt * 1000).toISOString(),
    };
  },

  parseForecast(data) {
    const dailyMap = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          temps: [],
          rain: 0,
          windSpeeds: [],
          descriptions: [],
          humidity: [],
        };
      }

      const day = dailyMap[date];
      day.temps.push(item.main.temp);
      day.windSpeeds.push(item.wind.speed * 3.6);
      day.descriptions.push(item.weather[0].description);
      day.humidity.push(item.main.humidity);

      if (item.rain) {
        day.rain += item.rain['3h'] || 0;
      }
    }

    return Object.values(dailyMap).map(day => ({
      date: day.date,
      tempMin: Math.min(...day.temps),
      tempMax: Math.max(...day.temps),
      tempAvg: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
      rain: Math.round(day.rain * 10) / 10,
      windMax: Math.max(...day.windSpeeds),
      windAvg: day.windSpeeds.reduce((a, b) => a + b, 0) / day.windSpeeds.length,
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      description: this.getMostCommonDescription(day.descriptions),
    }));
  },

  getMostCommonDescription(descriptions) {
    const counts = {};
    for (const desc of descriptions) {
      counts[desc] = (counts[desc] || 0) + 1;
    }
    let maxCount = 0;
    let result = descriptions[0];
    for (const [desc, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        result = desc;
      }
    }
    return result;
  },

  assessWeatherSuitability(weatherData, activity) {
    const reasons = [];
    let suitable = true;

    if (!weatherData) {
      return { suitable: true, reasons: ['No weather data available'] };
    }

    const temp = weatherData.tempAvg !== undefined ? weatherData.tempAvg : weatherData.temp;
    const tempMin = weatherData.tempMin;
    const rain = weatherData.rain || 0;
    const wind = weatherData.windMax !== undefined ? weatherData.windMax : weatherData.windSpeed;
    const T = WEATHER_THRESHOLDS;

    if (tempMin !== undefined && tempMin <= T.FROST_TEMP) {
      suitable = false;
      reasons.push(`Frost risk: minimum temperature ${tempMin.toFixed(1)}°C`);
    }

    switch (activity) {
      case 'watering':
        if (rain >= T.RAIN_SKIP_WATERING) {
          suitable = false;
          reasons.push(`Rain expected: ${rain}mm (skip watering)`);
        }
        if (temp >= T.HEAT_STRESS_TEMP) {
          reasons.push(`Heat stress: ${temp.toFixed(1)}°C - water early morning or evening`);
        }
        break;
      case 'pruning':
        if (temp < T.MIN_TEMP_FOR_PRUNING) {
          suitable = false;
          reasons.push(`Too cold for pruning: ${temp.toFixed(1)}°C`);
        }
        if (rain >= T.RAIN_SKIP_WATERING) {
          suitable = false;
          reasons.push('Wet conditions: risk of disease spread during pruning');
        }
        break;
      case 'fertilizing':
        if (temp < T.MIN_TEMP_FOR_FERTILIZING) {
          suitable = false;
          reasons.push(`Too cold for fertilizing: ${temp.toFixed(1)}°C`);
        }
        if (rain >= T.RAIN_DELAY_FERTILIZING) {
          suitable = false;
          reasons.push(`Heavy rain expected: ${rain}mm (fertilizer will wash away)`);
        }
        break;
      case 'mulching':
        if (temp >= T.MAX_TEMP_FOR_MULCHING) {
          suitable = false;
          reasons.push(`Too hot for mulching activity: ${temp.toFixed(1)}°C`);
        }
        if (wind >= T.MAX_WIND_FOR_MULCHING) {
          suitable = false;
          reasons.push(`Too windy for mulching: ${wind.toFixed(1)}km/h`);
        }
        break;
    }

    if (suitable && reasons.length === 0) {
      reasons.push('Weather conditions suitable');
    }

    return { suitable, reasons };
  },
};
