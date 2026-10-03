import React, { useState } from 'react';
import { MapPin, Search, Compass, Loader2, ExternalLink, ShieldCheck, Map as MapIcon, Building2, PhoneCall } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { findNearbyOffices } from '../services/geminiService';

const QUICK_CITIES = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai'];

interface OfficePin {
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  phone?: string;
}

export const NearbyOffices: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocationName, setActiveLocationName] = useState<string | null>('Delhi NCR');
  const [results, setResults] = useState<{ text: string; links: { title: string; uri: string }[] } | null>(null);
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 });
  const [offices, setOffices] = useState<OfficePin[]>([
    {
      name: 'Cyber Crime Police Station (Delhi Headquarters)',
      address: 'Police Station Cyber Crime, Dwarka Sector 17, New Delhi',
      lat: 28.5921,
      lng: 77.0460,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cyber+Crime+Police+Station+Delhi',
      phone: '1930'
    },
    {
      name: 'CERT-In National Response Center',
      address: 'Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi',
      lat: 28.5888,
      lng: 77.2370,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CERT-In+Electronics+Niketan',
      phone: '1800 11 2211'
    },
    {
      name: 'Special Cell Cyber Crime Unit (IFSO)',
      address: 'Sector 16, Rohini, New Delhi',
      lat: 28.7300,
      lng: 77.1200,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=IFSO+Cyber+Cell+Rohini',
      phone: '1930'
    }
  ]);
  const [selectedOffice, setSelectedOffice] = useState<OfficePin | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const extractLinks = (response: any, fallbackQuery?: string) => {
    const links: { title: string; uri: string }[] = [];

    if (Array.isArray(response.groundingChunks)) {
      response.groundingChunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({
            title: chunk.maps.title || 'Official Cyber Cell',
            uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title)}`,
          });
        } else if (chunk.web) {
          links.push({
            title: chunk.web.title || 'Cyber Crime Response Portal',
            uri: chunk.web.uri,
          });
        }
      });
    }

    if (links.length === 0 && response.text) {
      const markdownLinkRegex = /\[([^\]]+)\]\((https:\/\/[^\)]+)\)/g;
      let match;
      while ((match = markdownLinkRegex.exec(response.text)) !== null) {
        links.push({
          title: match[1],
          uri: match[2],
        });
      }
    }

    if (links.length === 0) {
      const q = fallbackQuery || 'Cyber Crime Police Station';
      links.push({
        title: `Google Maps Location Search: ${q}`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Cyber Crime Police Station ' + q)}`,
      });
    }

    return links;
  };

  const handleGPSScan = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter a city name below.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locName = `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
          setActiveLocationName(locName);
          setCenterCoords({ lat: latitude, lng: longitude });

          const response = await findNearbyOffices(latitude, longitude);
          const links = extractLinks(response, locName);

          if (response.structuredOffices && response.structuredOffices.length > 0) {
            setOffices(response.structuredOffices);
          }

          setResults({
            text: response.text || 'Verified cybersecurity office locations retrieved.',
            links,
          });
        } catch (err: any) {
          console.error(err);
          handleCitySearch('Delhi NCR');
        } fontally: {
          setLoading(false);
        }
      },
      (err) => {
        setError("GPS permission denied. Scanning default city center...");
        handleCitySearch('Delhi NCR');
      },
      { timeout: 8000 }
    );
  };

  const handleCitySearch = async (city?: string) => {
    const targetQuery = city || searchQuery || 'Delhi NCR';

    setLoading(true);
    setError(null);
    setActiveLocationName(targetQuery);

    try {
      const response = await findNearbyOffices(null, null, targetQuery);
      const links = extractLinks(response, targetQuery);

      if (response.centerCoords) {
        setCenterCoords(response.centerCoords);
      }
      if (response.structuredOffices && response.structuredOffices.length > 0) {
        setOffices(response.structuredOffices);
      }

      setResults({
        text: response.text || `Verified Cybersecurity Units in ${targetQuery}`,
        links,
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to query Google Maps for " + targetQuery);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            <MapPin size={14} />
            <span>Google Maps Platform Interactive Integration</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center">
            <span>Cybersecurity Units Nearby</span>
            <div className="rotate-3d inline-block ml-3">
              <MapPin className="text-blue-500" size={28} />
            </div>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Locate official government cyber crime cells, CERT response centers, and police digital safety hubs using integrated Google Maps JS API & Advanced Markers.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-400 shrink-0">
          <ShieldCheck size={16} />
          <span>Google Maps JS API Active</span>
        </div>
      </header>

      {/* Control Panel: GPS Scan + City Search */}
      <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <button
            onClick={handleGPSScan}
            disabled={loading}
            className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 transition-all shrink-0"
          >
            <Compass size={18} />
            <span>DETECT MY GPS LOCATION</span>
          </button>

          <div className="text-xs text-gray-500 font-bold uppercase hidden lg:block">— OR —</div>

          <div className="flex items-center space-x-2 w-full lg:w-96">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                placeholder="Enter city, state or pincode..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              onClick={() => handleCitySearch()}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold text-xs rounded-xl border border-white/10 transition-all shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick City Chips */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/5 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">Popular Centers:</span>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySearch(city)}
              className="px-3 py-1 bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white rounded-lg text-[11px] font-mono border border-white/10 transition-all whitespace-nowrap"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid gap-8">
        {loading && (
          <div className="charcoal-bg p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-blue-400 font-bold tracking-widest animate-pulse uppercase text-xs">
              Querying Google Maps API for {activeLocationName}...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-center text-xs">
            {error}
          </div>
        )}

        {!loading && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Interactive Google Map */}
            <div className="lg:col-span-2 charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapIcon size={18} className="text-blue-400" />
                  <h3 className="text-base font-extrabold text-white">
                    Interactive Google Map ({activeLocationName})
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/30">
                  {offices.length} Units Mapped
                </span>
              </div>

              {/* Interactive Map Component */}
              <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 relative">
                <APIProvider apiKey={apiKey}>
                  <Map
                    defaultCenter={centerCoords}
                    center={centerCoords}
                    defaultZoom={12}
                    zoom={12}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                    gestureHandling="greedy"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {offices.map((off, idx) => (
                      <AdvancedMarker
                        key={idx}
                        position={{ lat: off.lat, lng: off.lng }}
                        title={off.name}
                        onClick={() => setSelectedOffice(off)}
                      >
                        <Pin background="#3b82f6" glyphColor="#ffffff" borderColor="#1e40af" />
                      </AdvancedMarker>
                    ))}

                    {selectedOffice && (
                      <InfoWindow
                        position={{ lat: selectedOffice.lat, lng: selectedOffice.lng }}
                        onCloseClick={() => setSelectedOffice(null)}
                      >
                        <div className="p-2 text-black text-xs font-sans max-w-xs space-y-1">
                          <h4 className="font-extrabold text-blue-900">{selectedOffice.name}</h4>
                          <p className="text-gray-700 text-[11px]">{selectedOffice.address}</p>
                          {selectedOffice.phone && (
                            <div className="font-bold text-gray-900 text-[11px]">Helpline: {selectedOffice.phone}</div>
                          )}
                          <a
                            href={selectedOffice.mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 text-blue-600 font-bold underline text-[11px]"
                          >
                            Open in Google Maps &rarr;
                          </a>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>

              {/* Text Description Box */}
              {results?.text && (
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap bg-black/30 p-4 rounded-xl border border-white/5 font-mono">
                  {results.text}
                </div>
              )}
            </div>

            {/* Right Column: Office Cards & Helplines */}
            <div className="space-y-6">
              <div className="charcoal-bg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
                  <Building2 size={16} className="mr-2 text-blue-400" />
                  Verified Units List ({offices.length})
                </h4>

                <div className="space-y-3">
                  {offices.map((off, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedOffice(off);
                        setCenterCoords({ lat: off.lat, lng: off.lng });
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedOffice?.name === off.name
                          ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h5 className="font-bold text-xs text-white">{off.name}</h5>
                        <ExternalLink size={12} className="text-gray-500 shrink-0 ml-1" />
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{off.address}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">Helpline: {off.phone || '1930'}</span>
                        <a
                          href={off.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 font-bold hover:underline"
                        >
                          View Map &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* National Helpline Info Box */}
              <div className="bg-blue-950/20 p-5 rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-blue-300 uppercase tracking-wider">
                  <PhoneCall size={16} className="text-blue-400 animate-pulse" />
                  <span>National Cyber Helpline</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">1930</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  National Cyber Financial Helpline (1930) operates 24x7 for immediate bank account lien freezing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyOffices;
