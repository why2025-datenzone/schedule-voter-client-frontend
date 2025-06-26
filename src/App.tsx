import { useEffect, useCallback, useState } from 'react'; 
import { useAppStore, getLocalEventsAndClientIds } from './store';
import { useSubmissions, useSubmitVotes } from './hooks';
import { SubmissionList } from './components/SubmissionList';
import { ConsentPrompt } from './components/ConsentPrompt';
import LoadingIndicator from './components/LoadingIndicator';
import SideMenu from './components/SideMenu';
import { ConfirmationOverlay } from './components/ConfirmationOverlay';
import { deleteCurrentEventData, deleteAllEventData } from './api';

function App() {
  const initializeClient = useAppStore((state) => state.initializeClient);
  const isInitializing = useAppStore((state) => state.isInitializing);
  const isVoteSubmissionEnabled = useAppStore((state) => state.isVoteSubmissionEnabled);
  const voteSyncState = useAppStore((state) => state.voteSyncState);
  const clientId = useAppStore((state) => state.clientId);
  const confirmationOverlayVisible = useAppStore((state) => state.confirmationOverlayVisible);
  const confirmationOverlayMessage = useAppStore((state) => state.confirmationOverlayMessage);
  const confirmationOverlayActionType = useAppStore((state) => state.confirmationOverlayActionType);
  const hideConfirmationOverlay = useAppStore((state) => state.hideConfirmationOverlay);

  const {
    isLoading: isSubmissionsLoading,
    isError: isSubmissionsError,
    error: submissionsErrorObj,
  } = useSubmissions();

  const { submitVotesAction: submitVotesActionFromHook, isSubmitting } = useSubmitVotes();

  const submitVotesAction = useCallback(() => {
    submitVotesActionFromHook();
  }, [submitVotesActionFromHook]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationTimer, setNotificationTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initializeClient();
  }, [initializeClient]); 

  useEffect(() => {
    console.log(`App vote sync effect: voteSyncState=${voteSyncState}, isSubmitting=${isSubmitting}`);
    if (voteSyncState === 'syncing' && !isSubmitting) {
      console.log("App vote sync effect: Conditions met. Calling submitVotesAction.");
      submitVotesAction();
    } else if (voteSyncState === 'syncing' && isSubmitting) {
      console.log("App vote sync effect: voteSyncState is 'syncing' but mutation is already pending. Skipping call.");
    } else {
    }
  }, [voteSyncState, submitVotesAction, isSubmitting]);

  useEffect(() => {
    if (notificationMessage && !notificationTimer) {
      const timer = setTimeout(() => {
        setNotificationMessage(null);
        setNotificationTimer(null);
      }, 3500); 
      setNotificationTimer(timer); 
    }
    return () => {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }
    };
  }, [notificationMessage, notificationTimer]);

  const showNotification = useCallback((message: string) => {
    if (notificationTimer) clearTimeout(notificationTimer);
    setNotificationMessage(message);
    setNotificationTimer(null);
  }, [notificationTimer]);


  const handleConfirmDeletion = useCallback(async () => {
    if (!confirmationOverlayActionType || isDeleting) return;

    setIsDeleting(true);
    hideConfirmationOverlay();

    try {
      if (confirmationOverlayActionType === 'deleteCurrentEventData') {
        if (!clientId) {
          throw new Error("Client ID not found for the current event.");
        }
        await deleteCurrentEventData({ clientId });
        showNotification("Server data deleted for this event.");
        setIsDeleting(false);

      } else if (confirmationOverlayActionType === 'deleteAllEventData') {
        const allClientIds = getLocalEventsAndClientIds(false);

        if (Object.keys(allClientIds).length === 0) {
          showNotification("No relevant event data found locally to delete.");
          setIsDeleting(false);
        } else {
          await deleteAllEventData({ clientIds: allClientIds });
          showNotification("Server data deleted for all found events.");
          setIsDeleting(false);
        }
      }
    } catch (error) {
      console.error(`Failed to execute delete action (${confirmationOverlayActionType}):`, error);
      showNotification(`Error deleting data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsDeleting(false);
    }
  }, [confirmationOverlayActionType, clientId, hideConfirmationOverlay, isDeleting, showNotification]); // Dependencies


  console.log("APP RENDER: voteSyncState=", voteSyncState, "isSubmitting=", isSubmitting, "confirmationVisible=", confirmationOverlayVisible);

  if (isInitializing || isSubmissionsLoading) { 
    return <LoadingIndicator message="Initializing Conference App..." />;
  }

  if (isVoteSubmissionEnabled === null) {
    return <ConsentPrompt />;
  }

  if (isSubmissionsError) {
    return (
      <div className="text-center text-red-600 p-4 pt-20">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>Could not load conference submissions.</p>
        <p className="text-sm mt-2">({(submissionsErrorObj as Error)?.message || 'Unknown error'})</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 p-4 text-center border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20 w-full shadow-md">
        <h1 className="text-xl md:text-2xl font-bold">Conference Schedule Feedback</h1>
      </header>

      <SubmissionList />

      <SideMenu />

      <ConfirmationOverlay
        isOpen={confirmationOverlayVisible}
        message={confirmationOverlayMessage}
        onAbort={hideConfirmationOverlay} 
        onConfirm={handleConfirmDeletion} 
      />

      {notificationMessage && (
        <div
          id="app-notification"
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[110] bg-gray-900/80 text-white px-6 py-3 rounded-md text-sm shadow-lg transition-opacity duration-300 opacity-100"
          role="alert"
        >
          {notificationMessage}
        </div>
      )}
    </>
  );
}

export default App;