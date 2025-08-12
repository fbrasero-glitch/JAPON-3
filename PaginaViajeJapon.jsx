
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Play, Pause, ChevronLeft, ChevronRight, MapPin, CalendarRange, Images, Compass, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fix de iconos Leaflet en build
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const EUR = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const COORD = {
  valencia: [39.4699, -0.3763],
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

// Fotos libres usando source.unsplash.com (no necesitas subirlas)
const PHOTOS = {
  hero: "https://source.unsplash.com/1600x900/?tokyo,night,city",
  osaka: ["https://source.unsplash.com/1600x900/?osaka,city","https://source.unsplash.com/1600x900/?dotonbori","https://source.unsplash.com/1600x900/?umeda,skybuilding"],
  nara: ["https://source.unsplash.com/1600x900/?nara,deer","https://source.unsplash.com/1600x900/?nara,temple"],
  kyoto: ["https://source.unsplash.com/1600x900/?kyoto,arashiyama","https://source.unsplash.com/1600x900/?kinkakuji","https://source.unsplash.com/1600x900/?gion,streets"],
  hakone: ["https://source.unsplash.com/1600x900/?hakone,lake,ashi","https://source.unsplash.com/1600x900/?hakone,ropeway"],
  fuji: ["https://source.unsplash.com/1600x900/?mount,fuji,kawaguchiko","https://source.unsplash.com/1600x900/?chureito,pagoda"],
  tokyo: ["https://source.unsplash.com/1600x900/?tokyo,shinjuku","https://source.unsplash.com/1600x900/?shibuya,crossing","https://source.unsplash.com/1600x900/?odaiba,bridge"],
  disney: ["https://source.unsplash.com/1600x900/?disneysea,tokyo","https://source.unsplash.com/1600x900/?disney,fireworks"],
  teamlab: ["https://source.unsplash.com/1600x900/?teamlab,borderless","https://source.unsplash.com/1600x900/?digital,art,light"]
};

const ITINERARIO = [
  { dia: 1, fecha: "25 Jul", titulo: "Salida Valencia → Osaka (KIX)", descripcion: "Vuelo multi‑ciudad. Noche a bordo.", puntos: [COORD.valencia, COORD.kix], marcadores:[{pos:COORD.valencia,label:"Valencia (VLC)"},{pos:COORD.kix,label:"Kansai Intl (KIX)"}], costePorPersona: 0, fotos:[PHOTOS.hero] },
  { dia: 2, fecha: "26 Jul", titulo: "Llegada a Osaka · Umeda", descripcion: "Bus KIX→Umeda. Umeda Sky por la tarde.", puntos:[COORD.kix, COORD.osaka], marcadores:[{pos:COORD.kix,label:"KIX"},{pos:COORD.osaka,label:"Osaka/Umeda"}], costePorPersona: 49, fotos:PHOTOS.osaka },
  { dia: 3, fecha: "27 Jul", titulo: "USJ (Nintendo World)", descripcion: "Día completo en Universal Studios Japan.", puntos:[COORD.osaka], marcadores:[{pos:COORD.osaka,label:"Osaka"}], costePorPersona: 70, fotos:["https://source.unsplash.com/1600x900/?universal,studios,japan"] },
  { dia: 4, fecha: "28 Jul", titulo: "Osaka ciudad", descripcion: "Castillo y Dotonbori.", puntos:[COORD.osaka], marcadores:[{pos:COORD.osaka,label:"Osaka"}], costePorPersona: 41, fotos:PHOTOS.osaka },
  { dia: 5, fecha: "29 Jul", titulo: "Nara → Kioto", descripcion: "Templos y ciervos; llegada a Kioto.", puntos:[COORD.osaka, COORD.nara, COORD.kyoto], marcadores:[{pos:COORD.nara,label:"Nara"},{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 48, fotos:[...PHOTOS.nara, PHOTOS.kyoto[0]] },
  { dia: 6, fecha: "30 Jul", titulo: "Kioto Oeste", descripcion: "Arashiyama y Kinkaku‑ji.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:PHOTOS.kyoto },
  { dia: 7, fecha: "31 Jul", titulo: "Kioto Este", descripcion: "Kiyomizu‑dera, Gion.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:PHOTOS.kyoto },
  { dia: 8, fecha: "1 Ago", titulo: "Fushimi Inari + Uji", descripcion: "Torii al amanecer; té en Uji.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:["https://source.unsplash.com/1600x900/?fushimi,inari","https://source.unsplash.com/1600x900/?uji,tea"] },
  { dia: 9, fecha: "2 Ago", titulo: "Kioto → Odawara (Shinkansen) · Coche · Hakone", descripcion: "Recoge coche y onsen en Hakone.", puntos:[COORD.kyoto, COORD.odawara, COORD.hakone], marcadores:[{pos:COORD.odawara,label:"Odawara"},{pos:COORD.hakone,label:"Hakone"}], costePorPersona: 86, fotos:PHOTOS.hakone },
  { dia: 10, fecha: "3 Ago", titulo: "Hakone → Kawaguchiko", descripcion: "Miradores del Monte Fuji.", puntos:[COORD.hakone, COORD.kawaguchiko], marcadores:[{pos:COORD.kawaguchiko,label:"Kawaguchiko"}], costePorPersona: 64, fotos:PHOTOS.fuji },
  { dia: 11, fecha: "4 Ago", titulo: "Kawaguchiko → Tokio (Fuji Excursion)", descripcion: "Entrega coche y tren a Shinjuku.", puntos:[COORD.kawaguchiko, COORD.shinjuku], marcadores:[{pos:COORD.kawaguchiko,label:"Kawaguchiko"},{pos:COORD.shinjuku,label:"Tokio / Shinjuku"}], costePorPersona: 61, fotos:PHOTOS.tokyo },
  { dia: 12, fecha: "5 Ago", titulo: "Tokyo Disney/DisneySea", descripcion: "Día en parque.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 65, fotos:PHOTOS.disney },
  { dia: 13, fecha: "6 Ago", titulo: "Shibuya–Harajuku–Meiji + Odaiba", descripcion: "Shibuya Crossing y bahía.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 41, fotos:PHOTOS.tokyo },
  { dia: 14, fecha: "7 Ago", titulo: "teamLab Borderless + Roppongi", descripcion: "Arte inmersivo y skyline.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 49, fotos:PHOTOS.teamlab },
  { dia: 15, fecha: "8 Ago", titulo: "Regreso · HND → VLC", descripcion: "Traslado a Haneda y vuelo.", puntos:[COORD.shinjuku, COORD.hnd, COORD.valencia], marcadores:[{pos:COORD.hnd,label:"Haneda (HND)"},{pos:COORD.valencia,label:"Valencia"}], costePorPersona: 18, fotos:[PHOTOS.hero] },
];

function boundsFromPoints(points) {
  if (!points || !points.length) return undefined;
  const lats = points.map(p=>p[0]);
  const lngs = points.map(p=>p[1]);
  const southWest = [Math.min(...lats), Math.min(...lngs)];
  const northEast = [Math.max(...lats), Math.max(...lngs)];
  return [southWest, northEast];
}

function Badge({icon, children}){
  const Icon = icon;
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/10 border border-white/15 text-white/80"><Icon className="w-3.5 h-3.5"/>{children}</span>
}

export default function PaginaViajeJapon(){
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [velocidad, setVelocidad] = useState(4000);
  const actual = ITINERARIO[idx];
  const totalCoste = useMemo(()=> ITINERARIO.reduce((a,d)=>a+(d.costePorPersona||0),0),[]);
  const [lightbox, setLightbox] = useState({ open:false, src:null, i:0 });

  useEffect(()=>{
    if(!auto) return;
    const t = setTimeout(()=> setIdx(i => (i+1)%ITINERARIO.length), velocidad);
    return ()=> clearTimeout(t);
  }, [auto, idx, velocidad]);

  return (
    <div className="min-h-screen text-white bg-slate-950 bg-grid">
      {/* HERO */}
      <section className="relative hero overflow-hidden">
        <img src={PHOTOS.hero} alt="Tokio" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl">
            <div className="flex items-center gap-2 text-sky-300 mb-3">
              <Sparkles className="w-5 h-5"/><span>Itinerario familiar — Julio/Agosto</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">¡Nos vamos a Japón!</h1>
            <p className="mt-4 text-slate-200/90 max-w-2xl">Recorre día a día el plan, con mapas, fotos y todo lo esencial para que os hagáis una idea clara del viaje.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={()=>setAuto(a=>!a)} className="px-4 py-2 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold shadow">
                {auto ? "Pausar pase automático" : "Reproducir pase automático"}
              </button>
              <a href="#itinerario" className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20">Ver itinerario</a>
            </div>
            <div className="mt-6 flex gap-2">
              <Badge icon={Images}>Galería por día</Badge>
              <Badge icon={Compass}>Mapa de cada ruta</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CUERPO */}
      <main id="itinerario" className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAPA */}
        <div className="lg:col-span-2 rounded-3xl glass shadow-xl border border-white/10">
          <div className="px-5 pt-5">
            <div className="text-lg md:text-xl font-semibold flex items-center gap-2 text-sky-300">
              <MapPin className="w-5 h-5"/> Día {actual.dia}: {actual.titulo}
            </div>
            <p className="text-sm text-slate-300">{actual.fecha}</p>
          </div>
          <div className="p-5">
            <div className="h-[52vh] w-full overflow-hidden rounded-2xl">
              <MapaEtapa puntos={actual.puntos} marcadores={actual.marcadores} />
            </div>
          </div>
        </div>

        {/* LATERAL */}
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
              <div className="text-xs text-slate-300">Automáticas desde Unsplash</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actual.fotos?.map((src, i) => (
                  <button key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:scale-[1.02] transition"
                    onClick={()=> setLightbox({open:true, src, i})}>
                    <img src={src} alt={`Foto ${i+1} día ${actual.dia}`} className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* TIMELINE */}
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

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="relative max-w-5xl w-[92%]">
              <button onClick={()=> setLightbox({open:false, src:null, i:0})}
                className="absolute -top-10 right-0 text-white/80 hover:text-white">
                <X className="w-8 h-8" />
              </button>
              <img src={lightbox.src} alt="Foto" className="w-full h-auto rounded-2xl shadow-2xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-6xl mx-auto px-4 pb-10 pt-4 text-sm text-slate-300">
        <p>Imágenes servidas desde Unsplash por palabras clave. Cuando quieras, las cambiamos por fotos propias o de bancos con licencia y las empaquetamos dentro del proyecto.</p>
      </footer>
    </div>
  );
}

function MapaEtapa({ puntos = [], marcadores = [] }){
  const bounds = useMemo(()=> boundsFromPoints(puntos), [puntos]);
  const center = puntos?.[0] || [35.0,135.0];
  return (
    <MapContainer center={center} zoom={6} bounds={bounds || undefined} className="h-full w-full rounded-xl overflow-hidden">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {marcadores?.map((m, i)=>(
        <Marker position={m.pos} key={i}><Popup>{m.label}</Popup></Marker>
      ))}
      {puntos && puntos.length>1 && <Polyline positions={puntos} />}
    </MapContainer>
  );
}
