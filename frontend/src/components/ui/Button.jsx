import PropTypes from 'prop-types';
import { MESSAGES } from '@/constants/messages.js';
import './Button.css';

const BUTTON_VARIANTS = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
});

function Button({
  children,
  type = 'button',
  variant = BUTTON_VARIANTS.PRIMARY,
  isLoading = false,
  disabled = false,
  onClick,
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`button button--${variant}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {isLoading ? MESSAGES.COMMON.LOADING : children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(Object.values(BUTTON_VARIANTS)),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;
