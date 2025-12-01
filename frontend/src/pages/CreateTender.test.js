import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CreateTender from '../pages/CreateTender';
import { procurementAPI } from '../api';

// Mock dependencies
jest.mock('../api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <CreateTender />
    </BrowserRouter>
  );
};

describe('CreateTender Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    procurementAPI.createTender.mockClear();
  });

  test('should render the first step initially', () => {
    renderComponent();
    expect(screen.getByText(/Étape 1 sur 6/i)).toBeInTheDocument();
    expect(screen.getByText(/Informations/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Titre de l'appel d'offres/i)).toBeInTheDocument();
  });

  test('should show validation error if title is missing on step 1', () => {
    renderComponent();
    fireEvent.click(screen.getByText(/Suivant/i));
    expect(screen.getByText(/Le titre doit contenir au moins 5 caractères/i)).toBeInTheDocument();
  });

  test('should navigate to the next step on valid input', () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Titre de l'appel d'offres/i), { target: { value: 'Valid Tender Title' } });
    fireEvent.change(screen.getByLabelText(/Description détaillée/i), { target: { value: 'This is a sufficiently long and valid description for the tender.' } });
    fireEvent.click(screen.getByText(/Suivant/i));
    expect(screen.getByText(/Étape 2 sur 6/i)).toBeInTheDocument();
    expect(screen.getByText(/Lots/i)).toBeInTheDocument();
  });

  test('should handle form submission successfully', async () => {
    procurementAPI.createTender.mockResolvedValue({ data: { id: 'tender-123' } });
    renderComponent();

    // --- Simulate filling the entire form ---
    // Step 1
    fireEvent.change(screen.getByLabelText(/Titre de l'appel d'offres/i), { target: { value: 'Final Test Tender' } });
    fireEvent.change(screen.getByLabelText(/Description détaillée/i), { target: { value: 'A complete description for the final test tender.' } });
    fireEvent.click(screen.getByText(/Suivant/i));

    // Step 2
    fireEvent.click(screen.getByText(/Suivant/i));

    // Step 3 (Lots) - Assume it's valid for now
    fireEvent.click(screen.getByText(/Suivant/i));
    
    // Step 4 (Requirements)
    fireEvent.click(screen.getByText(/Suivant/i));

    // Step 5 (Evaluation)
    fireEvent.click(screen.getByText(/Suivant/i));

    // Step 6 (Finalisation)
    // Simulate filling final details
    fireEvent.change(screen.getByLabelText(/Niveau d'attribution/i), { target: { value: 'lot' } });

    // Click submit
    fireEvent.click(screen.getByText(/Créer l'Appel d'Offres/i));

    await waitFor(() => {
      expect(procurementAPI.createTender).toHaveBeenCalled();
    });

    // Check if the API was called with (at least) the title
    expect(procurementAPI.createTender).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Final Test Tender',
      })
    );
  });

});