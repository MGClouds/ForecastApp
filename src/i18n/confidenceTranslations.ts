/**
 * Confidence Engine Translations
 *
 * Dedicated translation dictionary for the Forecast Confidence Engine.
 * Kept separate from the main `translations.ts` because each rule has a
 * title + templated description (with {placeholders}) plus a set of
 * data-label translations used for the small "chips" shown under each
 * factor card (e.g. "Max probability: 62%").
 */

import type { Language } from './translations';

export interface ConfidenceRuleText {
  title: string;
  description: string; // may contain {placeholders}
}

export interface ConfidenceDict {
  dataLabels: {
    maxProbability: string;
    avgProbability: string;
    expectedRain: string;
    totalRain: string;
    avgCloudCover: string;
    maxWindSpeed: string;
    avgWindSpeed: string;
    elevation: string;
    avgTemp: string;
    minTemp: string;
    forecastSnow: string;
    forecastRain: string;
    thunderstormHours: string;
    maxPrecipProbability: string;
    distinctWeatherCodes: string;
    temperatureRange: string;
    avgTempFeelsLikeDiff: string;
    maxDiff: string;
    modelAgreementLabel: string;
    surfacePressure: string;
    pressureChange: string;
    humidity: string;
    cape: string;
    freezingLevel: string;
    windDirectionLabel: string;
  };
  compassDirections: {
    n: string; ne: string; e: string; se: string; s: string; sw: string; w: string; nw: string;
  };
  rules: {
    precipHigh: ConfidenceRuleText;
    precipProbHighAmountLow: ConfidenceRuleText;
    precipModerate: ConfidenceRuleText;
    precipLowModerate: ConfidenceRuleText;
    precipDry: ConfidenceRuleText;
    cloudNoRain: ConfidenceRuleText;
    clearDry: ConfidenceRuleText;
    windVeryHigh: ConfidenceRuleText;
    windHigh: ConfidenceRuleText;
    windCalm: ConfidenceRuleText;
    elevationVeryHigh: ConfidenceRuleText;
    elevationHigh: ConfidenceRuleText;
    elevationModerate: ConfidenceRuleText;
    rainSnowCritical: ConfidenceRuleText;
    rainSnowMarginal: ConfidenceRuleText;
    thunderstorm: ConfidenceRuleText;
    highVariability: ConfidenceRuleText;
    lowVariability: ConfidenceRuleText;
    feelsLikeDivergence: ConfidenceRuleText;
    modelAgreementHigh: ConfidenceRuleText;
    modelAgreementMedium: ConfidenceRuleText;
    modelAgreementLow: ConfidenceRuleText;
    modelAgreementVeryLow: ConfidenceRuleText;
    localisedShowers: ConfidenceRuleText;
    terrainOrographicLift: ConfidenceRuleText;
    terrainFlatStable: ConfidenceRuleText;
    pressureFalling: ConfidenceRuleText;
    pressureRising: ConfidenceRuleText;
    humidityReinforcesRain: ConfidenceRuleText;
    humidityConflict: ConfidenceRuleText;
    capeElevated: ConfidenceRuleText;
    capeStrong: ConfidenceRuleText;
    freezingLevelUncertain: ConfidenceRuleText;
    windMoistureMoist: ConfidenceRuleText;
    windMoistureDry: ConfidenceRuleText;
    windMoistureNeutral: ConfidenceRuleText;
  };
  europeAtlanticHint: string;
  summary: {
    highDry: string;
    highRain: string;
    high: string;
    mediumRain: string;
    medium: string;
    low: string;
  };
}

export const confidenceEn: ConfidenceDict = {
  dataLabels: {
    maxProbability: 'Max probability',
    avgProbability: 'Avg probability',
    expectedRain: 'Expected rain',
    totalRain: 'Total rain',
    avgCloudCover: 'Avg cloud cover',
    maxWindSpeed: 'Max wind speed',
    avgWindSpeed: 'Avg wind speed',
    elevation: 'Elevation',
    avgTemp: 'Avg temp',
    minTemp: 'Min temp',
    forecastSnow: 'Forecast snow',
    forecastRain: 'Forecast rain',
    thunderstormHours: 'Thunderstorm hours',
    maxPrecipProbability: 'Max precip probability',
    distinctWeatherCodes: 'Distinct weather codes',
    temperatureRange: 'Temperature range',
    avgTempFeelsLikeDiff: 'Avg temp-feelsLike diff',
    maxDiff: 'Max diff',
    modelAgreementLabel: 'Model agreement',
    surfacePressure: 'Surface pressure',
    pressureChange: 'Pressure change',
    humidity: 'Humidity',
    cape: 'Atmospheric instability (CAPE)',
    freezingLevel: 'Freezing level',
    windDirectionLabel: 'Wind direction',
  },
  compassDirections: {
    n: 'north', ne: 'northeast', e: 'east', se: 'southeast',
    s: 'south', sw: 'southwest', w: 'west', nw: 'northwest',
  },
  rules: {
    precipHigh: {
      title: 'Rain highly likely',
      description: 'Precipitation probability reaches {maxProb}% with {totalRain} mm of rain expected. The forecast model shows strong and consistent signals for precipitation - conditions are favorable for measurable rain.',
    },
    precipProbHighAmountLow: {
      title: 'High probability but low expected amount',
      description: 'Precipitation probability is {maxProb}%, yet the forecast model suggests only {totalRain} mm of rain. This may indicate light, scattered showers rather than continuous rainfall - some locations nearby could stay dry.',
    },
    precipModerate: {
      title: 'Uncertain precipitation',
      description: 'Precipitation probability peaks at {maxProb}% - the forecast model detects conditions favorable for rain but cannot confirm it with high confidence. The actual outcome depends on fine-scale atmospheric details the model may not fully resolve.',
    },
    precipLowModerate: {
      title: 'Slight chance of rain',
      description: 'Precipitation probability stays between {minProb}% and {maxProb}%. Rain is possible but unlikely. Conditions are only marginally favorable - most of the day forecast suggests dry weather.',
    },
    precipDry: {
      title: 'Low rain risk - stable conditions',
      description: 'Precipitation probability remains below {maxProb}% throughout the forecast period. The atmosphere appears stable and dry conditions are expected. The forecast model shows high confidence in no significant precipitation.',
    },
    cloudNoRain: {
      title: 'Cloud cover without significant precipitation',
      description: 'Average cloud cover is {avgCloud}%, yet the forecast model predicts only {totalRain} mm of rain with a maximum precipitation probability of {maxProb}%. Thick cloud layers do not always produce measurable rain - this cloud system may pass without significant precipitation.',
    },
    clearDry: {
      title: 'Clear skies support dry forecast',
      description: 'Average cloud cover is only {avgCloud}% with precipitation probability below {maxProb}%. Low cloud cover strongly supports the dry forecast - conditions appear clear and settled.',
    },
    windVeryHigh: {
      title: 'Very high wind speeds - dynamic conditions',
      description: 'Wind speeds may reach {maxWind} km/h (avg {avgWind} km/h). At these speeds, precipitation zones and weather fronts can shift position by tens of kilometres within hours. Exact timing and location of any rainfall is highly uncertain.',
    },
    windHigh: {
      title: 'High wind speeds may shift precipitation timing',
      description: 'Wind speeds may reach {maxWind} km/h. Fast-moving air masses can cause precipitation zones to arrive earlier or later than forecast - timing of any rain could shift by 1 to 2 hours from model predictions.',
    },
    windCalm: {
      title: 'Calm winds support forecast accuracy',
      description: 'Wind speeds remain low at up to {maxWind} km/h. Calm conditions mean weather systems are moving slowly and predictably - the forecast model can resolve their position more accurately.',
    },
    elevationVeryHigh: {
      title: 'High altitude - strong terrain effects',
      description: '{location} is located at approximately {elevation} m above sea level. At this altitude, orographic lift can dramatically enhance precipitation on windward slopes while leaving leeward areas dry. Small changes in wind direction can completely alter local conditions - models at typical resolutions may not fully capture these effects.',
    },
    elevationHigh: {
      title: 'Elevated terrain influences local forecast',
      description: '{location} sits at approximately {elevation} m elevation. Terrain at this height can force air upward, triggering or enhancing precipitation locally. The forecast model may slightly underestimate or misplace precipitation due to terrain interactions.',
    },
    elevationModerate: {
      title: 'Moderate elevation - some terrain influence',
      description: '{location} is at approximately {elevation} m elevation. At this height, the surrounding terrain can cause local weather variations - particularly with respect to cloud formation and shower development - that are not always captured by grid-based forecast models.',
    },
    rainSnowCritical: {
      title: 'Rain/snow transition - high precipitation type uncertainty',
      description: 'Average temperature is {avgTemp}°C with {totalSnow} cm of snowfall and {totalRain} mm of rain in the forecast. The location is right at the freezing level - a 1–2°C change in temperature can determine whether precipitation falls as rain, sleet, or snow. The boundary between rain and snow is very difficult for models to predict precisely.',
    },
    rainSnowMarginal: {
      title: 'Wet snow possible at marginal temperatures',
      description: 'Average temperature is {avgTemp}°C, but the forecast still includes {totalSnow} cm of snowfall. At these temperatures, snow is possible at higher elevations or during colder overnight hours, but rainfall is more likely at lower levels. The exact precipitation type depends on fine-scale temperature profiles.',
    },
    thunderstorm: {
      title: 'Thunderstorm activity - convective uncertainty',
      description: '{hours} hour(s) show thunderstorm conditions. Convective storms are inherently difficult to forecast - they can develop rapidly, affect small areas, and produce intense rainfall in one location while missing a nearby area completely. Precipitation amounts may vary significantly over short distances.',
    },
    highVariability: {
      title: 'Highly variable conditions throughout the day',
      description: 'The forecast includes {distinctCodes} different weather condition types with a temperature range of {tempRange}°C. Highly variable conditions indicate a dynamically active atmosphere where timing of transitions is harder to predict accurately.',
    },
    lowVariability: {
      title: 'Consistent conditions throughout the day',
      description: 'Only {distinctCodes} weather condition type(s) forecast with a temperature range of just {tempRange}°C. Consistent conditions suggest a stable air mass in place - the model has a simpler scenario to predict and is likely more reliable.',
    },
    feelsLikeDivergence: {
      title: 'Significant wind chill or heat index effect',
      description: 'Actual temperature and apparent (feels-like) temperature differ by an average of {avgDiff}°C (up to {maxDiff}°C). This is driven by wind speeds averaging {avgWind} km/h. High wind chill also indicates active wind-driven weather patterns that tend to be more variable.',
    },
    modelAgreementHigh: {
      title: 'Strong model agreement',
      description: 'The 3 weather models (Open-Meteo, ECMWF IFS, DWD ICON-EU) agree closely with {pct}% agreement on temperature forecasts. High inter-model agreement is a strong indicator that the atmospheric pattern is well-defined and the forecast is more reliable.',
    },
    modelAgreementMedium: {
      title: 'Moderate model agreement',
      description: 'The 3 forecast models show {pct}% agreement. Minor differences between Open-Meteo, ECMWF IFS, and DWD ICON-EU suggest some uncertainty in how the atmosphere will evolve - the averaged forecast is a reasonable estimate but individual models diverge on some details.',
    },
    modelAgreementLow: {
      title: 'Low model agreement - diverging forecasts',
      description: 'Model agreement is only {pct}%. Open-Meteo, ECMWF IFS, and DWD ICON-EU give noticeably different temperature forecasts, suggesting the atmosphere is in a complex state that different modelling approaches resolve differently. The averaged result carries higher uncertainty.',
    },
    modelAgreementVeryLow: {
      title: 'Very low model agreement - high forecast uncertainty',
      description: 'Model agreement is only {pct}%. The 3 forecast models diverge significantly on temperature and likely other variables. This is a strong warning that atmospheric conditions are poorly constrained by current model runs - treat this forecast with considerable caution.',
    },
    localisedShowers: {
      title: 'Localised shower risk',
      description: 'Precipitation probability reaches {maxProb}% but total expected rain is only {totalRain} mm. This pattern is typical of scattered, localised showers - one street may get rain while another remains dry. The model captures the overall shower risk but cannot pinpoint exactly which areas will be affected.',
    },
    terrainOrographicLift: {
      title: 'Elevated terrain may enhance local precipitation',
      description: '{location} sits at approximately {elevation} m elevation, with wind coming from the {direction}. Air forced upward over higher terrain (orographic lift) may enhance cloud formation or rainfall on windward slopes, while other nearby slopes could stay drier due to a possible rain-shadow effect. This is a general terrain heuristic rather than a precise slope-by-slope analysis.',
    },
    terrainFlatStable: {
      title: 'Low-elevation, flatter terrain',
      description: '{location} lies at approximately {elevation} m elevation, on relatively flat or low-lying terrain. Local terrain-driven effects on cloud formation or precipitation are likely less pronounced here than in mountainous areas, though coastal or valley moisture effects could still play a minor role.',
    },
    pressureFalling: {
      title: 'Falling pressure - signals changing weather',
      description: 'Surface pressure is dropping by about {absDelta} hPa over the next few hours (from {startPressure} to {endPressure} hPa). A falling pressure trend often signals an approaching low-pressure system or increasing atmospheric instability, which may raise the chance of clouds or precipitation developing while making the exact evolution harder to pin down.',
    },
    pressureRising: {
      title: 'Pressure rising or stable - supports settled weather',
      description: 'Surface pressure is holding steady or rising by about {absDelta} hPa over the next few hours (from {startPressure} to {endPressure} hPa). Stable or rising pressure typically favors calmer, more predictable weather.',
    },
    humidityReinforcesRain: {
      title: 'High humidity reinforces rain signal',
      description: 'Relative humidity averages {avgHumidity}% alongside {avgCloud}% average cloud cover. This combination of high humidity and cloud cover reinforces the likelihood that the forecast precipitation signal is accurate.',
    },
    humidityConflict: {
      title: 'Low humidity conflicts with rain probability',
      description: 'Relative humidity averages only {avgHumidity}%, despite a precipitation probability of up to {maxProb}%. Low humidity alongside a notable rain probability is a conflicting signal that may add uncertainty to the precipitation forecast.',
    },
    capeElevated: {
      title: 'Some atmospheric instability (CAPE) present',
      description: 'CAPE (Convective Available Potential Energy) reaches about {maxCape} J/kg. This level of instability may support localized or convective showers, which tend to be harder to pinpoint in exact timing and location than widespread frontal rain.',
    },
    capeStrong: {
      title: 'Strong atmospheric instability - thunderstorm potential',
      description: 'CAPE reaches about {maxCape} J/kg, suggesting strong atmospheric instability. This raises the chance of thunderstorms or heavy convective showers, which are inherently localized and difficult to forecast precisely in time and place.',
    },
    freezingLevelUncertain: {
      title: 'Freezing level close to local elevation',
      description: 'The freezing level is forecast at approximately {freezingLevel} m, close to the elevation of {location} (about {elevation} m - a difference of only {diff} m). A small shift in the freezing level could change whether precipitation falls as rain or snow, adding uncertainty to the expected precipitation type.',
    },
    windMoistureMoist: {
      title: 'Wind direction suggests moister air mass',
      description: 'Wind is coming from the {direction}. In many regions this direction tends to carry more moisture, which may reinforce the likelihood of cloud development or precipitation - though this is a general heuristic rather than precise air-mass tracking.',
    },
    windMoistureDry: {
      title: 'Wind direction suggests drier air mass',
      description: 'Wind is coming from the {direction}, an origin that often carries drier continental air in many regions. This may support a lower precipitation outlook, though local conditions can vary considerably.',
    },
    windMoistureNeutral: {
      title: 'Wind direction noted',
      description: 'Wind is coming from the {direction}. Wind direction can indicate the general origin of an air mass and may influence moisture content, though without full air-mass tracking this remains only a general indication.',
    },
  },
  europeAtlanticHint: ' In Western and Central Europe, westerly and southwesterly winds often carry moist Atlantic air, which could further increase precipitation potential.',
  summary: {
    highDry: 'The forecast for {location} carries high confidence (score {score}/100). Atmospheric conditions appear stable and well-defined - dry, settled weather is expected with low precipitation risk and consistent conditions throughout the day.',
    highRain: 'The forecast for {location} carries high confidence (score {score}/100). Rain is likely - precipitation probability reaches {maxProb}% with {totalRain} mm expected. The forecast model and all three ensemble members agree on a precipitation event.',
    high: 'The forecast for {location} appears reliable (score {score}/100). Cloud cover averages {avgCloud}% and conditions are relatively straightforward, with no major sources of uncertainty identified by the forecast engine.',
    mediumRain: 'Moderate uncertainty exists for {location} (score {score}/100). Precipitation probability reaches {maxProb}%, but several factors - including model spread and local terrain - introduce doubt about exact timing, location, and amount. The forecast suggests possible rain but cannot confirm it with high confidence.',
    medium: 'The forecast for {location} has moderate confidence (score {score}/100). Most conditions are reasonably well-defined, but some atmospheric factors introduce uncertainty. The forecast should be treated as a reliable guide with some margin for variation.',
    low: 'The forecast for {location} carries significant uncertainty (score {score}/100). Multiple factors are working against forecast reliability - near-freezing temperatures, diverging model outputs, complex terrain effects, or convective instability. Use this forecast as a general guide and expect possible surprises.',
  },
};

export const confidenceDe: ConfidenceDict = {
  dataLabels: {
    maxProbability: 'Max. Wahrscheinlichkeit',
    avgProbability: 'Ø Wahrscheinlichkeit',
    expectedRain: 'Erwarteter Regen',
    totalRain: 'Gesamtregen',
    avgCloudCover: 'Ø Bewölkung',
    maxWindSpeed: 'Max. Windgeschw.',
    avgWindSpeed: 'Ø Windgeschw.',
    elevation: 'Höhe',
    avgTemp: 'Ø Temperatur',
    minTemp: 'Min. Temperatur',
    forecastSnow: 'Prognostizierter Schnee',
    forecastRain: 'Prognostizierter Regen',
    thunderstormHours: 'Gewitterstunden',
    maxPrecipProbability: 'Max. Niederschlagswahrsch.',
    distinctWeatherCodes: 'Verschiedene Wettertypen',
    temperatureRange: 'Temperaturbereich',
    avgTempFeelsLikeDiff: 'Ø Differenz gefühlt/real',
    maxDiff: 'Max. Differenz',
    modelAgreementLabel: 'Modellübereinstimmung',
    surfacePressure: 'Bodendruck',
    pressureChange: 'Druckänderung',
    humidity: 'Luftfeuchtigkeit',
    cape: 'Atmosphärische Instabilität (CAPE)',
    freezingLevel: 'Nullgradgrenze',
    windDirectionLabel: 'Windrichtung',
  },
  compassDirections: {
    n: 'Norden', ne: 'Nordosten', e: 'Osten', se: 'Südosten',
    s: 'Süden', sw: 'Südwesten', w: 'Westen', nw: 'Nordwesten',
  },
  rules: {
    precipHigh: {
      title: 'Regen sehr wahrscheinlich',
      description: 'Die Niederschlagswahrscheinlichkeit erreicht {maxProb}% bei erwarteten {totalRain} mm Regen. Das Vorhersagemodell zeigt starke und konsistente Signale für Niederschlag - die Bedingungen begünstigen messbaren Regen.',
    },
    precipProbHighAmountLow: {
      title: 'Hohe Wahrscheinlichkeit, aber geringe erwartete Menge',
      description: 'Die Niederschlagswahrscheinlichkeit beträgt {maxProb}%, das Modell erwartet jedoch nur {totalRain} mm Regen. Dies könnte auf leichte, vereinzelte Schauer statt durchgehenden Regen hindeuten - manche nahegelegene Orte könnten trocken bleiben.',
    },
    precipModerate: {
      title: 'Unsicherer Niederschlag',
      description: 'Die Niederschlagswahrscheinlichkeit erreicht maximal {maxProb}% - das Modell erkennt für Regen günstige Bedingungen, kann dies aber nicht mit hoher Sicherheit bestätigen. Das tatsächliche Ergebnis hängt von kleinräumigen atmosphärischen Details ab, die das Modell möglicherweise nicht vollständig erfasst.',
    },
    precipLowModerate: {
      title: 'Geringe Regenchance',
      description: 'Die Niederschlagswahrscheinlichkeit liegt zwischen {minProb}% und {maxProb}%. Regen ist möglich, aber unwahrscheinlich. Die Bedingungen sind nur geringfügig günstig - die Prognose deutet für den größten Teil des Tages auf trockenes Wetter hin.',
    },
    precipDry: {
      title: 'Geringes Regenrisiko - stabile Bedingungen',
      description: 'Die Niederschlagswahrscheinlichkeit bleibt während des gesamten Vorhersagezeitraums unter {maxProb}%. Die Atmosphäre erscheint stabil, trockene Bedingungen werden erwartet. Das Modell zeigt hohe Zuversicht, dass kein nennenswerter Niederschlag auftritt.',
    },
    cloudNoRain: {
      title: 'Bewölkung ohne nennenswerten Niederschlag',
      description: 'Die durchschnittliche Bewölkung beträgt {avgCloud}%, das Modell sagt jedoch nur {totalRain} mm Regen bei einer maximalen Niederschlagswahrscheinlichkeit von {maxProb}% voraus. Dichte Wolkenschichten erzeugen nicht immer messbaren Regen - dieses Wolkensystem könnte ohne nennenswerten Niederschlag vorbeiziehen.',
    },
    clearDry: {
      title: 'Klarer Himmel unterstützt trockene Prognose',
      description: 'Die durchschnittliche Bewölkung beträgt nur {avgCloud}% bei einer Niederschlagswahrscheinlichkeit unter {maxProb}%. Geringe Bewölkung unterstützt stark die trockene Prognose - die Bedingungen erscheinen klar und beständig.',
    },
    windVeryHigh: {
      title: 'Sehr hohe Windgeschwindigkeiten - dynamische Bedingungen',
      description: 'Windgeschwindigkeiten können {maxWind} km/h erreichen (Ø {avgWind} km/h). Bei diesen Geschwindigkeiten können sich Niederschlagszonen und Wetterfronten innerhalb weniger Stunden um Dutzende Kilometer verschieben. Der genaue Zeitpunkt und Ort von Regenfällen ist sehr unsicher.',
    },
    windHigh: {
      title: 'Hohe Windgeschwindigkeiten können Niederschlagszeitpunkt verschieben',
      description: 'Windgeschwindigkeiten können {maxWind} km/h erreichen. Schnell bewegte Luftmassen können dazu führen, dass Niederschlagszonen früher oder später als vorhergesagt eintreffen - der Zeitpunkt von Regen könnte sich um 1 bis 2 Stunden gegenüber der Modellvorhersage verschieben.',
    },
    windCalm: {
      title: 'Ruhige Winde unterstützen die Prognosegenauigkeit',
      description: 'Die Windgeschwindigkeiten bleiben mit bis zu {maxWind} km/h niedrig. Ruhige Bedingungen bedeuten, dass sich Wettersysteme langsam und vorhersehbar bewegen - das Modell kann ihre Position genauer bestimmen.',
    },
    elevationVeryHigh: {
      title: 'Große Höhe - starke Geländeeffekte',
      description: '{location} liegt auf etwa {elevation} m über dem Meeresspiegel. In dieser Höhe kann orographische Hebung Niederschlag an Luvhängen deutlich verstärken, während Leehänge trocken bleiben. Kleine Änderungen der Windrichtung können lokale Bedingungen völlig verändern - Modelle mit typischer Auflösung erfassen diese Effekte möglicherweise nicht vollständig.',
    },
    elevationHigh: {
      title: 'Erhöhtes Gelände beeinflusst lokale Prognose',
      description: '{location} liegt auf etwa {elevation} m Höhe. Gelände in dieser Höhe kann Luft nach oben zwingen und dadurch Niederschlag lokal auslösen oder verstärken. Das Modell könnte Niederschlag aufgrund von Geländeeinflüssen leicht unterschätzen oder falsch platzieren.',
    },
    elevationModerate: {
      title: 'Mittlere Höhenlage - gewisser Geländeeinfluss',
      description: '{location} liegt auf etwa {elevation} m Höhe. In dieser Höhe kann das umliegende Gelände lokale Wetterschwankungen verursachen - insbesondere bei Wolkenbildung und Schauerentwicklung - die von gitterbasierten Modellen nicht immer erfasst werden.',
    },
    rainSnowCritical: {
      title: 'Regen-Schnee-Übergang - hohe Unsicherheit bei der Niederschlagsart',
      description: 'Die Durchschnittstemperatur beträgt {avgTemp}°C bei prognostizierten {totalSnow} cm Schnee und {totalRain} mm Regen. Der Ort liegt genau an der Gefriergrenze - eine Temperaturänderung von 1–2°C kann entscheiden, ob Niederschlag als Regen, Schneeregen oder Schnee fällt. Die Grenze zwischen Regen und Schnee ist für Modelle sehr schwer präzise vorherzusagen.',
    },
    rainSnowMarginal: {
      title: 'Nasser Schnee bei Grenztemperaturen möglich',
      description: 'Die Durchschnittstemperatur beträgt {avgTemp}°C, dennoch enthält die Prognose weiterhin {totalSnow} cm Schnee. Bei diesen Temperaturen ist Schnee in höheren Lagen oder während kälterer Nachtstunden möglich, in tieferen Lagen ist jedoch Regen wahrscheinlicher. Die genaue Niederschlagsart hängt von kleinräumigen Temperaturprofilen ab.',
    },
    thunderstorm: {
      title: 'Gewitteraktivität - konvektive Unsicherheit',
      description: '{hours} Stunde(n) zeigen Gewitterbedingungen. Konvektive Stürme sind naturgemäß schwer vorherzusagen - sie können sich schnell entwickeln, kleine Gebiete betreffen und an einem Ort starken Regen verursachen, während ein nahegelegenes Gebiet vollständig verschont bleibt. Die Niederschlagsmengen können über kurze Distanzen erheblich variieren.',
    },
    highVariability: {
      title: 'Stark wechselhafte Bedingungen im Tagesverlauf',
      description: 'Die Prognose umfasst {distinctCodes} verschiedene Wettertypen bei einem Temperaturbereich von {tempRange}°C. Stark wechselhafte Bedingungen deuten auf eine dynamisch aktive Atmosphäre hin, bei der der Zeitpunkt von Übergängen schwerer genau vorherzusagen ist.',
    },
    lowVariability: {
      title: 'Beständige Bedingungen im Tagesverlauf',
      description: 'Nur {distinctCodes} Wettertyp(en) werden bei einem Temperaturbereich von nur {tempRange}°C vorhergesagt. Beständige Bedingungen deuten auf eine stabile Luftmasse hin - das Modell hat ein einfacheres Szenario vorherzusagen und ist wahrscheinlich zuverlässiger.',
    },
    feelsLikeDivergence: {
      title: 'Deutlicher Windchill- oder Hitzeindex-Effekt',
      description: 'Die tatsächliche und die gefühlte Temperatur unterscheiden sich im Durchschnitt um {avgDiff}°C (bis zu {maxDiff}°C). Dies wird durch Windgeschwindigkeiten von durchschnittlich {avgWind} km/h verursacht. Starker Windchill deutet zudem auf aktive, windgetriebene Wettermuster hin, die tendenziell variabler sind.',
    },
    modelAgreementHigh: {
      title: 'Starke Modellübereinstimmung',
      description: 'Die 3 Wettermodelle (Open-Meteo, ECMWF IFS, DWD ICON-EU) stimmen mit {pct}% Übereinstimmung bei den Temperaturprognosen eng überein. Hohe Übereinstimmung zwischen Modellen ist ein starker Hinweis darauf, dass das atmosphärische Muster gut definiert ist und die Prognose zuverlässiger ist.',
    },
    modelAgreementMedium: {
      title: 'Mäßige Modellübereinstimmung',
      description: 'Die 3 Vorhersagemodelle zeigen {pct}% Übereinstimmung. Geringe Unterschiede zwischen Open-Meteo, ECMWF IFS und DWD ICON-EU deuten auf gewisse Unsicherheit bei der atmosphärischen Entwicklung hin - die gemittelte Prognose ist eine vernünftige Schätzung, einzelne Modelle weichen jedoch in Details ab.',
    },
    modelAgreementLow: {
      title: 'Geringe Modellübereinstimmung - abweichende Prognosen',
      description: 'Die Modellübereinstimmung beträgt nur {pct}%. Open-Meteo, ECMWF IFS und DWD ICON-EU liefern merklich unterschiedliche Temperaturprognosen, was darauf hindeutet, dass sich die Atmosphäre in einem komplexen Zustand befindet, den verschiedene Modellansätze unterschiedlich auflösen. Das gemittelte Ergebnis birgt höhere Unsicherheit.',
    },
    modelAgreementVeryLow: {
      title: 'Sehr geringe Modellübereinstimmung - hohe Prognoseunsicherheit',
      description: 'Die Modellübereinstimmung beträgt nur {pct}%. Die 3 Vorhersagemodelle weichen bei der Temperatur und wahrscheinlich weiteren Variablen erheblich voneinander ab. Dies ist ein starkes Warnsignal, dass die atmosphärischen Bedingungen durch die aktuellen Modellläufe schlecht eingegrenzt sind - diese Prognose sollte mit erheblicher Vorsicht behandelt werden.',
    },
    localisedShowers: {
      title: 'Risiko lokaler Schauer',
      description: 'Die Niederschlagswahrscheinlichkeit erreicht {maxProb}%, die erwartete Gesamtregenmenge beträgt jedoch nur {totalRain} mm. Dieses Muster ist typisch für vereinzelte, lokale Schauer - eine Straße kann Regen bekommen, während eine andere trocken bleibt. Das Modell erfasst das allgemeine Schauerrisiko, kann aber nicht genau bestimmen, welche Gebiete betroffen sind.',
    },
    terrainOrographicLift: {
      title: 'Erhöhtes Gelände kann lokalen Niederschlag verstärken',
      description: '{location} liegt auf etwa {elevation} m Höhe, mit Wind aus {direction}. Luft, die über höheres Gelände nach oben gezwungen wird (orographische Hebung), kann die Wolkenbildung oder den Niederschlag an Luvhängen verstärken, während benachbarte Hänge durch einen möglichen Lee-Effekt trockener bleiben könnten. Dies ist eine allgemeine Geländeheuristik und keine präzise hangweise Analyse.',
    },
    terrainFlatStable: {
      title: 'Niedrige Höhenlage, flacheres Gelände',
      description: '{location} liegt auf etwa {elevation} m Höhe, auf relativ flachem oder tief gelegenem Gelände. Geländebedingte Effekte auf Wolkenbildung oder Niederschlag sind hier wahrscheinlich weniger ausgeprägt als in Gebirgsregionen, wobei küsten- oder talbedingte Feuchteeffekte dennoch eine kleine Rolle spielen könnten.',
    },
    pressureFalling: {
      title: 'Fallender Druck - Anzeichen für Wetteränderung',
      description: 'Der Bodendruck fällt in den nächsten Stunden um etwa {absDelta} hPa (von {startPressure} auf {endPressure} hPa). Ein fallender Drucktrend deutet oft auf ein herannahendes Tiefdrucksystem oder zunehmende atmosphärische Instabilität hin, was die Wahrscheinlichkeit von Wolken oder Niederschlag erhöhen kann, während der genaue Verlauf schwerer vorherzusagen ist.',
    },
    pressureRising: {
      title: 'Steigender oder stabiler Druck - unterstützt beständiges Wetter',
      description: 'Der Bodendruck bleibt in den nächsten Stunden stabil oder steigt um etwa {absDelta} hPa (von {startPressure} auf {endPressure} hPa). Stabiler oder steigender Druck begünstigt in der Regel ruhigeres, besser vorhersehbares Wetter.',
    },
    humidityReinforcesRain: {
      title: 'Hohe Luftfeuchtigkeit bestärkt das Regensignal',
      description: 'Die relative Luftfeuchtigkeit beträgt im Durchschnitt {avgHumidity}% bei einer durchschnittlichen Bewölkung von {avgCloud}%. Diese Kombination aus hoher Luftfeuchtigkeit und Bewölkung bestärkt die Wahrscheinlichkeit, dass das prognostizierte Niederschlagssignal zutrifft.',
    },
    humidityConflict: {
      title: 'Geringe Luftfeuchtigkeit widerspricht der Regenwahrscheinlichkeit',
      description: 'Die relative Luftfeuchtigkeit beträgt im Durchschnitt nur {avgHumidity}%, trotz einer Niederschlagswahrscheinlichkeit von bis zu {maxProb}%. Geringe Luftfeuchtigkeit bei nennenswerter Regenwahrscheinlichkeit ist ein widersprüchliches Signal, das zusätzliche Unsicherheit in die Niederschlagsprognose bringen kann.',
    },
    capeElevated: {
      title: 'Gewisse atmosphärische Instabilität (CAPE) vorhanden',
      description: 'CAPE (Convective Available Potential Energy) erreicht etwa {maxCape} J/kg. Dieses Instabilitätsniveau kann lokale oder konvektive Schauer begünstigen, deren genauer Zeitpunkt und Ort schwerer zu bestimmen sind als bei großflächigem Frontalregen.',
    },
    capeStrong: {
      title: 'Starke atmosphärische Instabilität - Gewitterpotenzial',
      description: 'CAPE erreicht etwa {maxCape} J/kg, was auf starke atmosphärische Instabilität hindeutet. Dies erhöht die Wahrscheinlichkeit von Gewittern oder starken konvektiven Schauern, die naturgemäß lokal begrenzt und zeitlich sowie räumlich schwer präzise vorherzusagen sind.',
    },
    freezingLevelUncertain: {
      title: 'Nullgradgrenze nahe der lokalen Höhenlage',
      description: 'Die Nullgradgrenze wird bei etwa {freezingLevel} m prognostiziert, nahe der Höhenlage von {location} (etwa {elevation} m - ein Unterschied von nur {diff} m). Eine kleine Verschiebung der Nullgradgrenze könnte darüber entscheiden, ob Niederschlag als Regen oder Schnee fällt, was Unsicherheit bezüglich der erwarteten Niederschlagsart mit sich bringt.',
    },
    windMoistureMoist: {
      title: 'Windrichtung deutet auf feuchtere Luftmasse hin',
      description: 'Der Wind kommt aus {direction}. In vielen Regionen führt diese Richtung tendenziell mehr Feuchtigkeit mit sich, was die Wahrscheinlichkeit von Wolkenbildung oder Niederschlag bestärken kann - dies ist jedoch eine allgemeine Heuristik und keine präzise Luftmassenverfolgung.',
    },
    windMoistureDry: {
      title: 'Windrichtung deutet auf trockenere Luftmasse hin',
      description: 'Der Wind kommt aus {direction}, einer Herkunft, die in vielen Regionen oft trockenere kontinentale Luft mit sich bringt. Dies kann eine niedrigere Niederschlagsprognose unterstützen, wobei lokale Bedingungen erheblich variieren können.',
    },
    windMoistureNeutral: {
      title: 'Windrichtung vermerkt',
      description: 'Der Wind kommt aus {direction}. Die Windrichtung kann die allgemeine Herkunft einer Luftmasse anzeigen und den Feuchtigkeitsgehalt beeinflussen, bleibt jedoch ohne vollständige Luftmassenverfolgung nur ein allgemeiner Hinweis.',
    },
  },
  europeAtlanticHint: ' In West- und Mitteleuropa führen west- und südwestliche Winde oft feuchte Atlantikluft mit sich, was das Niederschlagspotenzial weiter erhöhen könnte.',
  summary: {
    highDry: 'Die Prognose für {location} weist hohe Zuverlässigkeit auf (Wert {score}/100). Die atmosphärischen Bedingungen erscheinen stabil und gut definiert - trockenes, beständiges Wetter wird mit geringem Niederschlagsrisiko und gleichbleibenden Bedingungen im Tagesverlauf erwartet.',
    highRain: 'Die Prognose für {location} weist hohe Zuverlässigkeit auf (Wert {score}/100). Regen ist wahrscheinlich - die Niederschlagswahrscheinlichkeit erreicht {maxProb}% bei erwarteten {totalRain} mm. Das Vorhersagemodell und alle drei Ensemble-Mitglieder stimmen bei einem Niederschlagsereignis überein.',
    high: 'Die Prognose für {location} erscheint zuverlässig (Wert {score}/100). Die Bewölkung beträgt im Durchschnitt {avgCloud}%, die Bedingungen sind relativ unkompliziert, ohne größere vom Prognosemodell identifizierte Unsicherheitsquellen.',
    mediumRain: 'Für {location} besteht mäßige Unsicherheit (Wert {score}/100). Die Niederschlagswahrscheinlichkeit erreicht {maxProb}%, aber mehrere Faktoren - einschließlich Modellstreuung und lokalem Gelände - führen zu Zweifeln an genauem Zeitpunkt, Ort und Menge. Die Prognose deutet auf möglichen Regen hin, kann dies aber nicht mit hoher Sicherheit bestätigen.',
    medium: 'Die Prognose für {location} hat eine mäßige Zuverlässigkeit (Wert {score}/100). Die meisten Bedingungen sind einigermaßen gut definiert, einige atmosphärische Faktoren führen jedoch zu Unsicherheit. Die Prognose sollte als verlässlicher Anhaltspunkt mit gewissem Spielraum für Abweichungen betrachtet werden.',
    low: 'Die Prognose für {location} birgt erhebliche Unsicherheit (Wert {score}/100). Mehrere Faktoren wirken gegen die Prognosezuverlässigkeit - Temperaturen nahe dem Gefrierpunkt, abweichende Modellergebnisse, komplexe Geländeeffekte oder konvektive Instabilität. Betrachten Sie diese Prognose als allgemeinen Anhaltspunkt und rechnen Sie mit möglichen Überraschungen.',
  },
};

export const confidencePl: ConfidenceDict = {
  dataLabels: {
    maxProbability: 'Maks. prawdopodobieństwo',
    avgProbability: 'Śr. prawdopodobieństwo',
    expectedRain: 'Oczekiwany deszcz',
    totalRain: 'Suma opadów',
    avgCloudCover: 'Śr. zachmurzenie',
    maxWindSpeed: 'Maks. prędkość wiatru',
    avgWindSpeed: 'Śr. prędkość wiatru',
    elevation: 'Wysokość',
    avgTemp: 'Śr. temperatura',
    minTemp: 'Min. temperatura',
    forecastSnow: 'Prognozowany śnieg',
    forecastRain: 'Prognozowany deszcz',
    thunderstormHours: 'Godziny burzowe',
    maxPrecipProbability: 'Maks. prawdop. opadów',
    distinctWeatherCodes: 'Różne typy pogody',
    temperatureRange: 'Zakres temperatur',
    avgTempFeelsLikeDiff: 'Śr. różnica odczuwalna/rzeczywista',
    maxDiff: 'Maks. różnica',
    modelAgreementLabel: 'Zgodność modeli',
    surfacePressure: 'Ciśnienie przy powierzchni',
    pressureChange: 'Zmiana ciśnienia',
    humidity: 'Wilgotność',
    cape: 'Niestabilność atmosferyczna (CAPE)',
    freezingLevel: 'Poziom izotermy 0°C',
    windDirectionLabel: 'Kierunek wiatru',
  },
  compassDirections: {
    n: 'północy', ne: 'północnego wschodu', e: 'wschodu', se: 'południowego wschodu',
    s: 'południa', sw: 'południowego zachodu', w: 'zachodu', nw: 'północnego zachodu',
  },
  rules: {
    precipHigh: {
      title: 'Deszcz bardzo prawdopodobny',
      description: 'Prawdopodobieństwo opadów sięga {maxProb}% przy oczekiwanych {totalRain} mm deszczu. Model prognostyczny wykazuje silne i spójne sygnały opadów - warunki sprzyjają wystąpieniu mierzalnego deszczu.',
    },
    precipProbHighAmountLow: {
      title: 'Wysokie prawdopodobieństwo, ale niska oczekiwana ilość',
      description: 'Prawdopodobieństwo opadów wynosi {maxProb}%, jednak model przewiduje jedynie {totalRain} mm deszczu. Może to wskazywać na lekkie, rozproszone przelotne opady zamiast ciągłego deszczu - niektóre pobliskie miejsca mogą pozostać suche.',
    },
    precipModerate: {
      title: 'Niepewne opady',
      description: 'Prawdopodobieństwo opadów osiąga maksymalnie {maxProb}% - model wykrywa warunki sprzyjające opadom, ale nie może tego potwierdzić z wysoką pewnością. Rzeczywisty wynik zależy od szczegółów atmosferycznych w małej skali, których model może nie w pełni uwzględniać.',
    },
    precipLowModerate: {
      title: 'Niewielka szansa na deszcz',
      description: 'Prawdopodobieństwo opadów utrzymuje się między {minProb}% a {maxProb}%. Deszcz jest możliwy, ale mało prawdopodobny. Warunki są tylko nieznacznie sprzyjające - prognoza na większość dnia wskazuje na suchą pogodę.',
    },
    precipDry: {
      title: 'Niskie ryzyko opadów - stabilne warunki',
      description: 'Prawdopodobieństwo opadów pozostaje poniżej {maxProb}% przez cały okres prognozy. Atmosfera wydaje się stabilna, oczekiwane są suche warunki. Model wykazuje wysoką pewność braku istotnych opadów.',
    },
    cloudNoRain: {
      title: 'Zachmurzenie bez istotnych opadów',
      description: 'Średnie zachmurzenie wynosi {avgCloud}%, jednak model przewiduje jedynie {totalRain} mm deszczu przy maksymalnym prawdopodobieństwie opadów {maxProb}%. Grube warstwy chmur nie zawsze powodują mierzalny deszcz - ten system chmur może przejść bez istotnych opadów.',
    },
    clearDry: {
      title: 'Czyste niebo wspiera suchą prognozę',
      description: 'Średnie zachmurzenie wynosi jedynie {avgCloud}% przy prawdopodobieństwie opadów poniżej {maxProb}%. Niskie zachmurzenie silnie wspiera suchą prognozę - warunki wydają się czyste i ustabilizowane.',
    },
    windVeryHigh: {
      title: 'Bardzo silny wiatr - dynamiczne warunki',
      description: 'Prędkość wiatru może osiągnąć {maxWind} km/h (śr. {avgWind} km/h). Przy takich prędkościach strefy opadów i fronty atmosferyczne mogą przemieszczać się o dziesiątki kilometrów w ciągu kilku godzin. Dokładny czas i miejsce ewentualnych opadów są wysoce niepewne.',
    },
    windHigh: {
      title: 'Silny wiatr może przesunąć czas wystąpienia opadów',
      description: 'Prędkość wiatru może osiągnąć {maxWind} km/h. Szybko poruszające się masy powietrza mogą sprawić, że strefy opadów pojawią się wcześniej lub później niż prognozowano - czas wystąpienia deszczu może przesunąć się o 1–2 godziny względem przewidywań modelu.',
    },
    windCalm: {
      title: 'Spokojny wiatr wspiera dokładność prognozy',
      description: 'Prędkość wiatru pozostaje niska, do {maxWind} km/h. Spokojne warunki oznaczają, że układy pogodowe przemieszczają się wolno i przewidywalnie - model może dokładniej określić ich położenie.',
    },
    elevationVeryHigh: {
      title: 'Duża wysokość - silne efekty terenowe',
      description: '{location} znajduje się na wysokości około {elevation} m n.p.m. Na tej wysokości wymuszone wznoszenie powietrza (efekt orograficzny) może znacząco wzmacniać opady na zboczach nawietrznych, pozostawiając zbocza zawietrzne suche. Niewielkie zmiany kierunku wiatru mogą całkowicie zmienić lokalne warunki - modele o typowej rozdzielczości mogą nie w pełni uwzględniać te efekty.',
    },
    elevationHigh: {
      title: 'Wyniesiony teren wpływa na lokalną prognozę',
      description: '{location} leży na wysokości około {elevation} m. Teren na tej wysokości może wymuszać wznoszenie powietrza, wywołując lub wzmacniając lokalne opady. Model prognostyczny może nieznacznie zaniżać lub błędnie lokalizować opady z powodu wpływu ukształtowania terenu.',
    },
    elevationModerate: {
      title: 'Umiarkowana wysokość - pewien wpływ terenu',
      description: '{location} znajduje się na wysokości około {elevation} m. Na tej wysokości otaczający teren może powodować lokalne zróżnicowanie pogody - szczególnie w zakresie formowania się chmur i rozwoju przelotnych opadów - nieuwzględniane zawsze przez modele siatkowe.',
    },
    rainSnowCritical: {
      title: 'Przejście deszcz/śnieg - wysoka niepewność rodzaju opadów',
      description: 'Średnia temperatura wynosi {avgTemp}°C przy prognozowanych {totalSnow} cm śniegu i {totalRain} mm deszczu. Lokalizacja znajduje się dokładnie na granicy zamarzania - zmiana temperatury o 1–2°C może zadecydować, czy opad będzie deszczem, deszczem ze śniegiem czy śniegiem. Granica między deszczem a śniegiem jest bardzo trudna do precyzyjnego przewidzenia przez modele.',
    },
    rainSnowMarginal: {
      title: 'Możliwy mokry śnieg przy granicznych temperaturach',
      description: 'Średnia temperatura wynosi {avgTemp}°C, ale prognoza wciąż obejmuje {totalSnow} cm śniegu. W takich temperaturach śnieg jest możliwy na większych wysokościach lub w chłodniejszych godzinach nocnych, natomiast na niższych poziomach bardziej prawdopodobny jest deszcz. Dokładny rodzaj opadów zależy od szczegółowych profili temperatury.',
    },
    thunderstorm: {
      title: 'Aktywność burzowa - niepewność konwekcyjna',
      description: '{hours} godzin(y) wykazują warunki burzowe. Burze konwekcyjne są z natury trudne do przewidzenia - mogą rozwijać się szybko, obejmować niewielkie obszary i powodować intensywne opady w jednym miejscu, całkowicie omijając pobliski obszar. Ilość opadów może się znacznie różnić na niewielkich odległościach.',
    },
    highVariability: {
      title: 'Bardzo zmienne warunki w ciągu dnia',
      description: 'Prognoza obejmuje {distinctCodes} różnych typów warunków pogodowych przy zakresie temperatur {tempRange}°C. Wysoka zmienność warunków wskazuje na dynamicznie aktywną atmosferę, w której trudniej dokładnie przewidzieć czas przejść między typami pogody.',
    },
    lowVariability: {
      title: 'Spójne warunki w ciągu dnia',
      description: 'Prognozowane są jedynie {distinctCodes} typ(y) pogody przy zakresie temperatur zaledwie {tempRange}°C. Spójne warunki sugerują stabilną masę powietrza - model ma prostszy scenariusz do przewidzenia i jest prawdopodobnie bardziej wiarygodny.',
    },
    feelsLikeDivergence: {
      title: 'Znaczący efekt chłodu wiatru lub indeksu upału',
      description: 'Rzeczywista i odczuwalna temperatura różnią się średnio o {avgDiff}°C (do {maxDiff}°C). Jest to spowodowane prędkością wiatru wynoszącą średnio {avgWind} km/h. Silny efekt chłodu wiatru wskazuje również na aktywne, zależne od wiatru wzorce pogodowe, które zwykle są bardziej zmienne.',
    },
    modelAgreementHigh: {
      title: 'Wysoka zgodność modeli',
      description: '3 modele pogodowe (Open-Meteo, ECMWF IFS, DWD ICON-EU) są zgodne w {pct}% co do prognoz temperatury. Wysoka zgodność między modelami jest silnym wskaźnikiem, że wzorzec atmosferyczny jest dobrze zdefiniowany, a prognoza jest bardziej wiarygodna.',
    },
    modelAgreementMedium: {
      title: 'Umiarkowana zgodność modeli',
      description: '3 modele prognostyczne wykazują {pct}% zgodności. Niewielkie różnice między Open-Meteo, ECMWF IFS i DWD ICON-EU sugerują pewną niepewność co do rozwoju atmosfery - uśredniona prognoza jest rozsądnym oszacowaniem, ale poszczególne modele różnią się w niektórych szczegółach.',
    },
    modelAgreementLow: {
      title: 'Niska zgodność modeli - rozbieżne prognozy',
      description: 'Zgodność modeli wynosi jedynie {pct}%. Open-Meteo, ECMWF IFS i DWD ICON-EU dają zauważalnie różne prognozy temperatury, co sugeruje, że atmosfera znajduje się w złożonym stanie, który różne podejścia modelowe rozwiązują odmiennie. Uśredniony wynik niesie wyższą niepewność.',
    },
    modelAgreementVeryLow: {
      title: 'Bardzo niska zgodność modeli - wysoka niepewność prognozy',
      description: 'Zgodność modeli wynosi jedynie {pct}%. 3 modele prognostyczne znacząco różnią się co do temperatury i prawdopodobnie innych zmiennych. To silne ostrzeżenie, że warunki atmosferyczne są słabo określone przez obecne przebiegi modeli - traktuj tę prognozę ze znaczną ostrożnością.',
    },
    localisedShowers: {
      title: 'Ryzyko lokalnych opadów przelotnych',
      description: 'Prawdopodobieństwo opadów sięga {maxProb}%, ale całkowita oczekiwana ilość deszczu wynosi jedynie {totalRain} mm. Ten wzorzec jest typowy dla rozproszonych, lokalnych przelotnych opadów - na jednej ulicy może padać deszcz, podczas gdy inna pozostanie sucha. Model uwzględnia ogólne ryzyko przelotnych opadów, ale nie może dokładnie wskazać, które obszary zostaną dotknięte.',
    },
    terrainOrographicLift: {
      title: 'Wyniesiony teren może wzmacniać lokalne opady',
      description: '{location} znajduje się na wysokości około {elevation} m, przy wietrze wiejącym od {direction}. Powietrze wymuszone do wznoszenia nad wyższym terenem (efekt orograficzny) może wzmacniać formowanie się chmur lub opady na zboczach nawietrznych, podczas gdy sąsiednie zbocza mogą pozostać bardziej suche z powodu możliwego efektu cienia opadowego. To ogólna heurystyka terenowa, a nie precyzyjna analiza poszczególnych zboczy.',
    },
    terrainFlatStable: {
      title: 'Niska wysokość, płaski teren',
      description: '{location} leży na wysokości około {elevation} m, na stosunkowo płaskim lub nisko położonym terenie. Efekty terenowe wpływające na formowanie się chmur czy opady są tu prawdopodobnie mniej wyraźne niż na obszarach górskich, choć nadmorskie lub dolinowe efekty wilgotności mogą wciąż odgrywać niewielką rolę.',
    },
    pressureFalling: {
      title: 'Spadające ciśnienie - sygnał zmiany pogody',
      description: 'Ciśnienie przy powierzchni spada o około {absDelta} hPa w ciągu najbliższych godzin (z {startPressure} do {endPressure} hPa). Spadający trend ciśnienia często sygnalizuje zbliżający się układ niżowy lub rosnącą niestabilność atmosferyczną, co może zwiększyć szansę na chmury lub opady, jednocześnie utrudniając dokładne określenie ich rozwoju.',
    },
    pressureRising: {
      title: 'Rosnące lub stabilne ciśnienie - sprzyja ustabilizowanej pogodzie',
      description: 'Ciśnienie przy powierzchni pozostaje stabilne lub rośnie o około {absDelta} hPa w ciągu najbliższych godzin (z {startPressure} do {endPressure} hPa). Stabilne lub rosnące ciśnienie zazwyczaj sprzyja spokojniejszej, bardziej przewidywalnej pogodzie.',
    },
    humidityReinforcesRain: {
      title: 'Wysoka wilgotność wzmacnia sygnał opadów',
      description: 'Wilgotność względna wynosi średnio {avgHumidity}% przy średnim zachmurzeniu {avgCloud}%. To połączenie wysokiej wilgotności i zachmurzenia wzmacnia prawdopodobieństwo, że prognozowany sygnał opadów jest trafny.',
    },
    humidityConflict: {
      title: 'Niska wilgotność jest sprzeczna z prawdopodobieństwem opadów',
      description: 'Wilgotność względna wynosi średnio jedynie {avgHumidity}%, mimo prawdopodobieństwa opadów sięgającego {maxProb}%. Niska wilgotność przy zauważalnym prawdopodobieństwie deszczu to sprzeczny sygnał, który może zwiększać niepewność prognozy opadów.',
    },
    capeElevated: {
      title: 'Pewna niestabilność atmosferyczna (CAPE)',
      description: 'CAPE (dostępna energia potencjalna konwekcji) sięga około {maxCape} J/kg. Ten poziom niestabilności może sprzyjać lokalnym lub konwekcyjnym opadom przelotnym, których dokładny czas i miejsce są trudniejsze do określenia niż przy rozległych opadach frontowych.',
    },
    capeStrong: {
      title: 'Silna niestabilność atmosferyczna - potencjał burzowy',
      description: 'CAPE sięga około {maxCape} J/kg, co sugeruje silną niestabilność atmosferyczną. Zwiększa to szansę na burze lub intensywne opady konwekcyjne, które z natury są zlokalizowane i trudne do precyzyjnego przewidzenia co do czasu i miejsca.',
    },
    freezingLevelUncertain: {
      title: 'Poziom izotermy 0°C blisko lokalnej wysokości',
      description: 'Poziom izotermy 0°C prognozowany jest na wysokości około {freezingLevel} m, blisko wysokości {location} (około {elevation} m - różnica zaledwie {diff} m). Niewielka zmiana poziomu izotermy 0°C może zdecydować, czy opady wystąpią jako deszcz czy śnieg, co zwiększa niepewność co do oczekiwanego rodzaju opadów.',
    },
    windMoistureMoist: {
      title: 'Kierunek wiatru sugeruje bardziej wilgotną masę powietrza',
      description: 'Wiatr wieje od {direction}. W wielu regionach ten kierunek zwykle niesie więcej wilgoci, co może wzmacniać prawdopodobieństwo formowania się chmur lub opadów - jest to jednak ogólna heurystyka, a nie precyzyjne śledzenie mas powietrza.',
    },
    windMoistureDry: {
      title: 'Kierunek wiatru sugeruje bardziej suchą masę powietrza',
      description: 'Wiatr wieje od {direction} - kierunku, który w wielu regionach często niesie suchsze, kontynentalne powietrze. Może to wspierać niższą prognozę opadów, choć lokalne warunki mogą się znacznie różnić.',
    },
    windMoistureNeutral: {
      title: 'Odnotowano kierunek wiatru',
      description: 'Wiatr wieje od {direction}. Kierunek wiatru może wskazywać na ogólne pochodzenie masy powietrza i wpływać na zawartość wilgoci, choć bez pełnego śledzenia mas powietrza pozostaje to jedynie ogólną wskazówką.',
    },
  },
  europeAtlanticHint: ' W Europie Zachodniej i Środkowej wiatry zachodnie i południowo-zachodnie często niosą wilgotne powietrze atlantyckie, co mogłoby dodatkowo zwiększyć potencjał opadowy.',
  summary: {
    highDry: 'Prognoza dla {location} charakteryzuje się wysoką pewnością (wynik {score}/100). Warunki atmosferyczne wydają się stabilne i dobrze zdefiniowane - oczekiwana jest sucha, ustabilizowana pogoda z niskim ryzykiem opadów i spójnymi warunkami przez cały dzień.',
    highRain: 'Prognoza dla {location} charakteryzuje się wysoką pewnością (wynik {score}/100). Deszcz jest prawdopodobny - prawdopodobieństwo opadów sięga {maxProb}% przy oczekiwanych {totalRain} mm. Model prognostyczny oraz wszystkie trzy modele zespołu są zgodne co do wystąpienia opadów.',
    high: 'Prognoza dla {location} wydaje się wiarygodna (wynik {score}/100). Średnie zachmurzenie wynosi {avgCloud}%, a warunki są stosunkowo proste, bez większych źródeł niepewności zidentyfikowanych przez silnik prognostyczny.',
    mediumRain: 'Dla {location} istnieje umiarkowana niepewność (wynik {score}/100). Prawdopodobieństwo opadów sięga {maxProb}%, ale kilka czynników - w tym rozbieżność modeli i lokalny teren - wprowadza wątpliwości co do dokładnego czasu, miejsca i ilości opadów. Prognoza sugeruje możliwy deszcz, ale nie może tego potwierdzić z wysoką pewnością.',
    medium: 'Prognoza dla {location} ma umiarkowaną pewność (wynik {score}/100). Większość warunków jest stosunkowo dobrze zdefiniowana, ale niektóre czynniki atmosferyczne wprowadzają niepewność. Prognozę należy traktować jako wiarygodny drogowskaz z pewnym marginesem na odchylenia.',
    low: 'Prognoza dla {location} niesie znaczną niepewność (wynik {score}/100). Wiele czynników działa przeciwko wiarygodności prognozy - temperatury bliskie zeru, rozbieżne wyniki modeli, złożone efekty terenowe lub niestabilność konwekcyjna. Traktuj tę prognozę jako ogólny drogowskaz i spodziewaj się możliwych niespodzianek.',
  },
};

export const confidenceTranslations: Record<Language, ConfidenceDict> = {
  en: confidenceEn,
  de: confidenceDe,
  pl: confidencePl,
};

/** Replaces {placeholder} tokens in a template string with values from params. */
export function formatTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}
