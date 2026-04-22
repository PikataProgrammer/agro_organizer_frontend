import { useState } from 'react';
import useSWR from 'swr';
import { api } from '../api/axiosClient';
import { useApp } from '../context/AppContext';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';

const Drivers = () => {

    const { data: drivers, error, isLoading, mutate } = useSWR<{ driverId: number; [key: string]: unknown }[]>('/api/driver');

    const { showToast, confirmAction } = useApp();

    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newDriver, setNewDriver] = useState({
        driverName: '', driverAge: null as number | null, driverPhoneNumber: '', licenseNumber: '', hiredOn: null as Date | null
    });

    const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('bg-BG') : '-';

    const handleSaveDriver = async () => {
        if (!newDriver.driverName || !newDriver.driverAge || !newDriver.driverPhoneNumber) {
            showToast('warn', 'Внимание', 'Моля, попълнете задължителните полета!');
            return;
        }

        setSaving(true);
        try {
            await api.post('/api/driver', {
                driverName: newDriver.driverName, driverAge: newDriver.driverAge, driverPhoneNumber: newDriver.driverPhoneNumber,
                licenseNumber: newDriver.licenseNumber || null, hiredOn: newDriver.hiredOn ? newDriver.hiredOn.toISOString() : null
            });

            showToast('success', 'Успех', 'Новият водач е добавен!');
            setShowDialog(false);
            setNewDriver({ driverName: '', driverAge: null, driverPhoneNumber: '', licenseNumber: '', hiredOn: null });
            mutate();
        } catch (err) {
            console.error(err);
            showToast('error', 'Грешка', 'Възникна проблем при записването.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDriver = (id: number) => {
        confirmAction(
            "Сигурни ли сте, че искате да премахнете този водач?",
            "Потвърждение за изтриване",
            async () => {
                try {
                    await api.delete(`/api/driver/${id}`);
                    showToast('success', 'Успех', 'Водачът е премахнат.');
                    mutate();
                } catch (err) {
                    console.error(err);
                    showToast('error', 'Грешка', 'Неуспешно изтриване.');
                }
            }
        );
    };

    const actionBodyTemplate = (rowData: { driverId: number }) => {
        return (
            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => handleDeleteDriver(rowData.driverId)} tooltip="Изтрий" />
        );
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на екипа.</h2>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Моят Екип (Водачи)</h1>
                <Button label="Добави Водач" icon="pi pi-plus" className="p-button-success" onClick={() => setShowDialog(true)} />
            </div>

            <Card style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <DataTable value={drivers} emptyMessage="Все още нямате добавени хора в екипа." stripedRows responsiveLayout="scroll">
                    <Column field="driverName" header="Име на водача" style={{ fontWeight: 'bold' }}></Column>
                    <Column field="driverAge" header="Възраст"></Column>
                    <Column field="driverPhoneNumber" header="Телефон"></Column>
                    <Column field="licenseNumber" header="Свидетелство за упр."></Column>
                    <Column field="hiredOn" header="Нает на" body={(r) => formatDate(r.hiredOn)}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </Card>

            <Dialog header="Добави Нов Водач" visible={showDialog} style={{ width: '450px' }} onHide={() => setShowDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSaveDriver} loading={saving} className="p-button-success" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Три имена *</label>
                        <InputText value={newDriver.driverName} onChange={(e) => setNewDriver({...newDriver, driverName: e.target.value})} placeholder="напр. Иван Иванов" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Възраст *</label>
                            <InputNumber value={newDriver.driverAge} onValueChange={(e) => setNewDriver({...newDriver, driverAge: e.value ?? null})} min={18} max={99} placeholder="Години" />
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontWeight: 'bold' }}>Телефон *</label>
                            <InputText value={newDriver.driverPhoneNumber} onChange={(e) => setNewDriver({...newDriver, driverPhoneNumber: e.target.value})} placeholder="08..." />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Номер на шоф. книжка</label>
                        <InputText value={newDriver.licenseNumber} onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})} placeholder="напр. 123456789" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Дата на наемане</label>
                        <Calendar value={newDriver.hiredOn} onChange={(e) => setNewDriver({...newDriver, hiredOn: e.value as Date})} dateFormat="dd.mm.yy" showIcon placeholder="Избери дата" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Drivers;