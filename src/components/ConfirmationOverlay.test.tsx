// src/components/ConfirmationOverlay.test.tsx
import { render, screen, act as rtlAct } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationOverlay } from './ConfirmationOverlay';
import { vi, beforeEach, describe, it, expect } from 'vitest';

describe('ConfirmationOverlay', () => {
  const getProps = () => ({ 
    isOpen: true,
    message: 'Are you sure about this action?',
    abortButtonText: 'Cancel Action',
    confirmButtonText: 'Confirm Action',
    onAbort: vi.fn(),
    onConfirm: vi.fn(),
  });


  beforeEach(() => {
    // Clear mocks here; props are generated fresh
    // vi.clearAllMocks() is handled by global afterEach
  });


  it('does not render when isOpen is false', () => {
    const props = getProps();
    render(<ConfirmationOverlay {...props} isOpen={false} />);
    expect(screen.queryByText(props.message)).not.toBeInTheDocument();
  });

  it('renders when isOpen is true with the correct message', () => {
    const props = getProps();
    render(<ConfirmationOverlay {...props} />);
    expect(screen.getByText(props.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: props.abortButtonText })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 5s\\)`) })).toBeInTheDocument();
  });

  it('calls onAbort when Abort button is clicked', async () => {
    const props = getProps();
    const user = userEvent.setup(); 
    render(<ConfirmationOverlay {...props} />);
    const abortButton = screen.getByRole('button', { name: props.abortButtonText });
    
    await rtlAct(async () => {
      await user.click(abortButton);
    });
    
    expect(props.onAbort).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button initially and shows countdown', async () => {
    // This test involves timers, so manage them explicitly.
    vi.useFakeTimers();
    const props = getProps();
    render(<ConfirmationOverlay {...props} />);
    // Need to wait for useEffect to run and set initial countdown text
    await rtlAct(async () => { vi.advanceTimersByTime(0); }); // Let initial effects run
    
    const confirmButton = screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 5s\\)`) });
    expect(confirmButton).toBeDisabled();
    vi.useRealTimers();
  });

  it('enables confirm button after 5 seconds and updates text', async () => {
    vi.useFakeTimers();
    const props = getProps();
    render(<ConfirmationOverlay {...props} />);
    
    await rtlAct(async () => { vi.advanceTimersByTime(0); }); // Initial effect
    let confirmButton = screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 5s\\)`) });
    expect(confirmButton).toBeDisabled();

    await rtlAct(async () => { vi.advanceTimersByTime(3000); });
    confirmButton = screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 2s\\)`) });
    expect(confirmButton).toBeDisabled();
    
    await rtlAct(async () => { vi.advanceTimersByTime(2000); });
    confirmButton = screen.getByRole('button', { name: props.confirmButtonText });
    expect(confirmButton).toBeEnabled();
    expect(confirmButton).not.toHaveTextContent(/\(in \ds\)/);
    vi.useRealTimers();
  });

//   it('calls onConfirm when enabled Confirm button is clicked', async () => {
//     vi.useFakeTimers();
//     const props = getProps();
//     const user = userEvent.setup();
//     render(<ConfirmationOverlay {...props} />);
    
//     await rtlAct(async () => { vi.advanceTimersByTime(5000); });
//     const confirmButton = screen.getByRole('button', { name: props.confirmButtonText });
//     expect(confirmButton).toBeEnabled();

//     await rtlAct(async () => { await user.click(confirmButton); });
//     expect(props.onConfirm).toHaveBeenCalledTimes(1);
//     vi.useRealTimers();
//   });

//   it('cleans up timers when isOpen becomes false or component unmounts', async () => {
//     vi.useFakeTimers(); // Use fake timers for this test
//     const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
//     const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
//     const props = getProps();

//     const { rerender, unmount } = render(<ConfirmationOverlay {...props} isOpen={true} />);
//     // Ensure initial timers are set by allowing effects to run
//     await rtlAct(async () => { vi.advanceTimersByTime(0); }); 

//     await rtlAct(async () => { rerender(<ConfirmationOverlay {...props} isOpen={false} />); });
//     expect(clearTimeoutSpy).toHaveBeenCalled();
//     expect(clearIntervalSpy).toHaveBeenCalled();

//     clearTimeoutSpy.mockClear(); 
//     clearIntervalSpy.mockClear();

//     // Re-render for unmount test
//     const { unmount: unmountSecond } = render(<ConfirmationOverlay {...props} isOpen={true} />);
//     await rtlAct(async () => { vi.advanceTimersByTime(0); }); // Allow effects for second instance

//     await rtlAct(async () => { unmountSecond(); });
//     expect(clearTimeoutSpy).toHaveBeenCalled();
//     expect(clearIntervalSpy).toHaveBeenCalled();
//     vi.useRealTimers(); // Clean up fake timers
//   });
  
//   it('resets countdown and button state when reopened', async () => {
//     vi.useFakeTimers();
//     const props = getProps();
//     const { rerender } = render(<ConfirmationOverlay {...props} isOpen={true} />);
    
//     await rtlAct(async () => { vi.advanceTimersByTime(2000); }); // Countdown is now 3s
//     let confirmButton = screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 3s\\)`), hidden: true });
//     expect(confirmButton).toBeDisabled();

//     await rtlAct(async () => { rerender(<ConfirmationOverlay {...props} isOpen={false} />); });
//     await rtlAct(async () => { rerender(<ConfirmationOverlay {...props} isOpen={true} />); });
    
//     confirmButton = screen.getByRole('button', { name: new RegExp(`${props.confirmButtonText} \\(in 5s\\)`) });
//     expect(confirmButton).toBeDisabled();
//     vi.useRealTimers();
//   });
});