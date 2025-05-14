// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { AdminUserStep } from './admin-user-step';
// import { beforeEach, describe, expect, it, jest } from 'jest';

// // Mock the store and API
// jest.mock('@/stores/onboarding-store', () => ({
//   useOnboardingStore: () => ({ setCurrentStep: jest.fn() })
// }));
// jest.mock('@/lib/api', () => ({
//   fetchApi: jest.fn(() => Promise.resolve({}))
// }));

// describe('AdminUserStep', () => {
//   const onComplete = jest.fn();

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('renders required fields', () => {
//     render(<AdminUserStep onComplete={onComplete} />);
//     expect(screen.getByLabelText(/Nombre\(s\)/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Apellidos/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Repetir Contraseña/i)).toBeInTheDocument();
//   });

//   it('shows validation errors on blur', async () => {
//     render(<AdminUserStep onComplete={onComplete} />);
//     const firstNameInput = screen.getByLabelText(/Nombre\(s\)/i);
//     fireEvent.blur(firstNameInput);
//     await waitFor(() => {
//       expect(screen.getByText(/nombre debe tener al menos/i)).toBeInTheDocument();
//     });
//   });

//   it('disables submit button if form is invalid', () => {
//     render(<AdminUserStep onComplete={onComplete} />);
//     const submitBtn = screen.getByRole('button', { name: /crear usuario administrador/i });
//     expect(submitBtn).toBeDisabled();
//   });

//   it('submits form when valid and calls onComplete', async () => {
//     const { fetchApi } = require('@/lib/api');
//     render(<AdminUserStep onComplete={onComplete} />);
//     fireEvent.change(screen.getByLabelText(/Nombre\(s\)/i), { target: { value: 'Juan' } });
//     fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Pérez' } });
//     fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'Password123' } });
//     fireEvent.change(screen.getByLabelText(/Repetir Contraseña/i), { target: { value: 'Password123' } });
//     const submitBtn = screen.getByRole('button', { name: /crear usuario administrador/i });
//     await waitFor(() => expect(submitBtn).toBeEnabled());
//     fireEvent.click(submitBtn);
//     await waitFor(() => {
//       expect(fetchApi).toHaveBeenCalledWith('/api/v1/admin/create', expect.objectContaining({ method: 'POST' }));
//       expect(onComplete).toHaveBeenCalled();
//     });
//   });

//   it('shows error if API fails', async () => {
//     const { fetchApi } = require('@/lib/api');
//     fetchApi.mockImplementationOnce(() => Promise.reject({ response: { data: { message: 'Error al crear usuario' } } }));
//     render(<AdminUserStep onComplete={onComplete} />);
//     fireEvent.change(screen.getByLabelText(/Nombre\(s\)/i), { target: { value: 'Juan' } });
//     fireEvent.change(screen.getByLabelText(/Apellidos/i), { target: { value: 'Pérez' } });
//     fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'Password123' } });
//     fireEvent.change(screen.getByLabelText(/Repetir Contraseña/i), { target: { value: 'Password123' } });
//     const submitBtn = screen.getByRole('button', { name: /crear usuario administrador/i });
//     await waitFor(() => expect(submitBtn).toBeEnabled());
//     fireEvent.click(submitBtn);
//     await waitFor(() => {
//       expect(screen.getByText(/error al crear usuario/i)).toBeInTheDocument();
//     });
//   });
// });
