/* Dashboard Page */
const DashboardPage = {
  async render() {
    const container = document.getElementById('page-dashboard');

    container.innerHTML = `
      <div class="spinner"></div>
    `;

    try {
      const [schedulesData, weatherData] = await Promise.allSettled([
        API.getSchedules({ days: 14 }),
        API.getCurrentWeather(),
      ]);

      const schedules = schedulesData.status === 'fulfilled' ? schedulesData.value.schedules : [];
      const weather = weatherData.status === 'fulfilled' ? weatherData.value.weather : null;

      const todayStr = new Date().toISOString().split('T')[0];
      const todayActivities = schedules.filter(s => s.scheduled_date === todayStr);
      const upcoming = schedules.filter(s => s.scheduled_date > todayStr && s.activity !== 'watering').slice(0, 8);
      const wateringToday = todayActivities.filter(s => s.activity === 'watering');
      const otherToday = todayActivities.filter(s => s.activity !== 'watering');

      let html = '';

      html += WeatherWidget.render(weather);

      html += `<div class="section-title">Today</div>`;
      if (otherToday.length > 0 || wateringToday.length > 0) {
        html += `<div class="card">`;
        if (wateringToday.length > 0) {
          html += `<div class="schedule-item">
            <div class="schedule-icon watering">💧</div>
            <div class="schedule-info">
              <div class="schedule-plant">Watering</div>
              <div class="schedule-detail">${wateringToday.length} plants need watering today</div>
            </div>
          </div>`;
        }
        otherToday.forEach(s => {
          html += ScheduleCard.renderItem(s);
        });
        html += `</div>`;
      } else {
        html += `<div class="card" style="text-align:center;color:var(--text-secondary);padding:24px;">
          No activities scheduled for today
        </div>`;
      }

      if (upcoming.length > 0) {
        html += `<div class="section-title">Upcoming Activities</div>`;
        html += ScheduleCard.renderList(upcoming);
      }

      const totalPending = schedules.filter(s => s.status === 'pending').length;
      const weatherDelayed = schedules.filter(s => s.status === 'weather_delayed').length;

      html += `
        <div class="section-title">Quick Stats</div>
        <div class="activity-summary">
          <div class="activity-card watering">
            <div class="activity-card-icon">📋</div>
            <div class="activity-card-title">Pending</div>
            <div class="activity-card-detail">${totalPending} activities</div>
          </div>
          <div class="activity-card ${weatherDelayed > 0 ? 'mulching' : 'pruning'}">
            <div class="activity-card-icon">${weatherDelayed > 0 ? '⚠️' : '✅'}</div>
            <div class="activity-card-title">Weather</div>
            <div class="activity-card-detail">${weatherDelayed > 0 ? weatherDelayed + ' delayed' : 'All clear'}</div>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `
        <div class="weather-card">
          <div class="weather-main">
            <div class="weather-temp">--°</div>
            <div class="weather-info">
              <div class="weather-city">Offline Mode</div>
              <div class="weather-desc">Unable to fetch data</div>
            </div>
          </div>
        </div>
        <div class="card" style="text-align:center;color:var(--text-secondary);">
          <p>Unable to load data. Please check your connection.</p>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="DashboardPage.render()">Retry</button>
        </div>
      `;
    }
  },
};
