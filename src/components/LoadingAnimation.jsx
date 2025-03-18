const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div
          className="absolute inset-0 border-4 border-blue-700 border-t-transparent rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        ></div>

        {/* Inner ring */}
        <div
          className="absolute inset-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          style={{ animationDuration: "1s", animationDirection: "reverse" }}
        ></div>

        {/* Static gradient center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-700 to-blue-500"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
