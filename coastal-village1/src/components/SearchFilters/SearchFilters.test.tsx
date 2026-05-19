import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchFilters from './SearchFilters';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/availabilityService', () => ({
  fetchHouses: vi.fn(() => Promise.resolve([
    { id: '1', type: 'small', price: 5000, bookedRanges: [] },
    { id: '2', type: 'big', price: 10000, bookedRanges: [] },
  ])),
  checkTypeAvailability: vi.fn(() => ({
    available: true,
    availableCount: 2,
    totalCount: 5,
    message: ''
  })),
  getPriceByType: vi.fn((_, type) => type === 'big' ? 10000 : 5000),
  getHouseCountByType: vi.fn((_, type) => type === 'big' ? 5 : 1),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SearchFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main elements correctly', async () => {
    renderWithRouter(<SearchFilters />);
    
    expect(await screen.findByText(/Поиск коттеджей/i)).toBeInTheDocument();
    expect(screen.getByText(/Заезд/i)).toBeInTheDocument();
    expect(screen.getByText(/Выезд/i)).toBeInTheDocument();
    expect(screen.getByText(/Количество человек/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Найти варианты/i })).toBeInTheDocument();
  });

  it('opens guests dropdown and changes count', async () => {
    renderWithRouter(<SearchFilters />);
    
    const guestsValue = await screen.findByText('2');
    const guestsWrapper = guestsValue.closest('.guests-selector');
    
    expect(guestsWrapper).toBeInTheDocument();
    if (guestsWrapper) fireEvent.click(guestsWrapper);

    expect(await screen.findByText('+')).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();

    fireEvent.click(screen.getByText('+'));
    
    await waitFor(() => {
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });
  });

  it('disables big house selection if guests > 6', async () => {
    renderWithRouter(<SearchFilters />);
    
    const guestsValue = await screen.findByText('2');
    const guestsWrapper = guestsValue.closest('.guests-selector');
    if (guestsWrapper) fireEvent.click(guestsWrapper);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(await screen.findByText('+'));
    }

    const bigHouseBtn = screen.getByRole('button', { name: /Большой дом/i });
    expect(bigHouseBtn).toBeDisabled();
  });

  it('navigates to catalog with correct params on search click', async () => {
    renderWithRouter(<SearchFilters />);
    
    const searchButton = screen.getByRole('button', { name: /Найти варианты/i });
    fireEvent.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/catalog');
  });
});