const Loading = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">{text}</p>
    </div>
  );
};

export default Loading;
