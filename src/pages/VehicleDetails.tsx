import React, {useRef, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { api } from '../api/axiosClient';
import { useApp } from '../context/AppContext';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast, confirmAction } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: vehicle, mutate: mutateVehicle, error: vehicleError, isLoading: loadingVehicle } = useSWR(`/api/vehicles/${id}`);

    const { data: services, error: servicesError, isLoading: loadingServices, mutate: mutateServices } = useSWR(`/api/vehicleservices/${id}`);

    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newService, setNewService] = useState({
        serviceDate: new Date(),
        description: ''
    });
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

    const openEditService = (service: any) => {
        setEditingServiceId(service.id);
        setNewService({
            serviceDate: new Date(service.serviceDate),
            description: service.description
        });
        setShowDialog(true);
    };

    const openNewService = () => {
        setEditingServiceId(null);
        setNewService({ serviceDate: new Date(), description: '' });
        setShowDialog(true);
    };

    const handleSaveService = async () => {
        if (!newService.description.trim() || !newService.serviceDate) {
            showToast('warn', 'Внимание', 'Моля, въведете дата и описание!');
            return;
        }

        setSaving(true);
        try {
            if (editingServiceId) {
                await api.put(`/api/vehicleservices/${editingServiceId}`, {
                    serviceDate: newService.serviceDate.toISOString(),
                    description: newService.description,
                    vehicleId: Number(id)
                });
                showToast('success', 'Успех', 'Записът е обновен!');
            } else {
                await api.post(`/api/vehicleservices`, {
                    serviceDate: newService.serviceDate.toISOString(),
                    description: newService.description,
                    vehicleId: Number(id)
                });
                await api.put(`/api/vehicles/${id}`, {
                    ...vehicle,
                    lastServiceDate: newService.serviceDate.toISOString()
                });
                showToast('success', 'Успех', 'Сервизният запис е добавен!');
            }

            setShowDialog(false);
            await mutateServices();
        } catch (err) {
            showToast('error', 'Грешка', 'Неуспешен запис.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = (serviceId: number) => {
        confirmAction(
            "Сигурни ли сте, че искате да изтриете този сервизен запис?",
            "Изтриване на запис",
            async () => {
                try {
                    await api.delete(`/api/vehicleservices/${serviceId}`);
                    showToast('success', 'Успех', 'Записът беше изтрит.');
                    await mutateServices();
                } catch (err) {
                    showToast('error', 'Грешка', 'Неуспешно изтриване.');
                }
            }
        );
    };

    if (loadingVehicle || loadingServices) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (vehicleError) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на машината.</h2>;

    const actionTemplate = (rowData: any) => {
        return (
            <div style={{ display: 'flex', gap: '5px' }}>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" onClick={() => openEditService(rowData)} tooltip="Редактирай" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDeleteService(rowData.id)} tooltip="Изтрий" />
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('bg-BG');
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        try {
            await api.post(`/api/vehicles/${id}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            showToast("success", "Успех", "Снимката е запазена");
            mutateVehicle();
        }
        catch (error) {
            console.error(error);
            showToast("error", "Грешка", "Неуспешно качване на снимката.")
        }finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <Button icon="pi pi-arrow-left" className="p-button-rounded p-button-secondary p-button-text" onClick={() => navigate('/vehicles')} />
                <h1 style={{ margin: 0, color: '#333' }}>Детайли: {vehicle?.name}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

                <Card style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />

                        {vehicle?.imageUrl ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={`http://localhost:5236${vehicle.imageUrl}`}
                                    alt={vehicle.name}
                                    style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <Button
                                    icon="pi pi-camera"
                                    className="p-button-rounded p-button-secondary"
                                    style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                                    onClick={() => fileInputRef.current?.click()}
                                    tooltip="Смени снимката"
                                />
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{ backgroundColor: '#f4f4f4', border: '2px dashed #ccc', borderRadius: '8px', padding: '40px', color: '#888', cursor: 'pointer', transition: '0.3s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9e9e9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
                            >
                                <i className="pi pi-camera" style={{ fontSize: '3rem', marginBottom: '10px' }}></i>
                                <p style={{ margin: 0 }}>Кликни за добавяне на снимка</p>
                            </div>
                        )}
                    </div>

                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Технически Данни</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div><strong>Вид:</strong> <Tag value={vehicle?.type} severity="info" style={{ marginLeft: '10px' }} /></div>
                        <div><strong>Рег. номер:</strong> {vehicle?.plateNumber}</div>
                        <div><strong>Година на закупуване:</strong> {vehicle?.purchaseYear || 'Няма данни'}</div>
                        <div>
                            <strong>Последно обслужване:</strong>{' '}
                            {vehicle?.lastServiceDate ? formatDate(vehicle.lastServiceDate) : 'Няма данни'}
                        </div>
                    </div>
                </Card>

                <Card title="Сервизна история / Ремонти" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                        <Button label="Нов Ремонт" icon="pi pi-wrench" className="p-button-warning" onClick={() => setShowDialog(true)} />
                    </div>

                    <DataTable value={services} emptyMessage="Няма записани ремонти или обслужвания." stripedRows paginator rows={5}>
                        <Column field="serviceDate" header="Дата" body={(r) => formatDate(r.serviceDate)} style={{ width: '120px', fontWeight: 'bold' }}></Column>
                        <Column field="description" header="Описание на ремонта / Сменени части"></Column>
                        <Column body={actionTemplate} style={{ width: '60px' }}></Column>
                    </DataTable>
                </Card>
            </div>

            <Dialog header="Добави сервизен запис" visible={showDialog} style={{ width: '450px' }} onHide={() => setShowDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSaveService} loading={saving} className="p-button-warning" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Дата на ремонта *</label>
                        <Calendar value={newService.serviceDate} onChange={(e) => setNewService({...newService, serviceDate: e.value as Date})} dateFormat="dd.mm.yy" showIcon />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Какво беше сменено/оправено? *</label>
                        <InputTextarea
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                            rows={5}
                            autoResize
                            placeholder="Опиши детайлно сменените консумативи, части или извършения ремонт..."
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default VehicleDetails;