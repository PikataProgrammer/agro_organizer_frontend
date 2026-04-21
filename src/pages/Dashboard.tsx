import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { type Field } from '../types';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: fields, error, isLoading, mutate } = useSWR<Field[]>('/api/field');

    const toast = useRef<Toast>(null);

    const [showDialog, setShowDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newField, setNewField] = useState({
        fieldName: '',
        fieldSize: null as number | null,
        fieldLocation: ''
    });

    const formatDate = (value: string) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('bg-BG');
    };

    const handleSaveField = async () => {
        if (!newField.fieldName || !newField.fieldSize || !newField.fieldLocation) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Внимание',
                detail: 'Моля, попълнете всички полета!',
                life: 3000
            });
            return;
        }

        setSaving(true);
        try {
            const userId = localStorage.getItem('userId');

            await api.post('/api/field', {
                fieldName: newField.fieldName,
                fieldSize: newField.fieldSize,
                fieldLocation: newField.fieldLocation,
                createdOn: new Date().toISOString(),
                userId: Number(userId)
            });

            setShowDialog(false);
            setNewField({ fieldName: '', fieldSize: null, fieldLocation: '' });
            mutate();

            toast.current?.show({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Нивата е добавена!',
                life: 3000
            });

        } catch (err) {
            console.error(err);
            toast.current?.show({
                severity: 'error',
                summary: 'Грешка',
                detail: 'Възникна проблем при добавянето.',
                life: 3000
            });
        } finally {
            setSaving(false);
        }
    };

    const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Моите Ниви</h2>
            <Button label="Добави Нива" icon="pi pi-plus" className="p-button-success" onClick={() => setShowDialog(true)} />
        </div>
    );

    const dialogFooter = (
        <div>
            <Button label="Отказ" icon="pi pi-times" onClick={() => setShowDialog(false)} className="p-button-text p-button-secondary" />
            <Button label="Запази" icon="pi pi-check" onClick={handleSaveField} loading={saving} className="p-button-success" autoFocus />
        </div>
    );

    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <Toast ref={toast} position="top-right" />


            <Card header={header} style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                    </div>
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                        Грешка при зареждане на нивите.
                    </div>
                ) : (
                    <DataTable value={fields} emptyMessage="Нямате добавени ниви." stripedRows responsiveLayout="scroll">
                        <Column field="fieldName" header="Име на нива" sortable style={{ fontWeight: 'bold' }}></Column>
                        <Column field="fieldSize" header="Размер (дка)" sortable></Column>
                        <Column field="fieldLocation" header="Локация" sortable></Column>
                        <Column field="createdOn" header="Добавена на" body={(rowData) => formatDate(rowData.createdOn)} sortable></Column>
                        <Column body={(rowData) => <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-text" tooltip="Към детайли" onClick={() => navigate(`/field/${rowData.fieldId}`)} />} style={{ width: '10%' }}></Column>
                    </DataTable>
                )}
            </Card>

            <Dialog header="Нова Нива" visible={showDialog} style={{ width: '400px' }} footer={dialogFooter} onHide={() => setShowDialog(false)}>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Име на нивата</label>
                        <InputText value={newField.fieldName} onChange={(e) => setNewField({...newField, fieldName: e.target.value})} placeholder="напр. Голямата поляна" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Размер (декари)</label>
                        <InputNumber value={newField.fieldSize} onValueChange={(e) => setNewField({...newField, fieldSize: e.value})} placeholder="напр. 50" min={0} maxFractionDigits={2} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Локация (землище)</label>
                        <InputText value={newField.fieldLocation} onChange={(e) => setNewField({...newField, fieldLocation: e.target.value})} placeholder="напр. с. Панагюрище" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Dashboard;