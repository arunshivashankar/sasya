/* Main App Controller */
const App = {
  currentPage: 'dashboard',

  async init() {
    await DB.init();
    await this.seedIfNeeded();
    this.setupNavigation();
    this.setupIOSInstallBanner();
    this.loadPage('dashboard');
  },

  async seedIfNeeded() {
    const plantCount = await DB.getPlantCount();
    if (plantCount > 0) return;

    const allNames = PlantCareData.getAllPlantNames();
    for (const name of allNames) {
      const careData = PlantCareData.getPlantCare(name);
      await DB.addPlant({
        name,
        scientific_name: careData.scientificName,
        type: careData.type,
        icon: careData.icon,
      });
    }

    await API.generateSchedules(new Date().getFullYear());
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  },

  navigateTo(page) {
    if (page === this.currentPage) return;

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const titles = {
      dashboard: ['Plant Care', 'Smart Scheduling'],
      plants: ['My Plants', 'Collection'],
      calendar: ['Calendar', 'Schedule Overview'],
      settings: ['Settings', 'Configuration'],
    };

    const [title, subtitle] = titles[page] || ['Plant Care', ''];
    document.getElementById('headerTitle').textContent = title;
    document.getElementById('headerSubtitle').textContent = subtitle;

    this.currentPage = page;
    this.loadPage(page);
  },

  loadPage(page) {
    switch (page) {
      case 'dashboard': DashboardPage.render(); break;
      case 'plants': PlantsPage.render(); break;
      case 'calendar': CalendarPage.render(); break;
      case 'settings': SettingsPage.render(); break;
    }
  },

  async showPlantDetail(plantId) {
    try {
      const { plant } = await API.getPlant(plantId);

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
      };

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.innerHTML = PlantCard.renderDetail(plant);

      overlay.appendChild(content);
      document.body.appendChild(overlay);
    } catch (error) {
      this.showToast('Unable to load plant details');
    }
  },

  async deletePlant(plantId) {
    if (!confirm('Remove this plant from your collection?')) return;

    try {
      await API.deletePlant(plantId);
      document.querySelector('.modal-overlay')?.remove();
      this.showToast('Plant removed');
      PlantsPage.render();
    } catch (error) {
      this.showToast('Failed to remove plant');
    }
  },

  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  setupIOSInstallBanner() {
    const banner = document.getElementById('installBanner');
    const closeBtn = document.getElementById('installBannerClose');
    if (!banner || !closeBtn) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent);

    if (isIOS && !isStandalone && isSafari) {
      const dismissed = localStorage.getItem('installBannerDismissed');
      if (!dismissed) {
        banner.style.display = '';
      }
    }

    closeBtn.addEventListener('click', () => {
      banner.style.display = 'none';
      localStorage.setItem('installBannerDismissed', Date.now().toString());
    });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
