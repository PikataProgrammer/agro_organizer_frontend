import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { type LoginResponse } from '../types';

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {

            const response = await api.post<LoginResponse>('/api/auth/login', { email, password });
            console.log('Успешен вход:', response.data);
            localStorage.setItem('userId', response.data.userId.toString());
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Грешен имейл или парола');
        } finally {
            setLoading(false);
        }
    };

    const header = (
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <i className="pi pi-leaf" style={{ fontSize: '2.5rem', color: '#22C55E' }}></i>
            <h2 style={{ margin: '10px 0 0 0', color: '#333' }}>AgroOrganizer</h2>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4' }}>
            <Card header={header} style={{ width: '100%', maxWidth: '500px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                        <span className="p-input-icon-left" style={{ width: '100%'}}>
                            <i className="pi pi-envelope" style={{  zIndex: 1, paddingLeft: "1rem"  }} />
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Въведи имейл"
                                style={{ width: '100%', paddingLeft: '2.5rem' }}
                            />
                        </span>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Парола</label>
                        <span className="p-input-icon-left" style={{ width: '100%' }}>
                            <i className="pi pi-lock" style={{ zIndex: 1, paddingLeft: "1rem"  }} />
                            <Password
                                inputId="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                feedback={false}
                                toggleMask
                                placeholder="Въведи парола"
                                inputStyle={{ paddingLeft: '2.5rem', width: '100%' }}
                                style={{ width: '100%' }}
                            />
                        </span>
                    </div>

                    {error && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Message severity="error" text={error} style={{ width: '100%', justifyContent: 'flex-start' }} />
                        </div>
                    )}

                    <Button
                        label="Вход"
                        icon="pi pi-sign-in"
                        loading={loading}
                        type="submit"
                        className="p-button-success"
                        style={{ width: '100%', paddingRight: '3rem'}}
                    />
                </form>
            </Card>
        </div>
    );
};

export default Login;