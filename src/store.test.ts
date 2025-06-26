// src/store.test.ts
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// Removed StoreSlice from here, as getFullInitialState will provide AppState
import { useAppStore, AppState, SubmissionData, AppActions } from './store';
import type { SubmissionsApiResponse } from './api';
import { config } from './config';

vi.mock('fnv-plus', () => ({
  fast1a32: vi.fn(),
}));

import * as fnv from 'fnv-plus';

// Helper to get a complete initial state (AppState part only)
const getInitialAppState = (): AppState => ({
    clientId: null,
    randomValue: null,
    votes: {},
    lastVoteSequenceNumber: null,
    isVoteSubmissionEnabled: null,
    submissions: new Map(),
    submissionOrder: [],
    lastSubmissionVersion: null,
    isInitializing: true,
    initialSubmissionsLoadState: 'idle',
    pollingSubmissionsError: false,
    voteSyncState: 'idle',
    isVoteSyncRequestInFlight: false,
    voteSendTimeoutId: null,
    voteRetryDelayMs: config.votes.initialRetryDelayMs,
    applicationName: 'conferenceVoter',
    confirmationOverlayVisible: false,
    confirmationOverlayMessage: '',
    confirmationOverlayActionType: null,
});

// Helper to reset store state parts for specific tests if needed
const resetStoreForTest = () => {
  act(() => {
    const initialAppState = getInitialAppState();
    const currentState = useAppStore.getState(); // Get current actions

    // Create a new state object that includes all actions from the current state
    // and the desired initial app state values.
    const newState: AppState & AppActions = {
        ...initialAppState, // Spread the desired state values
        // Manually override specific parts for store tests after reset
        randomValue: 'test-random-value',
        clientId: 'test-client-id',
        lastVoteSequenceNumber: 0,
        isVoteSubmissionEnabled: true,
        isInitializing: false,
        // Carry over all action functions from the actual store instance
        initializeClient: currentState.initializeClient,
        setVoteSubmissionConsent: currentState.setVoteSubmissionConsent,
        _handleSubmissionsResponse: currentState._handleSubmissionsResponse,
        _setInitialSubmissionsLoadStatus: currentState._setInitialSubmissionsLoadStatus,
        _setPollingSubmissionsError: currentState._setPollingSubmissionsError,
        setExpanded: currentState.setExpanded,
        setVote: currentState.setVote,
        _triggerVoteSync: currentState._triggerVoteSync,
        _handleVoteSyncSuccess: currentState._handleVoteSyncSuccess,
        // _handleVoteSyncResend: currentState._handleVoteSyncResend, // if you bring this back
        _handleVoteSyncError: currentState._handleVoteSyncError,
        showConfirmationOverlay: currentState.showConfirmationOverlay,
        hideConfirmationOverlay: currentState.hideConfirmationOverlay,
    };
    useAppStore.setState(newState, true); // 'true' for replace
  });
};


describe('Zustand Store (useAppStore)', () => {
  beforeEach(() => {
    resetStoreForTest();
    vi.clearAllMocks();
  });

  describe('initializeClient', () => {
    it('should generate clientId and randomValue if they are null', () => {
      act(() => {
        const initialAppState = getInitialAppState();
        const currentState = useAppStore.getState();
        useAppStore.setState({
          ...initialAppState, // Use AppState part
          clientId: null,
          randomValue: null,
          isInitializing: true,
          isVoteSubmissionEnabled: null,
          // Carry over actions
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
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.initializeClient();
      });

      expect(result.current.clientId).not.toBeNull();
      expect(result.current.randomValue).not.toBeNull();
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.voteSyncState).toBe('idle');
      expect(result.current.lastVoteSequenceNumber).toBe(0);
    });

    it('should not change existing clientId and randomValue', () => {
      const initialClientId = 'existing-client-id';
      const initialRandomValue = 'existing-random-value';
      const initialSequenceNumber = 5;

      act(() => {
        const initialAppState = getInitialAppState();
        const currentState = useAppStore.getState();
        useAppStore.setState({
          ...initialAppState,
          clientId: initialClientId,
          randomValue: initialRandomValue,
          lastVoteSequenceNumber: initialSequenceNumber,
          isInitializing: true,
          isVoteSubmissionEnabled: true,
          // Carry over actions
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

      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.initializeClient();
      });

      expect(result.current.clientId).toBe(initialClientId);
      expect(result.current.randomValue).toBe(initialRandomValue);
      expect(result.current.lastVoteSequenceNumber).toBe(initialSequenceNumber);
      expect(result.current.isInitializing).toBe(false);
      expect(result.current.voteSyncState).toBe('idle');
    });
    
    it('should set voteSyncState to "disabled" if consent is false', () => {
        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: false, 
                isInitializing: true,
                // Carry over actions
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
        const { result } = renderHook(() => useAppStore());
        act(() => {
            result.current.initializeClient();
        });
        expect(result.current.voteSyncState).toBe('disabled');
    });

    it('should set voteSyncState to "idle" if consent is true or null', () => {
        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: true, 
                isInitializing: true,
                // Carry over actions (ensure this pattern for all setState with replace: true)
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
        const { result: resultTrue } = renderHook(() => useAppStore());
        act(() => { resultTrue.current.initializeClient(); });
        expect(resultTrue.current.voteSyncState).toBe('idle');

        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: null, 
                isInitializing: true,
                // Carry over actions
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
        const { result: resultNull } = renderHook(() => useAppStore());
        act(() => { resultNull.current.initializeClient(); });
        expect(resultNull.current.voteSyncState).toBe('idle');
    });
  });
  
  describe('setVoteSubmissionConsent', () => {
    it('should update isVoteSubmissionEnabled and voteSyncState correctly for enabling', () => {
        const { result } = renderHook(() => useAppStore());
        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: false, 
                voteSyncState: 'disabled',
                // Carry over actions
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
            result.current.setVoteSubmissionConsent(true);
        });
        expect(result.current.isVoteSubmissionEnabled).toBe(true);
        expect(['idle', 'queued']).toContain(result.current.voteSyncState);
    });

    it('should update isVoteSubmissionEnabled and voteSyncState correctly for disabling', () => {
        const { result } = renderHook(() => useAppStore());
        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: true, 
                voteSyncState: 'idle',
                // Carry over actions
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
            result.current.setVoteSubmissionConsent(false);
        });
        expect(result.current.isVoteSubmissionEnabled).toBe(false);
        expect(result.current.voteSyncState).toBe('disabled');
    });

    it('should trigger vote sync if enabled (spy on _triggerVoteSync)', () => {
        const { result } = renderHook(() => useAppStore());
        const triggerVoteSyncSpy = vi.spyOn(result.current, '_triggerVoteSync');
        
        act(() => {
            const initialAppState = getInitialAppState();
            const currentState = useAppStore.getState();
            useAppStore.setState({ 
                ...initialAppState, 
                isVoteSubmissionEnabled: false,
                 // Carry over actions
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
            result.current.setVoteSubmissionConsent(true);
        });
        expect(triggerVoteSyncSpy).toHaveBeenCalled();
        triggerVoteSyncSpy.mockClear();
        act(() => { result.current.setVoteSubmissionConsent(false); });
        expect(triggerVoteSyncSpy).not.toHaveBeenCalled();
    });
  });

  describe('Confirmation Overlay Actions', () => {
    // These tests call actions that only modify state, so replace: true is not strictly needed
    // if we are sure the `resetStoreForTest` has run and the state is clean.
    // However, for consistency and to be safe, we can ensure we pass only Partial<AppState>.
    it('showConfirmationOverlay should set visibility, message, and action type', () => {
        const { result } = renderHook(() => useAppStore());
        const testMessage = 'Test delete message';
        const testAction: NonNullable<AppState['confirmationOverlayActionType']> = 'deleteCurrentEventData';
        act(() => { result.current.showConfirmationOverlay(testMessage, testAction); });
        expect(result.current.confirmationOverlayVisible).toBe(true);
        expect(result.current.confirmationOverlayMessage).toBe(testMessage);
        expect(result.current.confirmationOverlayActionType).toBe(testAction);
    });

    it('hideConfirmationOverlay should reset visibility, message, and action type', () => {
        const { result } = renderHook(() => useAppStore());
        act(() => { result.current.showConfirmationOverlay('Some message', 'deleteAllEventData'); });
        act(() => { result.current.hideConfirmationOverlay(); });
        expect(result.current.confirmationOverlayVisible).toBe(false);
        expect(result.current.confirmationOverlayMessage).toBe('');
        expect(result.current.confirmationOverlayActionType).toBeNull();
    });
  });

  describe('_handleSubmissionsResponse', () => {
     it('should correctly sort submissions based on initialVersion and then hash', () => {
      const { result } = renderHook(() => ({
        _handleSubmissionsResponse: useAppStore.getState()._handleSubmissionsResponse,
        getSubmissionOrder: () => useAppStore.getState().submissionOrder,
        getRandomValue: () => useAppStore.getState().randomValue,
      }));

      const fast1a32Mock = fnv.fast1a32 as Mock;
      fast1a32Mock.mockImplementation((input: string) => {
        if (input.includes('ITEM_C_V1')) return 30;
        if (input.includes('ITEM_A_V1')) return 10;
        if (input.includes('ITEM_B_V2')) return 20;
        return 0;
      });
      
      act(() => {
        const initialAppState = getInitialAppState(); // Base state
        const currentState = useAppStore.getState(); // For actions

        const initialSubmissionsData = new Map<string, SubmissionData>();
        initialSubmissionsData.set('ITEM_B_V2', { title: 'Item B V2', code: 'foo', abstract: 'Abstract for B', initialVersion: 2 });
        initialSubmissionsData.set('ITEM_C_V1', { title: 'Item C V1', code: 'bar', abstract: 'Abstract for C', initialVersion: 1 });
        initialSubmissionsData.set('ITEM_A_V1', { title: 'Item A V1', code: '123', abstract: 'Abstract for A', initialVersion: 1 });
        
        useAppStore.setState({
            ...initialAppState, // Use AppState part
            // Carry over actions
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
            // Test specific state
            submissions: initialSubmissionsData,
            lastSubmissionVersion: 0, // Simulate it's not the first ever load
            submissionOrder: ['ITEM_B_V2', 'ITEM_C_V1', 'ITEM_A_V1'], 
            isInitializing: false,
            randomValue: 'test-random-value',
            isVoteSubmissionEnabled: true, 
            voteSyncState: 'idle',
        }, true);

        const response: SubmissionsApiResponse = {
          version: 1, // New version from server
          submissions: { 
            'ITEM_B_V2': { title: 'Item B V2', code: 'foo', abstract: 'Abstract for B' }, // Same
            'ITEM_C_V1': { title: 'Item C V1 Updated', code: 'bar', abstract: 'Abstract for C' }, // Make a slight change to ensure `changed` is true
            'ITEM_A_V1': { title: 'Item A V1', code: '123', abstract: 'Abstract for A' }, // Same
          },
        };
        useAppStore.getState()._handleSubmissionsResponse(response);
      });

      expect(result.current.getSubmissionOrder()).toEqual(['ITEM_A_V1', 'ITEM_C_V1', 'ITEM_B_V2']);
      
      const expectedRandomValue = result.current.getRandomValue();
      expect(fast1a32Mock).toHaveBeenCalledWith(`${expectedRandomValue}ITEM_A_V1`);
      expect(fast1a32Mock).toHaveBeenCalledWith(`${expectedRandomValue}ITEM_B_V2`);
      expect(fast1a32Mock).toHaveBeenCalledWith(`${expectedRandomValue}ITEM_C_V1`);
    });
  });
});