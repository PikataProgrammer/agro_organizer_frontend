import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

const MapClickHandler = ({ onMapClick, isDrawing }: { onMapClick: (point: [number, number]) => void, isDrawing: boolean }) => {
    useMapEvents({
        click: (e) => {
            if (isDrawing) {
                onMapClick([e.latlng.lat, e.latlng.lng]);
            }
        }
    });
    return null;
};

const MapController = ({ targetCenter }: { targetCenter: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (targetCenter) {
            map.flyTo(targetCenter, 15, { duration: 1.5 });
        }
    }, [targetCenter, map]);
    return null;
};

const MapBoundsFitter = ({ points, fitDone, setFitDone }: { points: [number, number][], fitDone: boolean, setFitDone: (v: boolean) => void }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0 && !fitDone) {
            map.fitBounds(points, { padding: [30, 30] });
            setFitDone(true);
        }
    }, [points, map, fitDone, setFitDone]);
    return null;
};

interface FieldMapEditorProps {
    initialBoundaryJson: string | null;
    onSaveBoundary: (boundaryJson: string) => void;
}

const FieldMapEditor: React.FC<FieldMapEditorProps> = ({ initialBoundaryJson, onSaveBoundary }) => {
    const [points, setPoints] = useState<[number, number][]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
    const [initialFitDone, setInitialFitDone] = useState(false);

    const defaultCenter: [number, number] = [42.7339, 25.4858];

    useEffect(() => {
        if (initialBoundaryJson && initialBoundaryJson !== "null" && initialBoundaryJson !== "[]") {
            try {
                const parsed = JSON.parse(initialBoundaryJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setPoints(parsed);
                    setInitialFitDone(false);
                }
            } catch (e) {
                console.error("Грешка при четене на координатите", e);
            }
        }
    }, [initialBoundaryJson]);

    const handleMapClick = (point: [number, number]) => {
        setPoints([...points, point]);
    };

    const handleClear = () => {
        setPoints([]);
    };

    const handleSave = () => {
        if (points.length === 0) {
            onSaveBoundary("null");
        } else {
            const json = JSON.stringify(points);
            onSaveBoundary(json);
        }
        setIsDrawing(false);
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setSearchedLocation([parseFloat(lat), parseFloat(lon)]);
            } else {
                alert("Локацията не е намерена!");
            }
        } catch (error) {
            console.error("Грешка при търсенето", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const mapCenter = points.length > 0 ? points[0] : defaultCenter;
    const mapZoom = points.length > 0 ? 15 : 7;

    return (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="p-input-icon-left" style={{ width: '300px'}}>

                    <InputText
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Търси град, село, адрес..."
                        style={{ width: '100%' }}
                    />
                </span>
                <Button label="Търси" className="p-button-info" onClick={handleSearch} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#334155' }}>Очертания на нивата</h3>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {!isDrawing ? (
                        <Button label={points.length > 0 ? "Коригирай граници" : "Начертай граници"} icon="pi pi-pencil" className="p-button-warning p-button-outlined" onClick={() => setIsDrawing(true)} />
                    ) : (
                        <>
                            <Button label="Изчисти всичко" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={handleClear} />
                            <Button
                                label={points.length === 0 ? "Изтрий от картата" : "Запази Картата"}
                                icon={points.length === 0 ? "pi pi-trash" : "pi pi-check"}
                                className={points.length === 0 ? "p-button-danger" : "p-button-success"}
                                onClick={handleSave}
                                disabled={points.length > 0 && points.length < 3}
                            />
                            <Button label="Отказ" icon="pi pi-times" className="p-button-secondary p-button-text" onClick={() => {
                                setIsDrawing(false);
                                if (initialBoundaryJson && initialBoundaryJson !== "null") {
                                    setPoints(JSON.parse(initialBoundaryJson));
                                    setInitialFitDone(false);
                                } else {
                                    setPoints([]);
                                }
                            }} />
                        </>
                    )}
                </div>
            </div>

            {isDrawing && (
                <div style={{ backgroundColor: '#FEF08A', padding: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#854D0E' }}>
                    <strong>Режим Чертане:</strong> Кликайте върху картата, за да очертаете границите на нивата. Нужни са минимум 3 точки.
                </div>
            )}

            <div style={{ height: '500px', width: '100%', position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" maxZoom={20} attribution="&copy; Google Maps" />
                    <MapClickHandler onMapClick={handleMapClick} isDrawing={isDrawing} />
                    <MapController targetCenter={searchedLocation} />
                    <MapBoundsFitter points={points} fitDone={initialFitDone} setFitDone={setInitialFitDone} />
                    {points.length > 0 && (
                        <Polygon positions={points} pathOptions={{ color: isDrawing ? '#EAB308' : '#22C55E', weight: 3, fillColor: isDrawing ? '#FEF08A' : '#86EFAC', fillOpacity: 0.5 }} />
                    )}
                </MapContainer>
            </div>
        </Card>
    );
};

export default FieldMapEditor;