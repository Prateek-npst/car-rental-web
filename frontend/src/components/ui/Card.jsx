import PropTypes from 'prop-types';
import './Card.css';

function Card({ children, title }) {
  return (
    <section className="card">
      {title ? <h2 className="card__title">{title}</h2> : null}
      <div className="card__content">{children}</div>
    </section>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};

export default Card;
