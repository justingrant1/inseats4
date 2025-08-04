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

  // Function to get location from IP address
  const getLocationFromIP = async () => {
    try {
      // Try multiple IP geolocation services for better reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Handle different API response formats
          let city = '';
          let region = '';
          let lat = 0;
          let lng = 0;

          if (service.includes('ipapi.co')) {
            city = data.city;
            region = data.region_code;
            lat = data.latitude;
            lng = data.longitude;
          } else if (service.includes('ip-api.com')) {
            city = data.city;
            region = data.region;
            lat = data.lat;
            lng = data.lon;
          } else if (service.includes('ipinfo.io')) {
            city = data.city;
            region = data.region;
            const coords = data.loc?.split(',');
            if (coords && coords.length === 2) {
              lat = parseFloat(coords[0]);
              lng = parseFloat(coords[1]);
            }
          }

          if (city && region && lat && lng) {
            const locationString = `${city}, ${region}`;
            setState({
              location: locationString,
              isLoading: false,
              error: null,
              coordinates: { lat, lng }
            });
            return true;
          }
        } catch (error) {
          console.warn(`Failed to get location from ${service}:`, error);
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.warn('IP geolocation failed:', error);
      return false;
    }
  };

  useEffect(() => {
    const getCurrentLocation = async () => {
      // Set a timeout to stop loading after 10 seconds
      const overallTimeout = setTimeout(async () => {
        // Try IP-based location as final fallback
        const ipLocationSuccess = await getLocationFromIP();
        if (!ipLocationSuccess) {
          setState(prev => ({
            ...prev,
            location: 'Los Angeles, CA', // Ultimate fallback
            isLoading: false,
            error: 'Using default location'
          }));
        }
      }, 10000);

      try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
          clearTimeout(overallTimeout);
          // Try IP-based location immediately
          const ipLocationSuccess = await getLocationFromIP();
          if (!ipLocationSuccess) {
            setState(prev => ({
              ...prev,
              location: 'Los Angeles, CA',
              isLoading: false,
              error: 'Geolocation not supported, using default location'
            }));
          }
          return;
        }

        // Get current position with shorter timeout
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Load Google Maps API with timeout
              const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                libraries: ['geocoding']
              });

              const loadPromise = loader.load();
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Google Maps API timeout')), 5000);
              });

              await Promise.race([loadPromise, timeoutPromise]);

              // Use Geocoding API to get city name
              const geocoder = new google.maps.Geocoder();
              const latlng = { lat: latitude, lng: longitude };

              geocoder.geocode({ location: latlng }, async (results, status) => {
                clearTimeout(overallTimeout);
                
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
                  // Fallback to IP-based location
                  const ipLocationSuccess = await getLocationFromIP();
                  if (!ipLocationSuccess) {
                    setState(prev => ({
                      ...prev,
                      location: 'Los Angeles, CA',
                      isLoading: false,
                      error: 'Unable to determine location, using default'
                    }));
                  }
                }
              });
            } catch (error) {
              clearTimeout(overallTimeout);
              // Fallback to IP-based location
              const ipLocationSuccess = await getLocationFromIP();
              if (!ipLocationSuccess) {
                setState(prev => ({
                  ...prev,
                  location: 'Los Angeles, CA',
                  isLoading: false,
                  error: 'Error loading Google Maps API, using default location'
                }));
              }
            }
          },
          async (error) => {
            clearTimeout(overallTimeout);
            
            // Try IP-based location when GPS fails
            const ipLocationSuccess = await getLocationFromIP();
            if (!ipLocationSuccess) {
              let errorMessage = 'Unable to retrieve location, using default';
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied, using IP-based location';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'GPS unavailable, using IP-based location';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out, using IP-based location';
                  break;
              }

              setState(prev => ({
                ...prev,
                location: 'Los Angeles, CA',
                isLoading: false,
                error: errorMessage
              }));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 3000, // Reduced to 3 seconds for faster fallback
            maximumAge: 300000 // 5 minutes
          }
        );
      } catch (error) {
        clearTimeout(overallTimeout);
        // Fallback to IP-based location
        const ipLocationSuccess = await getLocationFromIP();
        if (!ipLocationSuccess) {
          setState(prev => ({
            ...prev,
            location: 'Los Angeles, CA',
            isLoading: false,
            error: 'Error initializing geolocation, using default location'
          }));
        }
      }
    };

    getCurrentLocation();
  }, []);

  return state;
};
