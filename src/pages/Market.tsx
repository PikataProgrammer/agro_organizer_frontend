import useSWR from 'swr';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

const Market = () => {
    const { data: marketData, error, isLoading } = useSWR('/api/market/prices');

    if (isLoading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><ProgressSpinner /></div>;
    if (error) return <h2 style={{ color: 'red', textAlign: 'center' }}>Грешка при зареждане на цените.</h2>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ margin: 0, color: '#333', marginBottom: '20px' }}>Борси и Пазари</h1>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                {/* Wheat */}
                <Card style={{ borderLeft: '5px solid #EAB308', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Пшеница</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#EAB308', fontSize: '2.5rem' }}>
                                {marketData?.wheat > 0 ? marketData.wheat : '...'} <span style={{fontSize: '1rem', color: '#888'}}>EUR/т</span>
                            </h2>
                        </div>
                        <div style={{ backgroundColor: '#FEF08A', padding: '15px', borderRadius: '50%' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '1.8rem', color: '#CA8A04' }}></i>
                        </div>
                    </div>
                </Card>

                {/* Corn */}
                <Card style={{ borderLeft: '5px solid #F97316', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Царевица</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#F97316', fontSize: '2.5rem' }}>
                                {marketData?.corn > 0 ? marketData.corn : '...'} <span style={{fontSize: '1rem', color: '#888'}}>EUR/т</span>
                            </h2>
                        </div>
                        <div style={{ backgroundColor: '#FFEDD5', padding: '15px', borderRadius: '50%' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '1.8rem', color: '#C2410C' }}></i>
                        </div>
                    </div>
                </Card>

                {/*  SunflowerSeed */}
                <Card style={{ borderLeft: '5px solid #14B8A6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Слънчоглед</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#14B8A6', fontSize: '2.5rem' }}>
                                {marketData?.sunflower > 0 ? marketData.sunflower : '...'} <span style={{fontSize: '1rem', color: '#888'}}>EUR/т</span>
                            </h2>
                        </div>
                        <div style={{ backgroundColor: '#CCFBF1', padding: '15px', borderRadius: '50%' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '1.8rem', color: '#0F766E' }}></i>
                        </div>
                    </div>
                </Card>

                {/* Barley */}
                <Card style={{ borderLeft: '5px solid #8B5CF6', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ечемик</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#8B5CF6', fontSize: '2.5rem' }}>
                                {marketData?.barley > 0 ? marketData.barley : '...'} <span style={{fontSize: '1rem', color: '#888'}}>EUR/т</span>
                            </h2>
                        </div>
                        <div style={{ backgroundColor: '#EDE9FE', padding: '15px', borderRadius: '50%' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '1.8rem', color: '#6D28D9' }}></i>
                        </div>
                    </div>
                </Card>
                {/* Rapeseed */}
                <Card style={{ borderLeft: '5px solid #F43F5E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, color: '#666', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Рапица</p>
                            <h2 style={{ margin: '10px 0 0 0', color: '#F43F5E', fontSize: '2.5rem' }}>
                                {marketData?.rapeseed > 0 ? marketData.rapeseed : '...'} <span style={{fontSize: '1rem', color: '#888'}}>EUR/т</span>
                            </h2>
                        </div>
                        <div style={{ backgroundColor: '#FFE4E6', padding: '15px', borderRadius: '50%' }}>
                            <i className="pi pi-chart-line" style={{ fontSize: '1.8rem', color: '#E11D48' }}></i>
                        </div>
                    </div>
                </Card>

            </div>

            {marketData && (
                <div style={{ marginTop: '20px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <i className="pi pi-check-circle"></i> Цените са обновени днес (Източник: MATIF / EXW България)
                </div>
            )}
        </div>
    );
};

export default Market;