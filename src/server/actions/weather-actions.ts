"use server";

export async function getWeatherForecast(lat: number, lon: number) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        
        if (!res.ok) {
            throw new Error(`Weather API returned ${res.status}`);
        }
        
        const data = await res.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch weather from server:", error);
        return { success: false, error: error.message };
    }
}
