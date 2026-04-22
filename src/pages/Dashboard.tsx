import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { type Field, CropTypes } from '../types';
import { useApp } from '../context/AppContext';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';

const Dashboard = () => {
    const { data: fields, error, isLoading, mutate } = useSWR<Field[]>('/api/field');
    const navigate = useNavigate();
    const { showToast, confirmAction } = useApp();

    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    // ❗ ВРЪЩАМЕ декарите и локацията в стейта
    const [newField, setNewField] = useState({
        fieldName: '',
        area: null as number | null,
        location: ''
    });

    const getCropName = (crop: CropTypes) => {
        const crops: Record<number, string> = { 1: 'Пшеница', 2: 'Ръж', 3: 'Грах', 4: 'Фацелия', 5: 'Слънчоглед', 6: 'Царевица', 7: 'Угар' };
        return crops[crop] || 'Неизвестно';
    };

    const handleSaveField = async () => {
        // Задължаваме потребителя да въведе поне име и декари
        if (!newField.fieldName.trim() || !newField.area) {
            showToast('warn', 'Внимание', 'Моля, въведете име и размер (декари) на нивата!');
            return;
        }
        setSaving(true);
        try {
            const userId = localStorage.getItem('userId');
            // ❗ Изпращаме новите полета към бекенда
            await api.post('/api/field', {
                fieldName: newField.fieldName,
                area: newField.area,
                location: newField.location,
                userId: Number(userId)
            });
            showToast('success', 'Успех', 'Нивата е добавена!');
            setShowDialog(false);
            // Изчистваме формата
            setNewField({ fieldName: '', area: null, location: '' });
            mutate();
        } catch (err) {
            console.error(err);
            showToast('error', 'Грешка', 'Неуспешен запис.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteField = (id: number, fieldName: string) => {
        confirmAction(
            `Сигурни ли сте, че искате да изтриете нивата "${fieldName}"? Всички данни за нея ще бъдат загубени!`,
            "Внимание: Изтриване на нива",
            async () => {
                try {
                    await api.delete(`/api/field/${id}`);
                    showToast('success', 'Успех', 'Нивата беше изтрита.');
                    mutate();
                } catch (err) {
                    console.error(err);
                    showToast('error', 'Грешка', 'Неуспешно изтриване.');
                }
            }
        );
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на данните.</h2>;

    const totalFields = fields?.length || 0;

    const totalArea = fields?.reduce((sum, f) => sum + (f.fieldSize || 0), 0) || 0;

    const currentCropsCount: Record<string, number> = {};
    let activeSeasonsCount = 0;

    fields?.forEach(field => {
        if (field.seasons && field.seasons.length > 0) {
            const latestSeason = field.seasons[field.seasons.length - 1];
            const cropName = getCropName(latestSeason.cropType);
            if (cropName !== 'Угар') activeSeasonsCount++;
            currentCropsCount[cropName] = (currentCropsCount[cropName] || 0) + 1;
        } else {
            currentCropsCount['Необработена'] = (currentCropsCount['Необработена'] || 0) + 1;
        }
    });

    const chartData = {
        labels: Object.keys(currentCropsCount),
        datasets: [{
            data: Object.values(currentCropsCount),
            backgroundColor: ['#EAB308', '#3B82F6', '#22C55E', '#A855F7', '#F97316', '#9CA3AF'],
            hoverBackgroundColor: ['#CA8A04', '#2563EB', '#16A34A', '#9333EA', '#EA580C', '#6B7280']
        }]
    };

    const chartOptions = { plugins: { legend: { labels: { usePointStyle: true } } } };

    const currentCropTemplate = (rowData: any) => {
        if (!rowData.seasons || rowData.seasons.length === 0) return <span style={{ color: '#999' }}>Няма сезони</span>;
        const latestSeason = rowData.seasons[rowData.seasons.length - 1];
        return <strong>{getCropName(latestSeason.cropType)} ({latestSeason.year})</strong>;
    };

    const actionBodyTemplate = (rowData: Field) => {
        return (
            <div style={{ display: 'flex', gap: '5px' }}>
                <Button
                    label="Отвори"
                    icon="pi pi-search"
                    className="p-button-text p-button-sm p-button-info"
                    onClick={() => navigate(`/field/${rowData.fieldId}`)}
                />

                <Button
                    icon="pi pi-trash"
                    tooltip="Изтрий нивата"
                    className="p-button-text p-button-sm p-button-danger"
                    onClick={() => handleDeleteField(rowData.fieldId, rowData.fieldName)}
                />
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Моето Стопанство</h1>
                <Button label="Нова Нива" icon="pi pi-plus" className="p-button-success" onClick={() => setShowDialog(true)} />
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Card style={{ borderLeft: '5px solid #3B82F6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Общо Ниви</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#3B82F6', fontSize: '2.5rem' }}>{totalFields}</h2>
                </Card>
                {/* ❗ НОВА КАРТА ЗА ОБЩО ДЕКАРИ */}
                <Card style={{ borderLeft: '5px solid #8B5CF6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Общо Площ</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#8B5CF6', fontSize: '2.5rem' }}>{totalArea} <span style={{fontSize: '1rem', color: '#888'}}>дка</span></h2>
                </Card>
                <Card style={{ borderLeft: '5px solid #22C55E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Засети Ниви</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#22C55E', fontSize: '2.5rem' }}>{activeSeasonsCount}</h2>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <Card title="Разпределение на културите" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {totalFields > 0 ? (
                        <div style={{ width: '80%', display: 'flex', justifyContent: 'center' }}>
                            <Chart type="pie" data={chartData} options={chartOptions} style={{ width: '100%' }} />
                        </div>
                    ) : (
                        <p style={{ color: '#888' }}>Няма данни за визуализация.</p>
                    )}
                </Card>

                <Card title="Списък с ниви" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={fields} emptyMessage="Нямате добавени ниви." stripedRows paginator rows={5}>
                        <Column field="fieldName" header="Име на нива" style={{ fontWeight: 'bold' }}></Column>
                        {/* ❗ ДОБАВЕНИ КОЛОНИ В ТАБЛИЦАТА */}
                        <Column field="area" header="Декари" body={(r) => r.area ? `${r.area} дка` : '-'}></Column>
                        <Column field="location" header="Локация"></Column>
                        <Column header="Текуща култура" body={currentCropTemplate}></Column>
                        <Column body={actionBodyTemplate} style={{ width: '150px' }}></Column>
                    </DataTable>
                </Card>
            </div>

            <Dialog header="Добави Нова Нива" visible={showDialog} style={{ width: '450px' }} onHide={() => setShowDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSaveField} loading={saving} className="p-button-success" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Име на нивата *</label>
                        <InputText value={newField.fieldName} onChange={(e) => setNewField({...newField, fieldName: e.target.value})} placeholder="напр. Голямата нива" />
                    </div>


                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Площ (декари) *</label>
                            <InputNumber value={newField.area} onValueChange={(e) => setNewField({...newField, area: e.value})} min={0} maxFractionDigits={2} placeholder="напр. 50" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Локация (землище)</label>
                            <InputText value={newField.location} onChange={(e) => setNewField({...newField, location: e.target.value})} placeholder="напр. с. Труд" />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Dashboard;