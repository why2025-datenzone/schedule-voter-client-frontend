import { useState } from 'react';
import { useAppStore, SubmissionData } from '../store';
import { VoteButtons } from './VoteButtons'; 

interface SubmissionItemProps {
  submissionCode: string;
  data: SubmissionData;
}

export function SubmissionItem({ submissionCode, data }: Readonly<SubmissionItemProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const setExpanded = useAppStore((state) => state.setExpanded);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      setExpanded(submissionCode);
    }
  };

  return (
    <div className={`submission-item bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 mb-3 rounded-md overflow-hidden transition-shadow duration-200 hover:shadow-lg group ${isOpen ? 'expanded' : ''}`} data-id={`event-${submissionCode}`}>
      <button className="submission-title px-4 py-3 w-full cursor-pointer flex justify-between items-center font-semibold text-base md:text-lg transition-colors duration-200 select-none hover:bg-gray-50 dark:hover:bg-slate-700/50" aria-expanded={isOpen} aria-controls={`content-${submissionCode}`} onClick={handleToggle}>
        <span className="text-left">{data.title}</span>
        <svg className={`accordion-icon w-5 h-5 ml-2 transition-transform duration-200 ease-out  ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <section className="submission-content px-4" id={`content-${submissionCode}`} aria-labelledby={`title-${submissionCode}`}>
          <div 
            className="submission-abstract text-sm md:text-base leading-relaxed mb-4 [&_p]:mb-3 last:[&_p]:mb-0" 
            dangerouslySetInnerHTML={{ __html: data.abstract }}
          >
        </div>
        <VoteButtons submissionCode={submissionCode} />
      </section>
    </div>
    

  );
}
