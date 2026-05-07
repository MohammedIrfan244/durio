"use client";

import React, { useState, useEffect } from "react";
import { CloudSun, Droplets, Wind, Thermometer, MapPin, Loader2 } from "lucide-react";

interface WeatherCurrent {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    code: number;
    city: string;
}

interface WeatherForecast {
    date: string;
    dayName: string;
    max: number;
    min: number;
    code: number;
}

// Weather code to info mapping (Open-Meteo WMO codes)
const getWeatherInfo = (code: number): { icon: string; label: string; gradient: string } => {
    if (code === 0) return { icon: "☀️", label: "Clear Sky", gradient: "from-amber-500/20 to-orange-500/10" };
    if (code <= 3) return { icon: "⛅", label: "Partly Cloudy", gradient: "from-blue-400/20 to-sky-500/10" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", label: "Foggy", gradient: "from-gray-400/20 to-slate-500/10" };
    if (code >= 51 && code <= 55) return { icon: "🌦️", label: "Drizzle", gradient: "from-blue-500/20 to-indigo-500/10" };
    if (code >= 56 && code <= 57) return { icon: "🌧️", label: "Freezing Drizzle", gradient: "from-cyan-500/20 to-blue-500/10" };
    if (code >= 61 && code <= 65) return { icon: "🌧️", label: "Rain", gradient: "from-blue-600/20 to-indigo-600/10" };
    if (code >= 66 && code <= 67) return { icon: "🌨️", label: "Freezing Rain", gradient: "from-cyan-600/20 to-blue-600/10" };
    if (code >= 71 && code <= 77) return { icon: "❄️", label: "Snow", gradient: "from-slate-300/20 to-blue-200/10" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Showers", gradient: "from-blue-500/20 to-indigo-500/10" };
    if (code >= 85 && code <= 86) return { icon: "🌨️", label: "Snow Showers", gradient: "from-slate-400/20 to-blue-300/10" };
    if (code >= 95) return { icon: "⛈️", label: "Thunderstorm", gradient: "from-purple-600/20 to-indigo-700/10" };
    return { icon: "☁️", label: "Cloudy", gradient: "from-gray-500/20 to-slate-500/10" };
};

const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
    return date.toLocaleDateString("en", { weekday: "short" });
};

export default function CalendarWeatherWidget() {
    const [current, setCurrent] = useState<WeatherCurrent | null>(null);
    const [forecast, setForecast] = useState<WeatherForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                // Fetch current + forecast
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
                );
                const data = await res.json();

                if (data?.current) {
                    setCurrent({
                        temp: Math.round(data.current.temperature_2m),
                        feelsLike: Math.round(data.current.apparent_temperature),
                        humidity: Math.round(data.current.relative_humidity_2m),
                        windSpeed: Math.round(data.current.wind_speed_10m),
                        code: data.current.weather_code,
                        city: `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`,
                    });
                }

                if (data?.daily) {
                    const fc: WeatherForecast[] = data.daily.time.map((t: string, i: number) => ({
                        date: t,
                        dayName: getDayName(t),
                        max: Math.round(data.daily.temperature_2m_max[i]),
                        min: Math.round(data.daily.temperature_2m_min[i]),
                        code: data.daily.weather_code[i],
                    }));
                    setForecast(fc);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(11.2588, 75.7804) // Fallback: Kozhikode
            );
        } else {
            fetchWeather(11.2588, 75.7804);
        }
    }, []);

    if (loading) {
        return (
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-5 shadow-sm flex items-center justify-center h-40">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
        );
    }

    if (error || !current) {
        return null;
    }

    const weatherInfo = getWeatherInfo(current.code);

    return (
        <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm overflow-hidden relative">
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${weatherInfo.gradient} pointer-events-none transition-all duration-1000`} />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none animate-pulse" />
            
            {/* Current weather */}
            <div className="relative p-5 pb-3">
                <div className="flex items-center gap-1.5 mb-3">
                    <CloudSun className="w-3.5 h-3.5 text-primary" />
                    <h3 className="font-bold text-xs text-muted-foreground tracking-widest uppercase">Weather</h3>
                </div>
                
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-end gap-1">
                            <span className="text-4xl font-bold text-foreground leading-none tracking-tight">
                                {current.temp}°
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium mt-1">
                            {weatherInfo.label}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground/60" />
                            <span className="text-[10px] text-muted-foreground/60">{current.city}</span>
                        </div>
                    </div>
                    <span className="text-5xl leading-none animate-bounce" style={{ animationDuration: "3s" }}>
                        {weatherInfo.icon}
                    </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3 h-3 text-orange-400" />
                        <span className="text-[11px] text-muted-foreground">Feels {current.feelsLike}°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span className="text-[11px] text-muted-foreground">{current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Wind className="w-3 h-3 text-cyan-400" />
                        <span className="text-[11px] text-muted-foreground">{current.windSpeed} km/h</span>
                    </div>
                </div>
            </div>

            {/* 5-day forecast */}
            <div className="relative px-5 pb-4 pt-2">
                <div className="flex items-center justify-between gap-1">
                    {forecast.map((day, i) => {
                        const dayInfo = getWeatherInfo(day.code);
                        return (
                            <div 
                                key={day.date}
                                className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl hover:bg-background/40 transition-colors cursor-default"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    {day.dayName}
                                </span>
                                <span className="text-lg">{dayInfo.icon}</span>
                                <div className="flex flex-col items-center">
                                    <span className="text-[11px] font-bold text-foreground">{day.max}°</span>
                                    <span className="text-[10px] text-muted-foreground">{day.min}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
