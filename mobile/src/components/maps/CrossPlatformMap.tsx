import React from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';

// Types
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
  type?: 'machine' | 'job' | 'location';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface CrossPlatformMapProps {
  markers?: MapMarker[];
  initialRegion?: MapRegion;
  style?: ViewStyle;
  showsUserLocation?: boolean;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
  selectedMarkerId?: string;
  renderCallout?: (marker: MapMarker) => React.ReactNode;
}

// Default region (Istanbul)
const DEFAULT_REGION: MapRegion = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Web implementation using Leaflet
const WebMap: React.FC<CrossPlatformMapProps> = ({
  markers = [],
  initialRegion = DEFAULT_REGION,
  style,
  onMarkerPress,
  onMapPress,
  selectedMarkerId,
  renderCallout,
}) => {
  // Dynamic import for web only
  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = require('react-leaflet');
  const L = require('leaflet');

  // Fix Leaflet default marker icon issue
  React.useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Create custom icons based on marker type/color
  const createIcon = (color: string = '#3B82F6') => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Map click handler component
  const MapClickHandler = () => {
    useMapEvents({
      click: (e: any) => {
        if (onMapPress) {
          onMapPress({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        }
      },
    });
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <MapContainer
        center={[initialRegion.latitude, initialRegion.longitude]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Google Maps-like tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        <MapClickHandler />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={createIcon(marker.color)}
            eventHandlers={{
              click: () => onMarkerPress?.(marker),
            }}
          >
            {(marker.title || renderCallout) && (
              <Popup>
                {renderCallout ? (
                  renderCallout(marker)
                ) : (
                  <div>
                    <strong>{marker.title}</strong>
                    {marker.description && <p>{marker.description}</p>}
                  </div>
                )}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
};

// Native implementation using react-native-maps
const NativeMap: React.FC<CrossPlatformMapProps> = ({
  markers = [],
  initialRegion = DEFAULT_REGION,
  style,
  showsUserLocation = false,
  onMarkerPress,
  onMapPress,
  selectedMarkerId,
  renderCallout,
}) => {
  const MapView = require('react-native-maps').default;
  const { Marker, Callout, PROVIDER_GOOGLE } = require('react-native-maps');
  const { Text } = require('react-native');

  return (
    <MapView
      style={[styles.container, style]}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      onPress={(e: any) => {
        if (onMapPress) {
          onMapPress(e.nativeEvent.coordinate);
        }
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          pinColor={marker.color || '#3B82F6'}
          onPress={() => onMarkerPress?.(marker)}
        >
          {(marker.title || renderCallout) && (
            <Callout>
              {renderCallout ? (
                renderCallout(marker)
              ) : (
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{marker.title}</Text>
                  {marker.description && (
                    <Text style={styles.calloutDescription}>{marker.description}</Text>
                  )}
                </View>
              )}
            </Callout>
          )}
        </Marker>
      ))}
    </MapView>
  );
};

// Main component that switches based on platform
export const CrossPlatformMap: React.FC<CrossPlatformMapProps> = (props) => {
  if (Platform.OS === 'web') {
    return <WebMap {...props} />;
  }
  return <NativeMap {...props} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  callout: {
    padding: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default CrossPlatformMap;
