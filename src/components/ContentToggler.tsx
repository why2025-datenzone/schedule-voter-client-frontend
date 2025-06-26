import { useAppStore } from '../store';

export function ConsentToggler() {
  const setConsent = useAppStore((state) => state.setVoteSubmissionConsent);
  const isVoteSubmissionEnabled = useAppStore((state) => state.isVoteSubmissionEnabled);
  return (
    <div className="menu-item flex items-center gap-3 py-2">
      <span className="text-sm">Submit votes to server</span>
      <label className="relative inline-flex items-center cursor-pointer ml-auto" aria-label="Toggle vote submission">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isVoteSubmissionEnabled === true}
          onChange={() => setConsent(isVoteSubmissionEnabled !== true)}
        />
        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}