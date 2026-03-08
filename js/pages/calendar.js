/* Calendar Page */
const CalendarPage = {
  currentDate: new Date(),
  schedulesByDate: {},

  async render() {
    const container = document.getElementById('page-calendar');
    container.innerHTML = '<div class="spinner"></div>';

    try {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { schedules } = await API.getSchedules({ start: startDate, end: endDate });

      this.schedulesByDate = {};
      for (const s of schedules) {
        if (!this.schedulesByDate[s.scheduled_date]) {
          this.schedulesByDate[s.scheduled_date] = [];
        }
        this.schedulesByDate[s.scheduled_date].push(s);
      }

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      let html = `
        <div class="calendar-header">
          <button class="calendar-nav-btn" onclick="CalendarPage.prevMonth()">&lt;</button>
          <div class="calendar-month">${monthNames[month]} ${year}</div>
          <button class="calendar-nav-btn" onclick="CalendarPage.nextMonth()">&gt;</button>
        </div>
      `;

      html += '<div class="calendar-grid">';
      const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      for (const d of dayHeaders) {
        html += `<div class="calendar-day-header">${d}</div>`;
      }

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day other-month"></div>';
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const hasActivity = this.schedulesByDate[dateStr]?.some(s => s.activity !== 'watering');
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasActivity) classes.push('has-activity');

        html += `<div class="${classes.join(' ')}" onclick="CalendarPage.showDay('${dateStr}')">${day}</div>`;
      }

      html += '</div>';
      html += '<div id="calendarDayDetail"></div>';

      container.innerHTML = html;
      this.showDay(todayStr);
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-text">Unable to load calendar</div>
        </div>
      `;
    }
  },

  showDay(dateStr) {
    const detail = document.getElementById('calendarDayDetail');
    if (!detail) return;

    const activities = this.schedulesByDate[dateStr] || [];
    const nonWatering = activities.filter(s => s.activity !== 'watering');
    const watering = activities.filter(s => s.activity === 'watering');

    const date = new Date(dateStr + 'T00:00:00');
    const displayDate = date.toLocaleDateString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long'
    });

    let html = `<div class="section-title">${displayDate}</div>`;

    if (activities.length === 0) {
      html += `<div class="card" style="text-align:center;color:var(--text-secondary);padding:20px;">
        No activities scheduled
      </div>`;
    } else {
      if (watering.length > 0) {
        html += `<div class="card"><div class="schedule-item">
          <div class="schedule-icon watering">💧</div>
          <div class="schedule-info">
            <div class="schedule-plant">Watering</div>
            <div class="schedule-detail">${watering.length} plants to water</div>
          </div>
        </div></div>`;
      }
      if (nonWatering.length > 0) {
        html += ScheduleCard.renderList(nonWatering);
      }
    }

    detail.innerHTML = html;
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  },
};
