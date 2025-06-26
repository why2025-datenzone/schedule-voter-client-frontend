import { useAppStore } from '../store';

export function SyncIcon({ withText }: Readonly<{ withText: boolean }>) {
    const pollingError = useAppStore((state) => state.pollingSubmissionsError);
    const fetchStatus = pollingError ? "error" : "ok";
    const color = pollingError ? "text-red-500" : "text-green-500";
    return (
        <div className="menu-item flex items-center gap-3 py-2">
            <div className={`status-icon status-${fetchStatus} w-5 h-5 flex-shrink-0 transition-colors duration-200 ease-out ${color}`}>
                <svg className="icon w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.6091 5.89092L15.5 9H21.5V3L18.6091 5.89092ZM18.6091 5.89092C16.965 4.1131 14.6125 3 12 3C7.36745 3 3.55237 6.50005 3.05493 11M5.39092 18.1091L2.5 21V15H8.5L5.39092 18.1091ZM5.39092 18.1091C7.03504 19.8869 9.38753 21 12 21C16.6326 21 20.4476 17.5 20.9451 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {withText ? (<span className="text-sm">Fetch status: {fetchStatus.charAt(0).toUpperCase() + fetchStatus.slice(1)}</span>) : (null)}
        </div>

    );
}