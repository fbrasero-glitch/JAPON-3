
import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Play, Pause, ChevronLeft, ChevronRight, MapPin, CalendarRange, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

const ITINERARIO = [
  { dia: 1, fecha: "25 Jul", titulo: "Salida Valencia → Osaka (KIX)", descripcion: "Vuelo multi‑ciudad. Noche a bordo.", puntos: [COORD.valencia, COORD.kix], marcadores:[{pos:COORD.valencia,label:"Valencia (VLC)"},{pos:COORD.kix,label:"Kansai Intl (KIX)"}], costePorPersona: 0, fotos:["./dia-1.svg"] },
  { dia: 2, fecha: "26 Jul", titulo: "Llegada a Osaka · Traslado a Umeda", descripcion: "Bus KIX→Umeda. Paseo Umeda Sky.", puntos:[COORD.kix, COORD.osaka], marcadores:[{pos:COORD.kix,label:"KIX"},{pos:COORD.osaka,label:"Osaka/Umeda"}], costePorPersona: 49, fotos:["./dia-2.svg"] },
  { dia: 3, fecha: "27 Jul", titulo: "USJ (Nintendo World)", descripcion: "Día completo en Universal Studios Japan.", puntos:[COORD.osaka], marcadores:[{pos:COORD.osaka,label:"Osaka"}], costePorPersona: 70, fotos:["./dia-3.svg"] },
  { dia: 4, fecha: "28 Jul", titulo: "Osaka ciudad", descripcion: "Castillo y Dotonbori.", puntos:[COORD.osaka], marcadores:[{pos:COORD.osaka,label:"Osaka"}], costePorPersona: 41, fotos:["./dia-4.svg"] },
  { dia: 5, fecha: "29 Jul", titulo: "Nara → Kioto", descripcion: "Templos y ciervos; tarde en Kioto.", puntos:[COORD.osaka, COORD.nara, COORD.kyoto], marcadores:[{pos:COORD.nara,label:"Nara"},{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 48, fotos:["./dia-5.svg"] },
  { dia: 6, fecha: "30 Jul", titulo: "Kioto Oeste", descripcion: "Arashiyama y Kinkaku‑ji.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:["./dia-6.svg"] },
  { dia: 7, fecha: "31 Jul", titulo: "Kioto Este", descripcion: "Kiyomizu‑dera, Gion.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:["./dia-7.svg"] },
  { dia: 8, fecha: "1 Ago", titulo: "Fushimi Inari + Uji", descripcion: "Torii al amanecer; té en Uji.", puntos:[COORD.kyoto], marcadores:[{pos:COORD.kyoto,label:"Kioto"}], costePorPersona: 41, fotos:["./dia-8.svg"] },
  { dia: 9, fecha: "2 Ago", titulo: "Kioto → Odawara (Shinkansen) · Coche · Hakone", descripcion: "Recogida de coche; onsen.", puntos:[COORD.kyoto, COORD.odawara, COORD.hakone], marcadores:[{pos:COORD.odawara,label:"Odawara"},{pos:COORD.hakone,label:"Hakone"}], costePorPersona: 86, fotos:["./dia-9.svg"] },
  { dia: 10, fecha: "3 Ago", titulo: "Hakone → Kawaguchiko", descripcion: "Miradores del Monte Fuji.", puntos:[COORD.hakone, COORD.kawaguchiko], marcadores:[{pos:COORD.kawaguchiko,label:"Kawaguchiko"}], costePorPersona: 64, fotos:["./dia-10.svg"] },
  { dia: 11, fecha: "4 Ago", titulo: "Kawaguchiko → Tokio (Fuji Excursion)", descripcion: "Devolución del coche; tren a Shinjuku.", puntos:[COORD.kawaguchiko, COORD.shinjuku], marcadores:[{pos:COORD.kawaguchiko,label:"Kawaguchiko"},{pos:COORD.shinjuku,label:"Tokio / Shinjuku"}], costePorPersona: 61, fotos:["./dia-11.svg"] },
  { dia: 12, fecha: "5 Ago", titulo: "Tokyo Disney/DisneySea", descripcion: "Día en parque.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 65, fotos:["./dia-12.svg"] },
  { dia: 13, fecha: "6 Ago", titulo: "Shibuya–Harajuku–Meiji + Odaiba", descripcion: "Cruce de Shibuya; bahía al atardecer.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 41, fotos:["./dia-13.svg"] },
  { dia: 14, fecha: "7 Ago", titulo: "teamLab Borderless + Roppongi", descripcion: "Arte inmersivo y skyline.", puntos:[COORD.shinjuku], marcadores:[{pos:COORD.shinjuku,label:"Tokio"}], costePorPersona: 49, fotos:["./dia-14.svg"] },
  { dia: 15, fecha: "8 Ago", titulo: "Regreso · HND → VLC", descripcion: "Traslado a Haneda y vuelo.", puntos:[COORD.shinjuku, COORD.hnd, COORD.valencia], marcadores:[{pos:COORD.hnd,label:"Haneda (HND)"},{pos:COORD.valencia,label:"Valencia"}], costePorPersona: 18, fotos:["./dia-15.svg"] },
];

function boundsFromPoints(points) {
  if (!points || !points.length) return undefined;
  const lats = points.map(p=>p[0]);
  const lngs = points.map(p=>p[1]);
  const southWest = [Math.min(...lats), Math.min(...lngs)];
  const northEast = [Math.max(...lats), Math.max(...lngs)];
  return [southWest, northEast];
}

export default function PaginaViajeJapon(){
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const [velocidad, setVelocidad] = useState(4500);
  const actual = ITINERARIO[idx];
  const totalCoste = useMemo(()=> ITINERARIO.reduce((a,d)=>a+(d.costePorPersona||0),0),[]);
  const [lightbox, setLightbox] = useState({ open:false, src:null, i:0 });

  useEffect(()=>{
    if(!auto) return;
    const t = setTimeout(()=> setIdx(i => (i+1)%ITINERARIO.length), velocidad);
    return ()=> clearTimeout(t);
  }, [auto, idx, velocidad]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarRange className="w-6 h-6" />
            <h1 className="text-xl md:text-2xl font-semibold">Viaje a Japón — Itinerario</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 rounded-2xl border" onClick={()=>setAuto(a=>!a)}>
              {auto ? <span className="inline-flex items-center gap-2"><Pause className="w-4 h-4"/>Pausar</span> : <span className="inline-flex items-center gap-2"><Play className="w-4 h-4"/>Autoplay</span>}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span>Velocidad</span>
              <input type="range" min={2500} max={9000} step={500} value={velocidad} onChange={(e)=>setVelocidad(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl shadow-sm border">
          <div className="px-4 pt-4">
            <div className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5"/> Día {actual.dia}: {actual.titulo}
            </div>
            <p className="text-sm text-gray-500">{actual.fecha}</p>
          </div>
          <div className="p-4">
            <div className="h-[50vh] w-full overflow-hidden rounded-xl">
              <MapaEtapa puntos={actual.puntos} marcadores={actual.marcadores} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl shadow-sm border">
            <div className="px-4 pt-4">
              <div className="text-lg font-semibold">Detalle del día</div>
            </div>
            <div className="p-4">
              <AnimatePresence mode="wait">
                <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>
                  <p className="text-gray-700 mb-3">{actual.descripcion}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>Coste estimado por persona: <span className="font-semibold">{EUR(actual.costePorPersona)}</span></div>
                    <div>Total estimado en destino: <span className="font-semibold">{EUR(totalCoste)}</span></div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button className="px-3 py-2 rounded-2xl border" onClick={()=> setIdx(i => (i-1+ITINERARIO.length)%ITINERARIO.length)}><span className="inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4"/>Anterior</span></button>
                <div className="text-xs text-gray-500">{idx+1} / {ITINERARIO.length}</div>
                <button className="px-3 py-2 rounded-2xl border bg-gray-900 text-white" onClick={()=> setIdx(i => (i+1)%ITINERARIO.length)}><span className="inline-flex items-center gap-2">Siguiente<ChevronRight className="w-4 h-4"/></span></button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border">
            <div className="px-4 pt-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Fotos del día</div>
              <div className="text-xs text-gray-500">Puedes reemplazar los archivos dia-*.svg por tus fotos .jpg/.png</div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {actual.fotos?.map((src, i) => (
                  <button key={i} className="group relative overflow-hidden rounded-xl border"
                    onClick={()=> setLightbox({open:true, src, i})}>
                    <img src={src} alt={`Foto ${i+1} día ${actual.dia}`} className="w-full h-28 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 pt-4 text-sm text-gray-500">
        <p>Versión sin carpetas. Coloca tus fotos en esta misma raíz y cambia los nombres en el itinerario si quieres.</p>
      </footer>

      <AnimatePresence>
        {lightbox.open && (
          <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="relative max-w-5xl w-[92%]">
              <button onClick={()=> setLightbox({open:false, src:null, i:0})}
                className="absolute -top-10 right-0 text-white/80 hover:text-white">
                <X className="w-8 h-8" />
              </button>
              <img src={lightbox.src} alt="Foto" className="w-full h-auto rounded-xl shadow-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MapaEtapa({ puntos = [], marcadores = [] }){
  const bounds = useMemo(()=> boundsFromPoints(puntos), [puntos]);
  const center = puntos?.[0] || [35.0,135.0];
  return (
    <MapContainer center={center} zoom={6} bounds={bounds || undefined} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {marcadores?.map((m, i)=>(
        <Marker position={m.pos} key={i}><Popup>{m.label}</Popup></Marker>
      ))}
      {puntos && puntos.length>1 && <Polyline positions={puntos} />}
    </MapContainer>
  );
}
