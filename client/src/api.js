// In dev, call the server on the same host the page was opened from
// (so it works both on localhost and from a phone via the PC's LAN IP).
const API_BASE = import.meta.env.PROD ? '' : `http://${location.hostname}:4000`

export async function getTrips(){
  const res = await fetch(API_BASE + '/api/trips')
  if(!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export async function postTrip(trip){
  const res = await fetch(API_BASE + '/api/trips', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(trip)
  })
  if(!res.ok) throw new Error('Failed to post')
  return res.json()
}

// --- Admin ---
export async function adminLogin(password){
  const res = await fetch(API_BASE + '/api/admin/login', {
    method: 'POST', headers: { 'x-admin-password': password }
  })
  if(!res.ok) throw new Error('unauthorized')
  return res.json()
}

export async function adminDeleteTrip(id, password){
  const res = await fetch(API_BASE + '/api/trips/' + id, {
    method: 'DELETE', headers: { 'x-admin-password': password }
  })
  if(!res.ok) throw new Error('delete failed')
  return res.json()
}

export async function recordVisit(){
  try {
    await fetch(API_BASE + '/api/visit', { method: 'POST' })
  } catch {
    // silencieux : ne jamais bloquer l'app si le comptage échoue
  }
}

export async function adminGetStats(password){
  const res = await fetch(API_BASE + '/api/admin/stats', {
    headers: { 'x-admin-password': password }
  })
  if(!res.ok) throw new Error('stats failed')
  return res.json()
}
