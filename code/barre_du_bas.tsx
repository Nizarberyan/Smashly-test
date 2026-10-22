// Extrait de référence (Chat.tsx, lignes 5819 à 5907) : ne compile pas seul, à traduire en React Native
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
