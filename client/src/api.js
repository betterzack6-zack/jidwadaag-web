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
