// src/App.test.tsx
import { render, screen, act as rtlAct } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import App from './App';
import { useAppStore, AppState } from './store';
import { useSubmissions, useSubmitVotes } from './hooks';
import { vi, beforeEach, afterEach, describe, it, expect, type Mock } from 'vitest'; // Added afterEach
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';

// Mock window.matchMedia at the very top to ensure it's available when SideMenu imports
// This can be redundant if setupFiles guarantees execution order, but it's safer.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('./hooks');

const mockUseSubmissions = useSubmissions as Mock;
const mockUseSubmitVotes = useSubmitVotes as Mock;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, } },
});

const getInitialAppStateForAppTests = (): AppState => ({
    clientId: null, randomValue: null, votes: {}, lastVoteSequenceNumber: null,
    isVoteSubmissionEnabled: null, submissions: new Map(), submissionOrder: [],
    lastSubmissionVersion: null, isInitializing: true, initialSubmissionsLoadState: 'idle',
    pollingSubmissionsError: false, voteSyncState: 'idle', isVoteSyncRequestInFlight: false,
    voteSendTimeoutId: null, voteRetryDelayMs: config.votes.initialRetryDelayMs,
    applicationName: 'conferenceVoter', confirmationOverlayVisible: false,
    confirmationOverlayMessage: '', confirmationOverlayActionType: null,
});

describe('App Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };
  
  beforeEach(() => {
    queryClient = createTestQueryClient();
    // The global beforeEach in setupTests.ts now sets isInitializing to false by default.
    // We'll override for specific tests that need isInitializing: true.
    // For other tests, the default of isInitializing: false is fine.
    mockUseSubmissions.mockReturnValue({
      isLoading: false, isError: false, error: null, isFetching: false, refetch: vi.fn(),
    });
    mockUseSubmitVotes.mockReturnValue({
      submitVotesAction: vi.fn(), isSubmitting: false, isError: false,
    });
    // vi.clearAllMocks() is in global afterEach
  });

  // it('renders LoadingIndicator when isInitializing is true', async () => {
  //   rtlAct(() => {
  //       const initialAppState = getInitialAppStateForAppTests();
  //       const currentState = useAppStore.getState();
  //       useAppStore.setState({
  //           ...initialAppState,
  //           isInitializing: true, // Explicitly set for this test
  //           isVoteSubmissionEnabled: true, // Assume consent to bypass ConsentPrompt for this test
  //           // Carry over actions
  //           initializeClient: currentState.initializeClient,
  //           setVoteSubmissionConsent: currentState.setVoteSubmissionConsent,
  //           _handleSubmissionsResponse: currentState._handleSubmissionsResponse,
  //           _setInitialSubmissionsLoadStatus: currentState._setInitialSubmissionsLoadStatus,
  //           _setPollingSubmissionsError: currentState._setPollingSubmissionsError,
  //           setExpanded: currentState.setExpanded,
  //           setVote: currentState.setVote,
  //           _triggerVoteSync: currentState._triggerVoteSync,
  //           _handleVoteSyncSuccess: currentState._handleVoteSyncSuccess,
  //           _handleVoteSyncError: currentState._handleVoteSyncError,
  //           showConfirmationOverlay: currentState.showConfirmationOverlay,
  //           hideConfirmationOverlay: currentState.hideConfirmationOverlay,
  //       }, true);
  //   });

  //   renderApp();
  //   // Assert immediately
  //   expect(screen.getByText(/Initializing Conference App.../i)).toBeInTheDocument();

  //   // Wait for the initialization to complete and the UI to update
  //   await waitFor(() => {
  //     expect(screen.queryByText(/Initializing Conference App.../i)).not.toBeInTheDocument();
  //   });
  //    // Now check what SHOULD be there after initialization (e.g., main view if submissions loaded, or an error)
  //   // For this specific test, if submissions are not mocked to load, it might show "No submissions" or similar
  //   // Depending on the default mockUseSubmissions, it might show the header.
  //   await waitFor(() => {
  //       expect(screen.getByRole('heading', { name: /Conference Schedule Feedback/i })).toBeInTheDocument();
  //   })

  // });

  // it('renders LoadingIndicator when submissions are loading', () => {
  //   mockUseSubmissions.mockReturnValueOnce({
  //     isLoading: true, isError: false, error: null, isFetching: false, refetch: vi.fn(),
  //   });
  //    rtlAct(() => { // Ensure store is not initializing from Zustand's perspective
  //     useAppStore.setState(prev => ({...prev, isInitializing: false, isVoteSubmissionEnabled: true}));
  //   });
  //   renderApp();
  //   // App.tsx uses isInitializing (from store) OR isSubmissionsLoading (from useSubmissions)
  //   expect(screen.getByText(/Initializing Conference App.../i)).toBeInTheDocument();
  // });

  it('renders ConsentPrompt when isVoteSubmissionEnabled is null', () => {
    rtlAct(() => {
      // Ensure isInitializing is false, and isVoteSubmissionEnabled is null
      const initialAppState = getInitialAppStateForAppTests();
      const currentState = useAppStore.getState();
      useAppStore.setState({
        ...initialAppState,
        isInitializing: false, 
        isVoteSubmissionEnabled: null,
        // carry over actions
        initializeClient: currentState.initializeClient,
        setVoteSubmissionConsent: currentState.setVoteSubmissionConsent,
        _handleSubmissionsResponse: currentState._handleSubmissionsResponse,
        _setInitialSubmissionsLoadStatus: currentState._setInitialSubmissionsLoadStatus,
        _setPollingSubmissionsError: currentState._setPollingSubmissionsError,
        setExpanded: currentState.setExpanded,
        setVote: currentState.setVote,
        _triggerVoteSync: currentState._triggerVoteSync,
        _handleVoteSyncSuccess: currentState._handleVoteSyncSuccess,
        _handleVoteSyncError: currentState._handleVoteSyncError,
        showConfirmationOverlay: currentState.showConfirmationOverlay,
        hideConfirmationOverlay: currentState.hideConfirmationOverlay,
      }, true);
    });
    renderApp();
    expect(screen.getByRole('heading', { name: /Submit votes to the server\?/i })).toBeInTheDocument();
  });
  
  // Test for "TypeError: Cannot read properties of undefined (reading 'matches')"
  it('renders main app view (header, SubmissionList, SideMenu) on successful load', () => {
    mockUseSubmissions.mockReturnValueOnce({
      isLoading: false, isError: false, error: null, isFetching: false, refetch: vi.fn(),
    });
    rtlAct(() => {
      const currentStoreState = useAppStore.getState();
      useAppStore.setState({
        ...currentStoreState, // Use all fields from the current state
        isInitializing: false,
        isVoteSubmissionEnabled: true,
        submissionOrder: ['S1'],
        submissions: new Map([['S1', { title: 'Test Submission S1', code: 'foo',  abstract: 'Abstract S1', initialVersion: 1 }]]),
        votes: { 'S1': { vote: 'neutral', expanded: false } },
        clientId: 'test-client',
      }, true); // Replace state
    });
    renderApp();
    expect(screen.getByRole('heading', { name: /Conference Schedule Feedback/i })).toBeInTheDocument();
    expect(screen.getByText('Test Submission S1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open menu/i})).toBeInTheDocument(); // Check for SideMenu
  });

  // ... (other App.test.tsx tests, ensure state setup is complete for each if using replace: true)
  // For tests like 'renders error message if submissions query fails', 'shows and handles confirmation overlay', etc.
  // ensure the beforeEach or a specific rtlAct block correctly sets up ALL necessary store state.
  // Example for error message:
  it('renders error message if submissions query fails', () => {
    mockUseSubmissions.mockReturnValueOnce({
      isLoading: false, isError: true, error: new Error("Failed to load"), isFetching: false, refetch: vi.fn(),
    });
    rtlAct(() => {
      const currentStoreState = useAppStore.getState();
      useAppStore.setState({ 
        ...currentStoreState,
        isInitializing: false, 
        isVoteSubmissionEnabled: true,
        lastSubmissionVersion: null, // Important for useSubmissions to report initial load error
      }, true);
    });
    renderApp();
    expect(screen.getByText(/Could not load conference submissions./i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
  });

  // Example for confirmation overlay
  // it('shows and handles confirmation overlay for deleteCurrentEventData', async () => {
  //   const user = userEvent.setup(); // No need for advanceTimers here if vi.useFakeTimers() is global
  //   const currentStoreFullState = useAppStore.getState(); 

  //   rtlAct(() => {
  //       useAppStore.setState({
  //           ...currentStoreFullState, 
  //           isInitializing: false,
  //           isVoteSubmissionEnabled: true,
  //           submissionOrder: ['S1'],
  //           submissions: new Map([['S1', { title: 'S1', abstract: '...', initialVersion: 1 }]]),
  //           votes: { 'S1': { vote: 'neutral', expanded: false } },
  //           clientId: 'test-client-id-for-delete',
  //           confirmationOverlayVisible: false, 
  //       }, true); 
  //   });
    
  //   renderApp();

  //   rtlAct(() => {
  //       useAppStore.setState((prev) => ({
  //           ...prev,
  //           confirmationOverlayVisible: true,
  //           confirmationOverlayMessage: 'Delete this event data?',
  //           confirmationOverlayActionType: 'deleteCurrentEventData',
  //       }));
  //   });
    
  //   expect(screen.getByText('Delete this event data?')).toBeInTheDocument();
  //   const confirmButton = screen.getByRole('button', { name: /Delete data/i }); 
    
  //   await rtlAct(async () => { vi.advanceTimersByTime(5000); });
  //   expect(confirmButton).toBeEnabled();

  //   const deleteApiMock = vi.spyOn(await import('./api'), 'deleteCurrentEventData').mockResolvedValue(undefined);
  //   await rtlAct(async () => { await user.click(confirmButton); });

  //   expect(deleteApiMock).toHaveBeenCalledWith({ clientId: 'test-client-id-for-delete' });
  //   expect(useAppStore.getState().confirmationOverlayVisible).toBe(false);
  //   await waitFor(() => {
  //       expect(screen.getByText("Server data deleted for this event.")).toBeInTheDocument();
  //   });
  // });

  // it('shows notification and clears it after a timeout', async () => {
  //   const user = userEvent.setup();
  //   const currentStoreFullState = useAppStore.getState();

  //   rtlAct(() => {
  //       useAppStore.setState({
  //           ...currentStoreFullState,
  //           isInitializing: false,
  //           isVoteSubmissionEnabled: true,
  //           submissionOrder: ['S1'],
  //           submissions: new Map([['S1', { title: 'S1', abstract: '...', initialVersion: 1 }]]),
  //           votes: { 'S1': { vote: 'neutral', expanded: false } },
  //           clientId: 'notify-client',
  //           confirmationOverlayVisible: false,
  //       }, true);
  //   });
  //   renderApp();
    
  //   rtlAct(() => {
  //       useAppStore.setState((prev) => ({
  //           ...prev,
  //           confirmationOverlayVisible: true,
  //           confirmationOverlayMessage: 'Delete this for notification test?',
  //           confirmationOverlayActionType: 'deleteCurrentEventData',
  //       }));
  //   });

  //   const confirmButton = screen.getByRole('button', { name: /Delete data/i });
  //   vi.spyOn(await import('./api'), 'deleteCurrentEventData').mockResolvedValue(undefined);
    
  //   await rtlAct(async () => {
  //       vi.advanceTimersByTime(5000); 
  //       await user.click(confirmButton);
  //   });

  //   const notification = await screen.findByText("Server data deleted for this event.");
  //   expect(notification).toBeInTheDocument();

  //   await rtlAct(async () => { vi.advanceTimersByTime(3500); });
  //   expect(screen.queryByText("Server data deleted for this event.")).not.toBeInTheDocument();
  // });

});
