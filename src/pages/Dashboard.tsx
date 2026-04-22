import  { useState } from 'react';
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

    const [newField, setNewField] = useState({
        fieldName: '',
        fieldSize: null as number | null,
        fieldLocation: ''
    });

    const [editingField, setEditingField] = useState<Field | null>(null);

    const getCropName = (crop: CropTypes) => {
        const crops: Record<number, string> = { 1: 'Пшеница', 2: 'Ръж', 3: 'Грах', 4: 'Фацелия', 5: 'Слънчоглед', 6: 'Царевица', 7: 'Угар', 8: 'Люцерна', 9: 'Изкуствени ливади' };
        return crops[crop] || 'Неизвестно';
    };

    const openEditDialog = (field: Field) => {
        setEditingField(field);
        setNewField({
            fieldName: field.fieldName,
            fieldSize: field.fieldSize ?? null,
            fieldLocation: field.fieldLocation ?? ''
        });
        setShowDialog(true);
    };
    const downloadExcel = async (url: string, filename: string) => {
        try {
            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data as BlobPart], { type: response.headers['content-type'] as string });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('success', 'Успех', 'Справката е изтеглена успешно!');
        } catch (err) {
            console.error(err);
            showToast('error', 'Грешка', 'Проблем при свалянето на справката.');
        }
    };

    const handleSaveField = async () => {
        if (!newField.fieldName.trim() || !newField.fieldSize) {
            showToast('warn', 'Внимание', 'Моля, въведете име и размер (декари) на нивата!');
            return;
        }
        setSaving(true);
        try {
            const userId = Number(localStorage.getItem('userId'));

            if (editingField) {
                await api.put(`/api/field/${editingField.fieldId}`, {
                    ...newField,
                    fieldId: editingField.fieldId,
                    userId: userId
                });
                showToast('success', 'Успех', 'Нивата е редактирана!');
            } else {
                await api.post('/api/field', {
                    ...newField,
                    userId: userId
                });
                showToast('success', 'Успех', 'Нивата е добавена!');
            }

            setShowDialog(false);
            setEditingField(null);
            setNewField({ fieldName: '', fieldSize: null, fieldLocation: '' });
            await mutate();
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
                    await mutate();
                } catch (err) {
                    showToast('error', 'Грешка', 'Неуспешно изтриване.');
                }
            }
        );
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане.</h2>;

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

    const currentCropTemplate = (rowData: Field) => {
        if (!rowData.seasons || rowData.seasons.length === 0) return <span style={{ color: '#999' }}>Няма сезони</span>;
        const latestSeason = rowData.seasons[rowData.seasons.length - 1];
        return <strong>{getCropName(latestSeason.cropType)} ({latestSeason.year})</strong>;
    };

    const actionBodyTemplate = (rowData: Field) => {
        return (
            <div style={{ display: 'flex', gap: '5px' }}>
                <Button label="Отвори" icon="pi pi-search" className="p-button-text p-button-sm p-button-info" onClick={() => navigate(`/field/${rowData.fieldId}`)} />
                <Button icon="pi pi-pencil" tooltip="Редактирай" className="p-button-text p-button-sm p-button-warning" onClick={() => openEditDialog(rowData)} />
                <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDeleteField(rowData.fieldId, rowData.fieldName)} />
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Моето Стопанство</h1>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                        label="Справка Ниви"
                        icon="pi pi-file-excel"
                        className="p-button-secondary p-button-outlined"
                        onClick={() => downloadExcel('/api/reports/field/excel', 'FieldsReport.xlsx')}
                    />
                    <Button
                        label="Нова Нива"
                        icon="pi pi-plus"
                        className="p-button-success"
                        onClick={() => { setEditingField(null); setNewField({fieldName:'', fieldSize: null, fieldLocation: ''}); setShowDialog(true); }}
                    />
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Card style={{ borderLeft: '5px solid #3B82F6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Общо Ниви</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#3B82F6', fontSize: '2.5rem' }}>{totalFields}</h2>
                </Card>
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
                <Card title="Разпределение на културите" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ width: '80%', margin: '0 auto' }}>
                        <Chart type="pie" data={chartData} />
                    </div>
                </Card>

                <Card title="Списък с ниви" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={fields} stripedRows paginator rows={5}>
                        <Column field="fieldName" header="Име на нива" style={{ fontWeight: 'bold' }}></Column>
                        <Column field="fieldSize" header="Декари" body={(r) => r.fieldSize ? `${r.fieldSize} дка` : '-'}></Column>
                        <Column field="fieldLocation" header="Локация"></Column>
                        <Column header="Текуща култура" body={currentCropTemplate}></Column>
                        <Column body={actionBodyTemplate} style={{ width: '160px' }}></Column>
                    </DataTable>
                </Card>
            </div>

            <Dialog header={editingField ? "Редактирай Нива" : "Добави Нова Нива"} visible={showDialog} style={{ width: '450px' }} onHide={() => { setShowDialog(false); setEditingField(null); }} footer={
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

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Площ (декари) *</label>
                            <InputNumber value={newField.fieldSize} onValueChange={(e) => setNewField({...newField, fieldSize: e.value ?? null})} min={0} placeholder="напр. 50" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Локация (землище)</label>
                            <InputText value={newField.fieldLocation} onChange={(e) => setNewField({...newField, fieldLocation: e.target.value})} placeholder="напр. с. Труд" />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Dashboard;