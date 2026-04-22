import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useApp } from '../context/AppContext';

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';


import backgroundImage from '../assets/Background_image.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { showToast } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', { email, password });

            const userId = response.data.id || response.data.userId || response.data.Id;

            if (userId) {
                localStorage.setItem('userId', userId.toString());
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
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
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
                                inputStyle={{ paddingLeft: '2.5rem' }}
                                style={{ width: '100%' }}
                            />
                        </span>
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
        </div>
    );
};

export default Login;