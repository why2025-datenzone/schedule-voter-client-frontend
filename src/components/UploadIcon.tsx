import { useAppStore } from '../store';



export function UploadIcon({ withText }: Readonly<{ withText: boolean }>) {
  const voteSyncState = useAppStore((state) => state.voteSyncState);
  const getColorClass = () => {
    switch (voteSyncState) {
      case "idle":
        return "text-green-500";
      case "disabled":
        return "text-grey-500";
      case "error":
        return "text-red-500";
      case "queued":
        return "text-blue-400";
      case "syncing":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };


  return (
    <div className="menu-item flex items-center gap-3 py-2">
      <div className={`status-icon w-5 h-5 flex-shrink-0 transition-colors duration-200 ease-out ${getColorClass()}`}>
        <svg className="icon w-full h-full" viewBox="0 -2 30 30">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g transform="translate(-571.000000, -676.000000)" fill="currentColor" >
              <path d="M599,692 C597.896,692 597,692.896 597,694 L597,698 L575,698 L575,694 C575,692.896 574.104,692 573,692 C571.896,692 571,692.896 571,694 L571,701 C571,701.479 571.521,702 572,702 L600,702 C600.604,702 601,701.542 601,701 L601,694 C601,692.896 600.104,692 599,692 L599,692 Z M582,684 L584,684 L584,693 C584,694.104 584.896,695 586,695 C587.104,695 588,694.104 588,693 L588,684 L590,684 C590.704,684 591.326,684.095 591.719,683.7 C592.11,683.307 592.11,682.668 591.719,682.274 L586.776,676.283 C586.566,676.073 586.289,675.983 586.016,675.998 C585.742,675.983 585.465,676.073 585.256,676.283 L580.313,682.274 C579.921,682.668 579.921,683.307 580.313,683.7 C580.705,684.095 581.608,684 582,684 L582,684 Z" id="upload"></path>
            </g>
          </g>
        </svg>
      </div>
      {withText ? (<span className="text-sm">Upload status: {voteSyncState.charAt(0).toUpperCase() + voteSyncState.slice(1)}</span>) : (<></>)}
    </div>
  )
}