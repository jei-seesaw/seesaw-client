/**
 * 로딩 스피너 컴포넌트
 */
export function LoadingSpinner() {
  return (
    <div className="w-full max-w-sm min-h-screen mx-auto bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    </div>
  );
}
