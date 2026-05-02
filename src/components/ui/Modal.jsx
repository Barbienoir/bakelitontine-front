export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-5 rounded-xl w-full max-w-md">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}