// Mock module for react-native-maps on web
// This file is used to prevent bundling errors when running on web platform

const React = require('react');

// Empty component that renders nothing
const MockMapView = React.forwardRef((props, ref) => {
  return null;
});

MockMapView.displayName = 'MockMapView';

const MockMarker = () => null;
const MockCallout = () => null;
const MockPolyline = () => null;
const MockPolygon = () => null;
const MockCircle = () => null;

module.exports = {
  default: MockMapView,
  Marker: MockMarker,
  Callout: MockCallout,
  Polyline: MockPolyline,
  Polygon: MockPolygon,
  Circle: MockCircle,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: null,
};
