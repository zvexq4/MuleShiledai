function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast">
      <strong>✅ {message}</strong>
    </div>
  );
}

export default Toast;