
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Play, Pause, ChevronLeft, ChevronRight, MapPin, CalendarRange, Images, Compass, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const EUR = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const COORD = {
  valencia: [39.4699, -0.3763],
  madrid: [40.4168, -3.7038],
  kix: [34.4347, 135.2327],
  osaka: [34.7025, 135.4959],
  nara: [34.6851, 135.8048],
  kyoto: [35.0116, 135.7681],
  odawara: [35.2556, 139.1597],
  hakone: [35.2324, 139.1068],
  kawaguchiko: [35.4993, 138.7685],
  shinjuku: [35.6909, 139.7003],
  hnd: [35.5494, 139.7798],
};

const PHOTOS = {
  es: ["./valencia.jpg","./madrid.jpg"],
  osaka: ["./osaka1.jpg","./osaka2.jpg"],
  nara: ["./nara1.jpg","./nara2.jpg"],
  kyoto: ["./kyoto1.jpg","./kyoto2.jpg","./kyoto3.jpg","./fushimi.jpg","./uji.jpg"],
  hakone: ["./hakone1.jpg"],
  fuji: ["./fuji1.jpg","./chureito.jpg"],
  tokyo: ["./tokyo1.jpg","./tokyo2.jpg","./odaiba.jpg"],
  teamlab: ["./teamlab.jpg"],
  disney: ["./disneysea.jpg"],
};

const REGIONS = {
  ES: { center: [40.2, -3.7], zoom: 5 },
  JP: { center: [36.2, 138.2], zoom: 5 },
  METRO_TOKYO: { center: [35.68, 139.76], zoom: 10 },
  KANSAI: { center: [34.78, 135.50], zoom: 9 },
};

const ITINERARIO = [
  { dia: 1, region: "ES", fecha: "25 Jul", titulo: "Valencia → Madrid (tren) · Madrid → Osaka (vuelo)", descripcion: "Salida desde Valencia a Madrid para volar a Osaka.", puntos: [COORD.valencia, COORD.madrid], path:[COORD.valencia, COORD.madrid], fotos: PHOTOS.es, costePorPersona: 0 },
  { dia: 2, region: "JP", fecha: "26 Jul", titulo: "Llegada a Osaka (KIX) · Umeda", descripcion: "Bus KIX → Umeda y mirador al atardecer.", puntos:[COORD.kix, COORD.osaka], path:[COORD.kix, COORD.osaka], fotos: PHOTOS.osaka, costePorPersona: 49 },
  { dia: 3, region: "KANSAI", fecha: "27 Jul", titulo: "USJ (Nintendo World)", descripcion: "Día completo en Universal Studios Japan.", puntos:[COORD.osaka], fotos: PHOTOS.osaka, costePorPersona: 70 },
  { dia: 4, region: "KANSAI", fecha: "28 Jul", titulo: "Osaka ciudad", descripcion: "Castillo y Dotonbori.", puntos:[COORD.osaka], fotos: PHOTOS.osaka, costePorPersona: 41 },
  { dia: 5, region: "KANSAI", fecha: "29 Jul", titulo: "Nara → Kioto", descripcion: "Templos con ciervos y llegada a Kioto.", puntos:[COORD.osaka, COORD.nara, COORD.kyoto], path:[COORD.osaka, COORD.nara, COORD.kyoto], fotos: [...PHOTOS.nara, PHOTOS.kyoto[0]], costePorPersona: 48 },
  { dia: 6, region: "KANSAI", fecha: "30 Jul", titulo: "Kioto Oeste", descripcion: "Arashiyama y Kinkaku‑ji.", puntos:[COORD.kyoto], fotos: PHOTOS.kyoto, costePorPersona: 41 },
  { dia: 7, region: "KANSAI", fecha: "31 Jul", titulo: "Kioto Este", descripcion: "Kiyomizu‑dera, Gion.", puntos:[COORD.kyoto], fotos: PHOTOS.kyoto, costePorPersona: 41 },
  { dia: 8, region: "KANSAI", fecha: "1 Ago", titulo: "Fushimi Inari + Uji", descripcion: "Torii al amanecer; té en Uji.", puntos:[COORD.kyoto], fotos: PHOTOS.kyoto, costePorPersona: 41 },
  { dia: 9, region: "JP", fecha: "2 Ago", titulo: "Kioto → Odawara (Shinkansen) · Coche · Hakone", descripcion: "Recogida de coche y onsen.", puntos:[COORD.kyoto, COORD.odawara, COORD.hakone], path:[COORD.kyoto, COORD.odawara, COORD.hakone], fotos: PHOTOS.hakone, costePorPersona: 86 },
  { dia: 10, region: "JP", fecha: "3 Ago", titulo: "Hakone → Kawaguchiko", descripcion: "Miradores del Monte Fuji.", puntos:[COORD.hakone, COORD.kawaguchiko], path:[COORD.hakone, COORD.kawaguchiko], fotos: PHOTOS.fuji, costePorPersona: 64 },
  { dia: 11, region: "METRO_TOKYO", fecha: "4 Ago", titulo: "Kawaguchiko → Tokio (Fuji Excursion)", descripcion: "Entrega coche y tren a Shinjuku.", puntos:[COORD.kawaguchiko, COORD.shinjuku], path:[COORD.kawaguchiko, COORD.shinjuku], fotos: PHOTOS.tokyo, costePorPersona: 61 },
  { dia: 12, region: "METRO_TOKYO", fecha: "5 Ago", titulo: "Tokyo Disney/DisneySea", descripcion: "Día en parque.", puntos:[COORD.shinjuku], fotos: PHOTOS.disney, costePorPersona: 65 },
  { dia: 13, region: "METRO_TOKYO", fecha: "6 Ago", titulo: "Shibuya–Harajuku–Meiji + Odaiba", descripcion: "Cruce de Shibuya y bahía.", puntos:[COORD.shinjuku], fotos: PHOTOS.tokyo, costePorPersona: 41 },
  { dia: 14, region: "METRO_TOKYO", fecha: "7 Ago", titulo: "teamLab Borderless + Roppongi", descripcion: "Arte inmersivo y skyline.", puntos:[COORD.shinjuku], fotos: PHOTOS.teamlab, costePorPersona: 49 },
  { dia: 15, region: "JP", fecha: "8 Ago", titulo: "Regreso · HND → VLC", descripcion: "Haneda → Valencia.", puntos:[COORD.shinjuku, COORD.hnd], path:[COORD.shinjuku, COORD.hnd], fotos: PHOTOS.tokyo, costePorPersona: 18 },
];

function regionView(regionKey){
  const r = REGIONS[regionKey] || REGIONS.JP;
  return r;
}

function pointsToBounds(points){
  if(!points || !points.length) return undefined;
  const lats = points.map(p=>p[0]);
  const lngs = points.map(p=>p[1]);
  const sw = [Math.min(...lats), Math.min(...lngs)];
  const ne = [Math.max(...lats), Math.max(...lngs)];
  return [sw, ne];
}

export default function PaginaViajeJapon(){
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [velocidad, setVelocidad] = useState(3800);
  const actual = ITINERARIO[idx];
  const totalCoste = useMemo(()=> ITINERARIO.reduce((a,d)=>a+(d.costePorPersona||0),0),[]);

  useEffect(()=>{
    if(!auto) return;
    const t = setTimeout(()=> setIdx(i => (i+1)%ITINERARIO.length), velocidad);
    return ()=> clearTimeout(t);
  }, [auto, idx, velocidad]);

  return (
    <div className="min-h-screen text-white bg-slate-950 bg-grid">
      <section className="relative hero overflow-hidden">
        <img src="./tokyo1.jpg" alt="Tokio" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl fade-border">
            <div className="flex items-center gap-2 text-sky-300 mb-3">
              <Sparkles className="w-5 h-5"/><span>Itinerario familiar — Julio/Agosto</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">¡Nos vamos a Japón!</h1>
            <p className="mt-4 text-slate-200/90 max-w-2xl">Día a día con mapas dinámicos por país y ciudad, rutas y galería de fotos.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={()=>setAuto(a=>!a)} className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold shadow">
                {auto ? "Pausar pase automático" : "Reproducir pase automático"}
              </button>
              <a href="#itinerario" className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20">Ver itinerario</a>
            </div>
          </div>
        </div>
      </section>

      <main id="itinerario" className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl glass shadow-xl border border-white/10">
          <div className="px-5 pt-5">
            <div className="text-lg md:text-xl font-semibold flex items-center gap-2 text-sky-300">
              <MapPin className="w-5 h-5"/> Día {actual.dia}: {actual.titulo}
            </div>
            <p className="text-sm text-slate-300">{actual.fecha} · Vista: {actual.region}</p>
          </div>
          <div className="p-5">
            <div className="h-[52vh] w-full overflow-hidden rounded-2xl">
              <MapaEtapa region={actual.region} puntos={actual.puntos} path={actual.path} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl glass shadow-xl border border-white/10">
            <div className="px-5 pt-5">
              <div className="text-lg font-semibold text-sky-300">Detalle del día</div>
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>
                  <p className="text-slate-200/90 mb-3">{actual.descripcion}</p>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <div>Coste por persona: <span className="font-semibold text-white">{EUR(actual.costePorPersona)}</span></div>
                    <div>Total en destino: <span className="font-semibold text-white">{EUR(totalCoste)}</span></div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button className="px-3 py-2 rounded-2xl border border-white/20 hover:bg-white/10" onClick={()=> setIdx(i => (i-1+ITINERARIO.length)%ITINERARIO.length)}><span className="inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4"/>Anterior</span></button>
                <div className="text-xs text-slate-300">{idx+1} / {ITINERARIO.length}</div>
                <button className="px-3 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold" onClick={()=> setIdx(i => (i+1)%ITINERARIO.length)}><span className="inline-flex items-center gap-2">Siguiente<ChevronRight className="w-4 h-4"/></span></button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl glass shadow-xl border border-white/10">
            <div className="px-5 pt-5 flex items-center justify-between">
              <div className="text-lg font-semibold text-sky-300">Fotos del día</div>
              <div className="text-xs text-slate-300">Incluidas en el proyecto</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actual.fotos?.map((src, i) => (
                  <a key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:scale-[1.02] transition" href={src} target="_blank">
                    <img src={src} alt={`Foto ${i+1} día ${actual.dia}`} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl glass shadow-xl border border-white/10 p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-3 text-sky-300">Línea temporal</h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ITINERARIO.map((d,i)=> (
              <li key={d.dia}>
                <button onClick={()=>setIdx(i)} className={`w-full text-left px-3 py-3 rounded-2xl border transition ${i===idx ? 'bg-white/10 border-white/30' : 'hover:bg-white/5 border-white/15'}`}>
                  <div className="text-xs text-slate-300">Día {d.dia} · {d.fecha}</div>
                  <div className="text-sm font-medium text-white/90">{d.titulo}</div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-4 pb-10 pt-4 text-sm text-slate-300">
        <p>Fotos incluidas. Cuando quieras, las cambiamos por fotos reales de tu familia.</p>
      </footer>
    </div>
  );
}

function MapaEtapa({ region, puntos = [], path = [] }){
  const view = regionView(region);
  const center = view.center;
  const zoom = view.zoom;
  const bounds = pointsToBounds(puntos);

  return (
    <MapContainer center={center} zoom={zoom} bounds={bounds || undefined} className="h-full w-full rounded-xl overflow-hidden">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {path && path.length>1 && <Polyline positions={path} />}
      {puntos?.map((p,i)=>(
        <CircleMarker key={i} center={p} radius={6}>
          <Popup>Punto {i+1}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function regionView(key){
  const REGIONS = {
    ES: { center: [40.2, -3.7], zoom: 5 },
    JP: { center: [36.2, 138.2], zoom: 5 },
    METRO_TOKYO: { center: [35.68, 139.76], zoom: 10 },
    KANSAI: { center: [34.78, 135.50], zoom: 9 },
  };
  return REGIONS[key] || REGIONS.JP;
}

function pointsToBounds(points){
  if(!points || !points.length) return undefined;
  const lats = points.map(p=>p[0]);
  const lngs = points.map(p=>p[1]);
  const sw = [Math.min(...lats), Math.min(...lngs)];
  const ne = [Math.max(...lats), Math.max(...lngs)];
  return [sw, ne];
}
