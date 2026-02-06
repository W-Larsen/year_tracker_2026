import PropTypes from 'prop-types';
import { ActivityGrid } from './ActivityGrid';

/**
 * Format ISO date string to dd/MM/YY format
 * @param {string|null} isoDate - ISO date string
 * @returns {string} Formatted date or empty string
 */
function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

/**
 * Reusable component for rendering an activity section
 * Includes name label, dot grid, progress counter, and last updated label
 * @param {object} props
 * @param {object} props.activity - Activity configuration object
 * @param {number[]} props.progress - Array of completed dot indices
 * @param {function} props.onToggle - Callback for toggling dot state
 * @param {function} props.getProgressCount - Function to get progress count
 * @param {string} props.nameId - ID for the name block element
 * @param {string} props.boxId - ID for the box element
 * @param {string} props.textId - ID for the text counter element
 * @param {string} [props.customName] - Optional custom name override (defaults to activity.name)
 * @param {string} [props.subtitleId] - Optional ID for subtitle element
 * @param {string} [props.subtitleText] - Optional subtitle text to display
 * @param {string} [props.updatedId] - Optional ID for the last updated label
 * @param {string|null} [props.lastUpdated] - Optional ISO date string for last update
 */
export function ActivitySection({
    activity,
    progress,
    onToggle,
    getProgressCount,
    nameId,
    boxId,
    textId,
    customName,
    subtitleId,
    subtitleText,
    updatedId,
    lastUpdated
}) {
    if (!activity) return null;

    const formattedDate = formatDate(lastUpdated);

    return (
        <>
            <div id={nameId} className="name-block">
                {customName ? customName.toLowerCase() : activity.name.toLowerCase()}
            </div>
            {subtitleId && subtitleText && (
                <div id={subtitleId}>
                    {subtitleText}
                </div>
            )}
            <div id={boxId} className="circles-block">
                <ActivityGrid
                    activity={activity}
                    progress={progress}
                    onToggle={onToggle}
                />
            </div>
            <div id={textId} className="meta-text">
                {getProgressCount(activity.key)}/{activity.count}
            </div>
            {updatedId && formattedDate && (
                <div id={updatedId} className="last-updated">
                    updated on {formattedDate}
                </div>
            )}
        </>
    );
}

ActivitySection.propTypes = {
    activity: PropTypes.shape({
        key: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
    }),
    progress: PropTypes.arrayOf(PropTypes.number).isRequired,
    onToggle: PropTypes.func.isRequired,
    getProgressCount: PropTypes.func.isRequired,
    nameId: PropTypes.string.isRequired,
    boxId: PropTypes.string.isRequired,
    textId: PropTypes.string.isRequired,
    customName: PropTypes.string,
    subtitleId: PropTypes.string,
    subtitleText: PropTypes.string,
    updatedId: PropTypes.string,
    lastUpdated: PropTypes.string,
};
