import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

interface WeatherWidgetProps {
    city: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city }) => {
    const [weatherData, setWeatherData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_KEY = '7386b18ea228dd86f16b467da3eb6396';

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city},bg&units=metric&lang=bg&appid=${API_KEY}`
                );

                if (!response.ok) throw new Error('Грешка при зареждане на времето');

                const data = await response.json();
                setWeatherData(data);
            } catch (err) {
                setError('Неуспешна връзка със станцията.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city]);

    if (loading) return (
        <Card style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ProgressSpinner style={{ width: '30px', height: '30px' }} />
        </Card>
    );

    if (error || !weatherData) return (
        <Card style={{ width: '100%', backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <i className="pi pi-exclamation-triangle" style={{ marginRight: '10px' }}></i>
            {error}
        </Card>
    );

    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const iconCode = weatherData.weather[0].icon;
    const windSpeed = weatherData.wind.speed; // в метри в секунда
    const humidity = weatherData.main.humidity;

    const isWindy = windSpeed > 4;

    return (
        <Card style={{
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            color: 'white',
            borderRadius: '12px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0', fontWeight: 'normal', opacity: 0.9 }}>
                        <i className="pi pi-map-marker" style={{ marginRight: '5px' }}></i>
                        {weatherData.name}
                    </h3>
                    <h1 style={{ margin: 0, fontSize: '3rem' }}>{temp}°C</h1>
                    <p style={{ margin: '5px 0 0 0', textTransform: 'capitalize', fontSize: '1.1rem' }}>
                        {description}
                    </p>
                </div>

                <div>
                    <img
                        src={`https://openweathermap.org/img/wn/${iconCode}@4x.png`}
                        alt="Weather icon"
                        style={{ width: '120px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <i className="pi pi-send" style={{ fontSize: '1.2rem', marginBottom: '5px', color: isWindy ? '#fca5a5' : 'white' }}></i>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Вятър</div>
                    <div style={{ fontWeight: 'bold', color: isWindy ? '#fca5a5' : 'white' }}>
                        {windSpeed} м/с
                        {isWindy && <span style={{display: 'block', fontSize: '0.7rem'}}>Лошо за пръскане</span>}
                    </div>
                </div>

                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <i className="pi pi-percentage" style={{ fontSize: '1.2rem', marginBottom: '5px' }}></i>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Влажност</div>
                    <div style={{ fontWeight: 'bold' }}>{humidity}%</div>
                </div>
            </div>
        </Card>
    );
};

export default WeatherWidget;