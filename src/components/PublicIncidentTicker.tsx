"use client";
import React, { useEffect, useState } from 'react';

interface CriticalIncident {
  title: string;
  event_date: string;
  actor: string;
  entity: string;
}

export default function PublicIncidentTicker() {
  const [incidents, setIncidents] = useState<CriticalIncident[]>([]);

  useEffect(() => {
    fetch('/api/incidents/public-alerts')
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json() as Promise<CriticalIncident[]>; // Cast the promise itself
      })
      .then((data) => {
        setIncidents(data); // Now 'data' is officially CriticalIncident[]
      })
      .catch((err) => {
        console.error("TICKER_FETCH_ERROR:", err);
        setIncidents([]);
      });
  }, []);

  if (incidents.length === 0) return null;

  return (
    <div className="bg-red-600 text-white font-mono overflow-hidden py-2 border-y border-red-900 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
      <div className="flex whitespace-nowrap animate-marquee items-center">
        {incidents.map((incident, idx) => (
          <span key={idx} className="flex items-center mx-8 text-[11px] font-black uppercase tracking-tighter">
            <span className="bg-white text-red-600 px-2 mr-3 py-0.5">CRITICAL_ALERT</span>
            {new Date(incident.event_date).toLocaleDateString()}
            {" — "} 
            {incident.entity} 
            {" // "} 
            {incident.actor}
            {": "}
            <span className="ml-2 font-normal italic">&quot;{incident.title}&quot;</span>
            <span className="ml-6 text-red-300">{"///"}</span>
          </span>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}