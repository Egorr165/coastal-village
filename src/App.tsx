import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';

import Catalog from './pages/Catalog/Catalog';

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
        </Routes>
    </BrowserRouter>
);

export default App;