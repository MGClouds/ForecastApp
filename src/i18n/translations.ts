export type Language = 'en' | 'de' | 'pl';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  searchPlaceholder: string;
  useMyLocation: string;
  currentLocationFallback: string;
  showWeather: string;
  searching: string;
  noResults: string;
  today: string;
  tomorrow: string;
  feelsLike: string;
  elevation: string;
  high: string;
  low: string;
  averagedFrom: string;
  modelAgreement: string;
  wind: string;
  cloudCover: string;
  snow: string;
  rainProb: string;
  weatherMap: string;
  mapOnly: string;
  rainRadar: string;
  satellite: string;
  rainLayer: string;
  cloudsLayer: string;
  snowLayer: string;
  windLayer: string;
  observed: string;
  forecastFrame: string;
  comingSoon: string;
  radarUnavailable: string;
  radarAttribution: string;
  mapDataAttribution: string;
  mapDisclaimer: string;
  playAnimation: string;
  pauseAnimation: string;
  nowLabel: string;
  hourLabel: string;
  noOverlayData: string;
  overlayForecastSuffix: string;
  intensityCloud: string;
  intensityLightRain: string;
  intensityModerateRain: string;
  intensityHeavyRain: string;
  intensityVeryHeavyRain: string;
  intensitySnow: string;
  loadingModels: string;
  retry: string;
  forecastConfidence: string;
  highCertainty: string;
  mediumCertainty: string;
  lowCertainty: string;
  relativeImpact: string;
  timeRangeFilterTitle: string;
  timeRangeFilterExplanation: string;
  startTimeLabel: string;
  endTimeLabel: string;
  timeRangeInvalid: string;
  analyzingHoursLabel: string;
  wmo0: string;
  wmo1: string;
  wmo2: string;
  wmo3: string;
  wmo45: string;
  wmo48: string;
  wmo51: string;
  wmo53: string;
  wmo55: string;
  wmo61: string;
  wmo63: string;
  wmo65: string;
  wmo71: string;
  wmo73: string;
  wmo75: string;
  wmo77: string;
  wmo80: string;
  wmo81: string;
  wmo82: string;
  wmo85: string;
  wmo86: string;
  wmo95: string;
  wmo96: string;
  wmo99: string;
  explainModerateProb: string;
  explainHighCloudNoRain: string;
  explainHighWind: string;
  explainElevation: string;
  explainRainSnow: string;
  explainLowProb: string;
  explainConsistent: string;
  factorModerateProb: string;
  factorHighCloud: string;
  factorHighWind: string;
  factorElevation: string;
  factorRainSnow: string;
  factorLowProb: string;
  factorConsistent: string;
  summaryHigh: string;
  summaryMedium: string;
  summaryLow: string;
  footerText: string;
  heroText: string;
}

export const en: Translations = {
  appTitle: '🌤️ ForecastApp',
  appSubtitle: 'Professional weather forecasting · 3 model ensemble',
  searchPlaceholder: 'Search city, town, village...',
  useMyLocation: '📍 Use my location',
  currentLocationFallback: 'Current Location',
  showWeather: '🌤️ Show me the weather',
  searching: 'Searching...',
  noResults: 'No results found',
  today: 'Today',
  tomorrow: 'Tomorrow',
  feelsLike: 'Feels like',
  elevation: 'elevation',
  high: 'High',
  low: 'Low',
  averagedFrom: 'Averaged from {count} models: {names}',
  modelAgreement: 'Model agreement',
  wind: 'Wind',
  cloudCover: 'Cloud cover',
  snow: 'Snow',
  rainProb: 'Rain probability',
  weatherMap: '🗺️ Weather Map',
  mapOnly: '🗺️ Map only',
  rainRadar: '🌧️ Radar (live)',
  satellite: '🛰️ Satellite',
  rainLayer: '🌧️ Rain',
  cloudsLayer: '☁️ Clouds',
  snowLayer: '❄️ Snow',
  windLayer: '💨 Wind',
  observed: '📡 Observed',
  forecastFrame: '🔮 Forecast',
  comingSoon: 'coming soon',
  radarUnavailable: 'Radar data temporarily unavailable',
  radarAttribution: 'Radar: RainViewer (aggregates EUMETNET OPERA + global radar networks)',
  mapDataAttribution: 'Forecast-based visualization from Open-Meteo model data | Map: CARTO Voyager, OpenStreetMap contributors',
  mapDisclaimer: '⚠️ Forecast visualization, not live radar',
  playAnimation: 'Play',
  pauseAnimation: 'Pause',
  nowLabel: 'Now',
  hourLabel: '+{n}h',
  noOverlayData: 'No forecast data available for the overlay animation.',
  overlayForecastSuffix: '(Forecast)',
  intensityCloud: 'Cloud',
  intensityLightRain: 'Light Rain',
  intensityModerateRain: 'Moderate Rain',
  intensityHeavyRain: 'Heavy Rain',
  intensityVeryHeavyRain: 'Very Heavy Rain',
  intensitySnow: 'Snow',
  loadingModels: 'Fetching 3 weather models...',
  retry: 'Retry',
  forecastConfidence: '🔍 Forecast Confidence Analysis',
  highCertainty: '✅ High Certainty',
  mediumCertainty: '⚠️ Medium Certainty',
  lowCertainty: '🟠 Low Certainty',
  relativeImpact: 'Relative contribution to the overall confidence score',
  timeRangeFilterTitle: '⏱️ Analysis window',
  timeRangeFilterExplanation: 'Narrow the analysis to a specific part of the day. The certainty score, summary, and factors below will recalculate using only the hours in this range.',
  startTimeLabel: 'Start time',
  endTimeLabel: 'End time',
  timeRangeInvalid: 'End time must be after start time.',
  analyzingHoursLabel: 'Analyzing {n} hour(s): {start} - {end}',
  wmo0: 'Clear sky', wmo1: 'Mainly clear', wmo2: 'Partly cloudy', wmo3: 'Overcast',
  wmo45: 'Fog', wmo48: 'Depositing rime fog',
  wmo51: 'Light drizzle', wmo53: 'Moderate drizzle', wmo55: 'Dense drizzle',
  wmo61: 'Slight rain', wmo63: 'Moderate rain', wmo65: 'Heavy rain',
  wmo71: 'Slight snow', wmo73: 'Moderate snow', wmo75: 'Heavy snow', wmo77: 'Snow grains',
  wmo80: 'Slight rain showers', wmo81: 'Moderate rain showers', wmo82: 'Violent rain showers',
  wmo85: 'Slight snow showers', wmo86: 'Heavy snow showers',
  wmo95: 'Thunderstorm', wmo96: 'Thunderstorm with slight hail', wmo99: 'Thunderstorm with heavy hail',
  explainModerateProb: 'Precipitation probability reaches {maxProb}%, suggesting conditions are uncertain - forecast models indicate possible but not definite precipitation.',
  explainHighCloudNoRain: 'Average cloud cover is {cloudCover}%, yet precipitation probability remains low. Cloud systems may pass without producing measurable rain.',
  explainHighWind: 'Wind speeds may reach {windSpeed} km/h, causing precipitation zones to move quickly through the area. Timing of any rain could shift by 1–2 hours.',
  explainElevation: '{location} is at approximately {elevation}m elevation. Terrain can enhance precipitation and cause local variations not always captured by models.',
  explainRainSnow: 'Temperatures near {temp}°C with forecast snowfall suggest the area may be near the freezing level. Small temperature changes could shift precipitation between rain and snow.',
  explainLowProb: 'Forecast models show conditions are not particularly favorable for precipitation. The atmosphere appears relatively stable for this period.',
  explainConsistent: 'Weather models are in good agreement for this forecast period. Conditions appear relatively straightforward with no major sources of uncertainty identified.',
  factorModerateProb: 'Moderate precipitation probability',
  factorHighCloud: 'High cloud cover without significant precipitation',
  factorHighWind: 'High wind speeds',
  factorElevation: 'Elevated terrain influence',
  factorRainSnow: 'Rain/snow transition zone',
  factorLowProb: 'Low precipitation likelihood',
  factorConsistent: 'Consistent model signals',
  summaryHigh: 'The forecast for {location} appears fairly confident. Model data shows {precipContext} with {cloudContext}.',
  summaryMedium: 'There is moderate uncertainty in the forecast for {location}. The model indicates possible precipitation, but several atmospheric factors may influence the actual outcome.',
  summaryLow: 'The forecast for {location} carries notable uncertainty. Near-freezing temperatures and precipitation create a complex scenario where small changes could significantly alter the outcome.',
  footerText: 'Weather data from Open-Meteo · Map tiles © OpenStreetMap',
  heroText: 'Search for a city or use your current location to see the weather forecast.',
};

export const de: Translations = {
  appTitle: '🌤️ WetterApp',
  appSubtitle: 'Professionelle Wettervorhersage · 3-Modell-Ensemble',
  searchPlaceholder: 'Stadt, Gemeinde, Dorf suchen...',
  useMyLocation: '📍 Meinen Standort verwenden',
  currentLocationFallback: 'Aktueller Standort',
  showWeather: '🌤️ Wetter anzeigen',
  searching: 'Suche...',
  noResults: 'Keine Ergebnisse gefunden',
  today: 'Heute',
  tomorrow: 'Morgen',
  feelsLike: 'Gefühlt',
  elevation: 'Höhe',
  high: 'Höchst',
  low: 'Tief',
  averagedFrom: 'Durchschnitt aus {count} Modellen: {names}',
  modelAgreement: 'Modellübereinstimmung',
  wind: 'Wind',
  cloudCover: 'Bewölkung',
  snow: 'Schnee',
  rainProb: 'Regenwahrscheinlichkeit',
  weatherMap: '🗺️ Wetterkarte',
  mapOnly: '🗺️ Nur Karte',
  rainRadar: '🌧️ Radar (live)',
  satellite: '🛰️ Satellit',
  rainLayer: '🌧️ Regen',
  cloudsLayer: '☁️ Wolken',
  snowLayer: '❄️ Schnee',
  windLayer: '💨 Wind',
  observed: '📡 Gemessen',
  forecastFrame: '🔮 Vorhersage',
  comingSoon: 'bald verfügbar',
  radarUnavailable: 'Radardaten vorübergehend nicht verfügbar',
  radarAttribution: 'Radar: RainViewer (beinhaltet EUMETNET OPERA + globale Radarnetzwerke)',
  mapDataAttribution: 'Prognosebasierte Visualisierung aus Open-Meteo-Modelldaten | Karte: CARTO Voyager, OpenStreetMap-Mitwirkende',
  mapDisclaimer: '⚠️ Vorhersage-Visualisierung, kein Live-Radar',
  playAnimation: 'Abspielen',
  pauseAnimation: 'Pause',
  nowLabel: 'Jetzt',
  hourLabel: '+{n}h',
  noOverlayData: 'Keine Vorhersagedaten für die Animation verfügbar.',
  overlayForecastSuffix: '(Vorhersage)',
  intensityCloud: 'Wolken',
  intensityLightRain: 'Leichter Regen',
  intensityModerateRain: 'Mäßiger Regen',
  intensityHeavyRain: 'Starker Regen',
  intensityVeryHeavyRain: 'Sehr starker Regen',
  intensitySnow: 'Schnee',
  loadingModels: '3 Wettermodelle werden geladen...',
  retry: 'Erneut versuchen',
  forecastConfidence: '🔍 Vorhersage-Konfidenzanalyse',
  highCertainty: '✅ Hohe Sicherheit',
  mediumCertainty: '⚠️ Mittlere Sicherheit',
  lowCertainty: '🟠 Geringe Sicherheit',
  relativeImpact: 'Relativer Beitrag zum Gesamt-Konfidenzwert',
  timeRangeFilterTitle: '⏱️ Analysezeitraum',
  timeRangeFilterExplanation: 'Grenzen Sie die Analyse auf einen bestimmten Tagesabschnitt ein. Der Sicherheitswert, die Zusammenfassung und die Faktoren unten werden neu berechnet, basierend nur auf den Stunden in diesem Zeitraum.',
  startTimeLabel: 'Startzeit',
  endTimeLabel: 'Endzeit',
  timeRangeInvalid: 'Die Endzeit muss nach der Startzeit liegen.',
  analyzingHoursLabel: 'Analyse von {n} Stunde(n): {start} - {end}',
  wmo0: 'Klarer Himmel', wmo1: 'Überwiegend klar', wmo2: 'Teilweise bewölkt', wmo3: 'Bedeckt',
  wmo45: 'Nebel', wmo48: 'Gefrierender Nebel',
  wmo51: 'Leichter Nieselregen', wmo53: 'Mäßiger Nieselregen', wmo55: 'Starker Nieselregen',
  wmo61: 'Leichter Regen', wmo63: 'Mäßiger Regen', wmo65: 'Starker Regen',
  wmo71: 'Leichter Schneefall', wmo73: 'Mäßiger Schneefall', wmo75: 'Starker Schneefall', wmo77: 'Schneegriesel',
  wmo80: 'Leichte Regenschauer', wmo81: 'Mäßige Regenschauer', wmo82: 'Starke Regenschauer',
  wmo85: 'Leichte Schneeschauer', wmo86: 'Starke Schneeschauer',
  wmo95: 'Gewitter', wmo96: 'Gewitter mit leichtem Hagel', wmo99: 'Gewitter mit starkem Hagel',
  explainModerateProb: 'Die Niederschlagswahrscheinlichkeit erreicht {maxProb}%, was auf unsichere Bedingungen hindeutet - Modelle zeigen mögliche, aber nicht sichere Niederschläge.',
  explainHighCloudNoRain: 'Die durchschnittliche Bewölkung beträgt {cloudCover}%, jedoch bleibt die Niederschlagswahrscheinlichkeit gering. Wolkensysteme könnten ohne messbaren Regen passieren.',
  explainHighWind: 'Windgeschwindigkeiten können {windSpeed} km/h erreichen, wodurch sich Niederschlagszonen schnell verlagern können. Der Zeitpunkt von Regen könnte sich um 1–2 Stunden verschieben.',
  explainElevation: '{location} liegt auf etwa {elevation}m Höhe. Das Gelände kann Niederschläge verstärken und lokale Variationen verursachen, die Modelle nicht immer erfassen.',
  explainRainSnow: 'Temperaturen um {temp}°C mit prognostiziertem Schneefall deuten darauf hin, dass das Gebiet nahe der Gefriergrenze liegt. Kleine Temperaturänderungen können zwischen Regen und Schnee entscheiden.',
  explainLowProb: 'Die Wettermodelle zeigen keine günstigen Bedingungen für Niederschläge. Die Atmosphäre erscheint für diesen Zeitraum relativ stabil.',
  explainConsistent: 'Die Wettermodelle sind für diesen Vorhersagezeitraum gut übereinstimmend. Die Bedingungen erscheinen unkompliziert ohne größere Unsicherheitsquellen.',
  factorModerateProb: 'Mäßige Niederschlagswahrscheinlichkeit',
  factorHighCloud: 'Hohe Bewölkung ohne nennenswerte Niederschläge',
  factorHighWind: 'Hohe Windgeschwindigkeiten',
  factorElevation: 'Einfluss des Geländes',
  factorRainSnow: 'Regen-Schnee-Übergangszone',
  factorLowProb: 'Geringe Niederschlagswahrscheinlichkeit',
  factorConsistent: 'Konsistente Modellsignale',
  summaryHigh: 'Die Vorhersage für {location} erscheint ziemlich zuverlässig. Die Modelldaten zeigen {precipContext} mit {cloudContext}.',
  summaryMedium: 'Es besteht mäßige Unsicherheit in der Vorhersage für {location}. Das Modell deutet auf mögliche Niederschläge hin, aber mehrere atmosphärische Faktoren können das Ergebnis beeinflussen.',
  summaryLow: 'Die Vorhersage für {location} birgt erhebliche Unsicherheit. Temperaturen nahe dem Gefrierpunkt und Niederschläge schaffen ein komplexes Szenario.',
  footerText: 'Wetterdaten von Open-Meteo · Kartenkacheln © OpenStreetMap',
  heroText: 'Suchen Sie nach einer Stadt oder verwenden Sie Ihren aktuellen Standort, um die Wettervorhersage zu sehen.',
};

export const pl: Translations = {
  appTitle: '🌤️ PrognoZa',
  appSubtitle: 'Profesjonalna prognoza pogody · Ensemble 3 modeli',
  searchPlaceholder: 'Szukaj miasta, wsi, miejscowości...',
  useMyLocation: '📍 Użyj mojej lokalizacji',
  currentLocationFallback: 'Aktualna lokalizacja',
  showWeather: '🌤️ Pokaż pogodę',
  searching: 'Szukanie...',
  noResults: 'Brak wyników',
  today: 'Dziś',
  tomorrow: 'Jutro',
  feelsLike: 'Odczuwalna',
  elevation: 'wys. n.p.m.',
  high: 'Maks.',
  low: 'Min.',
  averagedFrom: 'Średnia z {count} modeli: {names}',
  modelAgreement: 'Zgodność modeli',
  wind: 'Wiatr',
  cloudCover: 'Zachmurzenie',
  snow: 'Śnieg',
  rainProb: 'Prawdopodobieństwo deszczu',
  weatherMap: '🗺️ Mapa Pogody',
  mapOnly: '🗺️ Tylko mapa',
  rainRadar: '🌧️ Radar (na żywo)',
  satellite: '🛰️ Satelita',
  rainLayer: '🌧️ Deszcz',
  cloudsLayer: '☁️ Chmury',
  snowLayer: '❄️ Śnieg',
  windLayer: '💨 Wiatr',
  observed: '📡 Obserwowany',
  forecastFrame: '🔮 Prognoza',
  comingSoon: 'wkrótce',
  radarUnavailable: 'Dane radarowe chwilowo niedostępne',
  radarAttribution: 'Radar: RainViewer (agreguje EUMETNET OPERA + globalne sieci radarów)',
  mapDataAttribution: 'Wizualizacja oparta na prognozie z danych modelu Open-Meteo | Mapa: CARTO Voyager, współtwórcy OpenStreetMap',
  mapDisclaimer: '⚠️ Wizualizacja prognozy, nie radar na żywo',
  playAnimation: 'Odtwórz',
  pauseAnimation: 'Pauza',
  nowLabel: 'Teraz',
  hourLabel: '+{n}h',
  noOverlayData: 'Brak danych prognozy dla animacji nakładki.',
  overlayForecastSuffix: '(Prognoza)',
  intensityCloud: 'Chmury',
  intensityLightRain: 'Lekki deszcz',
  intensityModerateRain: 'Umiarkowany deszcz',
  intensityHeavyRain: 'Silny deszcz',
  intensityVeryHeavyRain: 'Bardzo silny deszcz',
  intensitySnow: 'Śnieg',
  loadingModels: 'Pobieranie 3 modeli pogodowych...',
  retry: 'Spróbuj ponownie',
  forecastConfidence: '🔍 Analiza pewności prognozy',
  highCertainty: '✅ Wysoka pewność',
  mediumCertainty: '⚠️ Średnia pewność',
  lowCertainty: '🟠 Niska pewność',
  relativeImpact: 'Względny wkład w ogólny wynik pewności',
  timeRangeFilterTitle: '⏱️ Zakres analizy',
  timeRangeFilterExplanation: 'Zawęź analizę do wybranej części dnia. Poniższy wynik pewności, podsumowanie i czynniki zostaną przeliczone wyłącznie na podstawie godzin z tego zakresu.',
  startTimeLabel: 'Godzina początkowa',
  endTimeLabel: 'Godzina końcowa',
  timeRangeInvalid: 'Godzina końcowa musi być późniejsza niż początkowa.',
  analyzingHoursLabel: 'Analiza {n} godz.: {start} - {end}',
  wmo0: 'Bezchmurnie', wmo1: 'Przeważnie pogodnie', wmo2: 'Częściowe zachmurzenie', wmo3: 'Pochmurno',
  wmo45: 'Mgła', wmo48: 'Marznąca mgła',
  wmo51: 'Lekka mżawka', wmo53: 'Umiarkowana mżawka', wmo55: 'Gęsta mżawka',
  wmo61: 'Lekki deszcz', wmo63: 'Umiarkowany deszcz', wmo65: 'Silny deszcz',
  wmo71: 'Lekki śnieg', wmo73: 'Umiarkowany śnieg', wmo75: 'Silny śnieg', wmo77: 'Ziarna śniegu',
  wmo80: 'Lekkie przelotne opady', wmo81: 'Umiarkowane przelotne opady', wmo82: 'Gwałtowne przelotne opady',
  wmo85: 'Lekkie przelotne opady śniegu', wmo86: 'Silne przelotne opady śniegu',
  wmo95: 'Burza', wmo96: 'Burza z lekkim gradem', wmo99: 'Burza z silnym gradem',
  explainModerateProb: 'Prawdopodobieństwo opadów sięga {maxProb}%, co wskazuje na niepewne warunki - modele sugerują możliwe, ale nie pewne opady.',
  explainHighCloudNoRain: 'Średnie zachmurzenie wynosi {cloudCover}%, jednak prawdopodobieństwo opadów pozostaje niskie. Chmury mogą przejść bez mierzalnych opadów.',
  explainHighWind: 'Prędkość wiatru może osiągnąć {windSpeed} km/h, powodując szybkie przemieszczanie się stref opadów. Moment wystąpienia deszczu może przesunąć się o 1–2 godziny.',
  explainElevation: '{location} leży na wysokości około {elevation}m n.p.m. Rzeźba terenu może wzmagać opady i powodować lokalne zróżnicowanie nieuwzględniane przez modele.',
  explainRainSnow: 'Temperatury blisko {temp}°C z prognozowanym opadem śniegu sugerują, że obszar może znajdować się blisko granicy zlodzenia. Małe zmiany temperatury mogą decydować o rodzaju opadu.',
  explainLowProb: 'Modele pogodowe nie wskazują warunków sprzyjających opadom. Atmosfera wydaje się stosunkowo stabilna w tym okresie.',
  explainConsistent: 'Modele pogodowe wykazują dobrą zgodność dla tego okresu. Warunki wydają się stosunkowo przejrzyste bez większych źródeł niepewności.',
  factorModerateProb: 'Umiarkowane prawdopodobieństwo opadów',
  factorHighCloud: 'Duże zachmurzenie bez znaczących opadów',
  factorHighWind: 'Duże prędkości wiatru',
  factorElevation: 'Wpływ ukształtowania terenu',
  factorRainSnow: 'Strefa przejściowa deszcz-śnieg',
  factorLowProb: 'Niskie prawdopodobieństwo opadów',
  factorConsistent: 'Spójne sygnały modeli',
  summaryHigh: 'Prognoza dla {location} wydaje się dość pewna. Dane modeli wskazują na {precipContext} przy {cloudContext}.',
  summaryMedium: 'Prognoza dla {location} charakteryzuje się umiarkowaną niepewnością. Model wskazuje na możliwe opady, jednak kilka czynników atmosferycznych może wpłynąć na wynik.',
  summaryLow: 'Prognoza dla {location} niesie znaczną niepewność. Temperatury bliskie zeru i opady tworzą złożony scenariusz, gdzie małe zmiany mogą znacząco wpłynąć na wynik.',
  footerText: 'Dane pogodowe z Open-Meteo · Kafelki mapy © OpenStreetMap',
  heroText: 'Wyszukaj miasto lub użyj swojej bieżącej lokalizacji, aby zobaczyć prognozę pogody.',
};

export const translations: Record<Language, Translations> = { en, de, pl };
