
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactForm from './ContactForm';
import api from '../../services/api'; 

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

const mockAddToast = vi.fn();

vi.mock('../../store/useToastStore', () => ({
  useToastStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ addToast: mockAddToast });
    }
    return { addToast: mockAddToast };
  },
}));

describe('ContactForm Component - Business Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly formats phone number as user types', () => {
    render(<ContactForm />);
    
    const phoneInput = screen.getByPlaceholderText('+7 (999) 999-99-99');
    fireEvent.change(phoneInput, { target: { value: '9001234567' } });
    
    expect(phoneInput).toHaveValue('+7 (900) 123-45-67');
  });

  it('prevents submission if checkbox is not checked', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /консультация/i });
    const nameInput = screen.getByPlaceholderText('Имя');
    const phoneInput = screen.getByPlaceholderText('+7 (999) 999-99-99');
    
    fireEvent.change(nameInput, { target: { value: 'Иван' } });
    fireEvent.change(phoneInput, { target: { value: '9001234567' } });
    
    expect(submitButton).toBeDisabled();
  });

    it('successfully submits form when all data is valid', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /консультация/i });
    const nameInput = screen.getByPlaceholderText('Имя');
    const phoneInput = screen.getByPlaceholderText('+7 (999) 999-99-99');
    const checkbox = screen.getByRole('checkbox');
    
    fireEvent.change(nameInput, { target: { value: 'Иван Петров' } });
    fireEvent.change(phoneInput, { target: { value: '9001234567' } });
    fireEvent.click(checkbox);
    
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/contacts/', {
        name: 'Иван Петров',
        phone: '+7 (900) 123-45-67',
      });
      
      expect(mockAddToast).toHaveBeenCalled();
      expect(mockAddToast.mock.calls[0][1]).toBe('success'); 
    }, { timeout: 1000 });
  });
});