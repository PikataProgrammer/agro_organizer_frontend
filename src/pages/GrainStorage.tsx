import useSWR from "swr";
import type {StorageItem} from "../types";
import {useApp} from "../context/AppContext.tsx";
import {useState} from "react";
import {api} from "../api/axiosClient.ts";
import {ProgressSpinner} from "primereact/progressspinner";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Tag} from "primereact/tag";
import {Dialog} from "primereact/dialog";
import {Dropdown} from "primereact/dropdown";
import {InputNumber} from "primereact/inputnumber";

const GrainStorage = () => {
    const {data: storages, error, isLoading, mutate} = useSWR<StorageItem[]>("/api/storage");
    const {showToast} = useApp();

    const [showTransactionDialog, setShowTransactionDialog] = useState(false);
    const [transactionType, setTransactionType] = useState<'add' | 'remove'>('add');
    const [saving, setSaving] = useState(false);
    const [transaction, setTransaction] = useState({
        storageType: 1,
        cropType: 1,
        amount: null as number | null
    });

    const cropOptions = [
        { label: 'Пшеница', value: 1 },
        { label: 'Ръж', value: 2 },
        { label: 'Зелен грах', value: 3 },
        { label: 'Фацелия', value: 4 },
        { label: 'Слънчоглед', value: 5 },
        { label: 'Царевица', value: 6 },
        { label: 'Угар', value: 7 },
        { label: 'Люцерна', value: 8 },
        { label: 'Изкуствени ливади - смесени насаждения', value: 9 },
        { label: 'Мека пшеница-зимна', value: 10 },
        { label: "Грах за зърно - пролетен", value: 11 },
    ];

    const storageTypeOptions = [
        { label: 'Склад за Семе', value: 1 },
        { label: 'Склад за Продажба (Стока)', value: 2 }
    ];
    const getCropName = (crop: number) => {
        const crops: Record<number, string> = { 1: 'Пшеница', 2: 'Ръж', 3: 'Грах', 4: 'Фацелия', 5: 'Слънчоглед', 6: 'Царевица', 7: 'Угар', 8: 'Люцерна', 9: 'Изкуствени ливади' };
        return crops[crop] || 'Неизвестно';
    };

    const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('bg-BG', { hour: '2-digit', minute: '2-digit' }) : '-';

    const formatQuantity = (kg: number) => {
        if (kg >= 1000) {
            return <strong style={{ color: '#3B82F6' }}>{(kg / 1000).toFixed(2)} т.</strong>;
        }
        return <strong>{kg} кг.</strong>;
    };

    const seedStorage = storages?.filter(s => s.storageType === 1) || [];
    const saleStorage = storages?.filter(s => s.storageType === 2) || [];

    const totalSeedKg = seedStorage.reduce((acc, curr) => acc + curr.quantityInKg, 0);
    const totalSaleKg = saleStorage.reduce((acc, curr) => acc + curr.quantityInKg, 0);

    const openTransaction = (type: 'add' | 'remove') => {
        setTransactionType(type);
        setTransaction({ storageType: 1, cropType: 1, amount: null });
        setShowTransactionDialog(true);
    };

    const handleTransaction = async () => {
        if (!transaction.amount || transaction.amount <= 0) {
            showToast( 'warn',  'Внимание',  'Въведете валидно количество!' );
            return;
        }

        setSaving(true);
        try {
            const endpoint = transactionType === 'add' ? '/api/storage/add' : '/api/storage/remove';

            await api.post(endpoint, {
                storageType: transaction.storageType,
                cropType: transaction.cropType,
                amount: transaction.amount
            });

            showToast(
                'success',
                 'Успех',
                 transactionType === 'add' ? 'Количеството е заприходено!' : 'Количеството е изписано!'
            );
            setShowTransactionDialog(false);
            mutate();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Възникна грешка при транзакцията.';
            showToast( 'error',  'Грешка',  errorMsg );
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на склада.</h2>;

    return (
        <div style={{ padding: '20px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Склад за Зърно</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button label="Заприходи (Вход)" icon="pi pi-arrow-down-left" className="p-button-success" onClick={() => openTransaction('add')} />
                    <Button label="Изпиши (Изход)" icon="pi pi-arrow-up-right" className="p-button-danger p-button-outlined" onClick={() => openTransaction('remove')} />
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <Card style={{ borderLeft: '5px solid #22C55E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Общо Семена в наличност</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#22C55E', fontSize: '2.5rem' }}>
                                {(totalSeedKg / 1000).toFixed(2)} <span style={{fontSize: '1.2rem', color: '#888'}}>тона</span>
                            </h2>
                        </div>
                        <i className="pi pi-box" style={{ fontSize: '3rem', color: '#22C55E', opacity: 0.3 }}></i>
                    </div>
                </Card>
                <Card style={{ borderLeft: '5px solid #F59E0B', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Общо Стока за продажба</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#F59E0B', fontSize: '2.5rem' }}>
                                {(totalSaleKg / 1000).toFixed(2)} <span style={{fontSize: '1.2rem', color: '#888'}}>тона</span>
                            </h2>
                        </div>
                        <i className="pi pi-shopping-cart" style={{ fontSize: '3rem', color: '#F59E0B', opacity: 0.3 }}></i>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Seed storage */}
                <Card title="Склад: Семе за посев" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={seedStorage} emptyMessage="Складът за семена е празен." stripedRows responsiveLayout="scroll">
                        <Column field="cropType" header="Култура" body={(r) => <strong>{getCropName(r.cropType)}</strong>} />
                        <Column field="quantityInKg" header="Наличност" body={(r) => formatQuantity(r.quantityInKg)} />
                        <Column header="Статус" body={(r) => r.quantityInKg > 0 ? <Tag severity="success" value="В наличност" /> : <Tag severity="danger" value="Изчерпано" />} />
                        <Column field="lastUpdated" header="Последно движение" body={(r) => formatDate(r.lastUpdated)} />
                    </DataTable>
                </Card>

                {/* Sell storage*/}
                <Card title="Склад: Стокова продукция" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <DataTable value={saleStorage} emptyMessage="Складът за продажба е празен." stripedRows responsiveLayout="scroll">
                        <Column field="cropType" header="Култура" body={(r) => <strong>{getCropName(r.cropType)}</strong>} />
                        <Column field="quantityInKg" header="Наличност" body={(r) => formatQuantity(r.quantityInKg)} />
                        <Column header="Статус" body={(r) => r.quantityInKg > 0 ? <Tag severity="warning" value="Налично" /> : <Tag severity="danger" value="Изчерпано" />} />
                        <Column field="lastUpdated" header="Последно движение" body={(r) => formatDate(r.lastUpdated)} />
                    </DataTable>
                </Card>

            </div>

            <Dialog
                header={transactionType === 'add' ? "Заприхождаване на зърно (Вход)" : "Изписване на зърно (Изход)"}
                visible={showTransactionDialog}
                style={{ width: '450px' }}
                onHide={() => setShowTransactionDialog(false)}
                footer={
                    <div>
                        <Button label="Отказ" icon="pi pi-times" onClick={() => setShowTransactionDialog(false)} className="p-button-text p-button-secondary" />
                        <Button
                            label={transactionType === 'add' ? "Заприходи" : "Изпиши"}
                            icon="pi pi-check"
                            onClick={handleTransaction}
                            loading={saving}
                            className={transactionType === 'add' ? "p-button-success" : "p-button-danger"}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Избери Склад *</label>
                        <Dropdown
                            value={transaction.storageType}
                            options={storageTypeOptions}
                            onChange={(e) => setTransaction({ ...transaction, storageType: e.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Избери Култура *</label>
                        <Dropdown
                            value={transaction.cropType}
                            options={cropOptions}
                            onChange={(e) => setTransaction({ ...transaction, cropType: e.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Количество (в килограми) *</label>
                        <InputNumber
                            value={transaction.amount}
                            onValueChange={(e) => setTransaction({ ...transaction, amount: e.value ?? null })}
                            min={1}
                            placeholder="напр. 5000"
                            suffix=" кг."
                        />
                        {transactionType === 'remove' && (
                            <small style={{ color: '#ef4444', display: 'block', marginTop: '5px' }}>
                                Внимание: Не можете да изпишете повече от наличното в склада!
                            </small>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default GrainStorage;