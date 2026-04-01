// Card.jsx
export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`card ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Button.jsx
export function Button({ children, variant = 'primary', size = '', onClick, disabled, type = 'button', style = {} }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
