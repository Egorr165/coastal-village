import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

import Catalog from './pages/Catalog/Catalog';
import House from './pages/House/House';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/house/:id" element={<House />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </BrowserRouter>
);

export default App;