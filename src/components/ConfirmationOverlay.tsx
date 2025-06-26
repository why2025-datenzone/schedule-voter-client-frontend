import { useState, useEffect } from 'react';

interface ConfirmationOverlayProps {
    isOpen: boolean;
    message: string;
    abortButtonText?: string;
    confirmButtonText?: string;
    onAbort: () => void;
    onConfirm: () => void;
}

export function ConfirmationOverlay({
    isOpen,
    message,
    abortButtonText = "Abort",
    confirmButtonText = "Delete data",
    onAbort,
    onConfirm,
}: Readonly<ConfirmationOverlayProps>) {
    const [confirmEnabled, setConfirmEnabled] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setConfirmEnabled(false); 
            setCountdown(5);

            const interval = setInterval(() => {
                setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            setIntervalId(interval);

            const timer = setTimeout(() => {
                setConfirmEnabled(true);
                if (intervalId) clearInterval(intervalId);
                setCountdown(0);
            }, 5000);
            setTimerId(timer);

        } else {
            if (timerId) clearTimeout(timerId);
            if (intervalId) clearInterval(intervalId);
            setTimerId(null);
            setIntervalId(null);
            setConfirmEnabled(false);
            setCountdown(5);
        }

        return () => {
            if (timerId) clearTimeout(timerId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Confirm Data Deletion</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-base">
                    {message}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onAbort}
                        className="px-5 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-base font-medium"
                    >
                        {abortButtonText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!confirmEnabled}
                        className={`px-5 py-2 rounded-md transition-all duration-300 text-base font-medium text-white ${confirmEnabled
                                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 cursor-pointer'
                                : 'bg-red-400 dark:bg-red-700 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        {confirmEnabled ? confirmButtonText : `${confirmButtonText} (in ${countdown}s)`}
                    </button>
                </div>
            </div>
        </div>
    );
}