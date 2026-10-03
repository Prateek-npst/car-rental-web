import PropTypes from 'prop-types';
import './FormField.css';

function FormField({ children, error, htmlFor, label }) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
      </label>

      <div className="form-field__control">{children}</div>

      {error ? (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

FormField.propTypes = {
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  htmlFor: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

FormField.defaultProps = {
  error: '',
};

export default FormField;
