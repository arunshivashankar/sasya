/* Schedule Card Component */
const ScheduleCard = {
  activityIcons: {
    watering: '💧',
    pruning: '✂️',
    fertilizing: '🧪',
    mulching: '🍂',
  },

  renderItem(schedule) {
    const icon = this.activityIcons[schedule.activity] || '📋';
    const plantIcon = schedule.plant_icon || '🌱';
    const plantName = schedule.plant_name || 'Unknown';
    const date = this.formatDate(schedule.scheduled_date);
    const status = schedule.status || 'pending';

    return `
      <div class="schedule-item" data-schedule-id="${schedule.id}">
        <div class="schedule-icon ${schedule.activity}">${icon}</div>
        <div class="schedule-info">
          <div class="schedule-plant">${plantIcon} ${plantName}</div>
          <div class="schedule-detail">
            <span class="activity-badge ${schedule.activity}">${schedule.activity}</span>
            ${!schedule.weather_suitable ? ' <span style="color:#DC2626;font-size:12px;">⚠️ Weather</span>' : ''}
          </div>
        </div>
        <div class="schedule-date">
          ${date}
          <div><span class="status-badge ${status}">${status.replace('_', ' ')}</span></div>
        </div>
      </div>
    `;
  },

  renderList(schedules) {
    if (!schedules || schedules.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-text">No scheduled activities</div>
        </div>
      `;
    }

    return `<div class="card">${schedules.map(s => this.renderItem(s)).join('')}</div>`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diff = Math.floor((date - today) / 86400000);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7 && diff > 0) {
      return date.toLocaleDateString('en-AU', { weekday: 'short' });
    }

    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  },
};
