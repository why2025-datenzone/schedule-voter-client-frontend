import { useAppStore } from '../store';
import { useCallback } from 'react';

const ThumbsUpIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 388.046 388.046" className={filled ? "fill-current" : "fill-gray-600 dark:fill-gray-400"}><g><g><path d="M341.698,217.842c10.595-6.117,17.741-17.567,17.741-30.656c0-9.442-3.676-18.325-10.354-25.016 c-6.683-6.683-15.567-10.364-25.016-10.364h-92.631c-8.444,0-16.036-4.357-20.308-11.656c-4.229-7.226-4.317-15.88-0.235-23.149 c14.795-26.328,21.001-56.215,19.484-72.131c-2.6-27.286-20.705-45.718-44.021-44.84L185.7,0.051 C170,0.65,157.477,13.002,156.569,28.779c-1.982,34.052-29.568,68.786-55.267,98.666c-8.099,9.405-14.864,19.831-20.104,30.981 c-1.477,3.134-3.801,5.769-6.731,7.627c-2.911,1.853-6.279,2.833-9.739,2.833h-29.62c-3.59,0-6.5,2.91-6.5,6.5v192.57 c0,3.59,2.91,6.5,6.5,6.5c18.248,0,36.381,2.595,53.896,7.714c13.34,3.899,27.151,5.876,41.05,5.876H293.66 c8.417,0,16.328-3.276,22.281-9.229c6.076-6.089,9.349-14.177,9.215-22.772c-0.117-7.491-2.944-14.37-7.55-19.734 c14.165-4.619,24.429-17.954,24.429-33.64c0-9.652-3.886-18.414-10.176-24.803c13.15-5.163,22.484-17.983,22.484-32.942 C354.343,234.067,349.424,224.336,341.698,217.842z M318.97,267.299h-12.307c-3.59,0-6.5,2.91-6.5,6.5c0,3.59,2.91,6.5,6.5,6.5 c12.336,0,22.372,10.036,22.372,22.373s-10.036,22.372-22.374,22.372l-13.565,0.003c-3.589,0.001-6.499,2.911-6.499,6.501 c0,3.59,2.911,6.499,6.5,6.499c10.353,0,18.903,8.165,19.06,18.201c0.078,5.052-1.846,9.806-5.414,13.382 c-3.493,3.493-8.139,5.416-13.084,5.416H130.052c-12.664,0-25.248-1.801-37.403-5.354c-16.618-4.857-33.758-7.586-51.042-8.134 V181.887h23.12c5.938,0,11.719-1.683,16.71-4.86c5.007-3.174,8.99-7.69,11.522-13.065c4.742-10.089,10.862-19.521,18.195-28.036 c27.088-31.496,56.173-68.289,58.391-106.395c0.521-9.058,7.679-16.146,16.611-16.487l0.656-0.021 c13.62-0.518,28.378,9.511,30.623,33.081c1.031,10.816-2.911,37.899-17.877,64.531c-6.368,11.34-6.237,24.83,0.35,36.083 c6.63,11.327,18.416,18.089,31.527,18.089h92.631c5.976,0,11.596,2.328,15.819,6.552c4.225,4.232,6.551,9.853,6.551,15.828 c0,12.334-10.035,22.369-22.369,22.37l-5.069-0.002c-0.005,0-0.01,0-0.014,0h-0.013c-0.001,0-0.002,0-0.003,0 c-3.589,0-6.499,2.909-6.5,6.499c-0.001,3.589,2.908,6.5,6.497,6.501h0.008c12.334,0.002,22.368,10.038,22.368,22.372 C341.343,257.263,331.307,267.299,318.97,267.299z"></path></g></g></svg>
);
const ThumbsDownIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 388.046 388.046" className={filled ? "fill-current" : "fill-gray-600 dark:fill-gray-400"}><g><g><path d="M341.697,170.205c7.727-6.493,12.645-16.225,12.645-27.084c0-14.96-9.333-27.779-22.483-32.942 c6.29-6.389,10.176-15.151,10.176-24.803c0-15.687-10.264-29.022-24.428-33.641c4.605-5.365,7.432-12.243,7.549-19.734 c0.134-8.595-3.139-16.683-9.22-22.777C309.988,3.276,302.077,0,293.66,0H130.052c-13.898,0-27.709,1.977-41.048,5.876 c-17.516,5.119-35.649,7.714-53.896,7.714c-3.59,0-6.5,2.91-6.5,6.5v192.569c0,3.59,2.91,6.5,6.5,6.5h29.62 c3.46,0,6.828,0.98,9.75,2.84c2.92,1.852,5.244,4.487,6.718,7.615c5.242,11.156,12.007,21.582,20.104,30.984 c25.701,29.883,53.287,64.617,55.269,98.665c0.908,15.781,13.432,28.133,29.169,28.733l0.583,0.019 c0.538,0.021,1.073,0.031,1.606,0.031c22.562,0,39.912-18.213,42.45-44.869c1.517-15.916-4.689-45.803-19.483-72.129 c-4.083-7.271-3.995-15.925,0.234-23.151c4.272-7.299,11.864-11.656,20.308-11.656h92.631c9.449,0,18.333-3.68,25.021-10.368 c6.674-6.687,10.35-15.569,10.35-25.012C359.438,187.772,352.292,176.322,341.697,170.205z M339.892,216.684 c-4.228,4.228-9.848,6.556-15.824,6.556h-92.631c-13.111,0-24.897,6.762-31.527,18.089c-6.587,11.254-6.718,24.743-0.349,36.085 c14.965,26.63,18.907,53.713,17.876,64.529c-2.245,23.57-16.984,33.601-30.66,33.08l-0.582-0.019 c-8.97-0.342-16.127-7.43-16.649-16.492c-2.218-38.102-31.303-74.895-58.394-106.394c-7.33-8.512-13.451-17.944-18.195-28.039 c-2.529-5.368-6.512-9.884-11.509-13.052c-5.002-3.184-10.783-4.867-16.721-4.867h-23.12V26.487 c17.283-0.547,34.424-3.277,51.042-8.133C104.804,14.801,117.388,13,130.052,13H293.66c4.945,0,9.591,1.924,13.078,5.411 c3.573,3.581,5.497,8.335,5.419,13.387C312,41.835,303.45,50,293.097,50c-3.589,0-6.5,2.909-6.5,6.499 c0,3.59,2.91,6.5,6.499,6.501l13.567,0.002c12.336,0,22.372,10.037,22.372,22.373s-10.036,22.372-22.372,22.372 c-3.59,0-6.5,2.91-6.5,6.5c0,3.59,2.91,6.5,6.5,6.5h12.307c12.336,0,22.372,10.037,22.372,22.373 c0,12.334-10.034,22.37-22.367,22.372h-0.008c-3.589,0.001-6.498,2.912-6.497,6.501c0.001,3.59,2.911,6.499,6.5,6.499 c0.001,0,0.002,0,0.003,0h0.013c0.004,0,0.009,0,0.014,0l5.069-0.002c12.334,0.001,22.369,10.036,22.369,22.37 C346.438,206.835,344.112,212.456,339.892,216.684z"></path></g></g></svg>
);
const NeutralIcon = ({ filled }: { filled: boolean }) => ( 
  <svg viewBox="0 0 24 24" className={filled ? "fill-current" : "fill-gray-600 dark:fill-gray-400"}><path fillRule="evenodd" clipRule="evenodd" d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"></path></svg>
);


interface VoteButtonsProps {
  submissionCode: string;
}

export function VoteButtons({ submissionCode }: Readonly<VoteButtonsProps>) {
  const currentVote = useAppStore((state) => state.votes[submissionCode]?.vote ?? 'neutral');
  const setVote = useAppStore((state) => state.setVote);

  const handleVote = useCallback((voteValue: 'up' | 'down' | 'neutral') => {
    setVote(submissionCode, voteValue);
  }, [setVote, submissionCode]);

  const newUpButtonClass = "rating-button rating-up hover:bg-green-300 dark:hover:bg-green-400"
  const newDownButtonClass = "rating-button rating-down hover:bg-red-300 dark:hover:bg-red-400"
  const newButtonClass = "rounded-full border p-2 flex items-center justify-center transition-all duration-200 ease-out w-10 h-10";
  const newButtonInactiveClass = "border-gray-300 dark:border-slate-600";
  const newUpButtonActiveClass = "active-thumb bg-green-400 dark:bg-green-600 text-white border-transparent";
  const newDownButtonActiveClass = "active-thumb bg-red-400 dark:bg-red-600 text-white border-transparent";


  const newNeutralButtonClass = "rating-button rating-neutral rounded-full border p-2 flex items-center justify-center transition-all duration-200 ease-out w-10 h-10 border-transparent hover:bg-slate-300 dark:hover:bg-slate-500";
  const newNeutralButtonActiveClass = "active-neutral bg-gray-400 dark:bg-slate-500 text-white"
  const newNeutralButtonInactiveClass = "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"

  return (
    <div className="rating-buttons flex justify-center items-center gap-4 mt-4">
      <button className={`${newDownButtonClass} ${newButtonClass} ${currentVote === 'down' ? newDownButtonActiveClass : newButtonInactiveClass}`} aria-label="Rate down" data-vote="down" onClick={() => handleVote('down')}>
        <ThumbsDownIcon filled={currentVote == 'down'} />
      </button>
      <button className={`${newNeutralButtonClass} ${newButtonClass} ${currentVote === 'neutral' ? newNeutralButtonActiveClass : newNeutralButtonInactiveClass}`} aria-label="Rate neutral" data-vote="neutral" onClick={() => handleVote('neutral')}>
        <NeutralIcon filled={currentVote == 'neutral'} />
      </button>
      <button className={`${newUpButtonClass} ${newButtonClass} ${currentVote === 'up' ? newUpButtonActiveClass : newButtonInactiveClass}`} aria-label="Rate up" data-vote="up" onClick={() => handleVote('up')}>
        <ThumbsUpIcon filled={currentVote == 'up'} />
      </button>
    </div>

  );
}
