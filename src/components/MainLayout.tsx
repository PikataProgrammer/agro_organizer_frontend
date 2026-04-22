import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        {
            label: 'Моите Ниви',
            icon: 'pi pi-fw pi-map',
            command: () => navigate('/dashboard'),
            className: location.pathname.includes('/dashboard') || location.pathname.includes('/field') ? 'p-menuitem-active' : ''
        },
        {
            label: 'Счетоводство',
            icon: 'pi pi-fw pi-wallet',
            command: () => navigate('/finances'),
            className: location.pathname.includes('/finances') ? 'p-menuitem-active' : ''
        },
        {
            label: 'Моят Екип',
            icon: 'pi pi-fw pi-users',
            command: () => navigate('/drivers'),
            className: location.pathname.includes('/drivers') ? 'p-menuitem-active' : ''
        },
        {
            label: 'Машинен Парк',
            icon: 'pi pi-fw pi-car',
            command: () => navigate('/vehicles'),
            className: location.pathname.includes('/vehicles') ? 'p-menuitem-active' : ''
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            <div style={{ width: '250px', backgroundColor: '#ffffff', boxShadow: '2px 0 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <h2 style={{ margin: 0, color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <i className="pi pi-leaf" style={{ fontSize: '1.5rem' }}></i>
                        AgroOrganizer
                    </h2>
                </div>

                <div style={{ flex: 1, padding: '10px' }}>
                    <Menu model={items} style={{ width: '100%', border: 'none' }} />
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                    <Button label="Изход" icon="pi pi-sign-out" className="p-button-text p-button-danger" style={{ width: '100%' }} onClick={handleLogout} />
                </div>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;