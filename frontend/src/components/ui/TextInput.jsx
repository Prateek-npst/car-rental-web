import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './TextInput.css';

const TextInput = forwardRef(function TextInput(
  { id, name, type = 'text', disabled = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className="text-input"
      disabled={disabled}
      id={id}
      name={name}
      type={type}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';

TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

export default TextInput;
