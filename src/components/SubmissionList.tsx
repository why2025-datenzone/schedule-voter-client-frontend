
import { useAppStore } from '../store';
import { SubmissionItem } from './SubmissionItem'; 

export function SubmissionList() {
  const submissionCodes = useAppStore((state) => state.submissionOrder);
  const submissionsMap = useAppStore((state) => state.submissions);

  if (submissionCodes.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No submissions available at the moment.</p>;
  }

  return (
    <main className="p-4 md:p-6 pr-16 md:pr-20 max-w-4xl mx-auto">
      {submissionCodes.map((code) => {
        const data = submissionsMap.get(code);
        return data ? <SubmissionItem key={code} submissionCode={code} data={data} /> : null;
      })}
    </main>
  );
}
