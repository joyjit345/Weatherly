
import { useState } from 'react';
import './App.css';

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Gauge,
  Search,
  MapPin,
  Sunrise,
  Sunset,
  Eye,
  Leaf,
  Heart,
  RefreshCw,
  LocateFixed,
  Clock,
  X,
  Umbrella,
  Compass,
  ThermometerSun,
  ShieldCheck
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// ---------------- TEMPERATURE ----------------

function formatTemperature(value, unit) {
  if (value === null || value === undefined) return '--';

  const converted =
    unit === 'F' ? (value * 9) / 5 + 32 : value;

  return `${Math.round(converted)}°${unit}`;
}

// ---------------- WEATHER INFORMATION ----------------

function getWeatherInfo(code) {
  if (code === 0) return { description: 'Clear Sky', Icon: Sun };
  if ([1, 2].includes(code)) return { description: 'Partly Cloudy', Icon: CloudSun };
  if (code === 3) return { description: 'Cloudy', Icon: Cloud };
  if ([45, 48].includes(code)) return { description: 'Foggy', Icon: Cloud };

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { description: 'Drizzle', Icon: CloudRain };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { description: 'Rainy', Icon: CloudRain };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { description: 'Snowy', Icon: Cloud };
  }

  if ([95, 96, 99].includes(code)) {
    return { description: 'Thunderstorm', Icon: CloudRain };
  }

  return { description: 'Unknown', Icon: Cloud };
}

// ---------------- WEATHER THEME ----------------

function getWeatherTheme(code) {
  if (code === 0) return 'theme-sunny';
  if ([1, 2].includes(code)) return 'theme-partly-cloudy';
  if ([3, 45, 48].includes(code)) return 'theme-cloudy';

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'theme-rainy';
  }

  if ([95, 96, 99].includes(code)) return 'theme-stormy';

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'theme-snowy';
  }

  return 'theme-default';
}

// ---------------- HELPERS ----------------

function getCurrentHourlyValue(hourly, currentTime, key) {
  if (!hourly?.time || !hourly[key] || !currentTime) return null;

  const index = hourly.time.findIndex(
    time => time.slice(0, 13) === currentTime.slice(0, 13)
  );

  return index >= 0 ? hourly[key][index] : null;
}

function getUVLabel(value) {
  if (value === null || value === undefined) return 'Unavailable';
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Moderate';
  if (value <= 7) return 'High';
  if (value <= 10) return 'Very High';
  return 'Extreme';
}

function getAQIInfo(value) {
  if (value <= 50) {
    return {
      label: 'Good',
      advice: 'Air quality is satisfactory.',
      color: '#22c55e'
    };
  }

  if (value <= 100) {
    return {
      label: 'Moderate',
      advice: 'Air quality is acceptable.',
      color: '#eab308'
    };
  }

  if (value <= 150) {
    return {
      label: 'Unhealthy for Sensitive Groups',
      advice: 'Sensitive people should reduce prolonged outdoor activity.',
      color: '#f97316'
    };
  }

  if (value <= 200) {
    return {
      label: 'Unhealthy',
      advice: 'Consider reducing prolonged outdoor activity.',
      color: '#ef4444'
    };
  }

  if (value <= 300) {
    return {
      label: 'Very Unhealthy',
      advice: 'Avoid prolonged outdoor activity.',
      color: '#a855f7'
    };
  }

  return {
    label: 'Hazardous',
    advice: 'Avoid outdoor activity if possible.',
    color: '#7f1d1d'
  };
}

function readSavedData(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// ---------------- SUNRISE / SUNSET HELPERS ----------------

function getMinutesFromTime(dateTime) {
  if (!dateTime) return null;

  const [hours, minutes] = dateTime.slice(11, 16).split(':').map(Number);

  return hours * 60 + minutes;
}

function formatClock(dateTime) {
  if (!dateTime) return '--';

  const total = getMinutesFromTime(dateTime);
  if (total === null) return '--';

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

// ---------------- HEADER ----------------

function Header({
  location,
  unit,
  setUnit,
  onRefresh,
  loading,
  isFavorite,
  onToggleFavorite
}) {
  return (
    <header className="header">
      <div className="logo">
        <CloudSun size={32} />
        <h2>Weatherly</h2>
      </div>

      <nav className="navigation">
        <a href="#">Dashboard</a>
        <a href="#forecast">Forecast</a>
        <a href="#favorites">Favourites</a>
      </nav>

      <div className="header-actions">
        <div className="location">
          <MapPin size={18} />
          <span>{location.name}, {location.country}</span>
        </div>

        <button
          className="unit-toggle"
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
        >
          °{unit}
        </button>

        <button className="icon-button" onClick={onToggleFavorite}>
          <Heart
            size={20}
            fill={isFavorite ? '#ef4444' : 'none'}
            color={isFavorite ? '#ef4444' : 'currentColor'}
          />
        </button>

        <button
          className="icon-button"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={20} className={loading ? 'spin' : ''} />
        </button>
      </div>
    </header>
  );
}

// ---------------- CITY SEARCH ----------------

function CitySearch({
  city,
  setCity,
  handleSearch,
  loading,
  error,
  onUseLocation
}) {
  return (
    <section className="search-section">
      <h1>Weather Dashboard</h1>
      <p>Check the weather anywhere in the world.</p>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search size={20} />

        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={e => setCity(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      <button
        className="location-button"
        type="button"
        onClick={onUseLocation}
        disabled={loading}
      >
        <LocateFixed size={18} />
        Use My Location
      </button>

      {error && <p className="error-message">{error}</p>}
    </section>
  );
}

// ---------------- SAVED CITIES ----------------

function SavedPlaces({ favorites, recent, onSelect, onRemoveFavorite }) {
  return (
    <section className="saved-places" id="favorites">
      <div className="saved-section">
        <h2><Heart size={20} /> Favourite Cities</h2>

        <div className="saved-list">
          {favorites.length === 0 ? (
            <p className="empty-message">No favourite cities yet.</p>
          ) : (
            favorites.map(place => (
              <div className="saved-chip" key={place.id}>
                <button onClick={() => onSelect(place)}>{place.name}</button>
                <button
                  className="remove-chip"
                  onClick={() => onRemoveFavorite(place.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="saved-section">
        <h2><Clock size={20} /> Recent Searches</h2>

        <div className="saved-list">
          {recent.length === 0 ? (
            <p className="empty-message">Your recent searches will appear here.</p>
          ) : (
            recent.map(place => (
              <button
                className="recent-chip"
                key={place.id}
                onClick={() => onSelect(place)}
              >
                <MapPin size={14} />
                {place.name}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------- CURRENT WEATHER ----------------

function CurrentWeather({ location, weather, unit }) {
  if (!weather) {
    return (
      <section className="current-weather">
        <div className="weather-left">
          <p className="weather-label">CURRENT WEATHER</p>
          <h2>Search for a city to see its weather.</h2>
        </div>
      </section>
    );
  }

  const current = weather.current;
  const { description, Icon } = getWeatherInfo(current.weather_code);

  return (
    <section className="current-weather">
      <div className="weather-left">
        <p className="weather-label">CURRENT WEATHER</p>
        <h1>{location.name}</h1>

        <p className="country">
          {location.admin1
            ? `${location.admin1}, ${location.country}`
            : location.country}
        </p>

        <div className="temperature">
          <h2>{formatTemperature(current.temperature_2m, unit)}</h2>
          <Icon size={65} />
        </div>

        <h3>{description}</h3>

        <p className="feels-like">
          Feels like {formatTemperature(current.apparent_temperature, unit)}
        </p>
      </div>
    </section>
  );
}

// ---------------- SUNRISE / SUNSET TRACKER ----------------

function SunriseSunset({ daily, currentTime }) {
  if (!daily?.sunrise?.[0] || !daily?.sunset?.[0] || !currentTime) {
    return null;
  }

  const sunrise = daily.sunrise[0];
  const sunset = daily.sunset[0];

  const sunriseMinutes = getMinutesFromTime(sunrise);
  const sunsetMinutes = getMinutesFromTime(sunset);
  const currentMinutes = getMinutesFromTime(currentTime);

  const daylightMinutes = sunsetMinutes - sunriseMinutes;

  if (
    sunriseMinutes === null ||
    sunsetMinutes === null ||
    currentMinutes === null ||
    daylightMinutes <= 0
  ) return null;

  const isDaytime =
    currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes;

  const progress = Math.max(
    0,
    Math.min(100, ((currentMinutes - sunriseMinutes) / daylightMinutes) * 100)
  );

  const hours = Math.floor(daylightMinutes / 60);
  const minutes = daylightMinutes % 60;

  const remaining = Math.max(0, sunsetMinutes - currentMinutes);

  return (
    <section className="sun-tracker-section">
      <h2>Sunrise & Sunset</h2>

      <div className="sun-tracker-card">
        <div className="sun-tracker-status">
          <div>
            <p>Today's Daylight</p>
            <h3>{hours}h {minutes}m</h3>
          </div>

          <span className="day-status">
            <Sun size={17} />
            {isDaytime ? 'Daytime' : 'Nighttime'}
          </span>
        </div>

        <div className="sun-progress-track">
          <div
            className="sun-progress-marker"
            style={{ left: `${progress}%` }}
          >
            <Sun size={23} />
          </div>
        </div>

        <div className="sun-time-labels">
          <div>
            <Sunrise size={23} />
            <p>Sunrise</p>
            <h3>{formatClock(sunrise)}</h3>
          </div>

          <div className="sunset-label">
            <Sunset size={23} />
            <p>Sunset</p>
            <h3>{formatClock(sunset)}</h3>
          </div>
        </div>

        <p className="sun-tracker-note">
          {isDaytime
            ? `${Math.floor(remaining / 60)}h ${remaining % 60}m of daylight remaining.`
            : 'The sun is currently below the horizon.'}
        </p>
      </div>
    </section>
  );
}

// ---------------- FEATURE 1: UV ADVISOR ----------------

function UVAdvisor({ hourly, currentTime }) {
  const uv = getCurrentHourlyValue(hourly, currentTime, 'uv_index');

  if (uv === null) return null;

  const label = getUVLabel(uv);

  let advice = 'Enjoy the outdoors. Basic sun protection is recommended.';
  let protection = 'Low risk';

  if (uv >= 3 && uv <= 5) {
    advice = 'Wear sunglasses, use sunscreen and seek shade during midday.';
    protection = 'Protection recommended';
  } else if (uv >= 6 && uv <= 7) {
    advice = 'Reduce midday sun exposure. Wear protective clothing and SPF 30+ sunscreen.';
    protection = 'High protection needed';
  } else if (uv >= 8) {
    advice = 'Avoid prolonged midday sun exposure. Seek shade and use SPF 30+ sunscreen.';
    protection = 'Extra protection needed';
  }

  const percentage = Math.min(100, (uv / 11) * 100);

  return (
    <section className="feature-section">
      <h2>UV Index & Sun Protection</h2>

      <div className="feature-card uv-card">
        <div className="feature-top">
          <div>
            <p>Current UV Index</p>
            <h2>{uv.toFixed(1)}</h2>
            <span className="feature-status">{label}</span>
          </div>

          <Sun size={55} />
        </div>

        <div className="uv-meter">
          <div
            className="uv-meter-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="feature-advice">
          <ShieldCheck size={20} />
          {protection}
        </p>

        <p>{advice}</p>
      </div>
    </section>
  );
}

// ---------------- FEATURE 2: RAIN TRACKER ----------------

function RainTracker({ hourly }) {
  if (!hourly?.time || !hourly?.precipitation_probability) return null;

  const rainData = hourly.time.map((time, index) => ({
    time: time.slice(11, 16),
    probability: hourly.precipitation_probability[index] ?? 0,
    precipitation: hourly.precipitation?.[index] ?? 0
  }));

  const nextHours = rainData.slice(0, 24);

  if (nextHours.length === 0) return null;

  const highestChance = Math.max(
    ...nextHours.map(item => item.probability)
  );

  const highestHour = nextHours.find(
    item => item.probability === highestChance
  );

  const totalRain = nextHours.reduce(
    (total, item) => total + item.precipitation,
    0
  );

  return (
    <section className="feature-section">
      <h2>Rain Probability Tracker</h2>

      <div className="feature-card">
        <div className="rain-summary">
          <div>
            <p>Highest rain probability</p>
            <h2>{highestChance}%</h2>
            <span>At {highestHour?.time || '--'}</span>
          </div>

          <div>
            <p>Expected precipitation</p>
            <h2>{totalRain.toFixed(1)} mm</h2>
            <span>Next 24 forecast hours</span>
          </div>
        </div>

        <h3 className="feature-subtitle">Hourly rain probability</h3>

        <div className="rain-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={nextHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="time" stroke="#94a3b8" interval={3} />

              <YAxis stroke="#94a3b8" unit="%" domain={[0, 100]} />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#ffffff'
                }}
                formatter={value => [`${value}%`, 'Rain probability']}
              />

              <Line
                type="monotone"
                dataKey="probability"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="feature-advice">
          <Umbrella size={20} />
          {highestChance >= 50
            ? 'Consider carrying an umbrella.'
            : 'Rain probability is relatively low.'}
        </p>
      </div>
    </section>
  );
}

// ---------------- FEATURE 3: WIND COMPASS ----------------

function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined) return '--';

  const directions = [
    'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
  ];

  return directions[Math.round(degrees / 45) % 8];
}

function WindCompass({ current }) {
  if (!current) return null;

  const direction = current.wind_direction_10m;
  const speed = current.wind_speed_10m;
  const gusts = current.wind_gusts_10m;

  return (
    <section className="feature-section">
      <h2>Wind Direction & Compass</h2>

      <div className="feature-card wind-card">
        <div className="compass-container">
          <div className="compass-label north">N</div>
          <div className="compass-label east">E</div>
          <div className="compass-label south">S</div>
          <div className="compass-label west">W</div>

          <div className="compass-circle">
            <div
              className="compass-arrow"
              style={{
                transform: `translate(-50%, -50%) rotate(${direction ?? 0}deg)`
              }}
            >
              ↑
            </div>

            <div className="compass-center" />
          </div>
        </div>

        <div className="wind-information">
          <p>Wind direction</p>
          <h2>{getWindDirection(direction)}</h2>
          <span>{direction ?? '--'}°</span>

          <div className="wind-stat">
            <Wind size={20} />
            <div>
              <p>Wind speed</p>
              <h3>{speed ?? '--'} km/h</h3>
            </div>
          </div>

          <div className="wind-stat">
            <Gauge size={20} />
            <div>
              <p>Wind gusts</p>
              <h3>{gusts ?? '--'} km/h</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- FEATURE 4: COMFORT INDEX ----------------

function ComfortIndex({ current }) {
  if (!current) return null;

  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m;

  let status = 'Comfortable';
  let advice = 'Conditions are generally comfortable for outdoor activities.';
  let comfortScore = 90;

  // This is a simple educational comfort estimate, not an official index.
  if (temperature >= 30 && humidity >= 70) {
    status = 'Hot & Humid';
    advice = 'Drink water, wear light clothing and avoid strenuous activity.';
    comfortScore = 25;
  } else if (temperature >= 32) {
    status = 'Very Hot';
    advice = 'Stay hydrated and avoid extended exposure to direct sunlight.';
    comfortScore = 35;
  } else if (temperature >= 27 && humidity >= 60) {
    status = 'Humid';
    advice = 'It may feel sticky. Choose breathable clothing.';
    comfortScore = 45;
  } else if (temperature <= 10) {
    status = 'Cold';
    advice = 'Wear warm clothing when going outside.';
    comfortScore = 40;
  } else if (temperature >= 25) {
    status = 'Warm';
    advice = 'Light clothing and regular hydration are recommended.';
    comfortScore = 65;
  } else if (temperature < 18) {
    status = 'Cool';
    advice = 'A light jacket may be useful outdoors.';
    comfortScore = 65;
  }

  return (
    <section className="feature-section">
      <h2>Weather Comfort Index</h2>

      <div className="feature-card comfort-card">
        <div className="comfort-icon">
          <ThermometerSun size={42} />
        </div>

        <div>
          <p>Outdoor comfort</p>
          <h2>{status}</h2>
          <p>{advice}</p>
        </div>

        <div className="comfort-score">
          <strong>{comfortScore}</strong>
          <span>/100</span>
        </div>

        <div className="comfort-meter">
          <div style={{ width: `${comfortScore}%` }} />
        </div>

        <div className="comfort-readings">
          <div>
            <Droplets size={20} />
            <span>Humidity</span>
            <strong>{humidity}%</strong>
          </div>

          <div>
            <ThermometerSun size={20} />
            <span>Temperature</span>
            <strong>{Math.round(temperature)}°C</strong>
          </div>
        </div>

        <p className="comfort-disclaimer">
          Estimated comfort score based on temperature and humidity. Not a medical or official meteorological index.
        </p>
      </div>
    </section>
  );
}

// ---------------- FEATURE 5: TEMPERATURE COMPARISON ----------------

function TemperatureComparison({ daily, unit }) {
  if (!daily?.time) return null;

  const comparisonData = daily.time.map((day, index) => ({
    day: index === 0
      ? 'Today'
      : new Date(day + 'T12:00:00').toLocaleDateString(
          'en-US',
          { weekday: 'short' }
        ),
    maximum: unit === 'F'
      ? (daily.temperature_2m_max[index] * 9) / 5 + 32
      : daily.temperature_2m_max[index],
    minimum: unit === 'F'
      ? (daily.temperature_2m_min[index] * 9) / 5 + 32
      : daily.temperature_2m_min[index]
  }));

  const hottest = comparisonData.reduce(
    (a, b) => a.maximum > b.maximum ? a : b
  );

  const coldest = comparisonData.reduce(
    (a, b) => a.minimum < b.minimum ? a : b
  );

  return (
    <section className="feature-section">
      <h2>Temperature Comparison</h2>

      <div className="feature-card">
        <div className="temperature-summary">
          <div>
            <p>Hottest day</p>
            <h3>{hottest.day}</h3>
            <strong>{Math.round(hottest.maximum)}°{unit}</strong>
          </div>

          <div>
            <p>Coldest night</p>
            <h3>{coldest.day}</h3>
            <strong>{Math.round(coldest.minimum)}°{unit}</strong>
          </div>
        </div>

        <h3 className="feature-subtitle">7-Day Temperature Range</h3>

        <div className="comparison-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="day" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" unit={`°${unit}`} />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#ffffff'
                }}
                formatter={value => [`${Math.round(value)}°${unit}`]}
              />

              <Legend />

              <Bar
                dataKey="maximum"
                name="Maximum"
                fill="#fb923c"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="minimum"
                name="Minimum"
                fill="#38bdf8"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ---------------- HOURLY FORECAST ----------------

function HourlyForecast({ hourly, unit }) {
  if (!hourly?.time) return null;

  const hourlyData = hourly.time.map((time, index) => {
    const temperature = hourly.temperature_2m[index];

    return {
      time: time.slice(11, 16),
      temperature: unit === 'F'
        ? (temperature * 9) / 5 + 32
        : temperature,
      rain: hourly.precipitation_probability?.[index],
      code: hourly.weather_code[index]
    };
  });

  return (
    <section className="hourly-section">
      <h2>Hourly Forecast</h2>

      <div className="hourly-grid">
        {hourlyData.slice(0, 8).map((item, index) => {
          const { Icon } = getWeatherInfo(item.code);

          return (
            <div className="hourly-card" key={index}>
              <p>{index === 0 ? 'Now' : item.time}</p>
              <Icon size={30} />
              <h3>{Math.round(item.temperature)}°{unit}</h3>
              <span>{item.rain ?? '--'}% rain</span>
            </div>
          );
        })}
      </div>

      <h2 className="chart-title">Temperature Trend - Next 24 Hours</h2>

      <div className="temperature-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" interval={2} />
            <YAxis stroke="#94a3b8" unit={`°${unit}`} />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '10px',
                color: '#ffffff'
              }}
              formatter={value => [`${Math.round(value)}°${unit}`, 'Temperature']}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ---------------- WEATHER DETAILS ----------------

function WeatherDetails({ weather, unit }) {
  if (!weather) return null;

  const current = weather.current;

  const uvIndex = getCurrentHourlyValue(
    weather.hourly,
    current.time,
    'uv_index'
  );

  const visibility = getCurrentHourlyValue(
    weather.hourly,
    current.time,
    'visibility'
  );

  const details = [
    {
      title: 'Humidity',
      value: `${current.relative_humidity_2m}%`,
      icon: Droplets,
      description: 'Relative humidity'
    },
    {
      title: 'Wind Speed',
      value: `${current.wind_speed_10m} km/h`,
      icon: Wind,
      description: 'Current wind speed'
    },
    {
      title: 'Pressure',
      value: `${Math.round(current.surface_pressure)} hPa`,
      icon: Gauge,
      description: 'Surface pressure'
    },
    {
      title: 'Feels Like',
      value: formatTemperature(current.apparent_temperature, unit),
      icon: CloudSun,
      description: 'Apparent temperature'
    },
    {
      title: 'UV Index',
      value: uvIndex === null ? '--' : uvIndex.toFixed(1),
      icon: Sun,
      description: getUVLabel(uvIndex)
    },
    {
      title: 'Visibility',
      value: visibility === null
        ? '--'
        : `${(visibility / 1000).toFixed(1)} km`,
      icon: Eye,
      description: 'Viewing distance'
    }
  ];

  return (
    <section className="details-section">
      <h2>Today's Highlights</h2>

      <div className="details-grid">
        {details.map(item => {
          const Icon = item.icon;

          return (
            <div className="detail-card" key={item.title}>
              <div className="detail-heading">
                <Icon size={22} />
                <span>{item.title}</span>
              </div>

              <h3>{item.value}</h3>
              <p>{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- AIR QUALITY ----------------

function AirQuality({ airQuality }) {
  if (!airQuality || airQuality.us_aqi == null) {
    return (
      <section className="air-quality-section">
        <h2>Air Quality</h2>
        <div className="air-quality-card">
          <p>Air quality information is currently unavailable.</p>
        </div>
      </section>
    );
  }

  const info = getAQIInfo(airQuality.us_aqi);

  return (
    <section className="air-quality-section">
      <h2>Air Quality</h2>

      <div className="air-quality-card">
        <div className="aqi-main">
          <Leaf size={35} />

          <div>
            <p>US Air Quality Index</p>
            <h2 style={{ color: info.color }}>
              {Math.round(airQuality.us_aqi)}
            </h2>
            <h3 style={{ color: info.color }}>{info.label}</h3>
          </div>
        </div>

        <p className="aqi-advice">{info.advice}</p>

        <div className="pollutants-grid">
          <div>
            <span>PM2.5</span>
            <h3>{airQuality.pm2_5 == null ? '--' : airQuality.pm2_5.toFixed(1)} µg/m³</h3>
          </div>

          <div>
            <span>PM10</span>
            <h3>{airQuality.pm10 == null ? '--' : airQuality.pm10.toFixed(1)} µg/m³</h3>
          </div>

          <div>
            <span>Ozone</span>
            <h3>{airQuality.ozone == null ? '--' : airQuality.ozone.toFixed(1)} µg/m³</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- WEEKLY FORECAST ----------------

function WeeklyForecast({ daily, unit }) {
  if (!daily) return null;

  return (
    <section className="forecast-section" id="forecast">
      <h2>7-Day Forecast</h2>

      <div className="forecast-grid">
        {daily.time.map((day, index) => {
          const { description, Icon } = getWeatherInfo(daily.weather_code[index]);

          const dayName = index === 0
            ? 'Today'
            : new Date(day + 'T12:00:00').toLocaleDateString(
                'en-US',
                { weekday: 'short' }
              );

          return (
            <div className="forecast-card" key={day}>
              <p>{dayName}</p>
              <Icon size={32} />

              <h3>
                {formatTemperature(daily.temperature_2m_max[index], unit)}
              </h3>

              <span>{description}</span>

              <p>
                Low: {formatTemperature(daily.temperature_2m_min[index], unit)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- MAIN APP ----------------

function App() {
  const [city, setCity] = useState('');
  const [unit, setUnit] = useState('C');

  const [location, setLocation] = useState({
    id: '22.5726,88.3639',
    name: 'Kolkata',
    country: 'India',
    admin1: 'West Bengal',
    latitude: 22.5726,
    longitude: 88.3639
  });

  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [favorites, setFavorites] = useState(
    () => readSavedData('weatherly-favorites')
  );

  const [recent, setRecent] = useState(
    () => readSavedData('weatherly-recent')
  );

  // Fetch weather and air quality
  async function fetchPlaceWeather(place) {
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,

      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'surface_pressure'
      ].join(','),

      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'uv_index',
        'visibility'
      ].join(','),

      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset'
      ].join(','),

      timezone: 'auto',
      forecast_days: '7',
      forecast_hours: '24'
    });

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`
    );

    if (!weatherResponse.ok) {
      throw new Error('Unable to fetch weather information.');
    }

    const weatherData = await weatherResponse.json();

    let airData = null;

    try {
      const airUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}&longitude=${place.longitude}&current=us_aqi,pm2_5,pm10,ozone&timezone=auto`;

      const airResponse = await fetch(airUrl);

      if (airResponse.ok) {
        const result = await airResponse.json();
        airData = result.current || null;
      }
    } catch (err) {
      console.error('Air quality unavailable:', err);
    }

    return { weatherData, airData };
  }

  // Save recent search
  function saveRecentPlace(place) {
    const updatedRecent = [
      place,
      ...recent.filter(item => item.id !== place.id)
    ].slice(0, 5);

    setRecent(updatedRecent);

    try {
      localStorage.setItem('weatherly-recent', JSON.stringify(updatedRecent));
    } catch (err) {
      console.error('Could not save recent searches:', err);
    }
  }

  // Load a selected place
  async function loadPlace(place) {
    try {
      setLoading(true);
      setError('');

      const { weatherData, airData } = await fetchPlaceWeather(place);

      setLocation(place);
      setWeather(weatherData);
      setAirQuality(airData);

      saveRecentPlace(place);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Search city
  async function handleSearch(e) {
    e.preventDefault();

    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;

      const geoResponse = await fetch(geoUrl);

      if (!geoResponse.ok) {
        throw new Error('City search failed.');
      }

      const geoData = await geoResponse.json();

      if (!geoData.results?.length) {
        throw new Error('City not found. Please try another city.');
      }

      const selected = geoData.results[0];

      const place = {
        id: `${selected.latitude},${selected.longitude}`,
        name: selected.name,
        country: selected.country || '',
        admin1: selected.admin1 || '',
        latitude: selected.latitude,
        longitude: selected.longitude
      };

      const { weatherData, airData } = await fetchPlaceWeather(place);

      setLocation(place);
      setWeather(weatherData);
      setAirQuality(airData);

      saveRecentPlace(place);
      setCity('');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Use current location
  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;

          let place = {
            id: `${latitude},${longitude}`,
            name: 'My Location',
            country: '',
            admin1: '',
            latitude,
            longitude
          };

          try {
            const reverseUrl =
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

            const response = await fetch(reverseUrl);

            if (response.ok) {
              const result = await response.json();

              place = {
                ...place,
                name: result.city || result.locality || 'My Location',
                country: result.countryName || '',
                admin1: result.principalSubdivision || ''
              };
            }
          } catch (err) {
            console.log('Could not identify city name.');
          }

          const { weatherData, airData } = await fetchPlaceWeather(place);

          setLocation(place);
          setWeather(weatherData);
          setAirQuality(airData);

          saveRecentPlace(place);
        } catch (err) {
          setError(err.message || 'Could not fetch local weather.');
        } finally {
          setLoading(false);
        }
      },
      error => {
        setLoading(false);

        setError(
          error.code === 1
            ? 'Location permission denied. Please allow location access.'
            : 'Unable to detect your location. Please try again.'
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  }

  // Refresh weather
  async function refreshWeather() {
    await loadPlace(location);
  }

  // Favourite status
  const isFavorite = favorites.some(item => item.id === location.id);

  // Toggle favourite
  function toggleFavorite() {
    const updatedFavorites = isFavorite
      ? favorites.filter(item => item.id !== location.id)
      : [location, ...favorites];

    setFavorites(updatedFavorites);

    try {
      localStorage.setItem(
        'weatherly-favorites',
        JSON.stringify(updatedFavorites)
      );
    } catch (err) {
      console.error('Could not save favourites:', err);
    }
  }

  // Remove favourite
  function removeFavorite(id) {
    const updatedFavorites = favorites.filter(item => item.id !== id);

    setFavorites(updatedFavorites);

    try {
      localStorage.setItem(
        'weatherly-favorites',
        JSON.stringify(updatedFavorites)
      );
    } catch (err) {
      console.error('Could not update favourites:', err);
    }
  }

  const themeClass = weather
    ? getWeatherTheme(weather.current.weather_code)
    : 'theme-default';

  return (
    <div className={`app-container ${themeClass}`}>
      <Header
        location={location}
        unit={unit}
        setUnit={setUnit}
        onRefresh={refreshWeather}
        loading={loading}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />

      <main>
        <CitySearch
          city={city}
          setCity={setCity}
          handleSearch={handleSearch}
          loading={loading}
          error={error}
          onUseLocation={useMyLocation}
        />

        <SavedPlaces
          favorites={favorites}
          recent={recent}
          onSelect={loadPlace}
          onRemoveFavorite={removeFavorite}
        />

        <CurrentWeather
          location={location}
          weather={weather}
          unit={unit}
        />

        <SunriseSunset
          daily={weather?.daily}
          currentTime={weather?.current?.time}
        />

        <UVAdvisor
          hourly={weather?.hourly}
          currentTime={weather?.current?.time}
        />

        <RainTracker hourly={weather?.hourly} />

        <WindCompass current={weather?.current} />

        <ComfortIndex current={weather?.current} />

        <TemperatureComparison
          daily={weather?.daily}
          unit={unit}
        />

        <HourlyForecast
          hourly={weather?.hourly}
          unit={unit}
        />

        <WeatherDetails
          weather={weather}
          unit={unit}
        />

        <AirQuality airQuality={airQuality} />

        <WeeklyForecast
          daily={weather?.daily}
          unit={unit}
        />
      </main>

      <footer>
        <p>Weatherly © 2026 | Made with React</p>
      </footer>
    </div>
  );
}

export default App;
