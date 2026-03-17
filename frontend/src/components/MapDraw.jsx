import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

// Fix default icon paths when using bundler (Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * Adds Leaflet Draw (polygon) control to the map. On draw:created, calls onPolygon with
 * latlngs array (Leaflet format).
 */
export default function MapDraw({ onPolygon }) {
  const map = useMap();
  const drawnItemsRef = useRef(null);
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const control = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: "#15803d" },
          metric: true,
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(control);
    controlRef.current = control;

    const onCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      const latlngs = layer.getLatLngs()[0];
      if (latlngs && latlngs.length >= 3) {
        onPolygon(latlngs);
      }
    };

    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      map.removeControl(control);
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED, onCreated);
    };
  }, [map, onPolygon]);

  return null;
}
