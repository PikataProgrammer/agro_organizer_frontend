import React, { useState } from 'react';
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
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

const Vehicles = () => {
    const { data: vehicles, error, isLoading, mutate } = useSWR<any[]>('/api/vehicles');
    const { showToast, confirmAction } = useApp();

    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

    const [vehicleData, setVehicleData] = useState({
        name: '',
        type: '',
        plateNumber: '',
        purchaseYear: null as number | null,
        lastServiceDate: null as Date | null
    });

    const typeOptions = [
        { label: 'Трактор', value: 'Трактор' },
        { label: 'Комбайн', value: 'Комбайн' },
        { label: 'Прикачен инвентар', value: 'Прикачен инвентар' },
        { label: 'Товарен автомобил', value: 'Товарен автомобил' },
        { label: 'Друго', value: 'Друго' }
    ];

    const openNew = () => { //CREATE
        setEditingVehicleId(null);
        setVehicleData({ name: '', type: '', plateNumber: '', purchaseYear: null, lastServiceDate: null });
        setShowDialog(true);
    };

    const openEdit = (vehicle: any) => { //UPDATE
        setEditingVehicleId(vehicle.id);
        setVehicleData({
            name: vehicle.name,
            type: vehicle.type,
            plateNumber: vehicle.plateNumber,
            purchaseYear: vehicle.purchaseYear,
            lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate) : null
        });
        setShowDialog(true);
    };

    const handleSave = async () => { //CORE logic
        if (!vehicleData.name.trim() || !vehicleData.type || !vehicleData.plateNumber.trim()) {
            showToast('warn', 'Внимание', 'Попълнете задължителните полета (Име, Вид, Рег. номер)!');
            return;
        }

        setSaving(true);
        try {
            const userId = Number(localStorage.getItem('userId'));
            const payload = {
                name: vehicleData.name,
                type: vehicleData.type,
                plateNumber: vehicleData.plateNumber,
                purchaseYear: vehicleData.purchaseYear,
                lastServiceDate: vehicleData.lastServiceDate ? vehicleData.lastServiceDate.toISOString() : null,
                userId: userId
            };

            if (editingVehicleId) {
                await api.put(`/api/vehicles/${editingVehicleId}`, { ...payload, id: editingVehicleId });
                showToast('success', 'Успех', 'Данните за машината бяха обновени!');
            } else {
                await api.post('/api/vehicles', payload);
                showToast('success', 'Успех', 'Новата машина е добавена!');
            }

            setShowDialog(false);
            await mutate();
        } catch (err) {
            console.error(err);
            showToast('error', 'Грешка', 'Неуспешен запис.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        confirmAction(
            `Сигурни ли сте, че искате да премахнете машината "${name}"?`,
            "Потвърждение за изтриване",
            async () => {
                try {
                    await api.delete(`/api/vehicles/${id}`);
                    showToast('success', 'Успех', 'Машината беше изтрита.');
                    await mutate();
                } catch (err) {
                    console.error(err);
                    showToast('error', 'Грешка', 'Неуспешно изтриване.');
                }
            }
        );
    };

    const typeTemplate = (rowData: any) => {
        let severity: "success" | "info" | "warning" | "danger" | null = null;
        switch (rowData.type) {
            case 'Трактор': severity = 'info'; break;
            case 'Комбайн': severity = 'warning'; break;
            case 'Прикачен инвентар': severity = 'success'; break;
            case 'Товарен автомобил': severity = 'danger'; break;
        }
        return <Tag value={rowData.type} severity={severity} />;
    };

    const serviceDateTemplate = (rowData: any) => {
        if (!rowData.lastServiceDate) return <span style={{ color: '#999' }}>Няма данни</span>;

        const serviceDate = new Date(rowData.lastServiceDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const needsService = serviceDate < oneYearAgo;

        return (
            <span style={{ color: needsService ? '#EF4444' : 'inherit', fontWeight: needsService ? 'bold' : 'normal' }}>
                {serviceDate.toLocaleDateString('bg-BG')}
                {needsService && <i className="pi pi-exclamation-triangle" style={{ marginLeft: '5px' }} tooltip="Нужда от обслужване"></i>}
            </span>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div style={{ display: 'flex', gap: '5px' }}>
                <Button icon="pi pi-pencil" tooltip="Редактирай" className="p-button-text p-button-sm p-button-warning" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" tooltip="Изтрий" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(rowData.id, rowData.name)} />
            </div>
        );
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на машините.</h2>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Машинен Парк</h1>
                <Button label="Добави Техника" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
            </div>

            <Card style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <DataTable value={vehicles} emptyMessage="Нямате добавени машини." stripedRows responsiveLayout="scroll">
                    <Column field="name" header="Марка / Модел" style={{ fontWeight: 'bold' }}></Column>
                    <Column field="type" header="Вид" body={typeTemplate}></Column>
                    <Column field="plateNumber" header="Рег. Номер"></Column>
                    <Column field="purchaseYear" header="Година на закупуване"></Column>
                    <Column field="lastServiceDate" header="Последно обслужване" body={serviceDateTemplate}></Column>
                    <Column body={actionBodyTemplate} style={{ minWidth: '100px' }}></Column>
                </DataTable>
            </Card>

            <Dialog header={editingVehicleId ? "Редактирай Машина" : "Добави Нова Машина"} visible={showDialog} style={{ width: '500px' }} onHide={() => setShowDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSave} loading={saving} className="p-button-success" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Марка / Модел *</label>
                        <InputText value={vehicleData.name} onChange={(e) => setVehicleData({...vehicleData, name: e.target.value})} placeholder="напр. John Deere 6155M" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Вид *</label>
                            <Dropdown value={vehicleData.type} options={typeOptions} onChange={(e) => setVehicleData({...vehicleData, type: e.value})} placeholder="Избери вид" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Рег. Номер *</label>
                            <InputText value={vehicleData.plateNumber} onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})} placeholder="напр. СТ 1234 АВ" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Година на закупуване</label>
                            <InputNumber value={vehicleData.purchaseYear} onValueChange={(e) => setVehicleData({...vehicleData, purchaseYear: e.value ?? null})} useGrouping={false} min={1950} max={new Date().getFullYear()} placeholder="напр. 2018" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: 'bold' }}>Последно обслужване</label>
                            <Calendar value={vehicleData.lastServiceDate} onChange={(e) => setVehicleData({...vehicleData, lastServiceDate: e.value as Date})} dateFormat="dd.mm.yy" showIcon placeholder="Избери дата" />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Vehicles;