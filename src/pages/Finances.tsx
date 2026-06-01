import { useState, useRef } from 'react';
import useSWR from 'swr';
import { api } from '../api/axiosClient';
import { type Sale, type Expense } from '../types';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import {useApp} from "../context/AppContext.tsx";

const Finances = () => {
    const { data: sales, error: errorSales, isLoading: loadingSales, mutate: mutateSales } = useSWR<Sale[]>('/api/sale');
    const { data: expenses, error: errorExpenses, isLoading: loadingExpenses, mutate: mutateExpenses } = useSWR<Expense[]>('/api/expense');

    const {showToast, confirmAction } = useApp();

    const [showSaleDialog, setShowSaleDialog] = useState(false);
    const [showExpenseDialog, setShowExpenseDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newExpense, setNewExpense] = useState({ type: '', amount: null as number | null });


    const [newSale, setNewSale] = useState({
        incomeType: 'sale',
        buyerName: '',
        quantity: null as number | null,
        priceForKg: null as number | null,
        cropType: 1 as number | null,
        totalAmount: null as number | null
    });

    const isLoading = loadingSales || loadingExpenses;
    const error = errorSales || errorExpenses;

    const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('bg-BG') : '-';
    const formatCurrency = (val: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(val);

    const totalIncome = sales?.reduce((acc, sale) => acc + sale.totalPrice, 0) || 0;
    const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
    const profit = totalIncome - totalExpenses;
    const isProfitable = profit >= 0;

    const incomeTypeOptions = [
        { label: 'Продажба на продукция', value: 'sale' },
        { label: 'Субсидия / Друг приход', value: 'subsidy' }
    ];

    const cropOptions = [
        { label: 'Пшеница', value: 1 }, { label: 'Ръж', value: 2 }, { label: 'Грах', value: 3 },
        { label: 'Фацелия', value: 4 }, { label: 'Слънчоглед', value: 5 }, { label: 'Царевица', value: 6 },
        { label: 'Ечемик', value: 7 }, { label: 'Люцерна', value: 8 }
    ];

    const expenseTypeOptions = [
        { label: 'Гориво', value: 'Гориво' }, { label: 'Торове/Препарати', value: 'Торове/Препарати' },
        { label: 'Семена', value: 'Семена' }, { label: 'Ремонт техника', value: 'Ремонт техника' },
        { label: 'Рента/Наем', value: 'Рента/Наем' }, { label: 'Заплати', value: 'Заплати' },
        { label: 'Други', value: 'Други' }
    ];

    const handleSaveExpense = async () => {
        if (!newExpense.type || !newExpense.amount) {
            showToast(  'warn','Внимание',  'Попълнете всички полета!' );
            return;
        }
        setSaving(true);
        try {
            const userId = localStorage.getItem('userId');

            await api.post('/api/expense', {
                type: newExpense.type,
                amount: newExpense.amount,
                date: new Date().toISOString(),
                userId: Number(userId)
            });
            setShowExpenseDialog(false);
            setNewExpense({ type: '', amount: null });
            mutateExpenses();
            showToast( 'success', 'Успех','Разходът е добавен!' );
        } catch (err) {
            console.error(err);
            showToast( 'error', 'Грешка', 'Неуспешен запис.' );
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSale = async () => {
        const userId = localStorage.getItem('userId');
        let payload: any = {
            dateSigned: new Date().toISOString(),
            userId: Number(userId)
        };

        if (newSale.incomeType === 'sale') {
            if (!newSale.buyerName || !newSale.quantity || !newSale.priceForKg) {
                showToast( 'warn', 'Внимание', 'Попълнете всички полета за продажба!' );
                return;
            }
            payload = {
                ...payload,
                buyerName: newSale.buyerName,
                quantity: newSale.quantity,
                priceForKg: newSale.priceForKg,
                cropType: newSale.cropType,
                totalPrice: newSale.quantity * newSale.priceForKg
            };
        }
        else {
            if (!newSale.buyerName || !newSale.totalAmount) {
                showToast( 'warn',  'Внимание',  'Попълнете описание и сума!' );
                return;
            }
            payload = {
                ...payload,
                buyerName: newSale.buyerName,
                quantity: null,
                priceForKg: null,
                cropType: null,
                totalPrice: newSale.totalAmount
            };
        }

        setSaving(true);
        try {
            await api.post('/api/sale', payload);
            setShowSaleDialog(false);
            setNewSale({ incomeType: 'sale', buyerName: '', quantity: null, priceForKg: null, cropType: 1, totalAmount: null });
            mutateSales();
            showToast( 'success','Успех',  'Приходът е отразен!' );
        } catch (err) {
            console.error(err);
            showToast( 'error', 'Грешка', 'Неуспешен запис.' );
        } finally {
            setSaving(false);
        }
    };

    const downloadExcel = async (url: string, filename: string) => {
        try {
            const response = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            showToast( 'error', 'Грешка', 'Проблем при свалянето на Excel.' );
        }
    };

    const handleDeleteExpense = (id: number, type: string) => {
        confirmAction(
            `Сигурни ли сте, че искате да премахнете текущия разход "${type}"?`,
            "Потвърждение за изтриване",
            async () => {
                try {
                    await api.delete(`/api/expense/${id}`);
                    mutateExpenses();
                    showToast( 'success','Успех','Разходът е изтрит!' );
                } catch (err) {
                    console.error(err);
                    showToast( 'error', 'Грешка','Неуспешно изтриване.' );
                }
            }
        );

    };

    const handleDeleteSale = (id: number) => {
        confirmAction(
            `Сигурни ли сте, че искате да премахнете текущия приход?`,
            "Потвърждение за изтриване",
            async () => {
                try {
                    await api.delete(`/api/sale/${id}`);
                    mutateSales();
                    showToast( 'success', 'Успех',  'Приходът е изтрит!' );
                } catch (err) {
                    console.error(err);
                    showToast( 'error', 'Грешка',  'Неуспешно изтриване.' );
                }
            }
        );

    };

    const expenseActionTemplate = (rowData: Expense) => {
        const id = (rowData as any).id || (rowData as any).Id;
        return <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDeleteExpense(id, rowData.type)} tooltip="Изтрий" />;
    };

    const saleActionTemplate = (rowData: Sale) => {
        const id = (rowData as any).saleId;
        return <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => handleDeleteSale(id)} tooltip="Изтрий" />;
    };

    const incomeSourceTemplate = (rowData: any) => {
        if (!rowData.cropType) {
            return <Tag value="Субсидия / Други" severity="info" />;
        }
        return <Tag value="Продажба" severity="success" />;
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане.</h2>;

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Счетоводство и Финанси</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button label="Нов Приход" icon="pi pi-plus" className="p-button-success" onClick={() => setShowSaleDialog(true)} />
                    <Button label="Нов Разход" icon="pi pi-minus" className="p-button-danger" onClick={() => setShowExpenseDialog(true)} />
                    <Button label="Справка разходи" className="p-button-secondary p-button-outlined" onClick={() => downloadExcel('/api/reports/expense/excel', 'ExpensesReport.xlsx')} />
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <Card style={{ borderLeft: '5px solid #22C55E' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem' }}>Общо Приходи</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#22C55E', fontSize: '2rem' }}>{formatCurrency(totalIncome)}</h2>
                </Card>
                <Card style={{ borderLeft: '5px solid #EF4444' }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem' }}>Общо Разходи</p>
                    <h2 style={{ margin: '10px 0 0 0', color: '#EF4444', fontSize: '2rem' }}>{formatCurrency(totalExpenses)}</h2>
                </Card>
                <Card style={{ borderLeft: `5px solid ${isProfitable ? '#3B82F6' : '#EF4444'}` }}>
                    <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem' }}>Финансов Резултат</p>
                    <h2 style={{ margin: '10px 0 0 0', color: isProfitable ? '#3B82F6' : '#EF4444', fontSize: '2rem' }}>
                        {formatCurrency(profit)}
                    </h2>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card title="Списък Приходи" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={sales} emptyMessage="Няма намерени приходи." stripedRows paginator rows={5} size="small">
                        <Column field="dateSigned" header="Дата" body={(r) => formatDate(r.dateSigned)}></Column>
                        <Column header="Тип" body={incomeSourceTemplate}></Column>
                        <Column field="buyerName" header="Източник / Купувач"></Column>
                        <Column field="quantity" header="Количество" body={(r) => r.quantity ? `${r.quantity} кг` : '-'}></Column>
                        <Column field="totalPrice" header="Сума" body={(r) =>
                            <strong style={{ color: '#22C55E' }}>+{formatCurrency(r.totalPrice)}</strong>}></Column>
                        <Column body={saleActionTemplate} style={{ width: '4rem', textAlign: 'center' }}></Column>
                    </DataTable>
                </Card>
                <Card title="Списък Разходи" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={expenses} emptyMessage="Няма намерени разходи." stripedRows paginator rows={5} size="small">
                        <Column field="date" header="Дата" body={(r) => formatDate(r.date)}></Column>
                        <Column field="type" header="Вид разход" body={(r) => <Tag value={r.type} severity="warning" />}></Column>
                        <Column field="amount" header="Сума" body={(r) =>
                            <strong style={{ color: '#EF4444' }}>-{formatCurrency(r.amount)}</strong>}></Column>
                        <Column body={expenseActionTemplate} style={{ width: '4rem', textAlign: 'center' }}></Column>
                    </DataTable>
                </Card>
            </div>

            {/* ДИАЛОГ: ДОБАВИ РАЗХОД */}
            <Dialog header="Добави Разход" visible={showExpenseDialog} style={{ width: '400px' }} onHide={() => setShowExpenseDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowExpenseDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSaveExpense} loading={saving} className="p-button-danger" autoFocus />
                </div>
            }>
                <div className="p-fluid">
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Вид разход</label>
                        <Dropdown value={newExpense.type} options={expenseTypeOptions} onChange={(e) => setNewExpense({...newExpense, type: e.value})} editable placeholder="Избери или напиши..." />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Сума (евро)</label>
                        <InputNumber value={newExpense.amount} onValueChange={(e) => setNewExpense({...newExpense, amount: e.value})} mode="currency" currency="EUR" locale="bg-BG" min={0} />
                    </div>
                </div>
            </Dialog>

            {/* ДИАЛОГ: ДОБАВИ ПРИХОД */}
            <Dialog header="Добави Приход" visible={showSaleDialog} style={{ width: '450px' }} onHide={() => setShowSaleDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowSaleDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Запази" icon="pi pi-check" onClick={handleSaveSale} loading={saving} className="p-button-success" autoFocus />
                </div>
            }>
                <div className="p-fluid">

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Вид на прихода</label>
                        <Dropdown value={newSale.incomeType} options={incomeTypeOptions} onChange={(e) => setNewSale({...newSale, incomeType: e.value})} />
                    </div>

                    {/* АКО Е ПРОДАЖБА */}
                    {newSale.incomeType === 'sale' && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Купувач</label>
                                <InputText value={newSale.buyerName} onChange={(e) => setNewSale({...newSale, buyerName: e.target.value})} placeholder="Име на фирма/лице" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Продадена култура</label>
                                <Dropdown value={newSale.cropType} options={cropOptions} onChange={(e) => setNewSale({...newSale, cropType: e.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold' }}>Количество (кг)</label>
                                    <InputNumber value={newSale.quantity} onValueChange={(e) => setNewSale({...newSale, quantity: e.value})} min={0} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold' }}>Цена за кг (евро)</label>
                                    <InputNumber value={newSale.priceForKg} onValueChange={(e) => setNewSale({...newSale, priceForKg: e.value})} min={0} maxFractionDigits={4} />
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', textAlign: 'center', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px' }}>
                                <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    Общо: {newSale.quantity && newSale.priceForKg ? formatCurrency(newSale.quantity * newSale.priceForKg) : '0,00 евро'}
                                </span>
                            </div>
                        </>
                    )}

                    {/* АКО Е СУБСИДИЯ */}
                    {newSale.incomeType === 'subsidy' && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Основание / Име на субсидия</label>
                                <InputText value={newSale.buyerName} onChange={(e) => setNewSale({...newSale, buyerName: e.target.value})} placeholder="напр. ДФЗ - Субсидия за площ" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Получена сума (евро)</label>
                                <InputNumber value={newSale.totalAmount} onValueChange={(e) => setNewSale({...newSale, totalAmount: e.value})} mode="currency" currency="EUR" locale="bg-BG" min={0} />
                            </div>
                        </>
                    )}

                </div>
            </Dialog>
        </div>
    );
};

export default Finances;