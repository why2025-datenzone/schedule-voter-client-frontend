import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from './store';
import { fetchSubmissions, submitVotes, SendVotesPayload } from './api';
import { useCallback, useEffect, useRef } from 'react'; 
import { config } from './config';

const SUBMISSIONS_QUERY_KEY = 'submissions';

export function useSubmissions() {
  const lastVersion = useAppStore((state) => state.lastSubmissionVersion);
  const isInitialLoad = lastVersion === null;
  const setInitialLoadStatus = useAppStore((state) => state._setInitialSubmissionsLoadStatus);
  const handleResponse = useAppStore((state) => state._handleSubmissionsResponse);
  const setPollingError = useAppStore((state) => state._setPollingSubmissionsError);
  const initialLoadState = useAppStore((state) => state.initialSubmissionsLoadState);
  const pollingSubmissionsError = useAppStore((state) => state.pollingSubmissionsError);

  const { pollingIntervalMs, staleTimeMs, initialLoadMaxRetries, pollingMaxRetries, initialRetryBaseDelayMs, initialRetryMaxDelayMs, pollingRetryBaseDelayMs, pollingRetryMaxDelayMs } = config.submissions;

  const {
    isLoading,
    isError,
    data, 
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, lastVersion],
    queryFn: () => fetchSubmissions(lastVersion),
    refetchInterval: pollingIntervalMs,
    staleTime: staleTimeMs,
    retry: (failureCount, err) => {
      const maxRetries = isInitialLoad ? initialLoadMaxRetries : pollingMaxRetries;
      if (err instanceof Error && err.message.includes('HTTP error')) {
        if (failureCount >= maxRetries) return false;
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      const baseDelay = isInitialLoad ? initialRetryBaseDelayMs : pollingRetryBaseDelayMs;
      const maxDelay = isInitialLoad ? initialRetryMaxDelayMs : pollingRetryMaxDelayMs;
      return Math.min(baseDelay * 2 ** attemptIndex, maxDelay);
    },
    structuralSharing: true,
  });

  const prevDataVersionRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading && isInitialLoad) {
      setInitialLoadStatus('loading');
    }

    if (isError) {
      console.error('useSubmissions query error:', error);
      if (isInitialLoad) {
        setInitialLoadStatus('error');
      } else if (!pollingSubmissionsError) {
        setPollingError(true);
      }
    }

    if (data) {
      if (data.version !== prevDataVersionRef.current || prevDataVersionRef.current === null) {
        console.log('useSubmissions: Processing new data version:', data.version);
        handleResponse(data);
        prevDataVersionRef.current = data.version; 

        if (isInitialLoad && initialLoadState !== 'idle') {
          setInitialLoadStatus('idle');
        }
        if (pollingSubmissionsError) {
          setPollingError(false);
        }
      } else {
        if (initialLoadState === 'error' && isInitialLoad) {
          setInitialLoadStatus('idle'); 
        }
        if (pollingSubmissionsError) {
          setPollingError(false); 
        }
      }
    }
  }, [
    isLoading,
    isError,
    error,
    isInitialLoad,
    data, 
    handleResponse, 
    setInitialLoadStatus, 
    setPollingError, 
    initialLoadState, 
    pollingSubmissionsError, 
  ]);


  return {
    isLoading: isLoading && isInitialLoad, 
    isError: isError && isInitialLoad, 
    error: isInitialLoad ? error : null,
    isFetching, 
    refetch, 
  };
}

export function useSubmitVotes() {
  const clientId = useAppStore((state) => state.clientId);
  const allVotes = useAppStore((state) => state.votes);
  const sequenceNumber = useAppStore((state) => state.lastVoteSequenceNumber);
  const handleSuccess = useAppStore((state) => state._handleVoteSyncSuccess);
  const handleError = useAppStore((state) => state._handleVoteSyncError);

  const mutation = useMutation({
    mutationFn: (payload: SendVotesPayload) => submitVotes(payload),
    onSuccess: (data) => {
      if (data.status === 'success') {
        handleSuccess();
      } else {
        console.error("Unknown response:", data.status);
        handleError();
      }
    },
    onError: (error) => {
      console.error('Vote submission mutation failed:', error);
      handleError(); 
    },
  });

  const triggerMutation = useCallback(() => {
    if (!clientId) {
      console.error("Cannot submit votes without clientId. Vote sync aborted.");
      return;
    }

    const votesToSend = allVotes;

    const payload: SendVotesPayload = {
      clientId,
      votes: votesToSend,
      sequenceNumber: sequenceNumber,
    };

    mutation.mutate(payload);

  }, [clientId, allVotes, sequenceNumber, mutation]); 


  return {
    submitVotesAction: triggerMutation,
    isSubmitting: mutation.isPending,
    isError: mutation.isError,
  };
}