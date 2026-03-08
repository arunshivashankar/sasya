/* Weather Widget Component */
const WeatherWidget = {
  render(weather) {
    if (!weather) {
      return `
        <div class="weather-card">
          <div class="weather-main">
            <div class="weather-temp">--°</div>
            <div class="weather-info">
              <div class="weather-city">Loading...</div>
              <div class="weather-desc">Fetching weather data</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="weather-card">
        <div class="weather-main">
          <div class="weather-temp">${Math.round(weather.temp)}°</div>
          <div class="weather-info">
            <div class="weather-city">${weather.city || 'Local'}</div>
            <div class="weather-desc">${weather.description || ''}</div>
          </div>
        </div>
        <div class="weather-details">
          <div class="weather-detail">Humidity <span>${weather.humidity}%</span></div>
          <div class="weather-detail">Wind <span>${Math.round(weather.windSpeed)} km/h</span></div>
          ${weather.rain > 0 ? `<div class="weather-detail">Rain <span>${weather.rain}mm</span></div>` : ''}
        </div>
      </div>
    `;
  },

  renderForecast(forecast) {
    if (!forecast || forecast.length === 0) {
      return '<div class="empty-state"><div class="spinner"></div></div>';
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return `
      <div class="forecast-bar">
        ${forecast.slice(0, 5).map(day => {
          const date = new Date(day.date + 'T00:00:00');
          const dayName = dayNames[date.getDay()];
          return `
            <div class="forecast-day">
              <div class="forecast-day-name">${dayName}</div>
              <div class="forecast-day-temp">${Math.round(day.tempMax)}°</div>
              <div class="forecast-day-desc">${day.description}</div>
              ${day.rain > 0 ? `<div class="forecast-day-desc">${day.rain}mm</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
};
