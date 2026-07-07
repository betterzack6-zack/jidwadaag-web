const STORAGE_KEY = 'jidwadaag_trips';

function getTrips(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveTrips(trips){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function renderTrips(filter){
  const container = document.getElementById('tripsList');
  container.innerHTML = '';
  let trips = getTrips().slice().reverse();
  if(filter){
    const depart = (filter.depart||'').trim().toLowerCase();
    const arrive = (filter.arrive||'').trim().toLowerCase();
    if(depart) trips = trips.filter(t => t.depart.toLowerCase().includes(depart));
    if(arrive) trips = trips.filter(t => t.arrive.toLowerCase().includes(arrive));
  }
  if(trips.length === 0){
    container.innerHTML = '<p>Aucun trajet trouvé.</p>';
    return;
  }
  trips.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card trip-card';
    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${escapeHtml(t.depart)} → ${escapeHtml(t.arrive)} <small class="small-muted">${escapeHtml(t.date)} ${escapeHtml(t.time)}</small></h5>
        <p class="card-text">Conducteur: <strong>${escapeHtml(t.driverName)}</strong> — ${escapeHtml(t.driverNumber)}</p>
        <p class="card-text">Voiture: ${escapeHtml(t.carMark||'-')} ${escapeHtml(t.carModel||'')}</p>
        <p class="card-text">Climatisation: ${t.ac? 'Oui' : 'Non'} · Bagages: ${t.baggage? 'Oui' : 'Non'}</p>
        <p class="card-text">${escapeHtml(t.description||'')}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[c]);
}

function addTripFromForm(e){
  e.preventDefault();
  const trip = {
    driverName: document.getElementById('driverName').value.trim(),
    driverNumber: document.getElementById('driverNumber').value.trim(),
    depart: document.getElementById('departCity').value.trim(),
    arrive: document.getElementById('arriveCity').value.trim(),
    date: document.getElementById('dateDepart').value,
    time: document.getElementById('timeDepart').value,
    carMark: document.getElementById('carMark').value.trim(),
    carModel: document.getElementById('carModel').value.trim(),
    ac: document.getElementById('ac').checked,
    baggage: document.getElementById('baggage').checked,
    description: document.getElementById('description').value.trim(),
    createdAt: new Date().toISOString()
  };
  if(!trip.driverName || !trip.driverNumber || !trip.depart || !trip.arrive || !trip.date || !trip.time){
    alert('Veuillez remplir les champs obligatoires.');
    return;
  }
  const trips = getTrips();
  trips.push(trip);
  saveTrips(trips);
  document.getElementById('proposerForm').reset();
  location.hash = '#trajets';
  renderTrips();
}

function handleSearch(){
  const depart = document.getElementById('searchDepart').value;
  const arrive = document.getElementById('searchArrive').value;
  renderTrips({ depart, arrive });
}

function route(){
  const hash = (location.hash || '#home').replace('#','');
  const allowed = ['home','trajets','proposer','about','contact'];
  const page = allowed.includes(hash)? hash : 'home';
  document.querySelectorAll('.page').forEach(p=>p.classList.add('d-none'));
  document.getElementById(page).classList.remove('d-none');
  if(page === 'trajets') renderTrips();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('proposerForm').addEventListener('submit', addTripFromForm);
  document.getElementById('btnSearch').addEventListener('click', handleSearch);
  window.addEventListener('hashchange', route);
  route();
});
