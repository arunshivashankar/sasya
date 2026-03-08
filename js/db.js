/**
 * IndexedDB Database Layer for Plant Care App
 * Replaces SQLite server-side database with client-side IndexedDB.
 */
const DB = {
  db: null,
  DB_NAME: 'PlantCareDB',
  DB_VERSION: 1,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('plants')) {
          const plantStore = db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
          plantStore.createIndex('name', 'name', { unique: true });
        }

        if (!db.objectStoreNames.contains('schedules')) {
          const scheduleStore = db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
          scheduleStore.createIndex('plant_id', 'plant_id', { unique: false });
          scheduleStore.createIndex('scheduled_date', 'scheduled_date', { unique: false });
          scheduleStore.createIndex('activity', 'activity', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('weatherCache')) {
          db.createObjectStore('weatherCache', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error('Failed to open IndexedDB: ' + event.target.error));
      };
    });
  },

  async getAllPlants() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readonly');
      const store = tx.objectStore('plants');
      const request = store.getAll();
      request.onsuccess = () => {
        const plants = request.result.sort((a, b) => a.name.localeCompare(b.name));
        resolve(plants);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getPlant(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readonly');
      const store = tx.objectStore('plants');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getPlantByName(name) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readonly');
      const store = tx.objectStore('plants');
      const index = store.index('name');
      const request = index.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async addPlant(plant) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readwrite');
      const store = tx.objectStore('plants');
      const request = store.add(plant);
      request.onsuccess = () => resolve({ ...plant, id: request.result });
      request.onerror = () => reject(request.error);
    });
  },

  async deletePlant(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readwrite');
      const store = tx.objectStore('plants');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getPlantCount() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('plants', 'readonly');
      const store = tx.objectStore('plants');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async addSchedule(schedule) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      const request = store.add(schedule);
      request.onsuccess = () => resolve({ ...schedule, id: request.result });
      request.onerror = () => reject(request.error);
    });
  },

  async addSchedulesBulk(schedules) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      let count = 0;
      for (const schedule of schedules) {
        const request = store.add(schedule);
        request.onsuccess = () => { count++; };
      }
      tx.oncomplete = () => resolve(count);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSchedules(filters = {}) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readonly');
      const store = tx.objectStore('schedules');
      const request = store.getAll();

      request.onsuccess = () => {
        let schedules = request.result;

        if (filters.plant_id) {
          schedules = schedules.filter(s => s.plant_id === filters.plant_id);
        }
        if (filters.activity) {
          schedules = schedules.filter(s => s.activity === filters.activity);
        }
        if (filters.start) {
          schedules = schedules.filter(s => s.scheduled_date >= filters.start);
        }
        if (filters.end) {
          schedules = schedules.filter(s => s.scheduled_date <= filters.end);
        }

        schedules.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
        resolve(schedules);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getUpcomingSchedules(days = 30) {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const end = endDate.toISOString().split('T')[0];
    return this.getSchedules({ start: today, end });
  },

  async getSchedule(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readonly');
      const store = tx.objectStore('schedules');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getSchedulesByPlant(plantId) {
    return this.getSchedules({ plant_id: plantId });
  },

  async updateScheduleStatus(id, status, weatherReason) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const schedule = getReq.result;
        if (!schedule) { reject(new Error('Schedule not found')); return; }
        schedule.status = status;
        if (weatherReason) schedule.weather_reason = weatherReason;
        const putReq = store.put(schedule);
        putReq.onsuccess = () => resolve(schedule);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  async updateScheduleWeather(id, weatherSuitable, notes) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const schedule = getReq.result;
        if (!schedule) { reject(new Error('Schedule not found')); return; }
        schedule.weather_suitable = weatherSuitable;
        if (notes) schedule.weather_notes = notes;
        const putReq = store.put(schedule);
        putReq.onsuccess = () => resolve(schedule);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  async clearSchedules() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteSchedulesByPlant(plantId) {
    const schedules = await this.getSchedulesByPlant(plantId);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('schedules', 'readwrite');
      const store = tx.objectStore('schedules');
      for (const s of schedules) {
        store.delete(s.id);
      }
      tx.oncomplete = () => resolve(schedules.length);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  },

  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAllSettings() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.getAll();
      request.onsuccess = () => {
        const settings = {};
        for (const item of request.result) {
          settings[item.key] = item.value;
        }
        resolve(settings);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async cacheWeather(key, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('weatherCache', 'readwrite');
      const store = tx.objectStore('weatherCache');
      const request = store.put({ key, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getCachedWeather(key, maxAgeMs = 300000) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('weatherCache', 'readonly');
      const store = tx.objectStore('weatherCache');
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && (Date.now() - result.timestamp) < maxAgeMs) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },
};
