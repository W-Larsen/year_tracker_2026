import PropTypes from 'prop-types';

export function Dot({ filled, onClick }) {
    return (
        <div
            className={`dot ${filled ? 'filled' : ''}`}
            onClick={onClick}
        />
    );
}

Dot.propTypes = {
    filled: Boolean,
    onClick: PropTypes.func.isRequired
};
