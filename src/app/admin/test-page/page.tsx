'use client';

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Admin Login Test</h1>
        <p className="text-gray-600 mb-4">✅ If you can see this, the page is working!</p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> The admin pages are loading correctly.
        </div>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin@solscape.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin123"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Login Test
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/admin" className="text-blue-600 hover:text-blue-800">
            ← Back to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
