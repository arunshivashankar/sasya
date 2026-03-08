/**
 * API Layer - Local IndexedDB Operations
 * Replaces HTTP API calls with local database operations.
 * Maintains the same interface so UI components work unchanged.
 */
const API = {
  async getPlants() {
    const plants = await DB.getAllPlants();
    return {
      plants: plants.map(p => {
        const careData = PlantCareData.getPlantCare(p.name);
        return {
          ...p,
          hasCareData: !!careData,
          icon: p.icon || (careData ? careData.icon : '🌱'),
        };
      }),
    };
  },

  async getPlant(id) {
    const plant = await DB.getPlant(id);
    if (!plant) throw new Error('Plant not found');

    const careData = PlantCareData.getPlantCare(plant.name);
    const summary = ScheduleEngine.getPlantScheduleSummary(plant.name);
    const schedules = await DB.getSchedulesByPlant(id);

    return {
      plant: {
        ...plant,
        icon: plant.icon || (careData ? careData.icon : '🌱'),
        careData: careData || null,
        summary: summary || null,
        schedules: schedules.filter(s => s.status === 'pending').slice(0, 20),
      },
    };
  },

  async addPlant(plantData) {
    const careData = PlantCareData.getPlantCare(plantData.name);
    const plant = {
      name: plantData.name,
      scientific_name: careData ? careData.scientificName : (plantData.scientific_name || ''),
      type: careData ? careData.type : (plantData.type || 'unknown'),
      icon: careData ? careData.icon : '🌱',
    };

    const existing = await DB.getPlantByName(plant.name);
    if (existing) throw new Error('Plant already exists');

    const saved = await DB.addPlant(plant);

    const year = new Date().getFullYear();
    const schedules = ScheduleEngine.generateSchedulesForPlant(saved.id, saved.name, saved.icon, year);
    if (schedules.length > 0) {
      await DB.addSchedulesBulk(schedules);
    }

    return { plant: saved };
  },

  async deletePlant(id) {
    await DB.deleteSchedulesByPlant(id);
    await DB.deletePlant(id);
    return {};
  },

  async getSchedules(params = {}) {
    const filters = {};

    if (params.plantId || params.plant_id) {
      filters.plant_id = Number(params.plantId || params.plant_id);
    }
    if (params.start) { filters.start = params.start; }
    if (params.end) { filters.end = params.end; }
    if (params.activity) { filters.activity = params.activity; }

    let schedules;

    if (params.days && !params.start && !params.end) {
      schedules = await DB.getUpcomingSchedules(Number(params.days));
    } else if (filters.start || filters.end || filters.plant_id || filters.activity) {
      schedules = await DB.getSchedules(filters);
    } else {
      schedules = await DB.getUpcomingSchedules(30);
    }

    return { schedules };
  },

  async getSchedule(id) {
    const schedule = await DB.getSchedule(id);
    if (!schedule) throw new Error('Schedule not found');
    return { schedule, alerts: [] };
  },

  async generateSchedules(year) {
    const targetYear = year || new Date().getFullYear();
    await DB.clearSchedules();

    const plants = await DB.getAllPlants();
    let totalSchedules = 0;

    for (const plant of plants) {
      const schedules = ScheduleEngine.generateSchedulesForPlant(
        plant.id, plant.name, plant.icon || '🌱', targetYear
      );
      if (schedules.length > 0) {
        await DB.addSchedulesBulk(schedules);
        totalSchedules += schedules.length;
      }
    }

    return { totalSchedules, plantCount: plants.length };
  },

  async updateScheduleStatus(id, status, weatherReason) {
    const schedule = await DB.updateScheduleStatus(id, status, weatherReason);
    return { schedule };
  },

  async getCurrentWeather() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `current_${today}`;

    const cached = await DB.getCachedWeather(cacheKey, 5 * 60 * 1000);
    if (cached) { return { weather: cached, cached: true }; }

    try {
      const weather = await WeatherService.fetchCurrentWeather();
      await DB.cacheWeather(cacheKey, weather);
      return { weather, cached: false };
    } catch (error) {
      const stale = await DB.getCachedWeather(cacheKey, Infinity);
      if (stale) return { weather: stale, cached: true };
      throw error;
    }
  },

  async getForecast() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `forecast_${today}`;

    const cached = await DB.getCachedWeather(cacheKey, 30 * 60 * 1000);
    if (cached) { return { forecast: cached, cached: true }; }

    try {
      const forecast = await WeatherService.fetchForecast();
      await DB.cacheWeather(cacheKey, forecast);
      return { forecast, cached: false };
    } catch (error) {
      const stale = await DB.getCachedWeather(cacheKey, Infinity);
      if (stale) return { forecast: stale, cached: true };
      throw error;
    }
  },

  async assessWeather(activity) {
    const validActivities = ['watering', 'pruning', 'fertilizing', 'mulching'];
    if (!validActivities.includes(activity)) {
      throw new Error('Invalid activity');
    }

    const { forecast } = await this.getForecast();
    const assessments = forecast.map(day => ({
      date: day.date,
      ...WeatherService.assessWeatherSuitability(day, activity),
    }));

    return { activity, assessments };
  },

  async getSettings() {
    const settings = await DB.getAllSettings();
    return { settings };
  },

  async updateSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await DB.setSetting(key, value);
    }
    const updated = await DB.getAllSettings();
    return { settings: updated };
  },

  async importPlantsFromText(text) {
    const names = text.split(/[\n,]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    let imported = 0;
    let skipped = 0;
    const plantNames = [];

    for (const name of names) {
      try {
        await this.addPlant({ name });
        imported++;
        plantNames.push(name);
      } catch {
        skipped++;
      }
    }

    return { results: { imported, skipped, plants: plantNames, total: names.length } };
  },

  async importPlantsFromCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await this.importPlantsFromText(e.target.result);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  async exportData() {
    const plants = await DB.getAllPlants();
    const schedules = await DB.getSchedules({});
    const settings = await DB.getAllSettings();

    const data = {
      exportDate: new Date().toISOString(),
      plants,
      schedules,
      settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-care-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
  },

  async exportSchedulesCSV() {
    const schedules = await DB.getSchedules({});
    const today = new Date().toISOString().split('T')[0];
    const upcoming = schedules.filter(s => s.scheduled_date >= today);

    const header = 'Plant,Activity,Date,Time,Status,Weather Suitable,Notes';
    const rows = upcoming.map(s =>
      `"${s.plant_name}","${s.activity}","${s.scheduled_date}","${s.scheduled_time || ''}","${s.status}","${s.weather_suitable ? 'Yes' : 'No'}","${(s.notes || '').replace(/"/g, '""')}"`
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-schedules-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, count: upcoming.length };
  },

  async getUpcomingAlerts() {
    const today = new Date().toISOString().split('T')[0];
    const schedules = await DB.getUpcomingSchedules(15);

    const alerts = [];
    for (const schedule of schedules) {
      if (schedule.activity === 'watering') continue;

      const schedDate = new Date(schedule.scheduled_date);
      const todayDate = new Date(today);
      const daysUntil = Math.round((schedDate - todayDate) / 86400000);

      for (const daysBefore of PlantCareData.ALERT_DAYS_BEFORE) {
        if (daysUntil === daysBefore || daysUntil === 0) {
          alerts.push({
            schedule,
            daysUntil,
            message: daysUntil === 0
              ? `${schedule.plant_name}: ${schedule.activity} is TODAY`
              : `${schedule.plant_name}: ${schedule.activity} in ${daysUntil} days`,
          });
        }
      }
    }

    return alerts;
  },

  async health() {
    return { status: 'ok', mode: 'offline', timestamp: new Date().toISOString() };
  },
};
