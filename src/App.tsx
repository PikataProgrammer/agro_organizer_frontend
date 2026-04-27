import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./pages/Dashboard.tsx";
import FieldDetails from "./pages/FieldDetails.tsx";
import MainLayout from "./components/MainLayout.tsx";
import Finances from "./pages/Finances.tsx";
import Login from "./pages/Login.tsx";
import Drivers from "./pages/Drivers.tsx";
import Vehicles from "./pages/Vehicles.tsx";
import ChangePassword from "./pages/ChangePassword.tsx";
import Market from "./pages/Market.tsx";

function App() {
    return (
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/field/:id" element={<FieldDetails />} />
                        <Route path="/finances" element={<Finances />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/drivers" element={<Drivers />} />
                        <Route path="/vehicles" element={<Vehicles />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
    )
}

export default App
