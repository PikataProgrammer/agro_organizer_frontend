import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const ChangePassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || localStorage.getItem('userEmail') || '';

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Новите пароли не съвпадат!');
            return;
        }

        if (!email) {
            setError('Липсва имейл адрес. Моля, влезте отново.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/auth/change-password', {
                email: email,
                oldPassword: oldPassword,
                newPassword: newPassword
            });

            setSuccess('Паролата е сменена успешно! Моля, влезте с новата парола.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Грешна стара парола или сървърна грешка.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Невалидна сесия</h2>
                <Button label="Към Вход" onClick={() => navigate('/login')} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
            <Card title="Смяна на парола" subTitle="Задължителна стъпка след възстановяване" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Текуща (временна) парола</label>
                        <Password value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required feedback={false} toggleMask
                                  style={{ paddingTop: '0.5rem', }}/>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold', }}>Нова парола</label>
                        <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                  required promptLabel="Въведете парола" weakLabel="Слаба" mediumLabel="Средна" strongLabel="Силна" toggleMask
                                  style={{ paddingTop: '0.5rem', }}/>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Потвърди нова парола</label>
                        <Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                  required feedback={false} toggleMask style={{ paddingTop: '0.5rem', }}/>
                    </div>

                    {error && <Message severity="error" text={error} style={{ width: '100%', marginBottom: '1rem' }} />}
                    {success && <Message severity="success" text={success} style={{ width: '100%', marginBottom: '1rem' }} />}

                    <Button label="Смени паролата" icon="pi pi-check" loading={loading} type="submit" className="p-button-success" />
                </form>
            </Card>
        </div>
    );
};

export default ChangePassword;