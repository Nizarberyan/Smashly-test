// Extrait de référence (Chat.tsx, lignes 5340 à 5914) : ne compile pas seul, à traduire en React Native
            <div className="flex-1 flex items-center justify-center p-8 pt-24 md:pt-8 overflow-hidden bg-[linear-gradient(to_bottom,rgba(2,6,23,0.35),rgba(2,6,23,0.25),rgba(2,6,23,0.45)),url('/hero-welcome-test.jpg')] bg-cover bg-center md:bg-[linear-gradient(to_bottom,rgba(2,6,23,0),rgba(2,6,23,0),rgba(2,6,23,0.06)),url('/hero-welcome-test.jpg')] md:bg-cover md:bg-center">
              
              {/* Toggle profil discret - En haut à droite - DESKTOP UNIQUEMENT */}
              {hasCoachProfile && hasPlayerProfile && (
                <div className="hidden md:block absolute top-6 right-6 group z-10">
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-full p-1 flex gap-1 border border-slate-700/30 shadow-lg">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeProfile === 'player'
                        ? 'bg-blue-500/90 text-white'
                        : 'text-slate-500'
                    }`}>
                      {t('chat.joueur')}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeProfile === 'coach'
                        ? 'bg-orange-500/90 text-white'
                        : 'text-slate-500'
                    }`}>
                      {t('chat.coach')}
                    </div>
                  </div>
                  
                  {/* Tooltip au hover */}
                  <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-slate-700/90 backdrop-blur-sm text-white text-[10px] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg whitespace-nowrap pointer-events-none">
                    {t('chat.switchViaLaPageDeTonProfil')} 
                  </div>
                </div>
              )}
              
              <div className="max-w-2xl w-full space-y-6">
                
                {/* Texte changeant au-dessus */}
                <h2 
                  className="text-2xl font-semibold text-white text-center mb-6 select-none"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', textShadow: '0 2px 16px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.9)' }}
                >
                  {welcomePhrase || t('chat.quePuisjeFairePourToiAujourd')}
                </h2>
                
                {/* Zone d'input au centre - Plus arrondie */}
                <div className="relative">
                {/* Desktop : même layout que mobile */}
                <div data-tutorial="chat-input" className="hidden md:block bg-[#0f1a30] rounded-2xl shadow-2xl shadow-black/60 border border-[#2a3b5c] px-3 pt-3 pb-2">
                  <textarea spellCheck={false}
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      const newHeight = e.target.value === '' ? 44 : Math.min(e.target.scrollHeight, 160);
                      e.target.style.height = newHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!loading && input.trim()) { onSend(); e.currentTarget.style.height = '44px'; }
                      }
                    }}
                    placeholder={profileCardPending ? '👆 ' + t('chat.repondsProfil') : (typedPlaceholder || ROOT_TW)}
                    disabled={profileCardPending}
                    className={`w-full bg-transparent px-1 py-1.5 focus:outline-none resize-none text-sm text-slate-100 placeholder-slate-400 leading-6 border-0 overflow-y-hidden ${profileCardPending ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ height: '44px', minHeight: '44px', maxHeight: '160px', overflowY: 'hidden' }}
                    rows={1}
                    autoFocus={window.innerWidth >= 768}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {/* Ampoule */}
                      <div className="relative group/tipd">
                        <button data-tutorial="tip-btn" className="w-9 h-9 rounded-xl hover:bg-slate-700/60 flex items-center justify-center transition-all">
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                            <path d="M9 18h6"/><path d="M10 22h4"/>
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-700 text-white text-xs rounded-xl px-3 py-2 opacity-0 invisible group-hover/tipd:opacity-100 group-hover/tipd:visible transition-all shadow-xl z-10 pointer-events-none">
                          {t('home.tip.text')}
                        </div>
                      </div>
                      {/* Partager */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            const url = 'https://smashlyai.com';
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(url).then(() => {
                                setShowCopiedToast(true);
                                setTimeout(() => setShowCopiedToast(false), 2000);
                              }).catch(() => {});
                            }
                          }}
                          className="w-9 h-9 rounded-xl hover:bg-slate-700/60 flex items-center justify-center transition-all"
                        >
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>
                        {showCopiedToast && (
                          <div className="absolute bottom-full left-0 mb-2 bg-green-600 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                            ✓ {t('chat.liencopie')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Micro */}
                      <button
                        data-tutorial="voice-btn"
                        onClick={() => {
                          const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (!SR) return;
                          if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
                          const rec = new SR();
                          recognitionRef.current = rec;
                          rec.lang = 'fr-FR';
                          rec.interimResults = false;
                          rec.onstart = () => setIsListening(true);
                          rec.onend = () => setIsListening(false);
                          rec.onerror = () => setIsListening(false);
                          rec.onresult = (e: any) => {
                            const transcript = e.results[0][0].transcript;
                            setInput(prev => prev ? prev + ' ' + transcript : transcript);
                          };
                          rec.start();
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-slate-700/60 text-slate-400'}`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>
                      {/* Envoyer */}
                      <button
                        onClick={() => { if (isGenerating) stopGenerating(); else onSend(); }}
                      disabled={!isGenerating && (loading || !input.trim())}
                      className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 grid place-items-center disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white rounded-sm grid place-items-center"><div className="w-1.5 h-1.5 bg-white rounded-[1px]" /></div>
                      ) : loading ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-white" />
                      )}
                    </button>
                    </div>
                  </div>
                </div>
                {/* Mobile : textarea + bouton bas droite */}
                <div data-tutorial="chat-input-mobile" className="md:hidden bg-[#0f1a30] rounded-2xl shadow-2xl shadow-black/60 border border-[#2a3b5c] px-3 pt-3 pb-2">
                  <textarea spellCheck={false}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!loading && input.trim()) { onSend(); e.currentTarget.style.height = '64px'; }
                      }
                    }}
                    placeholder={profileCardPending ? '👆 ' + t('chat.repondsProfil') : (typedPlaceholder || ROOT_TW)}
                    disabled={profileCardPending}
                    className={`w-full bg-transparent px-1 py-1 focus:outline-none resize-none text-sm text-slate-100 placeholder-slate-400 leading-6 border-0 overflow-y-hidden ${profileCardPending ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{ height: '52px', minHeight: '52px', maxHeight: '52px' }}
                    rows={2}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {/* Ampoule - astuce */}
                      <div className="relative group/tip">
                        <button data-tutorial="tip-btn-mobile" className="w-9 h-9 rounded-xl hover:bg-slate-700/60 flex items-center justify-center transition-all">
                          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                            <path d="M9 18h6"/><path d="M10 22h4"/>
                          </svg>
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-700 text-white text-xs rounded-xl px-3 py-2 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all shadow-xl z-10 pointer-events-none">
                          {t('home.tip.text')}
                        </div>
                      </div>
                      {/* Partager */}
                      <button
                        onClick={() => {
                        const url = 'https://smashlyai.com';
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(url).then(() => {
                            setShowCopiedToast(true);
                            setTimeout(() => setShowCopiedToast(false), 2000);
                          }).catch(() => {});
                        } else {
                          const el = document.createElement('textarea');
                          el.value = url;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          setShowCopiedToast(true);
                          setTimeout(() => setShowCopiedToast(false), 2000);
                        }
                      }}
                        className="w-9 h-9 rounded-xl hover:bg-slate-700/60 flex items-center justify-center transition-all relative"
                      >
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        {showCopiedToast && (
                          <div className="absolute bottom-full left-0 mb-2 bg-green-600 text-white text-xs rounded-lg px-3 py-1.5 shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
                            ✓ {t('chat.liencopie')}
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Micro */}
                      <button
                        data-tutorial="voice-btn-mobile"
                        onClick={() => {
                          const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (!SR) return;
                          if (isListening) {
                            recognitionRef.current?.stop();
                            setIsListening(false);
                            return;
                          }
                          const rec = new SR();
                          recognitionRef.current = rec;
                          rec.lang = 'fr-FR';
                          rec.interimResults = false;
                          rec.maxAlternatives = 1;
                          rec.onstart = () => setIsListening(true);
                          rec.onend = () => setIsListening(false);
                          rec.onerror = () => setIsListening(false);
                          rec.onresult = (e: any) => {
                            const transcript = e.results[0][0].transcript;
                            setInput(prev => prev ? prev + ' ' + transcript : transcript);
                          };
                          rec.start();
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isListening
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : 'hover:bg-slate-700/60 text-slate-400'
                        }`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>
                      {/* Envoyer */}
                      <button
                        onClick={() => { if (isGenerating) stopGenerating(); else onSend(); }}
                        disabled={!isGenerating && (loading || !input.trim())}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-300 grid place-items-center disabled:opacity-40"
                      >
                        {isGenerating ? (
                          <div className="w-3.5 h-3.5 border-2 border-white rounded-sm grid place-items-center"><div className="w-1.5 h-1.5 bg-white rounded-[1px]" /></div>
                        ) : loading ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <ArrowUp className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {chatMode === 'matching' && ['pro', 'gold'].includes(currentUserPlan) && (
                  <div className="absolute -bottom-6 left-3 group/network">
                      <button
                        onClick={() => setNetworkOnly(prev => !prev)}
                        className={`h-6 px-3 rounded-b-lg flex items-center justify-center gap-1.5 shadow-lg transition-all duration-200 hover:scale-105 ${
                      networkOnly
                        ? 'bg-blue-500 shadow-blue-500/40'
                        : 'bg-slate-600 shadow-slate-600/20'
                    }`}
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  </button>
                  <div className="absolute bottom-8 left-0 hidden group-hover/network:block z-50 w-48 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl pointer-events-none">
                    <p className="text-xs text-slate-200 font-semibold mb-0.5">{t('chat.monReseau')}</p>
                    <p className="text-[11px] text-slate-400 leading-snug">{t('chat.monReseauDescription')}</p>
                  </div>
                  </div>
                )}
                </div>

                {/* Sélection du mode */}
                <div className="space-y-3">
                  <p className="text-center text-white text-sm select-none" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.75)' }}>{t('chat.choisisTonModeDeDiscussion')}</p>
                  {isMobileLayout ? (() => {
                    const switchMode = (m: 'matching' | 'assistant') => {
                      if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                        abortControllerRef.current = null;
                      }
                      setIsGenerating(false);
                      setLoading(false);
                      setChatMode(m);
                    };
                    const frontKey = chatMode === 'matching' ? 'matching' : 'assistant';
                    const modes = [
                      {
                        key: 'matching' as const, tutorial: 'mode-community', img: '/mascotte-communaute.png',
                        title: t('chat.communaut'), desc: t('chat.trouveDesJoueursEtCoachsRserveDesCrneaux'),
                        disabled: activeProfile === 'coach',
                        frontCls: 'bg-[#162a4d] border-blue-500 shadow-lg shadow-blue-500/25', badgeCls: 'bg-blue-500 text-white',
                      },
                      {
                        key: 'assistant' as const, tutorial: 'mode-assistant', img: '/mascotte-assistant.png',
                        title: t('chat.assistant'), desc: t('chat.conseilsTechniquesEtRecommandationsPadel'),
                        disabled: false,
                        frontCls: 'bg-[#3d341c] border-yellow-400 shadow-lg shadow-yellow-400/25', badgeCls: 'bg-yellow-400 text-gray-900',
                      },
                    ];
                    // Les 2 actions clés, mêmes icônes que le menu du bas
                    const actions = [
                      { key: 'join', label: t('chat.quickJoinMatch'), Icon: CalendarDays, onClick: () => { setOpenMatchesAutoCreate(false); setOpenMatchesFilter('nearby'); setShowOpenMatches(true); } },
                      activeProfile !== 'coach'
                        ? { key: 'coach', label: t('chat.quickBookCoach'), Icon: GraduationCap, onClick: () => setShowBrowseCoaches(true) }
                        : { key: 'players', label: t('chat.quickFindPlayers'), Icon: Map, onClick: () => setShowMapModal(true) },
                    ];
                    return (
                      <div className="flex gap-4 items-center w-full max-w-md mx-auto">
                        {/* Paquet de cartes : le mode actif devant, l'autre derrière (tap = switch) */}
                        <div className="relative w-[46%] sm:w-[200px] flex-shrink-0 h-[180px] md:h-[236px] mr-2">
                          {modes.map(m => {
                            const isFront = frontKey === m.key;
                            return (
                              <button key={m.key} type="button" data-tutorial={m.tutorial}
                                onClick={() => { if (!isFront && !m.disabled) switchMode(m.key); }}
                                disabled={m.disabled}
                                aria-pressed={isFront}
                                className={`absolute inset-0 rounded-xl border-2 px-3 py-3 transition-all duration-500 ease-out ${
                                  isFront
                                    ? `z-20 ${m.frontCls}`
                                    : `z-10 translate-x-3 -translate-y-3 rotate-6 scale-95 bg-[#0e1729] border-[#22314f] ${m.disabled ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100 hover:rotate-3 cursor-pointer'}`
                                }`}>
                                {isFront ? (
                                  <div className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badgeCls}`}>
                                    <Check className="w-2.5 h-2.5" />
                                    {t('chat.actif')}
                                  </div>
                                ) : !m.disabled && (
                                  <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-xl ring-4 ring-slate-900 ${m.key === 'matching' ? 'bg-blue-500' : 'bg-yellow-400'}`}><RefreshCw className={`w-5 h-5 ${m.key === 'matching' ? 'text-white' : 'text-gray-900'}`} strokeWidth={2.5} /></div>
                                )}
                                <div className="flex flex-col items-center justify-center gap-1 h-full">
                                  <img src={m.img} alt={m.title} className="h-16 md:h-24 w-auto object-contain" />
                                  <span className="text-sm font-bold text-white">{m.title}</span>
                                  <p className="text-[10px] md:text-[11px] text-slate-400 text-center leading-snug line-clamp-3">{m.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {/* Raccourcis : mêmes actions que le menu du bas, en clair */}
                        <div className="flex-1 min-w-0 flex flex-col rounded-2xl border-2 border-[#22314f] bg-[#0e1729] p-2 shadow-lg">
                          {actions.map((a, i) => (
                            <div key={a.key}>
                            {i > 0 && <div className="h-px bg-slate-600/70 mx-3 my-1" />}
                            <button type="button" onClick={a.onClick} data-tutorial={a.key === 'join' ? 'open-matches' : undefined}
                              className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-white/5 text-left active:scale-95 transition-all">
                              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-600 text-white">
                                <a.Icon className="w-5 h-5" />
                              </span>
                              <span className="text-sm font-bold text-slate-100 leading-tight">{a.label}</span>
                            </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })() : (
                  <div className="flex gap-4 justify-center w-full max-sm:items-stretch">
                    {/* Mode Communauté */}
                    <div className="relative group w-full sm:w-[200px]">
                      <button
                        data-tutorial="mode-community"
                        onClick={() => {
                          if (abortControllerRef.current) {
                            abortControllerRef.current.abort();
                            abortControllerRef.current = null;
                          }
                          setIsGenerating(false);
                          setLoading(false);
                          setChatMode('matching');
                        }}
                        disabled={activeProfile === 'coach'}
                        className={`
                          relative px-5 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] w-full sm:w-[200px]
                          ${activeProfile === 'coach' 
                            ? 'opacity-50 cursor-not-allowed bg-[#0e1729] border-[#22314f]'
                            : chatMode === 'matching'
                              ? 'bg-[#162a4d] border-blue-500 shadow-lg shadow-blue-500/25'
                              : 'bg-[#0e1729] border-[#22314f] hover:border-blue-500/50'
                          }
                        `}
                      >
                        {chatMode === 'matching' && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" />
                            {t('chat.actif')}
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <img src="/mascotte-communaute.png" className="h-20 md:h-32 w-auto object-contain mb-1 md:mb-[-8px]" />
                          <span className="text-sm font-bold text-white">
                            {t('chat.communaut')}
                          </span>
                          <p className="text-[11px] text-slate-400 text-center leading-snug">
                            {t('chat.trouveDesJoueursEtCoachsRserveDesCrneaux')}
                          </p>
                        </div>
                      </button>
                      
                      {/* Tooltip au hover - seulement si coach */}
                      {activeProfile === 'coach' && (
                        <div className="absolute bottom-full left-0 md:left-1/2 md:-translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-10 whitespace-nowrap">
                          {t('chatpages.modeReserveJoueurs')}
                          {/* Petite flèche en bas */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-700"></div>
                        </div>
                      )}
                    </div>
                    {/* Mode Assistant */}
                    <button
                      data-tutorial="mode-assistant"
                      onClick={() => {
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                          abortControllerRef.current = null;
                        }
                        setIsGenerating(false);
                        setLoading(false);
                        setChatMode('assistant');
                      }}
                      className={`
                        group relative px-5 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] w-full sm:w-[200px]
                        ${chatMode === 'assistant'
                          ? 'bg-[#3d341c] border-yellow-400 shadow-lg shadow-yellow-400/25'
                          : 'bg-[#0e1729] border-[#22314f] hover:border-yellow-400/50'
                        }
                      `}
                    >
                      {chatMode === 'assistant' && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" />
                          {t('chat.actif')}
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <img src="/mascotte-assistant.png" className="h-20 md:h-32 w-auto object-contain mb-1 md:mb-[-8px]" />
                        <span className="text-sm font-bold text-white">{t('chat.assistant')}</span>
                        <p className="text-[11px] text-slate-400 text-center leading-snug">
                          {t('chat.conseilsTechniquesEtRecommandationsPadel')}
                        </p>
                      </div>
                    </button>
                  </div>
                  )}
                </div>

                {/* <AddToHomeScreenBanner /> */}
                {/* Barre de navigation compacte - visible hors conversation, mobile uniquement */}
                {showWelcomeScreen && !isOnboarding && (
                  <div className="md:hidden grid grid-cols-[1fr_auto_1fr] items-center bg-slate-800/95 backdrop-blur-xl rounded-full border border-slate-500/50 px-2 py-2 mt-2 shadow-xl">
                    <div className="flex items-center justify-around">
                      <button
                        onClick={() => {
                          setHighlightUserId(null);
                          setNetworkMatchIds([]);
                          setNetworkSearchType('player');
                          setShowNetwork(true);
                        }}
                        className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                      >
                        <Users2 className="w-6 h-6" />
                      </button>
                      {activeProfile !== 'coach' && !isMobileLayout && (
                        <button
                          onClick={() => setShowBrowseCoaches(true)}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <GraduationCap className="w-6 h-6" />
                        </button>
                      )}
                      {!isMobileLayout && (
                        <button
                          onClick={() => {
                            setOpenMatchesAutoCreate(false);
                            setOpenMatchesFilter('mine');
                            setShowOpenMatches(true);
                          }}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <CalendarDays className="w-6 h-6" />
                        </button>
                      )}
                      {isMobileLayout && (
                        <button
                          onClick={() => setShowMapModal(true)}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <Map className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowQuickOrganizer(true)}
                      className="flex items-center justify-center w-11 h-11 rounded-full text-slate-900 shadow-md active:scale-90 transition-transform mx-2"
                      style={{ background: 'linear-gradient(to bottom, #3b82f6 15%, #facc15 85%)', backgroundImage: 'linear-gradient(to bottom in oklab, #3b82f6 15%, #facc15 85%)' }}
                    >
                      <Plus className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center justify-around">
                      {!isMobileLayout && (
                        <button
                          onClick={() => setShowBrowseCourts(true)}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <MapPin className="w-6 h-6" />
                        </button>
                      )}
                      {!isMobileLayout && (
                        <button
                          onClick={() => setShowMapModal(true)}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <Map className="w-6 h-6" />
                        </button>
                      )}
                      {isMobileLayout && (
                        <button
                          onClick={() => setShowBrowseCourts(true)}
                          className="p-2 text-slate-200 hover:text-white active:scale-90 transition-all"
                        >
                          <PadelCourtIcon className="w-[26px] h-[26px]" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/profil')}
                        className="p-0.5 flex-shrink-0 active:scale-90 transition-all"
                      >
                        {myPhotoUrl ? (
                          <img src={myPhotoUrl} alt="Profil" className="w-11 h-11 rounded-full object-cover" />
                        ) : (
                          <PadelBallLogo size={40} letter={initial} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <p className="hidden md:block text-xs text-slate-200 text-center mt-4 select-none" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.75)' }}>
                  <Heart className="h-3.5 w-3.5 text-red-500 inline animate-pulse" style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.6))' }} /> {t('chat.smashlyPeutParfoisSeTromperVrifiezLesInformationsImportantes')}
                </p>

              </div>
            </div>
