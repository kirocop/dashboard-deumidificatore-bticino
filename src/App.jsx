import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('domotica'); // 'domotica' | 'energia'
  const [expandedZoneId, setExpandedZoneId] = useState(null); // ID della zona ingrandita
  
  // Stati per pannelli collassabili
  const [scenariosCollapsed, setScenariosCollapsed] = useState(true);
  const [plugsCollapsed, setPlugsCollapsed] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/status');
      if (!response.ok) {
        throw new Error('Impossibile caricare i dati dal server domotico.');
      }
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendControl = async (payload) => {
    try {
      const response = await fetch('http://localhost:3001/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.state);
        }
      }
    } catch (err) {
      console.error('Errore comando:', err);
    }
  };

  const handleTempChange = (zoneId, delta) => {
    if (!data) return;
    const zone = data.zones[zoneId];
    const newTarget = parseFloat((zone.tempTarget + delta).toFixed(1));
    sendControl({ type: 'temperature', zoneId, tempTarget: newTarget });
  };

  const handleZonePowerToggle = (zoneId, currentPower) => {
    sendControl({ type: 'zonePower', zoneId, power: !currentPower });
  };

  const handleDehumidifierToggle = () => {
    if (!data) return;
    sendControl({ type: 'dehumidifier', dehumidifier: { power: !data.dehumidifier.power } });
  };

  const handlePlugToggle = (plugId, currentPower) => {
    sendControl({ type: 'plug', plugId, plugPower: !currentPower });
  };

  const handleScenarioClick = (scenarioId) => {
    sendControl({ type: 'scenario', scenarioId });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="status-dot online" style={{ width: '30px', height: '30px' }}></div>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-title)' }}>Caricamento Casa Barbato...</p>
      </div>
    );
  }

  // Grafico storico energia 24h
  const getSvgPath = (history) => {
    if (!history || history.length === 0) return '';
    const width = 800;
    const height = 180;
    const maxVal = Math.max(...history.map(d => d.watts), 300);
    const minVal = Math.min(...history.map(d => d.watts), 50);
    const range = maxVal - minVal || 1;

    const points = history.map((d, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((d.watts - minVal) / range) * (height - 30) - 15;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Grafico storico temperatura 24h (corretto con mapping degli oggetti {time, temp})
  const getZoneTempPath = (tempHistory) => {
    if (!tempHistory || tempHistory.length === 0) return '';
    const width = 400;
    const height = 100;
    const temps = tempHistory.map(d => d.temp);
    const maxVal = Math.max(...temps) + 0.5;
    const minVal = Math.min(...temps) - 0.5;
    const range = maxVal - minVal || 1;

    const points = tempHistory.map((d, index) => {
      const x = (index / (tempHistory.length - 1)) * width;
      const y = height - ((d.temp - minVal) / range) * (height - 20) - 10;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div>
          <h1>{data?.config?.title || 'La Mia Casa Smart'}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {data?.config?.description || 'Domotica Integrata & Consumi'}
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <button 
            style={{ padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px', background: activeTab === 'domotica' ? 'var(--color-primary)' : 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={() => setActiveTab('domotica')}
          >
            🏠 Domotica
          </button>
          <button 
            style={{ padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px', background: activeTab === 'energia' ? 'var(--color-primary)' : 'transparent', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
            onClick={() => setActiveTab('energia')}
          >
            ⚡ Energia
          </button>
        </div>

        <div className="status-badge" style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`status-dot ${data?.modeReal ? 'online' : 'simulation'}`}></span>
            <span>Bticino</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`status-dot ${data?.legrandConnected ? 'online' : 'simulation'}`}></span>
            <span>Legrand</span>
          </div>
        </div>
      </header>

      {/* Tab: Clima e Domotica */}
      {activeTab === 'domotica' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="zones-grid">
            {data && Object.keys(data.zones).map((id) => {
              const zone = data.zones[id];
              return (
                <div key={id} className="zone-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s' }}>
                  <div>
                    <div className="zone-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="zone-title">{zone.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="zone-id" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Raffrescamento</span>
                        <div 
                          className={`switch small-switch ${zone.power ? 'active' : ''}`}
                          onClick={() => handleZonePowerToggle(id, zone.power)}
                          style={{ cursor: 'pointer' }}
                        ></div>
                      </div>
                    </div>

                    {/* Regolazione termostato ad arco e pulsanti laterali ben spaziati */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '1rem 0 1.5rem 0', minHeight: '190px', position: 'relative' }}>
                      
                      {/* Pulsante MENO a sinistra */}
                      <button 
                        className="temp-btn" 
                        onClick={() => handleTempChange(id, -0.5)}
                        disabled={!zone.power}
                        style={{ width: '42px', height: '42px', fontSize: '1.2rem', opacity: zone.power ? 1 : 0.15, flexShrink: 0, zIndex: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        －
                      </button>

                      {/* Display Arco centrale con scritte ben distanziate */}
                      <div style={{ position: 'relative', width: '100%', maxWidth: '180px', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto', overflow: 'visible', position: 'absolute', top: 0, left: 0 }}>
                          <path 
                            d="M 20 110 A 80 80 0 0 1 180 110" 
                            fill="none" 
                            stroke={zone.power ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.03)'} 
                            strokeWidth="10" 
                            strokeLinecap="round" 
                          />
                          {zone.power && (
                            <path 
                              d="M 20 110 A 80 80 0 0 1 180 110" 
                              fill="none" 
                              stroke="url(#arc-gradient)" 
                              strokeWidth="10" 
                              strokeLinecap="round" 
                              strokeDasharray="251" 
                              strokeDashoffset={251 - (251 * ((zone.tempTarget - 16) / 16))} 
                            />
                          )}
                          <defs>
                            <linearGradient id="arc-gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Blocco testi interno all'arco, posizionato con flex layout pulito */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5, marginTop: '20px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Misurata {zone.tempActual}°C
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: '600', marginTop: '0.2rem' }}>
                            Umidità: {zone.humidity}%
                          </span>
                          <span style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'var(--font-title)', marginTop: '0.2rem', color: zone.power ? 'white' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
                            {zone.power ? `${zone.tempTarget}°C` : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {/* Pulsante PIÙ a destra */}
                      <button 
                        className="temp-btn" 
                        onClick={() => handleTempChange(id, 0.5)}
                        disabled={!zone.power}
                        style={{ width: '42px', height: '42px', fontSize: '1.2rem', opacity: zone.power ? 1 : 0.15, flexShrink: 0, zIndex: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        ＋
                      </button>

                    </div>

                    {/* Variazione Termica con mini-grafico cliccabile per ingrandimento */}
                    {zone.power && (
                      <div 
                        onClick={() => setExpandedZoneId(expandedZoneId === id ? null : id)}
                        style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1rem', borderRadius: '16px', border: '1px solid var(--panel-border)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                        className="drift-box-interactive"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            📈 Storico Termico: 
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Clicca per ingrandire)</span>
                          </span>
                          <span style={{ fontWeight: '700', color: zone.drift < 0 ? '#60a5fa' : zone.drift > 0 ? '#f87171' : 'var(--color-text-muted)' }}>
                            {zone.drift > 0 ? `+${zone.drift}` : zone.drift}°C/h
                          </span>
                        </div>
                        
                        <svg viewBox="0 0 400 100" style={{ width: '100%', height: '35px', overflow: 'visible', opacity: 0.8 }}>
                          <path 
                            d={getZoneTempPath(zone.tempHistory)} 
                            fill="none" 
                            stroke={zone.drift < 0 ? '#60a5fa' : zone.drift > 0 ? '#f87171' : 'var(--color-primary)'} 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />
                        </svg>

                        {expandedZoneId === id && (
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fadeIn 0.25s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                              <span>24 Ore fa: {zone.tempHistory[0]?.temp}°C</span>
                              <span>Ora: {zone.tempActual}°C</span>
                            </div>
                            <svg viewBox="0 0 400 100" style={{ width: '100%', height: '90px', overflow: 'visible', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '12px' }}>
                              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                              <path 
                                d={getZoneTempPath(zone.tempHistory)} 
                                fill="none" 
                                stroke={zone.drift < 0 ? '#3b82f6' : zone.drift > 0 ? '#ef4444' : 'var(--color-secondary)'} 
                                strokeWidth="4" 
                                strokeLinecap="round"
                              />
                              {zone.tempHistory.map((d, idx) => {
                                const x = (idx / (zone.tempHistory.length - 1)) * 400;
                                const temps = zone.tempHistory.map(h => h.temp);
                                const maxVal = Math.max(...temps) + 0.5;
                                const minVal = Math.min(...temps) - 0.5;
                                const range = maxVal - minVal || 1;
                                const y = 100 - ((d.temp - minVal) / range) * 80 - 10;
                                return (
                                  <circle 
                                    key={idx} 
                                    cx={x} 
                                    cy={y} 
                                    r="4" 
                                    fill="white" 
                                    stroke={zone.drift < 0 ? '#3b82f6' : zone.drift > 0 ? '#ef4444' : 'var(--color-secondary)'} 
                                    strokeWidth="2" 
                                  />
                                );
                              })}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                              <span>{zone.tempHistory[0]?.time}</span>
                              <span>{zone.tempHistory[Math.round(zone.tempHistory.length / 2)]?.time}</span>
                              <span>{zone.tempHistory[zone.tempHistory.length - 1]?.time}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Scenari collassabili */}
            <div className="zone-card" style={{ height: 'fit-content' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: scenariosCollapsed ? '0' : '1.2rem' }}
                onClick={() => setScenariosCollapsed(!scenariosCollapsed)}
              >
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', margin: 0 }}>✨ Scenari Domotici</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{scenariosCollapsed ? 'Espandi ＋' : 'Riduci －'}</span>
              </div>
              {!scenariosCollapsed && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', animation: 'fadeIn 0.2s ease-out' }}>
                  {data?.scenarios.map(scen => (
                    <button 
                      key={scen.id}
                      onClick={() => handleScenarioClick(scen.id)}
                      style={{ padding: '1rem', borderRadius: '16px', background: scen.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
                    >
                      {scen.name === 'Buonanotte' ? '🌙' : scen.name === 'Tutto Spento' ? '🔌' : scen.name === 'Ho Caldo' ? '🔥' : '💧'} {scen.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prese collassabili */}
            <div className="zone-card" style={{ height: 'fit-content' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: plugsCollapsed ? '0' : '1.2rem' }}
                onClick={() => setPlugsCollapsed(!plugsCollapsed)}
              >
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.15rem', margin: 0 }}>🔌 Prese Connesse</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{plugsCollapsed ? 'Espandi ＋' : 'Riduci －'}</span>
              </div>
              {!plugsCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', animation: 'fadeIn 0.2s ease-out' }}>
                  {data?.smartPlugs.map(plug => (
                    <div key={plug.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.12)', padding: '0.8rem 1.2rem', borderRadius: '16px', border: '1px solid var(--panel-border)' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{plug.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Assorbimento: {plug.watts} W</div>
                      </div>
                      <div className="switch-container" onClick={() => handlePlugToggle(plug.id, plug.power)}>
                        <div className={`switch small-switch ${plug.power ? 'active' : ''}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deumidificatore */}
          <section className="dehum-card">
            <div className="dehum-info">
              <div className="dehum-icon">💧</div>
              <div className="dehum-title-desc">
                <h2>Deumidificatore Centralizzato</h2>
                <p>Stato attuale: {data?.dehumidifier.power ? 'In funzione (Auto)' : 'Spento'}</p>
              </div>
            </div>
            <div className="dehum-controls">
              <div className="switch-container" onClick={handleDehumidifierToggle}>
                <div className={`switch ${data?.dehumidifier.power ? 'active' : ''}`}></div>
                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                  {data?.dehumidifier.power ? 'ATTIVO' : 'SPENTO'}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Energia */}
      {activeTab === 'energia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="zone-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Potenza Istantanea Assorbita</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '3.5rem', fontWeight: '800', color: '#fbbf24', margin: '0.5rem 0' }}>
                {data?.energy.powerConsumption} W
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Tensione di rete: {data?.energy.voltage} V</div>
            </div>

            <div className="zone-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Consumo Giornaliero Totale</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '3.5rem', fontWeight: '800', color: '#60a5fa', margin: '0.5rem 0' }}>
                {data?.energy.dailyTotalKwh} kWh
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{data?.config?.title || 'Casa'} • Taratura Standard</div>
            </div>
          </div>

          <div className="zone-card">
            <h3 style={{ fontFamily: 'var(--font-title)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>📊 Andamento Consumi Elettrici (24 Ore)</h3>
            <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--panel-border)' }}>
              <svg viewBox="0 0 800 180" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <line x1="0" y1="30" x2="800" y2="30" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="5,5" />

                <path 
                  d={getSvgPath(data?.energy.history)} 
                  fill="none" 
                  stroke="url(#gradient-energy)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />

                <defs>
                  <linearGradient id="gradient-energy" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                <span>{data?.energy.history[0]?.time}</span>
                <span>{data?.energy.history[Math.round(data.energy.history.length / 2)]?.time}</span>
                <span>{data?.energy.history[data.energy.history.length - 1]?.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
        Ultimo aggiornamento: {data && new Date(data.lastUpdate).toLocaleTimeString()}
      </footer>
    </div>
  );
}

export default App;
