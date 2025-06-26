import { useState, useEffect } from 'react';
import { SyncIcon } from './SyncIcon';
import { UploadIcon } from './UploadIcon';
import { ConsentToggler } from './ContentToggler';
import { useAppStore, getLocalEventsAndClientIds } from '../store';
import { ExportPayload, gdprExport } from '../api';

const SideMenu = () => {
  const [folded, setFolded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isDeleting] = useState(false);

  const isVoteSubmissionEnabled = useAppStore((state) => state.isVoteSubmissionEnabled);
  const voteSyncState = useAppStore((state) => state.voteSyncState);
  const showConfirmationOverlay = useAppStore((state) => state.showConfirmationOverlay);

  const isDeleteDisabled = isVoteSubmissionEnabled === true || voteSyncState !== 'disabled' || isDeleting;

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleFolded = () => {
    setFolded(!folded);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const triggerGdprExport = async (justThisEvent: boolean) => {
    setIsFetchingData(true);
    const res = getLocalEventsAndClientIds(justThisEvent);
    if (Object.keys(res).length === 0) {
      showNotification('No relevant event data found in local storage for GDPR export.');
      setIsFetchingData(false);
      return;
    }

    const payload: ExportPayload = {
      events: res,
    };

    try {
      const result = await gdprExport(payload);
      navigator.clipboard.writeText(result ?? "").then(() => {
        const message = `Copied GDPR export to clipboard!`;
        showNotification(message);
      }).catch(err => {
        console.error('Failed to copy GDPR export to clipboard: ', err);
        showNotification('Error: Could not copy GDPR export to clipboard.');
      });
    } catch (err) {
      console.error('Failed to perform GDPR export: ', err);
      showNotification(`Failed to perform GDPR export: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsFetchingData(false);
    }
  };

  const copyPositiveToClipboard = () => {
    const store = useAppStore.getState();
    const currentVotes = store.votes;
    const currentSubmissions = store.submissions;
    const positiveVoteCodes = Object.entries(currentVotes)
      .filter(([_, voteState]) => voteState.vote === 'up')
      .map(([code, _]) => currentSubmissions.get(code)?.code).filter((code) => (code !== undefined));

    if (positiveVoteCodes.length === 0) {
      showNotification('No submissions have been voted "up".');
      return;
    }
    const codesString = positiveVoteCodes.join(',');
    navigator.clipboard.writeText(codesString).then(() => {
      const message = `Copied ${positiveVoteCodes.length} positively voted submission code(s) to clipboard!`;
      showNotification(message);
    }).catch(err => {
      console.error('Failed to copy positive vote codes: ', err);
      showNotification('Error: Could not copy codes to clipboard.');
    });
  };

  const showNotification = (message: string) => {
    const notification = document.getElementById('clipboard-notification');
    if (notification) {
      notification.textContent = message;
      notification.style.opacity = '1';
      notification.style.bottom = '20px';

      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.bottom = '-100px';
      }, 3000);
    }
  };

  const handleDeleteCurrent = () => {
    const message = "Are you sure you want to delete all your voting data stored on the server for THIS event? This action cannot be undone. Your local data for this event will remain on your device.";
    showConfirmationOverlay(message, 'deleteCurrentEventData');
  };

  const handleDeleteAll = () => {
    const message = "Are you sure you want to delete all your voting data stored on the server for ALL events associated with this browser? This action cannot be undone. Your local data for ALL detected events will remain on your device.";
    showConfirmationOverlay(message, 'deleteAllEventData');
  };


  return (
    <>
      <aside
        className={`
          side-menu-folded fixed top-1/2 right-2 transform -translate-y-1/2 z-30
          bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200
          p-2 rounded-md shadow-lg flex flex-col items-center gap-3
          ${!folded ? 'hidden-folded' : ''}
        `}
      >
        <button
          onClick={toggleFolded}
          className="menu-button p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 [&_svg]:w-6 [&_svg]:h-6"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.293 17.707 7.586 12l5.707-5.707 1.414 1.414L10.414 12l4.293 4.293z"></path></svg>
        </button>
        <SyncIcon withText={false} />
        <UploadIcon withText={false} />
        <button
          onClick={toggleTheme}
          className="menu-button p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 [&_svg]:w-5 [&_svg]:h-5"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (<svg width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16.584V18.9996C10 20.1042 10.8954 20.9996 12 20.9996C13.1046 20.9996 14 20.1042 14 18.9996L14 16.584M12 3V4M18.3643 5.63574L17.6572 6.34285M5.63574 5.63574L6.34285 6.34285M4 12H3M21 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.142 2.015a.75.75 0 0 1 0 1.06 6.004 6.004 0 0 0 8.808 8.808.75.75 0 0 1 1.06 0 9.004 9.004 0 1 1-9.869-9.868Z" /></svg>)}
        </button>
      </aside>

      <aside
        className={`
          side-menu-unfolded fixed top-0 right-[-350px] w-[300px] max-w-[80vw] h-screen z-40
          bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200
          shadow-xl p-4 flex flex-col overflow-y-auto
          ${!folded ? 'visible' : ''}
        `}
      >
        <div className="side-menu-header flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
          <span className="font-bold">Menu</span>
          <button
            onClick={toggleFolded}
            className="menu-button p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 [&_svg]:w-6 [&_svg]:h-6"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path></svg>
          </button>
        </div>

        <SyncIcon withText={true} />
        <UploadIcon withText={true} />
        <div className="menu-item flex items-center gap-3 py-2">
          <button
            onClick={toggleTheme}
            className="menu-button p-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 [&_svg]:w-5 [&_svg]:h-5"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (<svg width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 16.584V18.9996C10 20.1042 10.8954 20.9996 12 20.9996C13.1046 20.9996 14 20.1042 14 18.9996L14 16.584M12 3V4M18.3643 5.63574L17.6572 6.34285M5.63574 5.63574L6.34285 6.34285M4 12H3M21 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.142 2.015a.75.75 0 0 1 0 1.06 6.004 6.004 0 0 0 8.808 8.808.75.75 0 0 1 1.06 0 9.004 9.004 0 1 1-9.869-9.868Z" /></svg>)}
          </button>
          <span className="text-sm">Toggle {isDarkMode ? "Light" : "Dark"} Mode</span>
        </div>
        <ConsentToggler />
        <button
          onClick={copyPositiveToClipboard}
          className="copy-button bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm text-center transition-colors duration-200 ease-out w-full mt-3"
        >
          Copy all positive submissions
        </button>
        <button
          onClick={() => triggerGdprExport(true)}
          className="copy-button border-none px-4 py-2 rounded-md text-sm text-center transition-colors duration-200 ease-out w-full mt-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isFetchingData}
        >
          Copy my server data (this event)
        </button>
        <button
          onClick={() => triggerGdprExport(false)}
          className="copy-button border-none px-4 py-2 rounded-md text-sm text-center transition-colors duration-200 ease-out w-full mt-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white cursor-pointer disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isFetchingData}
        >
          Copy my server data (all events)
        </button>
        <div className="mt-4 pt-4 border-t border-red-400/50 dark:border-red-600/50">
          <p className="text-xs text-red-600 dark:text-red-400 mb-2 text-center font-semibold">Danger Zone</p>
          <button
            onClick={handleDeleteCurrent}
            disabled={isDeleteDisabled}
            className="delete-button w-full border border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 px-4 py-2 rounded-md text-sm text-center transition-colors duration-200 ease-out hover:bg-red-50 dark:hover:bg-red-900/30 disabled:border-slate-400 disabled:dark:border-slate-600 disabled:text-slate-400 disabled:dark:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          >
            Delete my server data (this event)
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={isDeleteDisabled}
            className="delete-button w-full border border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 px-4 py-2 rounded-md text-sm text-center transition-colors duration-200 ease-out mt-3 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:border-slate-400 disabled:dark:border-slate-600 disabled:text-slate-400 disabled:dark:text-slate-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          >
            Delete my server data (all events)
          </button>
          {isDeleteDisabled && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              (Deletion disabled while vote submission is enabled or syncing)
            </p>
          )}
        </div>
        <div className="privacy-statement text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
          <p>Your votes (thumbs up, down or neutral as well as which events you viewed) are stored locally in your browser. If "Submit votes to server" is enabled, your ratings will be sent to the server and stored under a random client id. It will be made available to the event organizers in aggregated form to help them build a better schedule. You can ask the server to export or delete all your data for this event only or for all events this browser is linked with. Each event you interact with has a dedicated client id, and those are not linked with each other. Only when you ask the server to export or delete all your data for all events, then the server will see all your client ids.</p>
        </div>
      </aside>

      <div id="clipboard-notification" className="fixed bottom-[-100px] left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/80 text-white px-6 py-3 rounded-md text-sm opacity-0 transition-all duration-300">
      </div>
    </>
  );
};

export default SideMenu;