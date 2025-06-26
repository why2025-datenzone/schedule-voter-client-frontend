import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as fnv from 'fnv-plus';
import { SubmissionsApiResponse } from './api';
import { config } from './config'; 

type VoteValue = 'up' | 'down' | 'neutral';

export interface VoteState {
  expanded: boolean;
  vote: VoteValue;
}

export interface SubmissionData {
  title: string;
  abstract: string;
  code: string;
  initialVersion: number;
}

export type ConfirmationActionType = 'deleteCurrentEventData' | 'deleteAllEventData' | null;


export interface AppState {
  clientId: string | null;
  randomValue: string | null;
  votes: Record<string, VoteState>;
  lastVoteSequenceNumber: number | null;
  isVoteSubmissionEnabled: boolean | null;

  submissions: Map<string, SubmissionData>;
  submissionOrder: string[];
  lastSubmissionVersion: number | null;

  isInitializing: boolean;
  initialSubmissionsLoadState: 'idle' | 'loading' | 'error';
  pollingSubmissionsError: boolean;
  voteSyncState: 'idle' | 'syncing' | 'queued' | 'error' | 'disabled';
  isVoteSyncRequestInFlight: boolean;
  voteSendTimeoutId: ReturnType<typeof setTimeout> | null;
  voteRetryDelayMs: number;
  applicationName: string;

  confirmationOverlayVisible: boolean;
  confirmationOverlayMessage: string;
  confirmationOverlayActionType: ConfirmationActionType;
}

export interface AppActions {
  initializeClient: () => void;
  setVoteSubmissionConsent: (enabled: boolean) => void;
  _handleSubmissionsResponse: (response: SubmissionsApiResponse) => void;
  _setInitialSubmissionsLoadStatus: (status: AppState['initialSubmissionsLoadState']) => void;
  _setPollingSubmissionsError: (hasError: boolean) => void;
  setExpanded: (submissionCode: string) => void;
  setVote: (submissionCode: string, vote: VoteValue) => void;
  _triggerVoteSync: () => void;
  _handleVoteSyncSuccess: () => void;
  _handleVoteSyncError: () => void;

  showConfirmationOverlay: (message: string, actionType: NonNullable<ConfirmationActionType>) => void;
  hideConfirmationOverlay: () => void;
}

export type StoreSlice = AppState & AppActions;

export const getLocalEventsAndClientIds = (justThisEvent: boolean) => {
  const res: Record<string, string> = {};
  if (justThisEvent) {
    const currentClientId = useAppStore.getState().clientId;
    if (currentClientId) {
      res[config.votes.localStorageName] = currentClientId;
    } else {
      return res;
    }
  } else {
    for (const key in localStorage) {
      const storedStateString = localStorage.getItem(key);

      if (storedStateString) {
        try {
          const parsedData = JSON.parse(storedStateString);
          if (parsedData?.state?.applicationName === PERSISTED_STATE_TYPE && parsedData?.state?.clientId) {
            console.log(`Found an entry for GDPR: ${key} - ${parsedData.state.clientId}`)
            res[key] = parsedData.state.clientId;
          }
        } catch (e) {
          console.warn(`Could not parse localStorage item: ${key}`, e);
        }
      }
    }
  }
  return res;
}

const createDynamicLocalStorage = (): StateStorage => {
  const getLocalStorageName = () => {
    console.log("Storage Name Used:", config.votes.localStorageName);
    return config.votes.localStorageName;
  };

  return {
    getItem: (_name) => {
      const dynamicName = getLocalStorageName();
      return localStorage.getItem(dynamicName);
    },
    setItem: (_name, value) => {
      const dynamicName = getLocalStorageName();
      localStorage.setItem(dynamicName, value);
    },
    removeItem: (_name) => {
      const dynamicName = getLocalStorageName();
      localStorage.removeItem(dynamicName);
    },
  };
};

export const PERSISTED_STATE_TYPE = "conferenceVoter";
const { sendDebounceMs, initialRetryDelayMs, maxRetryDelayMs } = config.votes;

export const useAppStore = create<StoreSlice>()(
  persist(
    (set, get) => ({
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
      voteRetryDelayMs: initialRetryDelayMs,
      needsFullVoteResend: false,
      applicationName: PERSISTED_STATE_TYPE,

      confirmationOverlayVisible: false,
      confirmationOverlayMessage: '',
      confirmationOverlayActionType: null,

      showConfirmationOverlay: (message, actionType) => {
        set({
          confirmationOverlayVisible: true,
          confirmationOverlayMessage: message,
          confirmationOverlayActionType: actionType,
        });
      },

      hideConfirmationOverlay: () => {
        set({
          confirmationOverlayVisible: false,
          confirmationOverlayMessage: '',
          confirmationOverlayActionType: null,
        });
      },

      initializeClient: () => {
        const state = get();
        let cid = state.clientId;
        let randVal = state.randomValue;
        let lastVoteSequenceNumber = state.lastVoteSequenceNumber;
        let updated = false;
        if (!cid) {
          cid = crypto.randomUUID();
          lastVoteSequenceNumber = 0;
          updated = true;
        }
        if (!randVal) {
          randVal = Math.random().toString(36).substring(2, 15);
          updated = true;
        }
        const finalState: Partial<AppState> = { isInitializing: false };
        if (updated) {
          finalState.clientId = cid;
          finalState.randomValue = randVal;
          finalState.lastVoteSequenceNumber = lastVoteSequenceNumber;
        }
        finalState.voteSyncState = state.isVoteSubmissionEnabled === false ? 'disabled' : 'idle';

        set(finalState);
      },

      setVoteSubmissionConsent: (enabled) => {
        set({
          isVoteSubmissionEnabled: enabled,
          voteSyncState: enabled ? 'idle' : 'disabled',
          ...(enabled ? {} : { voteRetryDelayMs: initialRetryDelayMs, needsFullVoteResend: false })
        });
        if (enabled) {
          get()._triggerVoteSync();
        }
      },

      _setInitialSubmissionsLoadStatus: (status) => {
        set({ initialSubmissionsLoadState: status });
      },

      _setPollingSubmissionsError: (hasError) => {
        set({ pollingSubmissionsError: hasError });
      },

      _handleSubmissionsResponse: (response) => {
        const { version, submissions: updatedSubmissionsMap } = response;
        const currentState = get();
        const currentVotes = currentState.votes;

        const newSubmissions = new Map(currentState.submissions);
        const randVal = currentState.randomValue ?? '';

        let changed = false;

        let needsVoteSync = false;

        for (const code in updatedSubmissionsMap) {
          const payload = updatedSubmissionsMap[code];
          if (payload === null) {
            if (newSubmissions.has(code)) {
              if (newSubmissions.has(code)) changed = true;
              newSubmissions.delete(code);
            }
          } else {
            const existing = newSubmissions.get(code);

            if (!existing) {
              const newState = currentVotes[code] ?? { expanded: false, vote: 'neutral' };
              set((state) => ({
                votes: { ...state.votes, [code]: newState },
                lastVoteSequenceNumber: (state.lastVoteSequenceNumber ?? 0) + 1,
              }));
              needsVoteSync = true;
            }
            if (!existing || existing.title !== payload.title || existing.abstract !== payload.abstract) {
              changed = true;
              newSubmissions.set(code, {
                ...payload,
                initialVersion: existing?.initialVersion ?? version,
              });
            }
            if (!existing && currentState.submissions.has(code)) changed = true;
          }
        }
        if (needsVoteSync) {
          get()._triggerVoteSync();
        }

        if (changed || currentState.lastSubmissionVersion === null) {
          const sortable = Array.from(newSubmissions.entries()).map(([code, data]) => {
            const hashInput = `${randVal}${code}`;
            const hash = fnv.fast1a32(hashInput);
            return { code, sortKey: [data.initialVersion, hash] as [number, number] };
          });

          sortable.sort((a, b) => {
            if (a.sortKey[0] !== b.sortKey[0]) {
              return a.sortKey[0] - b.sortKey[0];
            }
            return a.sortKey[1] - b.sortKey[1];
          });

          const newOrder = sortable.map(item => item.code);

          set({
            submissions: newSubmissions,
            submissionOrder: newOrder,
            lastSubmissionVersion: version,
            pollingSubmissionsError: false,
          });
        } else {
          set({ lastSubmissionVersion: version, pollingSubmissionsError: false });
        }
      },

      setExpanded: (submissionCode) => {
        const currentVotes = get().votes;
        const currentState = currentVotes[submissionCode] ?? { expanded: false, vote: 'neutral' };

        if (!currentState.expanded) {
          const newState: VoteState = { ...currentState, expanded: true };
          set((state) => ({
            votes: { ...state.votes, [submissionCode]: newState },
            lastVoteSequenceNumber: (state.lastVoteSequenceNumber ?? 0) + 1,
          }));
          get()._triggerVoteSync();
        }
      },

      setVote: (submissionCode, vote) => {
        const currentVotes = get().votes;
        const currentState = currentVotes[submissionCode] ?? { expanded: false, vote: 'neutral' };

        if (currentState.vote !== vote) {
          const newState: VoteState = { ...currentState, vote };
          set((state) => ({
            votes: { ...state.votes, [submissionCode]: newState },
            lastVoteSequenceNumber: (state.lastVoteSequenceNumber ?? 0) + 1,
          }));
          get()._triggerVoteSync();
        }
      },

      _triggerVoteSync: () => {
        const state = get();
        const existingTimeoutId = state.voteSendTimeoutId;
        if (existingTimeoutId) {
          clearTimeout(existingTimeoutId);
        }

        if (!state.isVoteSubmissionEnabled) {
          set({ voteSyncState: 'disabled' });
          return;
        }

        if (state.voteSyncState !== 'syncing' && state.voteSyncState !== 'error') {
          set({ voteSyncState: 'idle' });
        }

        if (state.isVoteSyncRequestInFlight) {
          set({ voteSyncState: 'queued' });
          return;
        }

        const timeoutId = setTimeout(() => {
          set({ voteSyncState: 'syncing', isVoteSyncRequestInFlight: true, voteSendTimeoutId: null });
        }, sendDebounceMs);

        set({ voteSendTimeoutId: timeoutId, voteSyncState: 'queued' });
      },

      _handleVoteSyncSuccess: () => {
        set({
          voteSyncState: 'idle',
          isVoteSyncRequestInFlight: false,
          voteRetryDelayMs: initialRetryDelayMs,
          voteSendTimeoutId: null,
        });
      },

      _handleVoteSyncError: () => {
        const currentDelay = get().voteRetryDelayMs;
        const nextDelay = Math.min(currentDelay * 2, maxRetryDelayMs);
        console.error(`Vote sync failed. Retrying in ${nextDelay / 1000}s`);

        set({
          voteSyncState: 'error',
          isVoteSyncRequestInFlight: false,
          voteRetryDelayMs: nextDelay
        });

        const existingRetryTimeoutId = get().voteSendTimeoutId;
        if (existingRetryTimeoutId) {
          clearTimeout(existingRetryTimeoutId);
        }
        const retryTimeoutId = setTimeout(() => {
          set({ voteSendTimeoutId: null });
          get()._triggerVoteSync();
        }, nextDelay);
        set({ voteSendTimeoutId: retryTimeoutId });
      },


    }),
    {
      name: 'zustand-persist-placeholder',
      storage: createJSONStorage(createDynamicLocalStorage),
      partialize: (state) => ({
        clientId: state.clientId,
        randomValue: state.randomValue,
        votes: state.votes,
        lastVoteSequenceNumber: state.lastVoteSequenceNumber,
        isVoteSubmissionEnabled: state.isVoteSubmissionEnabled,
        applicationName: state.applicationName,
        // DO NOT persist overlay state:
        // confirmationOverlayVisible: state.confirmationOverlayVisible,
        // confirmationOverlayMessage: state.confirmationOverlayMessage,
        // confirmationOverlayActionType: state.confirmationOverlayActionType,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
          } else if (state) {
            state.isInitializing = false;
            state.voteSyncState = state.isVoteSubmissionEnabled === false ? 'disabled' : 'idle';
            state.voteRetryDelayMs = initialRetryDelayMs;
          }
        };
      },
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === config.votes.localStorageName && event.newValue) {
      try {
        useAppStore.persist.rehydrate();
      } catch (error: any) {
        console.error('Error during manual rehydration:', error);
      }
    }
  });
}