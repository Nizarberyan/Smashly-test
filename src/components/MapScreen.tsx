import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
const NativeWebView: any = WebView;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeable } from './SwipeableTabScreen';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Star,
  Users2,
  GraduationCap,
  Search,
  ExternalLink,
  Phone,
  RefreshCw,
  Target,
  Sparkles,
  X,
} from 'lucide-react-native';

import {
  apiFetchPublicMap,
  apiFetchPublicClubs,
  SmashlyPublicPlayer,
  SmashlyPublicCoach,
  SmashlyPublicClub,
} from '../api/smashlyClient';
import { colors } from '../theme/colors';

type MapCategory = 'all' | 'players' | 'coaches' | 'clubs';

interface MapScreenProps {
  onGoHome?: () => void;
  onOpenMatches?: () => void;
  onBookCoach?: () => void;
}

let cachedMapData: {
  players: SmashlyPublicPlayer[];
  coaches: SmashlyPublicCoach[];
  clubs: SmashlyPublicClub[];
  timestamp: number;
} | null = null;
const MAP_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const MapScreen: React.FC<MapScreenProps> = memo(({
  onGoHome,
  onOpenMatches,
  onBookCoach,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [loading, setLoading] = useState(!cachedMapData);
  const [players, setPlayers] = useState<SmashlyPublicPlayer[]>(cachedMapData?.players || []);
  const [coaches, setCoaches] = useState<SmashlyPublicCoach[]>(cachedMapData?.coaches || []);
  const [clubs, setClubs] = useState<SmashlyPublicClub[]>(cachedMapData?.clubs || []);

  const [category, setCategory] = useState<MapCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'player' | 'coach' | 'club';
    data: any;
  } | null>(null);

  // Fetch real map data from Smashly AI backend with smart cache
  const loadMapData = useCallback(async (forceRefresh = false) => {
    const isFresh = cachedMapData && Date.now() - cachedMapData.timestamp < MAP_CACHE_TTL_MS;
    if (isFresh && !forceRefresh) {
      setPlayers(cachedMapData!.players);
      setCoaches(cachedMapData!.coaches);
      setClubs(cachedMapData!.clubs);
      setLoading(false);
      return;
    }

    if (!cachedMapData) {
      setLoading(true);
    }
    try {
      const [mapRes, clubsRes] = await Promise.all([
        apiFetchPublicMap(),
        apiFetchPublicClubs(),
      ]);
      const newPlayers = mapRes.players || [];
      const newCoaches = mapRes.coaches || [];
      const newClubs = clubsRes || [];

      cachedMapData = {
        players: newPlayers,
        coaches: newCoaches,
        clubs: newClubs,
        timestamp: Date.now(),
      };

      setPlayers(newPlayers);
      setCoaches(newCoaches);
      setClubs(newClubs);
    } catch (err) {
      console.warn('Error loading public map data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Recenter map handler
  const handleRecenter = () => {
    const js = `window.recenterMap && window.recenterMap(43.2965, 5.3698, 11); true;`;
    if (Platform.OS === 'web') {
      (iframeRef.current?.contentWindow as any)?.recenterMap?.(43.2965, 5.3698, 11);
    } else {
      webViewRef.current?.injectJavaScript(js);
    }
  };

  // Sync category and search query into WebView on the fly (NO HTML RELOAD)
  useEffect(() => {
    const js = `window.applyFilter && window.applyFilter(${JSON.stringify(category)}, ${JSON.stringify(searchQuery)}); true;`;
    if (Platform.OS === 'web') {
      if (iframeRef.current?.contentWindow) {
        (iframeRef.current.contentWindow as any).applyFilter?.(category, searchQuery);
      }
    } else {
      webViewRef.current?.injectJavaScript(js);
    }
  }, [category, searchQuery]);

  // Handle message from WebView (clicking a pin on the map)
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'SELECT_PIN') {
        if (msg.category === 'player') {
          const p = players.find((item) => String(item.id) === String(msg.id));
          if (p) setSelectedItem({ type: 'player', data: p });
        } else if (msg.category === 'coach') {
          const c = coaches.find((item) => String(item.id) === String(msg.id));
          if (c) setSelectedItem({ type: 'coach', data: c });
        } else if (msg.category === 'club') {
          const cl = clubs.find((item) => String(item.id) === String(msg.id));
          if (cl) setSelectedItem({ type: 'club', data: cl });
        }
      }
    } catch (e) {
      console.warn('WebView message parse error:', e);
    }
  };

  // Launch native navigation
  const openNavigation = (lat: number, lng: number, name: string) => {
    const gmapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    if (Platform.OS === 'android') {
      const gmapsNavUrl = `google.navigation:q=${lat},${lng}`;
      Linking.canOpenURL(gmapsNavUrl)
        .then((supported) => {
          if (supported) return Linking.openURL(gmapsNavUrl);
          return Linking.openURL(gmapsWebUrl);
        })
        .catch(() => Linking.openURL(gmapsWebUrl));
    } else {
      Linking.openURL(gmapsWebUrl);
    }
  };

  // Build Leaflet HTML string ONCE per dataset (never on every keystroke)
  const leafletHtml = useMemo(() => {
    const playersJson = JSON.stringify(players);
    const coachesJson = JSON.stringify(coaches);
    // Limit clubs slice to 250 for instant mobile rasterization
    const clubsJson = JSON.stringify(clubs.slice(0, 250));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      box-sizing: border-box;
    }
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #0f172a;
      overflow: hidden;
    }

    /* GPU layer promotion for silky 60-120fps panning & zooming */
    #map, .leaflet-pane, .leaflet-tile-pane, .leaflet-marker-pane, .leaflet-map-pane {
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
      will-change: transform;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      perspective: 1000px;
    }

    .leaflet-control-zoom { display: none !important; }
    .leaflet-bottom { bottom: 92px !important; }
    .leaflet-control-attribution {
      background: rgba(15, 23, 42, 0.85) !important;
      color: #64748b !important;
      font-size: 8px !important;
      padding: 2px 6px !important;
      border-top-left-radius: 6px;
    }
    .leaflet-control-attribution a { color: #38bdf8 !important; text-decoration: none; }

    /* Custom Pins with Hardware Layer Elevation */
    .pin-player {
      background: #2563eb;
      color: #ffffff;
      border: 2px solid #60a5fa;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 11px;
      box-shadow: 0 2px 8px rgba(37,99,235,0.6);
      cursor: pointer;
      transform: translate3d(0,0,0);
      -webkit-transform: translate3d(0,0,0);
      will-change: transform;
      contain: layout style paint;
    }
    .pin-coach {
      background: #f97316;
      color: #ffffff;
      border: 2px solid #fdba74;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(249,115,22,0.6);
      cursor: pointer;
      transform: translate3d(0,0,0);
      -webkit-transform: translate3d(0,0,0);
      will-change: transform;
      contain: layout style paint;
    }
    .pin-club {
      background: #10b981;
      color: #ffffff;
      border: 2px solid #6ee7b7;
      border-radius: 8px;
      padding: 2px 5px;
      font-weight: 700;
      font-size: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(16,185,129,0.5);
      white-space: nowrap;
      cursor: pointer;
      transform: translate3d(0,0,0);
      -webkit-transform: translate3d(0,0,0);
      will-change: transform;
      contain: layout style paint;
    }
    .leaflet-tooltip.dark-tip {
      background: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #38bdf8 !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      font-weight: 700 !important;
      font-size: 11px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
    }
    .leaflet-tooltip-top.dark-tip::before {
      border-top-color: #38bdf8 !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Hardware accelerated Leaflet setup
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
      wheelDebounceTime: 40
    }).setView([43.2965, 5.3698], 10); // Marseille center

    // CartoDB Dark Matter layer with caching
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2m38_1_1a27ed67c11b8a29ad8d6195', {
      maxZoom: 18,
      subdomains: 'abcd',
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 6,
      attribution: '&copy; Smashly AI &bull; CartoDB'
    }).addTo(map);

    var rawPlayers = ${playersJson};
    var rawCoaches = ${coachesJson};
    var rawClubs = ${clubsJson};

    function sendSelection(category, id, lat, lng) {
      if (lat && lng) {
        map.panTo([lat - 0.022, lng], { animate: true, duration: 0.35 });
      }
      var msg = JSON.stringify({ type: 'SELECT_PIN', category: category, id: id });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(msg, '*');
      }
    }

    // High performance LayerGroups
    var playerGroup = L.layerGroup().addTo(map);
    var coachGroup = L.layerGroup().addTo(map);
    var clubGroup = L.layerGroup().addTo(map);

    // 1. Build Player Markers
    var playerItems = [];
    rawPlayers.forEach(function(p) {
      if (!p.lat || !p.lng) return;
      var icon = L.divIcon({
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        html: '<div class="pin-player">N' + (p.level || 5) + '</div>'
      });
      var m = L.marker([p.lat, p.lng], { icon: icon });
      m.bindTooltip(p.name + ' · Niveau ' + p.level + ' (' + p.city + ')', {
        direction: 'top',
        className: 'dark-tip',
        offset: [0, -12]
      });
      m.on('click', function() { sendSelection('player', p.id, p.lat, p.lng); });
      playerGroup.addLayer(m);
      playerItems.push({
        marker: m,
        searchStr: ((p.name || '') + ' ' + (p.last_name || '') + ' ' + (p.city || '')).toLowerCase(),
        lat: p.lat,
        lng: p.lng
      });
    });

    // 2. Build Coach Markers
    var coachItems = [];
    rawCoaches.forEach(function(c) {
      if (!c.lat || !c.lng) return;
      var icon = L.divIcon({
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: '<div class="pin-coach">🎓</div>'
      });
      var m = L.marker([c.lat, c.lng], { icon: icon });
      m.bindTooltip('Coach ' + c.name + ' · ' + (c.hourly_rate ? c.hourly_rate + '€/h' : 'Pro') + ' (' + c.city + ')', {
        direction: 'top',
        className: 'dark-tip',
        offset: [0, -14]
      });
      m.on('click', function() { sendSelection('coach', c.id, c.lat, c.lng); });
      coachGroup.addLayer(m);
      coachItems.push({
        marker: m,
        searchStr: ((c.name || '') + ' ' + (c.last_name || '') + ' ' + (c.city || '')).toLowerCase(),
        lat: c.lat,
        lng: c.lng
      });
    });

    // 3. Build Club Markers
    var clubItems = [];
    rawClubs.forEach(function(cl) {
      if (!cl.lat || !cl.lng) return;
      var icon = L.divIcon({
        className: '',
        iconSize: [40, 20],
        iconAnchor: [20, 10],
        html: '<div class="pin-club">🎾 ' + (cl.nb_courts ? cl.nb_courts + 'p' : '') + '</div>'
      });
      var m = L.marker([cl.lat, cl.lng], { icon: icon });
      m.bindTooltip(cl.name + ' (' + cl.city + ')', {
        direction: 'top',
        className: 'dark-tip',
        offset: [0, -10]
      });
      m.on('click', function() { sendSelection('club', cl.id, cl.lat, cl.lng); });
      clubGroup.addLayer(m);
      clubItems.push({
        marker: m,
        searchStr: ((cl.name || '') + ' ' + (cl.city || '')).toLowerCase(),
        lat: cl.lat,
        lng: cl.lng
      });
    });

    // Real-time zero-reload GPU filtering
    window.applyFilter = function(category, query) {
      var q = (query || '').toLowerCase().trim();

      // Players
      playerGroup.clearLayers();
      if (category === 'all' || category === 'players') {
        for (var i = 0; i < playerItems.length; i++) {
          if (!q || playerItems[i].searchStr.indexOf(q) !== -1) {
            playerGroup.addLayer(playerItems[i].marker);
          }
        }
      }

      // Coaches
      coachGroup.clearLayers();
      if (category === 'all' || category === 'coaches') {
        for (var j = 0; j < coachItems.length; j++) {
          if (!q || coachItems[j].searchStr.indexOf(q) !== -1) {
            coachGroup.addLayer(coachItems[j].marker);
          }
        }
      }

      // Clubs
      clubGroup.clearLayers();
      if (category === 'all' || category === 'clubs') {
        for (var k = 0; k < clubItems.length; k++) {
          if (!q || clubItems[k].searchStr.indexOf(q) !== -1) {
            clubGroup.addLayer(clubItems[k].marker);
          }
        }
      }
    };

    window.recenterMap = function(lat, lng, zoom) {
      map.flyTo([lat || 43.2965, lng || 5.3698], zoom || 11, {
        animate: true,
        duration: 0.6
      });
    };
  </script>
</body>
</html>
    `;
  }, [players, coaches, clubs]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <MapPin size={20} color="#ffffff" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Smashly Map</Text>
            <Text style={styles.headerSubtitle}>
              {players.length} Joueurs · {coaches.length} Coachs · {clubs.length} Clubs
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.refreshBtn}
            onPress={() => loadMapData(true)}
            accessibilityRole="button"
            accessibilityLabel="Actualiser la carte"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : (
              <RefreshCw size={17} color="#94a3b8" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={onGoHome}
            accessibilityRole="button"
            accessibilityLabel="Retour à l'accueil"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar with Clear Button */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchInner}>
          <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par ville (Marseille, Paris...), joueur ou club..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.searchClearBtn}
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Category Tabs with Horizontal Scrolling */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsRow}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterChip, category === 'all' && styles.filterChipActiveAll]}
            onPress={() => setCategory('all')}
          >
            <Text style={[styles.filterChipText, category === 'all' && styles.filterChipTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterChip, category === 'players' && styles.filterChipActivePlayers]}
            onPress={() => setCategory('players')}
          >
            <Users2 size={13} color={category === 'players' ? '#ffffff' : '#94a3b8'} style={{ marginRight: 5 }} />
            <Text style={[styles.filterChipText, category === 'players' && styles.filterChipTextActive]}>
              Joueurs ({players.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterChip, category === 'coaches' && styles.filterChipActiveCoaches]}
            onPress={() => setCategory('coaches')}
          >
            <GraduationCap size={13} color={category === 'coaches' ? '#ffffff' : '#94a3b8'} style={{ marginRight: 5 }} />
            <Text style={[styles.filterChipText, category === 'coaches' && styles.filterChipTextActive]}>
              Coachs ({coaches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.filterChip, category === 'clubs' && styles.filterChipActiveClubs]}
            onPress={() => setCategory('clubs')}
          >
            <MapPin size={13} color={category === 'clubs' ? '#ffffff' : '#94a3b8'} style={{ marginRight: 5 }} />
            <Text style={[styles.filterChipText, category === 'clubs' && styles.filterChipTextActive]}>
              Clubs ({clubs.length > 250 ? '250+' : clubs.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Interactive Leaflet Map with Full Hardware Acceleration */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef as any}
            srcDoc={leafletHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <NativeWebView
            ref={webViewRef}
            source={{ html: leafletHtml }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            androidHardwareAccelerationDisabled={false}
            androidLayerType="hardware"
            renderToHardwareTextureAndroid={true}
            overScrollMode="never"
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            cacheEnabled={true}
            cacheMode="LOAD_DEFAULT"
            mixedContentMode="always"
            originWhitelist={['*']}
            onLoadEnd={() => {
              const js = `window.applyFilter && window.applyFilter(${JSON.stringify(category)}, ${JSON.stringify(searchQuery)}); true;`;
              webViewRef.current?.injectJavaScript(js);
            }}
          />
        )}

        {/* Floating Recenter Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.recenterFab}
          onPress={handleRecenter}
        >
          <Target size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Selected Item Floating Card - Raised above persistent BottomNavBar */}
      {selectedItem && (
        <View
          style={[
            styles.detailDrawer,
            {
              bottom: Math.max(insets.bottom, 12) + 76,
            },
          ]}
        >
          {/* Top handle and Close Button */}
          <View style={styles.drawerTopBar}>
            <View style={styles.drawerHandle} />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.drawerCloseBtn}
              onPress={() => setSelectedItem(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View style={styles.drawerContentRow}>
            {selectedItem.type === 'player' && (
              <>
                <View style={styles.drawerAvatarBox}>
                  <Text style={styles.drawerAvatarText}>
                    {selectedItem.data.name[0] || 'J'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.drawerTitleRow}>
                    <Text style={styles.drawerName}>
                      {selectedItem.data.name} {selectedItem.data.last_name || ''}
                    </Text>
                    <View style={styles.drawerLevelBadge}>
                      <Text style={styles.drawerLevelText}>
                        Niveau {selectedItem.data.level}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.drawerSub}>📍 {selectedItem.data.city}</Text>
                  {selectedItem.data.clubs && selectedItem.data.clubs.length > 0 && (
                    <Text style={styles.drawerClubs}>
                      Club : {selectedItem.data.clubs.join(', ')}
                    </Text>
                  )}
                </View>
              </>
            )}

            {selectedItem.type === 'coach' && (
              <>
                <View style={[styles.drawerAvatarBox, { backgroundColor: '#f97316' }]}>
                  <GraduationCap size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.drawerTitleRow}>
                    <Text style={styles.drawerName}>
                      Coach {selectedItem.data.name} {selectedItem.data.last_name || ''}
                    </Text>
                    <View style={[styles.drawerLevelBadge, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                      <Text style={[styles.drawerLevelText, { color: '#f97316' }]}>
                        {selectedItem.data.hourly_rate ? `${selectedItem.data.hourly_rate} €/h` : 'Pro'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.drawerSub}>📍 {selectedItem.data.city}</Text>
                  {selectedItem.data.specialties && (
                    <Text style={styles.drawerClubs}>
                      {selectedItem.data.specialties.join(' · ')}
                    </Text>
                  )}
                </View>
              </>
            )}

            {selectedItem.type === 'club' && (
              <>
                <View style={[styles.drawerAvatarBox, { backgroundColor: '#10b981' }]}>
                  <MapPin size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.drawerTitleRow}>
                    <Text style={styles.drawerName}>{selectedItem.data.name}</Text>
                    {selectedItem.data.nb_courts && (
                      <View style={[styles.drawerLevelBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                        <Text style={[styles.drawerLevelText, { color: '#10b981' }]}>
                          {selectedItem.data.nb_courts} pistes
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.drawerSub}>
                    {selectedItem.data.address || selectedItem.data.city}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Drawer Actions */}
          <View style={styles.drawerActionsRow}>
            {selectedItem.type === 'club' ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.actionBtnPrimary}
                  onPress={() =>
                    openNavigation(
                      selectedItem.data.lat,
                      selectedItem.data.lng,
                      selectedItem.data.name
                    )
                  }
                >
                  <Navigation size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Itinéraire GPS</Text>
                </TouchableOpacity>

                {selectedItem.data.phone && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.actionBtnSecondary}
                    onPress={() => Linking.openURL(`tel:${selectedItem.data.phone}`)}
                  >
                    <Phone size={15} color="#38bdf8" style={{ marginRight: 6 }} />
                    <Text style={styles.actionBtnSecondaryText}>Appeler</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : selectedItem.type === 'coach' ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.actionBtnPrimary, { backgroundColor: '#f97316' }]}
                onPress={() => {
                  onBookCoach?.();
                  Alert.alert('Réservation Coach', `Prise de contact avec Coach ${selectedItem.data.name} initiée !`);
                }}
              >
                <GraduationCap size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Réserver un cours</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.actionBtnPrimary}
                onPress={() =>
                  Alert.alert(
                    'Invitation Smashly',
                    `Demande de match envoyée à ${selectedItem.data.name} !`
                  )
                }
              >
                <Users2 size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Inviter à jouer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    paddingVertical: 6,
  },
  searchClearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  filterTabsContainer: {
    backgroundColor: '#0f172a',
    paddingBottom: 8,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActiveAll: {
    backgroundColor: '#38bdf8',
    borderColor: '#7dd3fc',
  },
  filterChipActivePlayers: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
  },
  filterChipActiveCoaches: {
    backgroundColor: '#f97316',
    borderColor: '#fdba74',
  },
  filterChipActiveClubs: {
    backgroundColor: '#10b981',
    borderColor: '#6ee7b7',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  detailDrawer: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: '#0f172a',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 24,
    zIndex: 1000,
  },
  drawerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 18,
    marginBottom: 6,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  drawerCloseBtn: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  drawerLevelBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drawerLevelText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  drawerSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  drawerClubs: {
    color: '#cbd5e1',
    fontSize: 11.5,
    marginTop: 3,
  },
  drawerActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnSecondaryText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  recenterFab: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
});
