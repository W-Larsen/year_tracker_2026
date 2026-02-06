import PropTypes from 'prop-types';

/**
 * Individual clickable dot component
 * @param {object} props
 * @param {boolean} props.filled - Whether the dot is filled/completed
 * @param {function} props.onClick - Click handler function
 */
export function Dot({ filled, onClick }) {
    return (
        <div
            className={`dot ${filled ? 'filled' : ''}`}
            onClick={onClick}
        />
    );
}

Dot.propTypes = {
    filled: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};
