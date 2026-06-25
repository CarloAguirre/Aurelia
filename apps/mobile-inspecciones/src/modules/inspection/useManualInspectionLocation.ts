import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useManualInspectionDraft } from './manualInspection.store';

const utmBands = 'CDEFGHJKLMNPQRSTUVWX';

function latitudeBand(latitude: number): string {
  const index = Math.max(0, Math.min(utmBands.length - 1, Math.floor((latitude + 80) / 8)));
  return utmBands[index];
}

function toUtmLabel(latitude: number, longitude: number): string {
  const a = 6378137;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e = Math.sqrt(f * (2 - f));
  const ePrimeSquared = e * e / (1 - e * e);
  const zone = Math.floor((longitude + 180) / 6) + 1;
  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  const latRad = latitude * Math.PI / 180;
  const lonRad = longitude * Math.PI / 180;
  const lonOriginRad = lonOrigin * Math.PI / 180;
  const n = a / Math.sqrt(1 - e * e * Math.sin(latRad) * Math.sin(latRad));
  const t = Math.tan(latRad) * Math.tan(latRad);
  const c = ePrimeSquared * Math.cos(latRad) * Math.cos(latRad);
  const x = Math.cos(latRad) * (lonRad - lonOriginRad);
  const m = a * ((1 - e * e / 4 - 3 * e ** 4 / 64 - 5 * e ** 6 / 256) * latRad - (3 * e * e / 8 + 3 * e ** 4 / 32 + 45 * e ** 6 / 1024) * Math.sin(2 * latRad) + (15 * e ** 4 / 256 + 45 * e ** 6 / 1024) * Math.sin(4 * latRad) - (35 * e ** 6 / 3072) * Math.sin(6 * latRad));
  let easting = k0 * n * (x + (1 - t + c) * x ** 3 / 6 + (5 - 18 * t + t * t + 72 * c - 58 * ePrimeSquared) * x ** 5 / 120) + 500000;
  let northing = k0 * (m + n * Math.tan(latRad) * (x * x / 2 + (5 - t + 9 * c + 4 * c * c) * x ** 4 / 24 + (61 - 58 * t + t * t + 600 * c - 330 * ePrimeSquared) * x ** 6 / 720));

  if (latitude < 0) northing += 10000000;

  easting = Math.round(easting);
  northing = Math.round(northing);

  return `${zone}${latitudeBand(latitude)} ${easting}E ${northing}N`;
}

function accuracyLabel(accuracy: number | null): string {
  if (accuracy === null || Number.isNaN(accuracy)) return 'Precisión no disponible';
  return `± ${accuracy.toFixed(1)} m`;
}

export function useManualInspectionLocation() {
  const setLocation = useManualInspectionDraft((state) => state.setLocation);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async () => {
    setCapturing(true);
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setError('Permiso de ubicación denegado. Activa la ubicación del navegador o dispositivo.');
        return false;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude, accuracy, altitude } = current.coords;
      const accuracyText = accuracyLabel(accuracy ?? null);
      const label = `${toUtmLabel(latitude, longitude)} ${accuracyText}`;

      setLocation({
        label,
        accuracy: accuracyText,
        latitude,
        longitude,
        altitude: altitude ?? null,
      });

      return true;
    } catch {
      setError('No se pudo capturar la ubicación. Revisa permisos, GPS o navegador.');
      return false;
    } finally {
      setCapturing(false);
    }
  }, [setLocation]);

  return { captureLocation, capturing, locationError: error };
}
