'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // States for login form and auth status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null); // Store userId

  // States for book form and search
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [books, setBooks] = useState([]);
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    isbn: '',
  });
  const [fetchingBooks, setFetchingBooks] = useState(false);
  const [addingBook, setAddingBook] = useState(false);

  // Function to fetch books only when userId is available
  const fetchBooks = async () => {
    if (!userId) return; // Ensure userId is available

    const query = new URLSearchParams({ ...searchParams, userId });  // Include userId in query
    try {
      setFetchingBooks(true);
      const res = await fetch(`/api/books/find?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setBooks(data);
      } else {
        setErrorMessage('Failed to fetch books');
      }
    } catch (error) {
      setErrorMessage('Error fetching books');
    } finally {
      setFetchingBooks(false);
    }
  };

  // Check if the user is already logged in (localStorage)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isAuthenticated');
    const storedUserId = localStorage.getItem('userId');

    const initialize = async () => {
      if (loggedIn && storedUserId) {
        setIsAuthenticated(true);
        setUserId(storedUserId);
      }
    };

    initialize();
  }, []);

  // Fetch books once userId is available and user is authenticated
  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchBooks();  // Fetch books when userId is set
    }
  }, [userId, isAuthenticated]); // Dependencies: only run when userId or isAuthenticated changes

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      // If login is successful, store auth status and userId in localStorage and state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', data.user.id);  // Store userId
      setIsAuthenticated(true);
      setUserId(data.user.id);  // Set userId state
      setUsername('');
      setPassword('');
    } else {
      const errorData = await res.json();
      setErrorMessage(errorData.error || 'Invalid credentials');
    }
  };

  // Handle logout by clearing localStorage
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserId(null);
    setBooks([]);
  };

  const addBook = async (e) => {
    e.preventDefault();
    setAddingBook(true);
    setSuccessMessage('');
    setErrorMessage('');
  
    try {
      const res = await fetch('/api/books/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, isbn, authorName, userId }),  // Include userId in request body
      });
  
      if (res.ok) {
        const newBook = await res.json();
  
        // Add the fully populated new book to the state
        setBooks((prevBooks) => [...prevBooks, newBook]);
  
        // Clear form fields
        setTitle('');
        setIsbn('');
        setAuthorName('');
        setSuccessMessage('Book added successfully!');
      } else {
        const errorData = await res.json();
        setErrorMessage(`Failed to add book: ${errorData.error}`);
      }
    } catch (error) {
      setErrorMessage('An error occurred while adding the book.');
    } finally {
      setAddingBook(false);
    }
  };
  

  // Handle changes to the search form inputs
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // If the user is not logged in, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-4xl text-black font-bold mb-6">Login</h1>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white shadow-md rounded p-6"
        >
          <div className="mb-4">
            <label htmlFor="username" className="block text-black text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-style w-full"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-black text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-style w-full"
              required
            />
          </div>
          {errorMessage && (
            <p className="text-red-500 text-xs italic">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
          >
            Sign In/Sign Up 
          </button>
          <p className="text-black text-xs italic"> If you don&apos;t have an account you will be signed up automatically </p>
        </form>
      </div>
    );
  }

  // If the user is authenticated, show the books and logout option
  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-foreground">MyBooksApp</h1>

      <button
        onClick={handleLogout}
        className="mb-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Logout
      </button>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-200 text-green-800 p-4 rounded-md mb-4 w-full max-w-md text-center">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-200 text-red-800 p-4 rounded-md mb-4 w-full max-w-md text-center">
          {errorMessage}
        </div>
      )}

      {/* Add Book Form */}
      <form
        onSubmit={addBook}
        className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4 text-black">Add a New Book</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-style"
            required
            disabled={addingBook}
          />
          <input
            type="text"
            placeholder="Author Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="input-style"
            required
            disabled={addingBook}
          />
          <input
            type="text"
            placeholder="ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="input-style"
            required
            disabled={addingBook}
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${
              addingBook ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={addingBook}
          >
            {addingBook ? 'Adding...' : 'Add Book'}
          </button>
        </div>
      </form>

      {/* Search Books Section */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-black">Search Books</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Search by Title"
            value={searchParams.title}
            onChange={handleSearchChange}
            className="input-style"
            disabled={fetchingBooks}
          />
          <input
            type="text"
            name="author"
            placeholder="Search by Author"
            value={searchParams.author}
            onChange={handleSearchChange}
            className="input-style"
            disabled={fetchingBooks}
          />
          <input
            type="text"
            name="isbn"
            placeholder="Search by ISBN"
            value={searchParams.isbn}
            onChange={handleSearchChange}
            className="input-style"
            disabled={fetchingBooks}
          />
          <button
            onClick={fetchBooks}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
              fetchingBooks ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={fetchingBooks}
          >
            {fetchingBooks ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Book List */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Book List</h2>
        <ul className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          {fetchingBooks ? (
            <li className="text-gray-500">Loading...</li>
          ) : books.length > 0 ? (
            books.map((book) => (
              <li key={book.id} className="border-b last:border-none pb-4">
                <p className="text-xl font-semibold text-black">{book.title}</p>
                <p className="text-gray-600">
                  {book.author ? `by ${book.author.name}` : 'Author unknown'}
                </p>
                <p className="text-gray-500">ISBN: {book.isbn || 'N/A'}</p>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No books found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
