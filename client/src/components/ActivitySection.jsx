import PropTypes from 'prop-types';
import { ActivityGrid } from './ActivityGrid';

/**
 * Reusable component for rendering an activity section
 * Includes name label, dot grid, and progress counter
 * @param {object} props
 * @param {object} props.activity - Activity configuration object
 * @param {number[]} props.progress - Array of completed dot indices
 * @param {function} props.onToggle - Callback for toggling dot state
 * @param {function} props.getProgressCount - Function to get progress count
 * @param {string} props.nameId - ID for the name block element
 * @param {string} props.boxId - ID for the box element
 * @param {string} props.textId - ID for the text counter element
 */
export function ActivitySection({
    activity,
    progress,
    onToggle,
    getProgressCount,
    nameId,
    boxId,
    textId
}) {
    if (!activity) return null;

    return (
        <>
            <div id={nameId} className="name-block">
                {activity.name.toLowerCase()}
            </div>
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
};
