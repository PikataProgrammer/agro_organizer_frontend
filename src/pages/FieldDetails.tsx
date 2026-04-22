import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { api } from '../api/axiosClient';
import { type Field, type FieldSeason, FieldOperationTypes, CropTypes } from '../types';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const FieldDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: field, error: fieldError, isLoading: loadingField, mutate } = useSWR<Field>(`/api/field/${id}`);
    const { data: drivers, error: driversError, isLoading: loadingDrivers } = useSWR<any[]>('/api/driver');

    const isLoading = loadingField || loadingDrivers;
    const error = fieldError || driversError;

    const toast = useRef<Toast>(null);
    const [selectedSeason, setSelectedSeason] = useState<FieldSeason | null>(null);

    const [showSeasonDialog, setShowSeasonDialog] = useState(false);
    const [savingSeason, setSavingSeason] = useState(false);
    const [newSeason, setNewSeason] = useState({ year: new Date().getFullYear(), cropType: 1 });

    const [showActivityDialog, setShowActivityDialog] = useState(false);
    const [savingActivity, setSavingActivity] = useState(false);
    const [newActivity, setNewActivity] = useState({
        type: 1,
        driverId: null as number | null,
        notes: ''
    });
    useEffect(() => {
        if (field && field.seasons && field.seasons.length > 0) {
            if (selectedSeason) {
                const updatedSeason = field.seasons.find(s => s.id === selectedSeason.id);
                if (updatedSeason) {
                    setSelectedSeason(updatedSeason);
                }
            } else {
                setSelectedSeason(field.seasons[field.seasons.length - 1]);
            }
        }
    }, [field]);
    const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('bg-BG') : '-';

    const getCropName = (crop: CropTypes) => {
        const crops: Record<number, string> = { 1: 'Пшеница', 2: 'Ръж', 3: 'Грах', 4: 'Фацелия', 5: 'Слънчоглед', 6: 'Царевица', 7: 'Угар (Празно)' };
        return crops[crop] || 'Неизвестно';
    };

    const getOperationName = (op: FieldOperationTypes) => {
        const ops: Record<number, string> = { 1: 'Изорана', 2: 'Посята', 3: 'Наторена', 4: 'Напръскана', 5: 'Ожъната / Окосена', 6: 'Издискована', 7: 'Няма' };
        return ops[op] || '-';
    };

    const cropOptions = [
        { label: 'Пшеница', value: 1 }, { label: 'Ръж', value: 2 }, { label: 'Грах', value: 3 },
        { label: 'Фацелия', value: 4 }, { label: 'Слънчоглед', value: 5 }, { label: 'Царевица', value: 6 },
        { label: 'Угар (Празно)', value: 7 }
    ];

    const operationOptions = [
        { label: 'Изорана', value: 1 }, { label: 'Посята', value: 2 }, { label: 'Наторена', value: 3 },
        { label: 'Напръскана', value: 4 }, { label: 'Ожъната / Окосена', value: 5 }, { label: 'Издискована', value: 6 }
    ];

    const handleCreateSeason = async () => {
        if (!newSeason.year || !newSeason.cropType) {
            toast.current?.show({ severity: 'warn', summary: 'Внимание', detail: 'Моля, попълнете всички полета!' });
            return;
        }
        setSavingSeason(true);
        try {
            await api.post('/api/fieldseason', { fieldId: Number(id), year: newSeason.year, cropType: newSeason.cropType });
            toast.current?.show({ severity: 'success', summary: 'Успех', detail: 'Новият сезон е създаден!' });
            setShowSeasonDialog(false);
            setSelectedSeason(null);
            await mutate();
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Грешка', detail: 'Неуспешно създаване на сезон.' });
        } finally {
            setSavingSeason(false);
        }
    };

    const handleCreateActivity = async () => {
        if (!selectedSeason) return;

        setSavingActivity(true);
        try {
            await api.post('/api/activity', {
                fieldSeasonId: selectedSeason.id,
                type: newActivity.type,
                date: new Date().toISOString(),
                driverId: newActivity.driverId,
                notes: newActivity.notes
            });

            toast.current?.show({ severity: 'success', summary: 'Успех', detail: 'Обработката е записана!' });
            setShowActivityDialog(false);
            setNewActivity({ type: 1, driverId: null, notes: '' });
            await mutate();
        } catch (err) {
            console.error(err);
            toast.current?.show({ severity: 'error', summary: 'Грешка', detail: 'Неуспешен запис на обработката.' });
        } finally {
            setSavingActivity(false);
        }
    };
    const getDriverNameDisplay = (activity: any) => {
        if (activity.driverName) return activity.driverName;
        if (activity.driverId && drivers) {
            const foundDriver = drivers.find((d: any) => d.driverId == activity.driverId);
            return foundDriver ? foundDriver.driverName : 'Неизвестен';
        }
        return '-';
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error || !field) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка!</h2>;



    const latestActivity = selectedSeason?.activities && selectedSeason.activities.length > 0
        ? selectedSeason.activities[selectedSeason.activities.length - 1] : null;

    const currentStatus = latestActivity ? getOperationName(latestActivity.type) : 'Необработена';
    const lastDriver = latestActivity ? getDriverNameDisplay(latestActivity) : 'Няма данни';

    const tableHeader = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>История на обработките</span>
            <Button label="Добави Обработка" icon="pi pi-plus" className="p-button-sm p-button-info" onClick={() => setShowActivityDialog(true)} disabled={!selectedSeason} />
        </div>
    );



    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <Toast ref={toast} position="top-right" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Button icon="pi pi-arrow-left" className="p-button-rounded p-button-text" onClick={() => navigate('/dashboard')} />
                    <h1 style={{ margin: 0, color: '#333' }}>{field.fieldName}</h1>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Dropdown
                        value={selectedSeason}
                        options={field.seasons}
                        onChange={(e) => setSelectedSeason(e.value)}
                        optionLabel={(option) => `${option.year} - ${getCropName(option.cropType)}`}
                        placeholder="Избери сезон"
                        style={{ width: '250px' }}
                        emptyMessage="Няма сезони"
                    />
                    <Button icon="pi pi-plus" tooltip="Нов Сезон" className="p-button-success p-button-outlined" onClick={() => setShowSeasonDialog(true)} />
                </div>
            </div>

            {!selectedSeason ? (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="pi pi-calendar-plus" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '15px' }}></i>
                    <h3>Тази нива все още няма активен сезон</h3>
                    <Button label="Започни нов сезон" icon="pi pi-plus" className="p-button-success p-mt-3" onClick={() => setShowSeasonDialog(true)} />
                </Card>
            ) : (
                <div className="grid">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <Card title="Посев (Култура)" style={{ borderTop: '5px solid #EAB308', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#EAB308', margin: '0' }}>{getCropName(selectedSeason.cropType)}</h2>
                            <small>Година: {selectedSeason.year}</small>
                        </Card>
                        <Card title="Текущ Статус" style={{ borderTop: '5px solid #3B82F6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#3B82F6', margin: '0' }}>{currentStatus}</h2>
                            <small>Спрямо последна обработка</small>
                        </Card>
                        <Card title="Последен Водач" style={{ borderTop: '5px solid #22C55E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ color: '#22C55E', margin: '0' }}>{lastDriver}</h2>
                            <small>Лице извършило последната дейност</small>
                        </Card>
                    </div>

                    <Card style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <DataTable value={selectedSeason.activities} header={tableHeader} emptyMessage="Няма извършени обработки през този сезон." stripedRows>
                            <Column field="date" header="Дата" body={(r) => formatDate(r.date)}></Column>
                            <Column field="type" header="Операция" body={(r) => <Tag value={getOperationName(r.type)} severity="info" />}></Column>
                            <Column header="Тракторист/Водач" body={(r) => getDriverNameDisplay(r)}></Column>
                            <Column field="notes" header="Допълнителни бележки"></Column>
                        </DataTable>
                    </Card>
                </div>
            )}

            <Dialog header="Започни Нов Сезон" visible={showSeasonDialog} style={{ width: '400px' }} onHide={() => setShowSeasonDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowSeasonDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Създай" icon="pi pi-check" onClick={handleCreateSeason} loading={savingSeason} className="p-button-success" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Година / Реколта</label>
                        <InputNumber value={newSeason.year} onValueChange={(e) => setNewSeason({...newSeason, year: e.value ?? new Date().getFullYear()})} useGrouping={false} min={2000} max={2100} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Култура за засяване</label>
                        <Dropdown value={newSeason.cropType} options={cropOptions} onChange={(e) => setNewSeason({...newSeason, cropType: e.value})} placeholder="Избери култура" />
                    </div>
                </div>
            </Dialog>


            <Dialog header="Добави Обработка" visible={showActivityDialog} style={{ width: '400px' }} onHide={() => setShowActivityDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowActivityDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleCreateActivity} loading={savingActivity} className="p-button-info" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Вид Операция</label>
                        <Dropdown value={newActivity.type} options={operationOptions} onChange={(e) => setNewActivity({...newActivity, type: e.value})} placeholder="Напр. Оран" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Водач / Тракторист</label>
                        <Dropdown
                            value={newActivity.driverId}
                            options={drivers || []}
                            onChange={(e) => setNewActivity({...newActivity, driverId: e.value})}
                            optionLabel="driverName"
                            optionValue="driverId"
                            placeholder="Избери водач"
                            showClear
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Бележки (Препарат, норма и др.)</label>
                        <InputText value={newActivity.notes} onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})} placeholder="Допълнително инфо..." />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default FieldDetails;