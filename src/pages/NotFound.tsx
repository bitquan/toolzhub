import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-primary-600">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-4">
          <Link to="/" className="btn-primary">
            Go back home
          </Link>
          <Link
            to="/blog"
            className="text-sm font-semibold text-gray-900 hover:text-primary-700"
          >
            Explore the blog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
