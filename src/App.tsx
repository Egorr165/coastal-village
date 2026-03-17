import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

import Catalog from './pages/Catalog/Catalog';
import House from './pages/House/House';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/house/:id" element={<House />} />
        </Routes>
    </BrowserRouter>
);

export default App;