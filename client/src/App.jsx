import React, {useEffect, useState} from 'react'
import { getTrips, postTrip, adminLogin, adminDeleteTrip } from './api'

const navLinks = [
  ['home', 'Accueil'],
  ['trajets', 'Trajets'],
  ['proposer', 'Proposer un trajet'],
  ['about', 'À propos'],
  ['contact', 'Contact']
]

function Nav({onNav, page}){
  const [open, setOpen] = useState(false)
  function go(key){ setOpen(false); onNav(key) }
  return (
    <header className="site-header">
      <button className="brand" onClick={()=>go('home')}>
        <img src="/logo-header.svg" alt="" className="brand-logo" />
        <span>JIDWADAAG</span>
      </button>
      <button
        className={open ? 'nav-toggle open' : 'nav-toggle'}
        aria-label="Menu"
        aria-expanded={open}
        onClick={()=>setOpen(o => !o)}
      >
        <span></span><span></span><span></span>
      </button>
      <nav className={open ? 'nav nav-open' : 'nav'}>
        {navLinks.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? 'active' : ''}
            aria-current={page === key ? 'page' : undefined}
            onClick={()=>go(key)}
          >{label}</button>
        ))}
      </nav>
    </header>
  )
}

const heroFeatures = [
  { title: 'Recherche rapide', description: 'Trouvez un trajet entre villes en quelques secondes.' },
  { title: 'Confiance entre voyageurs', description: 'Des offres claires avec numéro du conducteur et description complète.' },
  { title: 'Simple et gratuit', description: 'Pas de compte nécessaire, publiez et réservez rapidement.' }
]

const citiesByCountry = [
  { country: 'Djibouti', cities: ['Djibouti-ville', 'Arta', 'Wea', 'Ali Sabieh', 'Dikhil', 'Tadjourah', 'Obock'] },
  { country: 'Éthiopie', cities: ['Dire Dawa', 'Harrar', 'Babouli', 'JigJiga', 'Addis Abeba'] },
  { country: 'Somaliland', cities: ['Gabiley', 'Borama', 'Hargeysa', 'Harirad'] }
]

const availableCities = citiesByCountry.flatMap(group => group.cities)

function CitySelect({ value, onChange, placeholder, required }){
  return (
    <select className="city-select" value={value} onChange={onChange} required={required}>
      <option value="">{placeholder}</option>
      {citiesByCountry.map(group => (
        <optgroup key={group.country} label={group.country}>
          {group.cities.map(city => <option key={city} value={city}>{city}</option>)}
        </optgroup>
      ))}
    </select>
  )
}

const howItWorks = [
  { step: '1', title: 'Proposez votre trajet', description: 'Donnez les détails de votre départ, arrivée, date et véhicule.' },
  { step: '2', title: 'Publiez l’annonce', description: 'Le trajet apparaît immédiatement dans la liste des trajets disponibles.' },
  { step: '3', title: 'Recevez des réservations', description: 'Les passagers vous contactent pour réserver une place.' }
]

function formatTripDate(date, time){
  if(!date) return ''
  const dt = new Date(`${date}T${time || '00:00'}`)
  if(isNaN(dt.getTime())) return time ? `${date} · ${time}` : date
  const weekday = dt.toLocaleDateString('fr-FR', { weekday: 'long' })
  const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const day = String(dt.getDate()).padStart(2, '0')
  const month = dt.toLocaleDateString('fr-FR', { month: 'long' })
  const year = dt.getFullYear()
  const timePart = time ? ` à ${time.replace(':', 'h')}` : ''
  return `${capWeekday} ${day} ${month} ${year}${timePart}`
}

function whatsappLink(trip){
  const digits = (trip.driverNumber || '').replace(/\D/g, '')
  const message = `Bonjour, je suis intéressé par votre trajet ${trip.depart} → ${trip.arrive} du ${formatTripDate(trip.date, trip.time)}. Est-il encore disponible ?`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function WinWin(){
  return (
    <div className="winwin-grid">
      <div className="winwin-card driver">
        <span className="winwin-emoji">💰</span>
        <h3>Pour les conducteurs — gagnez de l’argent</h3>
        <p>Vous prenez déjà la route ? Ne roulez plus avec des sièges vides. Partagez vos frais de carburant et gagnez de l’argent à chaque trajet, sans détour ni effort.</p>
        <ul>
          <li>Amortissez le prix de l’essence et du diesel</li>
          <li>Vous fixez librement votre tarif par place</li>
          <li>Publiez votre trajet en moins d’une minute</li>
        </ul>
      </div>
      <div className="winwin-card passenger">
        <span className="winwin-emoji">🧳</span>
        <h3>Pour les passagers — voyagez mieux</h3>
        <p>Trouvez une place en quelques clics et voyagez dans un seul véhicule, bien plus vite qu’en bus — sans les correspondances ni la fatigue, malgré la chaleur.</p>
        <ul>
          <li>Un seul véhicule, sans changer de bus en route</li>
          <li>Trajet direct : arrivez plus vite et reposé</li>
          <li>Fini les montées et descentes sous la chaleur</li>
        </ul>
        <p className="winwin-example">Ex. Djibouti-ville → Dire Dawa : ~4h30 en voiture, sans correspondance, contre ~7h, 3 bus et beaucoup de montées et descentes.</p>
      </div>
    </div>
  )
}

function Home({ onNav, onCity }){
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">JIDWADAAG</p>
          <h1>Voyagez ensemble, en toute simplicité</h1>
          <p>Les conducteurs rentabilisent leurs places vides, les passagers voyagent plus vite et confortablement. Une solution <strong>gagnant-gagnant</strong> pour toute la région.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onNav('proposer')}>Proposer un trajet</button>
            <button className="secondary" onClick={() => onNav('trajets')}>Voir les trajets</button>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-card">
            <h2>Votre prochaine route est juste ici</h2>
            <p>Ajoutez un trajet et rejoignez des passagers qui vont dans la même direction que vous.</p>
          </div>
          <div className="hero-grid">
            {heroFeatures.map(feature => (
              <div className="feature-card" key={feature.title}>
                <strong>{feature.title}</strong>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <h2>Une solution gagnant-gagnant</h2>
          <p>À Djibouti, le carburant coûte cher et les bus sont longs et inconfortables. JIDWADAAG change la donne — autant pour les conducteurs que pour les passagers.</p>
        </div>
        <WinWin />
      </section>

      <section className="page-section light-section">
        <div className="section-header">
          <h2>Disponible dans les meilleures villes</h2>
          <p>Recherchez un trajet pour rejoindre rapidement une ville à Djibouti, en Éthiopie ou au Somaliland.</p>
        </div>
        <div className="city-grid">
          {availableCities.map(city => (
            <button className="city-card" key={city} onClick={() => onCity(city)}>{city}</button>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <h2>Comment ça marche</h2>
          <p>Publiez un trajet ou réservez une place en trois étapes simples.</p>
        </div>
        <div className="steps-grid">
          {howItWorks.map(item => (
            <div className="step-card" key={item.step}>
              <span className="step-badge">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section dark-section">
        <div className="section-header">
          <h2>Pourquoi choisir JIDWADAAG ?</h2>
          <p>Une expérience fluide pour les conducteurs et les passagers qui cherchent un trajet sûr et économique.</p>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <strong>Annonce visible immédiatement</strong>
            <p>Votre trajet est publié et consultable par tous les voyageurs.</p>
          </div>
          <div className="benefit-card">
            <strong>Contact direct</strong>
            <p>Les passagers vous contactent directement sur WhatsApp via le bouton de réservation.</p>
          </div>
          <div className="benefit-card">
            <strong>Sans inscription</strong>
            <p>Utilisation facile, sans compte ni mot de passe obligatoire.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function Trajets({ initialArrive = '' }){
  const [trips, setTrips] = useState([])
  const [depart, setDepart] = useState('')
  const [arrive, setArrive] = useState(initialArrive)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setDepart('')
    setArrive(initialArrive)
    setLoading(true)
    getTrips().then(all => {
      const a = initialArrive.trim().toLowerCase()
      setTrips(a ? all.filter(t => t.arrive.toLowerCase().includes(a)) : all)
    }).finally(() => setLoading(false))
  }, [initialArrive])
  function load(){ setDepart(''); setArrive(''); setLoading(true); getTrips().then(setTrips).finally(()=>setLoading(false)) }
  function search(){ setLoading(true); getTrips().then(all=>{
    const f = all.filter(t=> (!depart || t.depart.toLowerCase().includes(depart.toLowerCase())) && (!arrive || t.arrive.toLowerCase().includes(arrive.toLowerCase())) )
    setTrips(f)
  }).finally(()=>setLoading(false)) }

  return (
    <section className="page-section trajets-page">
      <div className="section-header">
        <h2>Trajets</h2>
        <p>Recherchez un trajet disponible ou contactez le conducteur pour réserver votre place.</p>
      </div>
      <div className="search-row">
        <CitySelect placeholder="Ville de départ" value={depart} onChange={e=>setDepart(e.target.value)} />
        <CitySelect placeholder="Ville d'arrivée" value={arrive} onChange={e=>setArrive(e.target.value)} />
        <button className="primary" onClick={search}>Rechercher</button>
        <button className="secondary" onClick={load}>Réinitialiser</button>
      </div>
      <div className="trip-grid">
        {loading ? (
          <p className="loading-note">Chargement…</p>
        ) : trips.length===0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🔍</span>
            <h3>Oups, aucun trajet pour cet itinéraire… pour l’instant</h3>
            <p>Nous n’avons pas encore de trajet correspondant à votre recherche. Veuillez revenir ultérieurement pour voir s’il devient disponible.</p>
          </div>
        ) : trips.map(t => (
          <article className="trip-card" key={t.id}>
            <div className="trip-route">
              <div className="trip-cities">
                <span>{t.depart}</span>
                <span className="route-arrow">→</span>
                <span>{t.arrive}</span>
              </div>
              <p className="trip-date">{formatTripDate(t.date, t.time)}</p>
            </div>
            <div className="trip-tags">
              <span className={t.ac ? 'chip chip-on' : 'chip chip-danger'}>{t.ac ? '❄️ Climatisé' : 'Sans clim'}</span>
              <span className={t.baggage ? 'chip chip-on' : 'chip chip-off'}>{t.baggage ? 'Bagages autorisés' : 'Sans bagages'}</span>
              <span className={t.khat ? 'chip chip-on' : 'chip chip-danger'}>{t.khat ? 'Khat autorisé' : 'Khat interdit'}</span>
            </div>
            <div className="trip-body">
              <div className="trip-info"><span>Conducteur</span><strong>{t.driverName}</strong></div>
              <div className="trip-info"><span>Contact</span><strong>{t.driverNumber}</strong></div>
              <div className="trip-info"><span>Voiture</span><strong>{t.carMark} {t.carModel}</strong></div>
              <div className="trip-info"><span>Places disponibles</span><strong>{t.seats != null ? t.seats : '—'}</strong></div>
              <div className="trip-info"><span>Tarif / place</span><strong>{t.price != null ? `${t.price} Fdj` : '—'}</strong></div>
            </div>
            {t.description && <p className="trip-description">{t.description}</p>}
            <div className="trip-actions">
              <a className="accent" href={whatsappLink(t)} target="_blank" rel="noopener noreferrer">Contacter pour réserver</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const dialCodes = [
  { code: '+253', placeholder: '77 80 98 98', lengths: [8], example: '77 80 98 98' },
  { code: '+251', placeholder: '91 234 56 78', lengths: [9], example: '91 234 56 78' },
  { code: '+252', placeholder: '63 00 00 00', lengths: [8, 9], example: '63 00 00 00' }
]

const emptyTrip = {driverName:'', dialCode:'+253', driverNumber:'', depart:'', arrive:'', date:'', time:'', carMark:'', carModel:'', seats:'', price:'', ac:false, baggage:false, khat:false, description:''}

function Proposer({onPosted}){
  const [form, setForm] = useState(emptyTrip)
  const [status, setStatus] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const today = new Date().toISOString().split('T')[0]
  function change(k,v){ setForm({...form,[k]:v}) }
  function currentDial(){ return dialCodes.find(d => d.code === form.dialCode) }
  function checkPhone(){
    const cfg = currentDial()
    const digits = form.driverNumber.replace(/\D/g, '')
    if(cfg && !cfg.lengths.includes(digits.length)){
      const expected = cfg.lengths.length === 1 ? `${cfg.lengths[0]} chiffres` : `${cfg.lengths.join(' ou ')} chiffres`
      setPhoneError(`Numéro incorrect (${expected} attendus). Exemple : ${cfg.example}.`)
      return false
    }
    setPhoneError('')
    return true
  }
  async function submit(e){
    e.preventDefault()
    if(!checkPhone()) return
    setStatus('')
    try {
      const payload = { ...form, driverNumber: `${form.dialCode} ${form.driverNumber}`.trim() }
      await postTrip(payload)
      setForm(emptyTrip)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }
  function dismiss(){
    const wasSuccess = status === 'success'
    setStatus('')
    if(wasSuccess) onPosted()
  }
  return (
    <section className="page-section">
      <h2>Proposer un trajet</h2>
      {status && (
        <div className="modal-overlay" onClick={dismiss}>
          <div className={`modal modal-${status}`} role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}>
            <div className={`modal-icon modal-icon-${status}`}>{status === 'success' ? '✓' : '!'}</div>
            <h3>{status === 'success' ? 'Trajet publié !' : 'Échec de la publication'}</h3>
            <p>{status === 'success'
              ? 'Votre trajet a été publié avec succès. Vous allez être redirigé vers la liste des trajets.'
              : 'Une erreur est survenue lors de la publication. Veuillez réessayer.'}</p>
            <button type="button" className={status === 'success' ? 'accent' : 'primary'} onClick={dismiss}>OK</button>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="proposer-form">
        <div className="form-grid">
          <label>
            Nom du conducteur
            <input required placeholder="Nom du conducteur" value={form.driverName} onChange={e=>change('driverName', e.target.value)} />
          </label>
          <label>
            Numéro
            <div className="phone-group">
              <select className="dial-select" value={form.dialCode} onChange={e=>{ change('dialCode', e.target.value); setPhoneError('') }}>
                {dialCodes.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
              </select>
              <input
                required
                type="tel"
                inputMode="numeric"
                className={phoneError ? 'phone-input input-error' : 'phone-input'}
                placeholder={currentDial()?.placeholder}
                value={form.driverNumber}
                onChange={e=>{ change('driverNumber', e.target.value); if(phoneError) setPhoneError('') }}
                onBlur={checkPhone}
              />
            </div>
            {phoneError && <span className="field-error">{phoneError}</span>}
          </label>
          <label>
            Ville de départ
            <CitySelect required placeholder="Choisir une ville" value={form.depart} onChange={e=>change('depart', e.target.value)} />
          </label>
          <label>
            Ville d'arrivée
            <CitySelect required placeholder="Choisir une ville" value={form.arrive} onChange={e=>change('arrive', e.target.value)} />
          </label>
          <label>
            Date de départ
            <input type="date" required min={today} value={form.date} onChange={e=>change('date', e.target.value)} />
          </label>
          <label>
            Heure de départ
            <input type="time" required value={form.time} onChange={e=>change('time', e.target.value)} />
          </label>
          <label>
            Marque
            <input placeholder="Marque" value={form.carMark} onChange={e=>change('carMark', e.target.value)} />
          </label>
          <label>
            Modèle
            <input placeholder="Modèle" value={form.carModel} onChange={e=>change('carModel', e.target.value)} />
          </label>
          <label>
            Places disponibles
            <input type="number" min="1" required placeholder="Ex. 3" value={form.seats} onChange={e=>change('seats', e.target.value)} />
          </label>
          <label>
            Tarif par place (Fdj)
            <input type="number" min="0" required placeholder="Ex. 1500" value={form.price} onChange={e=>change('price', e.target.value)} />
          </label>
        </div>
        <div className="checkbox-row">
          <label><input type="checkbox" checked={form.ac} onChange={e=>change('ac', e.target.checked)} /> Climatisation</label>
          <label><input type="checkbox" checked={form.baggage} onChange={e=>change('baggage', e.target.checked)} /> Bagages autorisés</label>
          <label><input type="checkbox" checked={form.khat} onChange={e=>change('khat', e.target.checked)} /> Khat autorisé</label>
        </div>
        <label className="full-width">
          Description
          <textarea placeholder="Description" value={form.description} onChange={e=>change('description', e.target.value)} />
        </label>
        <button type="submit" className="primary">Publier le trajet</button>
      </form>
    </section>
  )
}

function About(){
  return (
    <section className="page-section">
      <div className="section-header">
        <h2>À propos de JIDWADAAG</h2>
        <p>Voyager entre nos villes, simplement et entre confiance.</p>
      </div>
      <div className="prose">
        <p>
          JIDWADAAG est une plateforme de covoiturage interurbain qui relie les villes
          de <strong>Djibouti</strong>, d’<strong>Éthiopie</strong> et du <strong>Somaliland</strong>.
          Notre objectif est simple : rendre les déplacements entre villes plus <strong>rapides</strong>,
          plus <strong>confortables</strong> et plus <strong>humains</strong>.
        </p>
        <p>
          Chaque jour, des conducteurs prennent la route avec des places libres dans leur véhicule,
          pendant que d’autres voyageurs cherchent justement à rejoindre la même destination.
          JIDWADAAG met ces personnes en relation, directement et sans intermédiaire compliqué.
        </p>
        <p>
          Le conducteur publie son trajet en quelques secondes — départ, arrivée, date, prix par place
          et détails du véhicule. Le passager, lui, trouve un trajet et contacte le conducteur
          <strong> directement sur WhatsApp</strong> pour réserver sa place. Pas de compte à créer,
          pas de démarches inutiles.
        </p>
        <p>
          Notre mission : remplir les voitures qui roulent déjà, permettre aux conducteurs d’amortir
          leurs frais de carburant, et offrir aux passagers un trajet plus <strong>rapide</strong>,
          plus <strong>direct</strong> et plus <strong>confortable</strong> — tout en renforçant les
          liens entre les communautés de la région.
        </p>
      </div>
      <div className="winwin-section">
        <h2>Pourquoi c’est gagnant-gagnant</h2>
        <WinWin />
      </div>
    </section>
  )
}

function Contact(){
  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Contact</h2>
        <p>Une question, une remarque ou besoin d’aide ? Écrivez-nous directement sur WhatsApp, nous répondons rapidement.</p>
      </div>
      <a className="accent" href="https://wa.me/25377648442" target="_blank" rel="noopener noreferrer">
        💬 Nous contacter sur WhatsApp
      </a>
    </section>
  )
}

function Admin(){
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function loadTrips(){
    setLoading(true)
    getTrips().then(t => { setTrips(t); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pw')
    if(stored){
      adminLogin(stored)
        .then(() => { setPassword(stored); setAuthed(true); loadTrips() })
        .catch(() => sessionStorage.removeItem('admin_pw'))
    }
  }, [])

  async function login(e){
    e.preventDefault()
    setError('')
    try {
      await adminLogin(password)
      sessionStorage.setItem('admin_pw', password)
      setAuthed(true)
      loadTrips()
    } catch {
      setError('Mot de passe incorrect.')
    }
  }

  function logout(){
    sessionStorage.removeItem('admin_pw')
    setAuthed(false)
    setPassword('')
    setTrips([])
  }

  async function remove(id){
    if(!window.confirm(`Supprimer définitivement le trajet #${id} ?`)) return
    try {
      await adminDeleteTrip(id, password)
      setTrips(trips.filter(t => t.id !== id))
    } catch {
      alert('Erreur lors de la suppression.')
    }
  }

  if(!authed){
    return (
      <section className="page-section admin-login">
        <h2>Administration</h2>
        <form onSubmit={login} className="proposer-form">
          <label>
            Mot de passe administrateur
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </label>
          {error && <div className="form-banner form-banner-error">{error}</div>}
          <button className="primary" type="submit">Se connecter</button>
        </form>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Administration — Trajets</h2>
        <p>{loading ? 'Chargement…' : `${trips.length} trajet(s) enregistré(s). Supprimez les trajets indésirables.`}</p>
      </div>
      <div className="admin-actions">
        <button className="secondary" onClick={loadTrips}>Rafraîchir</button>
        <button className="secondary" onClick={logout}>Se déconnecter</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Trajet</th><th>Date</th><th>Conducteur</th>
              <th>Contact</th><th>Places</th><th>Tarif</th><th></th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr><td colSpan="8" className="admin-empty">Aucun trajet.</td></tr>
            ) : trips.map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.depart} → {t.arrive}</td>
                <td>{t.date} {t.time}</td>
                <td>{t.driverName}</td>
                <td>{t.driverNumber}</td>
                <td>{t.seats != null ? t.seats : '—'}</td>
                <td>{t.price != null ? `${t.price} Fdj` : '—'}</td>
                <td><button className="danger-btn" onClick={()=>remove(t.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="site-footer">
      <div>
        <h4>JIDWADAAG</h4>
        <p>Une plateforme moderne pour partager des trajets entre villes.</p>
      </div>
      <div className="footer-links">
        <div>
          <strong>Navigation</strong>
          <p>Accueil · Trajets · Proposer</p>
        </div>
        <div>
          <strong>Contact</strong>
          <p><a href="https://wa.me/25377648442" target="_blank" rel="noopener noreferrer">WhatsApp : +253 77 64 84 42</a></p>
        </div>
      </div>
      <p className="footer-copy">© 2026 JIDWADAAG. Tous droits réservés.</p>
    </footer>
  )
}

function InstallPrompt(){
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onPrompt(e){
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    function onInstalled(){ setVisible(false); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if(!visible) return null

  async function install(){
    if(!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  return (
    <div className="install-banner">
      <span className="install-text">📱 Installez l’application JIDWADAAG sur votre téléphone</span>
      <div className="install-actions">
        <button className="accent" onClick={install}>Installer</button>
        <button className="install-close" onClick={()=>setVisible(false)} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

export default function App(){
  const [page, setPage] = useState(() => window.location.hash === '#admin' ? 'admin' : 'home')
  const [arriveFilter, setArriveFilter] = useState('')
  function navigate(p){ setArriveFilter(''); setPage(p) }
  function onPosted(){ navigate('trajets') }
  function onCity(city){ setArriveFilter(city); setPage('trajets') }

  useEffect(() => {
    function onHash(){ if(window.location.hash === '#admin') setPage('admin') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="app">
      <Nav onNav={navigate} page={page} />
      <main>
        {page==='home' && <Home onNav={navigate} onCity={onCity} />}
        {page==='trajets' && <Trajets initialArrive={arriveFilter} />}
        {page==='proposer' && <Proposer onPosted={onPosted} />}
        {page==='about' && <About />}
        {page==='contact' && <Contact />}
        {page==='admin' && <Admin />}
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  )
}
