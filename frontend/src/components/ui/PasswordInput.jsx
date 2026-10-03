import { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/ui/Button.jsx';
import { MESSAGES } from '@/constants/messages.js';
import './PasswordInput.css';

function PasswordInput({ id, name, disabled = false, ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  const inputType = isVisible ? 'text' : 'password';
  const toggleLabel = isVisible
    ? MESSAGES.PASSWORD_INPUT.HIDE
    : MESSAGES.PASSWORD_INPUT.SHOW;

  function handleToggle() {
    setIsVisible((currentValue) => !currentValue);
  }

  return (
    <div className="password-input">
      <input
        {...props}
        className="password-input__field"
        disabled={disabled}
        id={id}
        name={name}
        type={inputType}
      />

      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={handleToggle}
      >
        {toggleLabel}
      </Button>
    </div>
  );
}

PasswordInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export default PasswordInput;
