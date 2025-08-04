import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GeolocationState {
  location: string;
  isLoading: boolean;
  error: string | null;
  coordinates: { lat: number; lng: number } | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: '',
    isLoading: true,
    error: null,
    coordinates: null
  });

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Geolocation is not supported by this browser'
          }));
          return;
        }

        // Get current position
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Load Google Maps API
              const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                libraries: ['geocoding']
              });

              await loader.load();

              // Use Geocoding API to get city name
              const geocoder = new google.maps.Geocoder();
              const latlng = { lat: latitude, lng: longitude };

              geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  // Find the city component
                  const addressComponents = results[0].address_components;
                  let city = '';
                  let state = '';

                  for (const component of addressComponents) {
                    if (component.types.includes('locality')) {
                      city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                      state = component.short_name;
                    }
                  }

                  const locationString = city && state ? `${city}, ${state}` : results[0].formatted_address;

                  setState({
                    location: locationString,
                    isLoading: false,
                    error: null,
                    coordinates: { lat: latitude, lng: longitude }
                  });
                } else {
                  setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Unable to determine location from coordinates'
                  }));
                }
              });
            } catch (error) {
              setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Error loading Google Maps API'
              }));
            }
          },
          (error) => {
            let errorMessage = 'Unable to retrieve location';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }

            setState(prev => ({
              ...prev,
              isLoading: false,
              error: errorMessage
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error initializing geolocation'
        }));
      }
    };

    getCurrentLocation();
  }, []);

  return state;
};
