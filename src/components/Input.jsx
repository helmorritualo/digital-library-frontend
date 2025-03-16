const Input = ({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
