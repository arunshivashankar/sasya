/* Settings Page */
const SettingsPage = {
  async render() {
    const container = document.getElementById('page-settings');
    const settings = await DB.getAllSettings();
    const plantCount = await DB.getPlantCount();

    let html = `
      <div class="section-title">Settings</div>

      <div class="settings-group">
        <div class="settings-group-title">Weather Location</div>
        <div style="padding:12px 16px;">
          <div class="input-group">
            <label class="input-label">City</label>
            <input type="text" class="input-field" id="settingsCity" value="${settings.weather_city || 'Melbourne'}" placeholder="Melbourne">
          </div>
          <div class="input-group" style="display:flex;gap:8px;">
            <div style="flex:1;">
              <label class="input-label">Latitude</label>
              <input type="text" class="input-field" id="settingsLat" value="${settings.weather_lat || '-37.8136'}" placeholder="-37.8136">
            </div>
            <div style="flex:1;">
              <label class="input-label">Longitude</label>
              <input type="text" class="input-field" id="settingsLon" value="${settings.weather_lon || '144.9631'}" placeholder="144.9631">
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">OpenWeatherMap API Key</label>
            <input type="password" class="input-field" id="settingsApiKey" value="${settings.weather_api_key || ''}" placeholder="Enter your free API key">
            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">
              Get a free key at openweathermap.org
            </div>
          </div>
          <button class="btn btn-primary btn-block" onclick="SettingsPage.saveWeatherSettings()">
            Save Weather Settings
          </button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Notifications</div>
        <div class="settings-item">
          <div class="settings-label">Alert Schedule</div>
          <div class="settings-value">15, 7, 3, 1 days before</div>
        </div>
        <div style="padding:8px 16px 12px;">
          <button class="btn btn-secondary btn-block" onclick="SettingsPage.checkAlerts()">
            Check Upcoming Alerts
          </button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Data Management</div>
        <div style="padding:12px 16px;">
          <button class="btn btn-primary btn-block" onclick="SettingsPage.generateSchedules()" style="margin-bottom:8px;">
            Regenerate Schedules
          </button>
          <button class="btn btn-secondary btn-block" onclick="SettingsPage.exportCSV()" style="margin-bottom:8px;">
            Export Schedules (CSV)
          </button>
          <button class="btn btn-secondary btn-block" onclick="SettingsPage.exportJSON()">
            Export All Data (JSON)
          </button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Add Plants</div>
        <div style="padding:12px 16px;">
          <div class="input-group">
            <label class="input-label">Plant names (one per line or comma-separated)</label>
            <textarea class="input-field" id="importText" rows="4" placeholder="Rose&#10;Lavender&#10;Silver Birch" style="resize:vertical;font-family:inherit;"></textarea>
          </div>
          <button class="btn btn-secondary btn-block" onclick="SettingsPage.importFromText()" style="margin-bottom:12px;">
            Add Plants
          </button>
          <div style="text-align:center;color:var(--text-secondary);font-size:13px;margin-bottom:8px;">or</div>
          <label class="btn btn-secondary btn-block" style="display:block;text-align:center;cursor:pointer;">
            Import from CSV File
            <input type="file" accept=".csv,.txt" id="importFile" onchange="SettingsPage.importFromFile()" style="display:none;">
          </label>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">About</div>
        <div class="settings-item">
          <div class="settings-label">Version</div>
          <div class="settings-value">1.0.0 (Offline PWA)</div>
        </div>
        <div class="settings-item">
          <div class="settings-label">Plants in Collection</div>
          <div class="settings-value">${plantCount} plants</div>
        </div>
        <div class="settings-item">
          <div class="settings-label">Plants Database</div>
          <div class="settings-value">${PlantCareData.getAllPlantNames().length} species</div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  async saveWeatherSettings() {
    const city = document.getElementById('settingsCity').value.trim();
    const lat = document.getElementById('settingsLat').value.trim();
    const lon = document.getElementById('settingsLon').value.trim();
    const apiKey = document.getElementById('settingsApiKey').value.trim();

    await API.updateSettings({
      weather_city: city,
      weather_lat: lat,
      weather_lon: lon,
      weather_api_key: apiKey,
    });

    App.showToast('Weather settings saved');
  },

  async generateSchedules() {
    try {
      const result = await API.generateSchedules(new Date().getFullYear());
      App.showToast(`Generated ${result.totalSchedules} schedules for ${result.plantCount} plants`);
    } catch (error) {
      App.showToast('Failed to generate schedules');
    }
  },

  async exportCSV() {
    try {
      const result = await API.exportSchedulesCSV();
      App.showToast(`Exported ${result.count} schedules`);
    } catch (error) {
      App.showToast('Failed to export');
    }
  },

  async exportJSON() {
    try {
      await API.exportData();
      App.showToast('Data exported');
    } catch (error) {
      App.showToast('Failed to export');
    }
  },

  async importFromText() {
    const text = document.getElementById('importText').value;
    if (!text.trim()) {
      App.showToast('Enter plant names first');
      return;
    }
    try {
      const result = await API.importPlantsFromText(text);
      App.showToast(`Added ${result.results.imported} plants, ${result.results.skipped} already existed`);
      document.getElementById('importText').value = '';
      this.render();
    } catch (error) {
      App.showToast('Import failed: ' + error.message);
    }
  },

  async importFromFile() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const result = await API.importPlantsFromCSV(file);
      App.showToast(`Added ${result.results.imported} plants, ${result.results.skipped} already existed`);
      fileInput.value = '';
      this.render();
    } catch (error) {
      App.showToast('Import failed: ' + error.message);
    }
  },

  async checkAlerts() {
    try {
      const alerts = await API.getUpcomingAlerts();
      if (alerts.length === 0) {
        App.showToast('No upcoming alerts');
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.innerHTML = `
        <div class="modal-handle"></div>
        <div class="modal-title" style="text-align:center;">Upcoming Alerts</div>
        ${alerts.map(a => `
          <div class="schedule-item">
            <div class="schedule-icon ${a.schedule.activity}">${
              { watering: '💧', pruning: '✂️', fertilizing: '🧪', mulching: '🍂' }[a.schedule.activity] || '📋'
            }</div>
            <div class="schedule-info">
              <div class="schedule-plant">${a.schedule.plant_icon || '🌱'} ${a.schedule.plant_name}</div>
              <div class="schedule-detail">${a.message}</div>
            </div>
          </div>
        `).join('')}
      `;

      overlay.appendChild(content);
      document.body.appendChild(overlay);
    } catch (error) {
      App.showToast('Failed to check alerts');
    }
  },
};
