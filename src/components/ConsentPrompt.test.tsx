import { render, screen, act as rtlAct } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsentPrompt } from './ConsentPrompt';
import { useAppStore } from '../store';
import { vi, beforeEach, describe, it, expect, type Mock } from 'vitest'; 

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store')>();
  return {
    ...actual,
    useAppStore: vi.fn(actual.useAppStore),
  };
});

describe('ConsentPrompt', () => {
  let setVoteSubmissionConsentMock: Mock;

  beforeEach(() => {
    setVoteSubmissionConsentMock = vi.fn();
    (useAppStore as unknown as Mock).mockImplementation((selector: any) => {
      if (selector.toString().includes('state.setVoteSubmissionConsent')) {
        return setVoteSubmissionConsentMock;
      }
      const actualStore = useAppStore.getState();
      return selector(actualStore);
    });
    vi.clearAllMocks();
  });

  it('renders the consent prompt with title and description', () => {
    render(<ConsentPrompt />);
    expect(screen.getByRole('heading', { name: /Submit votes to the server\?/i })).toBeInTheDocument();
    expect(screen.getByText(/Allow this application to send your votes/i)).toBeInTheDocument();
  });

  it('calls setConsent(false) when "No" button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConsentPrompt />);
    
    const noButton = screen.getByRole('button', { name: /No , store my votes only locally in the browser\./i });
    await rtlAct(async () => {
        await user.click(noButton);
    });
    
    expect(setVoteSubmissionConsentMock).toHaveBeenCalledWith(false);
  });

  it('calls setConsent(true) when "Yes" button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConsentPrompt />);

    const yesButton = screen.getByRole('button', { name: /Yes , send data to the server to improve the schedule\./i });
    await rtlAct(async () => {
        await user.click(yesButton);
    });

    expect(setVoteSubmissionConsentMock).toHaveBeenCalledWith(true);
  });
});