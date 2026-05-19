
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingCalendar, { getNightsWord } from './BookingCalendar';
import * as availabilityService from '../../services/availabilityService';

vi.mock('../../services/availabilityService', () => ({
  getBookedDatesForMonth: vi.fn(() => []), 
}));

describe('BookingCalendar Component', () => {
  const mockOnBookClick = vi.fn();
  const mockOnHouseTypeChange = vi.fn();

  const defaultProps = {
    houseId: 'test-house-1',
    houseTitle: 'Тестовый коттедж',
    houseType: 'small' as const,
    pricePerNight: 5000,
    bookedRanges: [],
    onBookClick: mockOnBookClick,
    onHouseTypeChange: mockOnHouseTypeChange,
  };

  const getActiveDays = () => {
    const container = document.querySelector('.booking-widget__calendar-grid');
    if (!container) return [];
    
    const days = Array.from(container.querySelectorAll('.booking-widget__day:not(.booking-widget__day--inactive)'));
    return days;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(availabilityService.getBookedDatesForMonth).mockReturnValue([]);
  });

  describe('Utility Function: getNightsWord', () => {
    it('returns "ночь" for 1 night', () => {
      expect(getNightsWord(1)).toBe('ночь');
    });

    it('returns "ночи" for 2, 3, 4 nights', () => {
      expect(getNightsWord(2)).toBe('ночи');
      expect(getNightsWord(3)).toBe('ночи');
      expect(getNightsWord(4)).toBe('ночи');
    });

    it('returns "ночей" for 5+ nights and exceptions (11-19)', () => {
      expect(getNightsWord(5)).toBe('ночей');
      expect(getNightsWord(10)).toBe('ночей');
      expect(getNightsWord(11)).toBe('ночей');
      expect(getNightsWord(12)).toBe('ночей');
      expect(getNightsWord(21)).toBe('ночь');
    });
  });

  describe('Component Rendering & Interaction', () => {
    it('renders calendar header with current month and year', () => {
      render(<BookingCalendar {...defaultProps} />);
      
      const now = new Date();
      const monthName = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ][now.getMonth()];
      
      expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument();
      
      const yearRegex = new RegExp(now.getFullYear().toString());
      expect(screen.getByText(yearRegex)).toBeInTheDocument();
    });

    it('calculates total price correctly when dates are selected', async () => {
      render(<BookingCalendar {...defaultProps} pricePerNight={10000} />);
      
      const activeDays = getActiveDays();
      
      if (activeDays.length >= 2) {
        fireEvent.click(activeDays[0]); 
        fireEvent.click(activeDays[1]); 
        
        await waitFor(() => {
          const totalContainer = screen.getByText(/Итоговая стоимость:/).closest('.booking-widget__total');
          expect(totalContainer).toHaveTextContent('10 000 ₽');
        });
      }
    });

    it('disables booking button if dates are not selected', () => {
      render(<BookingCalendar {...defaultProps} />);
      
      const bookButton = screen.getByRole('button', { name: /ЗАБРОНИРОВАТЬ/i });
      expect(bookButton).toBeDisabled();
    });

    it('enables booking button and calls onBookClick when valid dates are selected', async () => {
      render(<BookingCalendar {...defaultProps} pricePerNight={5000} />);
      
      const activeDays = getActiveDays();
      
      if (activeDays.length >= 2) {
        fireEvent.click(activeDays[0]);
        fireEvent.click(activeDays[1]);
        
        const bookButton = screen.getByRole('button', { name: /ЗАБРОНИРОВАТЬ/i });
        expect(bookButton).not.toBeDisabled();
        
        fireEvent.click(bookButton);
        
        await waitFor(() => {
          expect(mockOnBookClick).toHaveBeenCalled();
          const callArgs = mockOnBookClick.mock.calls[0][0];
          
          expect(callArgs).toHaveProperty('houseId');
          expect(callArgs).toHaveProperty('checkIn');
          expect(callArgs).toHaveProperty('checkOut');
          expect(callArgs.totalPrice).toBeGreaterThan(0);
        });
      }
    });

    it('adds extra bed cost to total price when checkbox is checked', async () => {
      render(<BookingCalendar {...defaultProps} pricePerNight={1000} />);
      
      const activeDays = getActiveDays();
      
      if (activeDays.length >= 2) {
        fireEvent.click(activeDays[0]);
        fireEvent.click(activeDays[1]);
        
        const checkbox = screen.getByLabelText(/Дополнительное место/i);
        fireEvent.click(checkbox);
        
        await waitFor(() => {
          const totalContainer = screen.getByText(/Итоговая стоимость:/).closest('.booking-widget__total');
          expect(totalContainer).toHaveTextContent('2 500 ₽');
        });
      }
    });

    it('switches house type when selector is used', () => {
      render(<BookingCalendar {...defaultProps} allowHouseSelection={true} />);
      
      const bigHouseBtn = screen.getByRole('button', { name: /6-ти местный/i });
      fireEvent.click(bigHouseBtn);
      
      expect(mockOnHouseTypeChange).toHaveBeenCalledWith('big');
    });
  });
});