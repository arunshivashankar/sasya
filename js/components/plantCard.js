/* Plant Card Component */
const PlantCard = {
  render(plant) {
    const icon = plant.icon || '🌱';
    const type = (plant.type || 'unknown').replace(/_/g, ' ');

    return `
      <div class="plant-card" data-plant-id="${plant.id}" onclick="App.showPlantDetail(${plant.id})">
        <div class="plant-card-icon">${icon}</div>
        <div class="plant-card-name">${plant.name}</div>
        <div class="plant-card-type">${type}</div>
      </div>
    `;
  },

  renderDetail(plant) {
    const careData = plant.careData;
    const summary = plant.summary;

    let detailHtml = `
      <div class="modal-handle"></div>
      <div style="text-align:center;font-size:56px;margin-bottom:8px;">${plant.icon || '🌱'}</div>
      <div class="modal-title" style="text-align:center;">${plant.name}</div>
      <div class="modal-subtitle" style="text-align:center;">${plant.scientific_name || careData?.scientificName || ''}</div>
    `;

    if (careData) {
      detailHtml += `
        <div class="activity-summary">
          <div class="activity-card watering">
            <div class="activity-card-icon">💧</div>
            <div class="activity-card-title">Watering</div>
            <div class="activity-card-detail">${summary?.watering?.notes || ''}</div>
          </div>
          <div class="activity-card pruning">
            <div class="activity-card-icon">✂️</div>
            <div class="activity-card-title">Pruning</div>
            <div class="activity-card-detail">${careData.pruning.notes.substring(0, 60)}...</div>
          </div>
          <div class="activity-card fertilizing">
            <div class="activity-card-icon">🧪</div>
            <div class="activity-card-title">Fertilizing</div>
            <div class="activity-card-detail">${careData.fertilizing.type}</div>
          </div>
          <div class="activity-card mulching">
            <div class="activity-card-icon">🍂</div>
            <div class="activity-card-title">Mulching</div>
            <div class="activity-card-detail">${careData.mulching.depth} ${careData.mulching.type}</div>
          </div>
        </div>
      `;

      if (plant.schedules && plant.schedules.length > 0) {
        const upcoming = plant.schedules
          .filter(s => s.status === 'pending' && s.activity !== 'watering')
          .slice(0, 5);

        if (upcoming.length > 0) {
          detailHtml += `<div class="section-title">Upcoming Activities</div>`;
          detailHtml += upcoming.map(s => ScheduleCard.renderItem(s)).join('');
        }
      }
    }

    detailHtml += `
      <button class="btn btn-danger btn-block" style="margin-top:20px;" onclick="App.deletePlant(${plant.id})">
        Remove Plant
      </button>
    `;

    return detailHtml;
  },
};
