/**
 * Schedule Engine (Browser version)
 * Generates care schedules for plants based on knowledge base data.
 */
const ScheduleEngine = {
  formatDate(year, month, day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  },

  getOptimalTime(season, activity) {
    if (activity === 'watering') {
      if (season === 'summer') return '06:00';
      if (season === 'winter') return '10:00';
      return '07:00';
    }
    if (season === 'summer') return '07:00';
    if (season === 'winter') return '10:00';
    return '09:00';
  },

  generateSchedulesForPlant(plantId, plantName, plantIcon, year) {
    const careData = PlantCareData.getPlantCare(plantName);
    if (!careData) return [];

    const icon = plantIcon || careData.icon || '🌱';
    const schedules = [];

    schedules.push(...this.generateWateringSchedule(plantId, plantName, icon, careData, year));
    schedules.push(...this.generateActivitySchedule(plantId, plantName, icon, careData, 'pruning', year));
    schedules.push(...this.generateActivitySchedule(plantId, plantName, icon, careData, 'fertilizing', year));
    schedules.push(...this.generateActivitySchedule(plantId, plantName, icon, careData, 'mulching', year));

    return schedules;
  },

  generateWateringSchedule(plantId, plantName, plantIcon, careData, year) {
    const schedules = [];
    const watering = careData.watering;

    for (let month = 1; month <= 12; month++) {
      const season = PlantCareData.getSeason(month);
      const seasonData = watering[season];
      if (!seasonData) continue;

      const daysInMonth = new Date(year, month, 0).getDate();
      let day = 1;

      while (day <= daysInMonth) {
        schedules.push({
          plant_id: plantId,
          plant_name: plantName,
          plant_icon: plantIcon,
          activity: 'watering',
          scheduled_date: this.formatDate(year, month, day),
          scheduled_time: this.getOptimalTime(season, 'watering'),
          status: 'pending',
          weather_suitable: 1,
          notes: seasonData.notes,
        });
        day += seasonData.frequencyDays;
      }
    }

    return schedules;
  },

  generateActivitySchedule(plantId, plantName, plantIcon, careData, activity, year) {
    const schedules = [];
    const activityData = careData[activity];
    if (!activityData || !activityData.months) return schedules;

    for (const month of activityData.months) {
      const season = PlantCareData.getSeason(month);
      schedules.push({
        plant_id: plantId,
        plant_name: plantName,
        plant_icon: plantIcon,
        activity,
        scheduled_date: this.formatDate(year, month, 15),
        scheduled_time: this.getOptimalTime(season, activity),
        status: 'pending',
        weather_suitable: 1,
        notes: activityData.notes,
      });
    }

    return schedules;
  },

  getPlantScheduleSummary(plantName) {
    const careData = PlantCareData.getPlantCare(plantName);
    if (!careData) return null;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const season = PlantCareData.getSeason(currentMonth);

    return {
      plantName,
      type: careData.type,
      currentSeason: season,
      watering: {
        ...careData.watering[season],
        season,
      },
      pruning: {
        ...careData.pruning,
        isDueSoon: careData.pruning.months.some(m => Math.abs(m - currentMonth) <= 1 || Math.abs(m - currentMonth) >= 11),
      },
      fertilizing: {
        ...careData.fertilizing,
        isDueSoon: careData.fertilizing.months.some(m => Math.abs(m - currentMonth) <= 1 || Math.abs(m - currentMonth) >= 11),
      },
      mulching: {
        ...careData.mulching,
        isDueSoon: careData.mulching.months.some(m => Math.abs(m - currentMonth) <= 1 || Math.abs(m - currentMonth) >= 11),
      },
    };
  },
};
