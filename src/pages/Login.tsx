import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useApp } from '../context/AppContext';

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import backgroundImage from '../assets/Background_image.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetting, setResetting] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useApp();
    const toast = useRef<Toast>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', { email, password });

            const userData = response.data;
            const userId = userData.id || userData.userId || userData.Id;

            if (userId) {
                const needsPasswordChange = userData.shouldChangePassword || userData.ShouldChangePassword;

                if (needsPasswordChange) {
                    navigate('/change-password', { state: { email: email } });
                    return;
                }

                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('userEmail', email);
                showToast('success', 'Добре дошли!', 'Успешен вход в системата.');
                navigate('/dashboard');
            } else {
                console.log("Данни от бекенда:", response.data);
                setError('Грешка в данните от сървъра.');
            }
        } catch (err: any) {
            setError('Грешен имейл или парола!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetEmail) {
            toast.current?.show({ severity: 'warn', summary: 'Внимание', detail: 'Моля, въведете имейл адрес.' });
            return;
        }

        setResetting(true);
        try {
            await api.post('/api/auth/reset-password', { email: resetEmail });
            toast.current?.show({ severity: 'success', summary: 'Изпратено', detail: 'Ако имейлът съществува, ще получите нова парола!' });
            setShowResetDialog(false);
            setResetEmail('');
        } catch (err) {
            toast.current?.show({ severity: 'error', summary: 'Грешка', detail: 'Възникна проблем. Опитайте по-късно.' });
            console.error(err);
        } finally {
            setResetting(false);
        }
    };

    const header = (
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <h2 style={{ color: '#22C55E', margin: 0 }}>
                <i className="pi pi-leaf" style={{ fontSize: '2rem', marginRight: '10px' }}></i>
                AgroOrganizer
            </h2>
            <p style={{ color: '#666' }}>Влезте в своя акаунт</p>
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Toast ref={toast} />
            <Card header={header} style={{ width: '100%', maxWidth: '450px', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope" style={{ paddingLeft: '0.8rem' }} />
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@mail.com"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Парола</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-lock" style={{ zIndex: 10, paddingLeft: '0.8rem' }} />
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                feedback={false}
                                toggleMask
                                placeholder="******"
                                inputStyle={{ paddingLeft: '2.5rem' }}
                                style={{ width: '100%' }}
                            />
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <Button
                            label="Забравена парола?"
                            className="p-button-link p-0"
                            type="button"
                            onClick={() => setShowResetDialog(true)}
                            style={{ padding: 0, textDecoration: 'none' }}
                        />
                    </div>

                    {error && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Message severity="error" text={error} style={{ width: '100%' }} />
                        </div>
                    )}

                    <Button
                        label="Вход в системата"
                        icon="pi pi-sign-in"
                        loading={loading}
                        type="submit"
                        className="p-button-success"
                        style={{ height: '45px', borderRadius: '8px' }}
                    />
                </form>
            </Card>

            {/* Forget password */}
            <Dialog header="Възстановяване на парола" visible={showResetDialog} style={{ width: '400px' }} onHide={() => setShowResetDialog(false)} footer={
                <div>
                    <Button label="Отказ" icon="pi pi-times" onClick={() => setShowResetDialog(false)} className="p-button-text p-button-secondary" />
                    <Button label="Изпрати" icon="pi pi-envelope" onClick={handleResetPassword} loading={resetting} className="p-button-success" autoFocus />
                </div>
            }>
                <p className="m-0" style={{ marginBottom: '1rem' }}>
                    Въведете вашия имейл адрес. Ако той съществува в нашата система, ще ви изпратим нова временна парола.
                </p>
                <div className="p-fluid" style={{display:"flex", flexWrap: "wrap",  gap: '0.4rem' }}>
                    <label style={{ fontWeight: 'bold' }}>Email *</label>
                    <InputText type="email" value={resetEmail}
                               onChange={(e) => setResetEmail(e.target.value)} placeholder="Въведете имейл"
                               />
                </div>
            </Dialog>
        </div>
    );
};

export default Login;