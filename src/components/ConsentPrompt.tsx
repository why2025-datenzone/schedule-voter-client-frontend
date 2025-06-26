
import { useAppStore } from '../store';

export function ConsentPrompt() {
  const setConsent = useAppStore((state) => state.setVoteSubmissionConsent);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-3">Submit votes to the server?</h2>
        <p className="text-gray-700 mb-4">
          Allow this application to send your votes (up/down/neutral and whether you viewed an event) to the server to help the event organisers to improve the schedule? They will be stored there under an pseudonymous client id.
          Your votes will only be stored locally if you select no. You can also change your mind and enable or disable vote submissions later or on ask the server to export or delete your data.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setConsent(false)}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
          >
            <b>No</b>, store my votes only locally in the browser.
          </button>
          <button
            onClick={() => setConsent(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <b>Yes</b>, send data to the server to improve the schedule.
          </button>
        </div>
      </div>
    </div>
  );
}
