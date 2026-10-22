import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Platform,
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
  Car,
  ExternalLink,
  Plus,
  Minus,
  LocateFixed,
  CalendarDays,
  Globe2,
  Compass,
} from 'lucide-react-native';

import { colors } from '../theme/colors';

export interface ClubItem {
  id: string;
  name: string;
  city: string;
  distance: string;
  eta: string;
  rating: number;
  reviews: number;
  matchesCount: number;
  courtsCount: number;
  address: string;
  lat: number;
  lng: number;
  image: any;
}

interface MapScreenProps {
  onGoHome?: () => void;
  onOpenMatches?: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = memo(({
  onGoHome,
  onOpenMatches,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();
  const [mapType, setMapType] = useState<'plan' | 'satellite'>('plan');
  // Zoom Level Preset: 0.4 (Région), 0.85 (Agglo), 1.4 (Focus)
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [mapTouchActive, setMapTouchActive] = useState(false);

  const clubs: ClubItem[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Tennis Padel Club Venelles',
        city: 'Venelles · Aix Nord',
        distance: '4.2 km',
        eta: '8 min',
        rating: 4.9,
        reviews: 142,
        matchesCount: 2,
        courtsCount: 6,
        address: 'Chemin des Piboules, 13770 Venelles',
        lat: 43.5931,
        lng: 5.4811,
        image: require('../../images/venelles-court.jpg'),
      },
      {
        id: '2',
        name: 'Country Club Aixois',
        city: 'Aix-en-Provence · Centre',
        distance: '8.1 km',
        eta: '14 min',
        rating: 4.8,
        reviews: 98,
        matchesCount: 1,
        courtsCount: 4,
        address: '1195 Chemin des Cruyes, 13090 Aix-en-Provence',
        lat: 43.5297,
        lng: 5.4474,
        image: require('../../images/venelles-court.jpg'),
      },
      {
        id: '3',
        name: 'Mon Padel Plan de Campagne',
        city: 'Bouc-Bel-Air / Les Pennes',
        distance: '14 km',
        eta: '18 min',
        rating: 4.7,
        reviews: 86,
        matchesCount: 2,
        courtsCount: 5,
        address: 'Zone Commerciale Plan de Campagne, 13170',
        lat: 43.4382,
        lng: 5.3729,
        image: require('../../images/venelles-court.jpg'),
      },
      {
        id: '4',
        name: 'Padel Club Marseille Luminy',
        city: 'Marseille · Luminy / Sud',
        distance: '24 km',
        eta: '28 min',
        rating: 4.9,
        reviews: 215,
        matchesCount: 3,
        courtsCount: 8,
        address: 'Parc Scientifique de Luminy, 13009 Marseille',
        lat: 43.2325,
        lng: 5.4389,
        image: require('../../images/venelles-court.jpg'),
      },
      {
        id: '5',
        name: 'Padel Toulon Méditerranée',
        city: 'Toulon / Hyères · Est',
        distance: '68 km',
        eta: '52 min',
        rating: 4.8,
        reviews: 110,
        matchesCount: 1,
        courtsCount: 6,
        address: 'Rond-Point de la Mer, 83000 Toulon',
        lat: 43.1242,
        lng: 5.928,
        image: require('../../images/venelles-court.jpg'),
      },
      {
        id: '6',
        name: 'Tennis Padel Grand Avignon',
        city: 'Avignon · Nord-Ouest',
        distance: '75 km',
        eta: '55 min',
        rating: 4.7,
        reviews: 94,
        matchesCount: 2,
        courtsCount: 6,
        address: 'Avenue de la Durance, 84000 Avignon',
        lat: 43.9493,
        lng: 4.8055,
        image: require('../../images/venelles-court.jpg'),
      },
    ],
    []
  );

  const [selectedClub, setSelectedClub] = useState<ClubItem>(clubs[0]);

  // Leaflet numeric zoom level:
  // Région: 9, Agglo: 12, Focus: 15
  const computedZoom = useMemo(() => {
    if (zoomLevel <= 0.55) return 9;
    if (zoomLevel <= 1.1) return 12;
    return 15;
  }, [zoomLevel]);

  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<any>(null);

  // Self-contained, responsive OpenStreetMap + Leaflet HTML template
  const osmHtml = useMemo(() => {
    const clubsJson = JSON.stringify(
      clubs.map((c, i) => ({
        id: c.id,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        courtsCount: c.courtsCount,
        distance: c.distance,
        index: i + 1,
      }))
    );

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Smashly OpenStreetMap</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #osm-map {
      width: 100%;
      height: 100%;
      background: #0f172a;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Custom Pin Badges */
    .pin-container {
      position: relative;
      width: 34px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .pin-body {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ef4444;
      border: 2px solid #ffffff;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 12px;
      color: #ffffff;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      z-index: 2;
    }
    .pin-pointer {
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #ef4444;
      transition: border-top-color 0.25s;
      z-index: 1;
    }
    .pin-glow {
      position: absolute;
      top: -6px;
      left: -3px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.4);
      display: none;
      animation: pulseGlow 1.8s infinite ease-out;
      z-index: 0;
    }
    .pin-container.selected .pin-body {
      background: #0284c7;
      border-color: #38bdf8;
      transform: scale(1.22);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.85);
    }
    .pin-container.selected .pin-pointer {
      border-top-color: #0284c7;
      bottom: 0px;
    }
    .pin-container.selected .pin-glow {
      display: block;
    }
    @keyframes pulseGlow {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Tooltip Custom styling */
    .leaflet-tooltip.osm-tooltip {
      background-color: rgba(15, 23, 42, 0.92);
      color: #f8fafc;
      border: 1px solid #38bdf8;
      border-radius: 8px;
      padding: 4px 8px;
      font-weight: 600;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .leaflet-tooltip-top.osm-tooltip::before {
      border-top-color: #38bdf8;
    }

    /* Attribution link */
    .leaflet-control-attribution {
      background: rgba(15, 23, 42, 0.8) !important;
      color: #94a3b8 !important;
      font-size: 9px !important;
      padding: 2px 6px !important;
    }
    .leaflet-control-attribution a {
      color: #38bdf8 !important;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div id="osm-map"></div>
  <script>
    var clubs = ${clubsJson};
    var selectedId = "${selectedClub.id}";
    var currentType = "${mapType}";

    // Initialize Map
    var map = L.map('osm-map', {
      zoomControl: false,
      attributionControl: true
    }).setView([${selectedClub.lat}, ${selectedClub.lng}], ${computedZoom});

    // Street Layer: Standard OpenStreetMap
    var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    });

    // Satellite Layer: High-res Esri World Imagery
    var satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Esri Satellite'
    });

    if (currentType === 'satellite') {
      satLayer.addTo(map);
    } else {
      streetLayer.addTo(map);
    }

    var markerRefs = {};

    function buildIcon(index, isSelected) {
      return L.divIcon({
        className: 'pin-icon-wrap',
        iconSize: [34, 38],
        iconAnchor: [17, 34],
        html: '<div class="pin-container ' + (isSelected ? 'selected' : '') + '">' +
                '<div class="pin-glow"></div>' +
                '<div class="pin-body">' + index + '</div>' +
                '<div class="pin-pointer"></div>' +
              '</div>'
      });
    }

    clubs.forEach(function(club) {
      var isSelected = (club.id === selectedId);
      var m = L.marker([club.lat, club.lng], {
        icon: buildIcon(club.index, isSelected),
        zIndexOffset: isSelected ? 1000 : 100
      }).addTo(map);

      m.bindTooltip(club.name + ' (' + club.courtsCount + ' pistes)', {
        direction: 'top',
        offset: [0, -28],
        className: 'osm-tooltip'
      });

      m.on('click', function() {
        sendSelection(club.id);
      });

      markerRefs[club.id] = { marker: m, index: club.index };
    });

    function sendSelection(clubId) {
      var payload = JSON.stringify({ type: 'SELECT_CLUB', id: clubId });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(payload, '*');
      }
    }

    window.selectClub = function(clubId, lat, lng, zoom) {
      selectedId = clubId;
      Object.keys(markerRefs).forEach(function(id) {
        var item = markerRefs[id];
        var active = (id === clubId);
        item.marker.setIcon(buildIcon(item.index, active));
        item.marker.setZIndexOffset(active ? 1000 : 100);
      });
      if (lat && lng) {
        map.flyTo([lat, lng], zoom || map.getZoom(), {
          duration: 0.7,
          easeLinearity: 0.25
        });
      }
    };

    window.switchLayer = function(type) {
      currentType = type;
      if (type === 'satellite') {
        if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
        if (!map.hasLayer(satLayer)) satLayer.addTo(map);
      } else {
        if (map.hasLayer(satLayer)) map.removeLayer(satLayer);
        if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
      }
    };

    window.setZoom = function(z) {
      map.setZoom(z);
    };

    window.zoomIn = function() {
      map.zoomIn();
    };

    window.zoomOut = function() {
      map.zoomOut();
    };

    // Support Web iframe messaging
    window.addEventListener('message', function(evt) {
      try {
        var data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
        if (data.action === 'selectClub') {
          window.selectClub(data.id, data.lat, data.lng, data.zoom);
        } else if (data.action === 'switchLayer') {
          window.switchLayer(data.layer);
        } else if (data.action === 'setZoom') {
          window.setZoom(data.zoom);
        } else if (data.action === 'zoomIn') {
          window.zoomIn();
        } else if (data.action === 'zoomOut') {
          window.zoomOut();
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
    `;
  }, [clubs]);

  // Sync club selection & zoom changes with Leaflet
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            action: 'selectClub',
            id: selectedClub.id,
            lat: selectedClub.lat,
            lng: selectedClub.lng,
            zoom: computedZoom,
          }),
          '*'
        );
      } catch (e) {}
    } else {
      webViewRef.current?.injectJavaScript(
        `window.selectClub && window.selectClub('${selectedClub.id}', ${selectedClub.lat}, ${selectedClub.lng}, ${computedZoom}); true;`
      );
    }
  }, [selectedClub, computedZoom]);

  // Sync layer changes (Plan vs Satellite) with Leaflet
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ action: 'switchLayer', layer: mapType }),
          '*'
        );
      } catch (e) {}
    } else {
      webViewRef.current?.injectJavaScript(
        `window.switchLayer && window.switchLayer('${mapType}'); true;`
      );
    }
  }, [mapType]);

  // Web event listener for postMessage from Leaflet
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (e: MessageEvent) => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data?.type === 'SELECT_CLUB') {
            const found = clubs.find((c) => c.id === data.id);
            if (found) setSelectedClub(found);
          }
        } catch {}
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, [clubs]);

  // Handle message from React Native WebView (Android/iOS)
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'SELECT_CLUB') {
        const found = clubs.find((c) => c.id === data.id);
        if (found) {
          setSelectedClub(found);
        }
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  // Zoom management: delta steps
  const handleZoom = (delta: number) => {
    if (delta > 0) {
      if (Platform.OS === 'web') {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'zoomIn' }), '*');
      } else {
        webViewRef.current?.injectJavaScript('window.zoomIn && window.zoomIn(); true;');
      }
      setZoomLevel((prev) => Math.min(2.0, Math.round((prev + 0.3) * 100) / 100));
    } else {
      if (Platform.OS === 'web') {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'zoomOut' }), '*');
      } else {
        webViewRef.current?.injectJavaScript('window.zoomOut && window.zoomOut(); true;');
      }
      setZoomLevel((prev) => Math.max(0.35, Math.round((prev - 0.3) * 100) / 100));
    }
  };

  // Automatically detect OS and launch native route navigation (Google Maps on Android, Apple/Google Maps on iOS)
  const openDirections = (club: ClubItem) => {
    const gmapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${club.lat},${club.lng}`;

    if (Platform.OS === 'android') {
      const gmapsNavUrl = `google.navigation:q=${club.lat},${club.lng}`;
      const androidGeoUrl = `geo:${club.lat},${club.lng}?q=${club.lat},${club.lng}(${encodeURIComponent(club.name)})`;

      Linking.canOpenURL(gmapsNavUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(gmapsNavUrl);
          }
          return Linking.openURL(androidGeoUrl);
        })
        .catch(() => {
          Linking.openURL(androidGeoUrl).catch(() => {
            Linking.openURL(gmapsWebUrl);
          });
        });
    } else if (Platform.OS === 'ios') {
      const gmapsIosUrl = `comgooglemaps://?daddr=${club.lat},${club.lng}&directionsmode=driving`;
      const appleMapsUrl = `maps:0,0?q=${encodeURIComponent(club.name)}&daddr=${club.lat},${club.lng}&dirflg=d`;

      // If user has Google Maps installed on iOS, open in Google Maps; otherwise open native Apple Maps
      Linking.canOpenURL('comgooglemaps://')
        .then((hasGmaps) => {
          if (hasGmaps) {
            return Linking.openURL(gmapsIosUrl);
          }
          return Linking.openURL(appleMapsUrl);
        })
        .catch(() => {
          Linking.openURL(appleMapsUrl).catch(() => {
            Linking.openURL(gmapsWebUrl);
          });
        });
    } else {
      // Web / fallback
      Linking.openURL(gmapsWebUrl);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: 4 }]}>
      {/* Top Header (Swipeable down) */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <MapPin size={20} color="#ffffff" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Smashly Map</Text>
            <Text style={styles.headerSubtitle}>OpenStreetMap · Terrains de padel</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={onGoHome}
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        scrollEnabled={!mapTouchActive}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 95,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* OPENSTREETMAP INTERACTIVE CONTAINER */}
        <View style={styles.mapCardContainer}>
          {/* Top Bar of Map: Mode Toggle & Location Badge */}
          <View style={styles.mapTopControls}>
            {/* Row 1: Location Badge + Plan / Satellite Switch */}
            <View style={styles.mapControlsHeaderRow}>
              <View style={styles.locationPill}>
                <View style={styles.liveGpsDot} />
                <Text style={styles.locationPillText} numberOfLines={1}>
                  {zoomLevel < 0.6 ? 'Région PACA' : 'Marseille · Aix-en-Provence'}
                </Text>
              </View>

              {/* Plan / Satellite Switch */}
              <View style={styles.layerSwitchRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.layerBtn,
                    mapType === 'plan' && styles.layerBtnActive,
                  ]}
                  onPress={() => setMapType('plan')}
                >
                  <Text
                    style={[
                      styles.layerBtnText,
                      mapType === 'plan' && styles.layerBtnTextActive,
                    ]}
                  >
                    Plan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.layerBtn,
                    mapType === 'satellite' && styles.layerBtnActive,
                  ]}
                  onPress={() => setMapType('satellite')}
                >
                  <Text
                    style={[
                      styles.layerBtnText,
                      mapType === 'satellite' && styles.layerBtnTextActive,
                    ]}
                  >
                    Sat.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Full-width Quick Zoom Presets (Never clips or hides) */}
            <View style={styles.zoomPresetRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={[
                  styles.presetBtn,
                  zoomLevel <= 0.55 && styles.presetBtnActive,
                ]}
                onPress={() => setZoomLevel(0.4)}
              >
                <Globe2
                  size={12}
                  color={zoomLevel <= 0.55 ? '#ffffff' : '#94a3b8'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.presetBtnText,
                    zoomLevel <= 0.55 && styles.presetBtnTextActive,
                  ]}
                >
                  Région
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={[
                  styles.presetBtn,
                  zoomLevel > 0.55 && zoomLevel <= 1.1 && styles.presetBtnActive,
                ]}
                onPress={() => setZoomLevel(0.85)}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    zoomLevel > 0.55 && zoomLevel <= 1.1 && styles.presetBtnTextActive,
                  ]}
                >
                  Agglo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                style={[
                  styles.presetBtn,
                  zoomLevel > 1.1 && styles.presetBtnActive,
                ]}
                onPress={() => setZoomLevel(1.4)}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    zoomLevel > 1.1 && styles.presetBtnTextActive,
                  ]}
                >
                  Focus
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* OPENSTREETMAP LEAFLET CANVAS (Isolated Map Gestures with GPU Compositing) */}
          <View
            style={styles.mapCanvasWrapper}
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
            onTouchStart={() => setMapTouchActive(true)}
            onTouchEnd={() => setMapTouchActive(false)}
            onTouchCancel={() => setMapTouchActive(false)}
          >
            {Platform.OS === 'web' ? (
              // @ts-ignore Web iframe rendering
              <iframe
                ref={iframeRef}
                srcDoc={osmHtml}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  width: '100%',
                  height: 310,
                  backgroundColor: '#0f172a',
                }}
                title="OpenStreetMap Padel"
              />
            ) : (
              <NativeWebView
                ref={webViewRef}
                source={{ html: osmHtml }}
                style={styles.mapWebView}
                containerStyle={styles.mapWebViewContainer}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                nestedScrollEnabled={true}
                scalesPageToFit={false}
                androidHardwareAccelerationDisabled={false}
                androidLayerType="hardware"
                renderToHardwareTextureAndroid={true}
                onMessage={handleWebViewMessage}
              />
            )}

            {/* Provider Watermark & Zoom Badge */}
            <View style={styles.zoomPercentBadge}>
              <Compass size={12} color="#38bdf8" style={{ marginRight: 4 }} />
              <Text style={styles.zoomPercentText}>
                OSM · {zoomLevel <= 0.55 ? 'Région' : zoomLevel <= 1.1 ? 'Agglo' : 'Focus'}
              </Text>
            </View>

            {/* Floating Navigation App Button on Map */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.floatingNavBtn}
              onPress={() => openDirections(selectedClub)}
            >
              <Navigation
                size={14}
                color="#38bdf8"
                strokeWidth={2.4}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.floatingNavBtnText}>
                Ouvrir dans Maps
              </Text>
              <ExternalLink
                size={12}
                color="#93c5fd"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>

            {/* Map Action Controls (GPS Nav Shortcut, Recenter & Zoom In/Out) */}
            <View style={styles.mapControlsRight}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.mapCtrlBtn, styles.mapNavShortcutBtn]}
                onPress={() => openDirections(selectedClub)}
                accessibilityLabel="Ouvrir dans l'application GPS"
              >
                <Navigation size={17} color="#ffffff" strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.mapCtrlBtn}
                onPress={() => {
                  setSelectedClub(clubs[0]);
                  setZoomLevel(0.85);
                }}
              >
                <LocateFixed size={18} color="#38bdf8" />
              </TouchableOpacity>

              <View style={styles.zoomControlsBox}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.zoomBtn}
                  onPress={() => handleZoom(1)}
                >
                  <Plus size={16} color="#cbd5e1" strokeWidth={2.5} />
                </TouchableOpacity>
                <View style={styles.zoomDivider} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.zoomBtn}
                  onPress={() => handleZoom(-1)}
                >
                  <Minus size={16} color="#cbd5e1" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* QUICK PADEL CLUB CHIPS CAROUSEL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickClubScroll}
          >
            {clubs.map((club, idx) => {
              const isSelected = selectedClub.id === club.id;
              return (
                <TouchableOpacity
                  key={club.id}
                  activeOpacity={0.8}
                  style={[
                    styles.quickClubChip,
                    isSelected && styles.quickClubChipActive,
                  ]}
                  onPress={() => {
                    setSelectedClub(club);
                    setZoomLevel(1.4);
                  }}
                >
                  <View
                    style={[
                      styles.quickClubPinBadge,
                      isSelected && styles.quickClubPinBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickClubPinText,
                        isSelected && styles.quickClubPinTextActive,
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.quickClubChipText,
                      isSelected && styles.quickClubChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {club.name
                      .replace('Tennis Padel Club ', '')
                      .replace('Padel Club ', '')
                      .replace('Padel ', '')}
                  </Text>
                  <Text style={styles.quickClubDistText}>{club.distance}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SELECTED CLUB HERO CARD (PREVIEW) */}
        <View style={styles.selectedHeroCard}>
          {/* Court Photo Header */}
          <View style={styles.cardImageContainer}>
            <Image
              source={selectedClub.image}
              style={styles.cardCoverImg}
              resizeMode="cover"
              fadeDuration={0}
            />
            {/* Live Status Badge */}
            <View style={styles.openPistesBadge}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.openPistesText}>
                {selectedClub.matchesCount} parties ouvertes
              </Text>
            </View>

            {/* Club Rating Badge */}
            <View style={styles.googleRatingBadge}>
              <Star
                size={13}
                color="#facc15"
                fill="#facc15"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.ratingNumber}>{selectedClub.rating}</Text>
              <Text style={styles.ratingCount}>({selectedClub.reviews})</Text>
            </View>
          </View>

          {/* Card Body */}
          <View style={styles.heroCardBody}>
            <View style={styles.heroNameRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.heroTitle}>{selectedClub.name}</Text>
                <Text style={styles.heroCity}>{selectedClub.city}</Text>
              </View>

              {/* Distance & ETA Chip */}
              <View style={styles.etaChip}>
                <Car size={13} color="#38bdf8" style={{ marginRight: 4 }} />
                <Text style={styles.etaChipText}>{selectedClub.eta}</Text>
                <Text style={styles.etaChipSub}>({selectedClub.distance})</Text>
              </View>
            </View>

            <Text style={styles.heroAddress} numberOfLines={1}>
              📍 {selectedClub.address}
            </Text>

            {/* Action Buttons: Itinéraire GPS + Voir les parties */}
            <View style={styles.heroActionsRow}>
              {/* Route Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.directionsBtn}
                onPress={() => openDirections(selectedClub)}
              >
                <Navigation
                  size={16}
                  color="#ffffff"
                  strokeWidth={2.4}
                  style={{ marginRight: 7 }}
                />
                <Text style={styles.directionsBtnText}>Itinéraire GPS</Text>
                <ExternalLink
                  size={13}
                  color="#93c5fd"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>

              {/* View Matches Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.openMatchesBtn}
                onPress={onOpenMatches}
              >
                <CalendarDays
                  size={16}
                  color="#0f172a"
                  strokeWidth={2.4}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.openMatchesBtnText}>
                  Parties ({selectedClub.matchesCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ALL CLUBS LIST SECTION */}
        <View style={styles.allClubsSection}>
          <Text style={styles.sectionHeaderTitle}>
            Clubs de padel dans la région ({clubs.length})
          </Text>

          {clubs.map((club, i) => {
            const isSelected = selectedClub.id === club.id;
            return (
              <TouchableOpacity
                key={club.id}
                activeOpacity={0.8}
                style={[
                  styles.clubListItem,
                  isSelected && styles.clubListItemSelected,
                ]}
                onPress={() => {
                  setSelectedClub(club);
                  setZoomLevel(1.4);
                }}
              >
                {/* Index badge */}
                <View
                  style={[
                    styles.indexCircle,
                    isSelected && { backgroundColor: '#0284c7' },
                  ]}
                >
                  <Text style={styles.indexCircleText}>{i + 1}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.clubListTitle}>{club.name}</Text>
                  <Text style={styles.clubListSub}>
                    {club.distance} · {club.courtsCount} pistes · {club.eta}
                  </Text>
                </View>

                {/* Rating & Route Button */}
                <View style={styles.clubListRight}>
                  <View style={styles.miniRatingRow}>
                    <Star size={12} color="#facc15" fill="#facc15" />
                    <Text style={styles.miniRatingText}>{club.rating}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.miniNavBtn}
                    onPress={() => openDirections(club)}
                  >
                    <Navigation size={13} color="#38bdf8" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
});

MapScreen.displayName = 'MapScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
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
    backgroundColor: colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  backBtn: {
    padding: 8,
  },
  scroll: {
    flex: 1,
    paddingTop: 14,
  },
  mapCardContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 16,
  },
  mapTopControls: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 8,
  },
  mapControlsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  liveGpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38bdf8',
    marginRight: 6,
  },
  locationPillText: {
    color: '#e2e8f0',
    fontSize: 11.5,
    fontWeight: '600',
  },
  zoomPresetRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 3,
    gap: 4,
    width: '100%',
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetBtnActive: {
    backgroundColor: '#0284c7',
  },
  presetBtnText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  presetBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  layerSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 2,
  },
  layerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerBtnActive: {
    backgroundColor: colors.blue500,
  },
  layerBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  layerBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  mapCanvasWrapper: {
    position: 'relative',
    height: 310,
    backgroundColor: '#0f172a',
  },
  mapWebView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
  },
  mapWebViewContainer: {
    width: '100%',
    height: '100%',
  },
  quickClubScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  quickClubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  quickClubChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  quickClubPinBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickClubPinBadgeActive: {
    backgroundColor: '#ffffff',
  },
  quickClubPinText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  quickClubPinTextActive: {
    color: '#0284c7',
  },
  quickClubChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 120,
  },
  quickClubChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  quickClubDistText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  zoomPercentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 40,
  },
  zoomPercentText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingNavBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 50,
  },
  floatingNavBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  mapNavShortcutBtn: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlsRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
  },
  mapCtrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControlsBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    width: 24,
    height: 1,
    backgroundColor: '#334155',
  },
  selectedHeroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
    overflow: 'hidden',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
  },
  cardImageContainer: {
    height: 135,
    width: '100%',
    position: 'relative',
  },
  cardCoverImg: {
    width: '100%',
    height: '100%',
  },
  openPistesBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  openPistesText: {
    color: '#f8fafc',
    fontSize: 11.5,
    fontWeight: '700',
  },
  googleRatingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ratingNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  ratingCount: {
    color: '#94a3b8',
    fontSize: 11,
    marginLeft: 3,
  },
  heroCardBody: {
    padding: 16,
  },
  heroNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroCity: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  etaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  etaChipText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  etaChipSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginLeft: 3,
  },
  heroAddress: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 14,
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  directionsBtn: {
    flex: 1.4,
    backgroundColor: colors.blue500,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue500,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  directionsBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  openMatchesBtn: {
    flex: 1,
    backgroundColor: colors.yellow400,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.yellow400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  openMatchesBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
  allClubsSection: {
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  clubListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  clubListItemSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#131d35',
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  indexCircleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clubListTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  clubListSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  clubListRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  miniRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  miniRatingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  miniNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
});
