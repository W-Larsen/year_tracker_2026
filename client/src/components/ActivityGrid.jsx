import PropTypes from 'prop-types';
import { Dot } from './Dot';

export function ActivityGrid({ activity, progress, onToggle }) {
    const dots = [];
    for (let i = 0; i < activity.count; i++) {
        dots.push(
            <Dot
                key={i}
                filled={progress.includes(i)}
                onClick={() => onToggle(activity.key, i)}
            />
        );
    }

    return (
        <div className="grid-container" id={activity.grid_id}>
            {dots}
        </div>
    );
}

ActivityGrid.propTypes = {
    activity: PropTypes.shape({
        key: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        grid_id: PropTypes.string.isRequired
    }).isRequired,
    progress: PropTypes.arrayOf(PropTypes.number).isRequired,
    onToggle: PropTypes.func.isRequired
};
