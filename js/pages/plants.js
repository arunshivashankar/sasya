/* Plants Page */
const PlantsPage = {
  async render() {
    const container = document.getElementById('page-plants');
    container.innerHTML = '<div class="spinner"></div>';

    try {
      const { plants } = await API.getPlants();

      let html = `
        <div class="section-title">My Plants (${plants.length})</div>
        <div class="plant-grid">
          ${plants.map(p => PlantCard.render(p)).join('')}
        </div>
      `;

      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌱</div>
          <div class="empty-state-text">Unable to load plants</div>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="PlantsPage.render()">Retry</button>
        </div>
      `;
    }
  },
};
