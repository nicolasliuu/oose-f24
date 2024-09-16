'use client';

import { useState, useEffect } from 'react';

export default function Home() {
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch the books based on search parameters when triggered by a button click
  const fetchBooks = async () => {
    const query = new URLSearchParams(searchParams);
    try {
      setFetchingBooks(true); // Start fetching
      const res = await fetch(`/api/books/find?${query.toString()}`); // Update route
      const data = await res.json();
      if (res.ok) {
        setBooks(data); // Set the book list
      } else {
        setErrorMessage('Failed to fetch books');
      }
    } catch (error) {
      setErrorMessage('Error fetching books');
    } finally {
      setFetchingBooks(false); // End fetching
    }
  };

  // Add a new book
  const addBook = async (e) => {
    e.preventDefault();
    setAddingBook(true); // Start adding book
    setSuccessMessage(''); // Clear previous success messages
    setErrorMessage(''); // Clear previous error messages

    try {
      const res = await fetch('/api/books/add', { // Update route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, isbn, authorName }),
      });

      if (res.ok) {
        const newBook = await res.json();
        setBooks((prevBooks) => [...prevBooks, newBook]); // Add the new book to the list
        setTitle(''); // Clear the title field
        setIsbn(''); // Clear the ISBN field
        setAuthorName(''); // Clear the author name field
        setSuccessMessage('Book added successfully!'); // Set success message
      } else {
        const errorData = await res.json();
        setErrorMessage(`Failed to add book: ${errorData.error}`);
      }
    } catch (error) {
      setErrorMessage('An error occurred while adding the book.');
    } finally {
      setAddingBook(false); // End adding book
    }
  };

  // Handle changes to the search form inputs
  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-foreground">MyBooksApp</h1>

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
            disabled={addingBook} // Disable input while adding a book
          />
          <input
            type="text"
            placeholder="Author Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="input-style"
            required
            disabled={addingBook} // Disable input while adding a book
          />
          <input
            type="text"
            placeholder="ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className="input-style"
            required
            disabled={addingBook} // Disable input while adding a book
          />
          <button
            type="submit"
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${
              addingBook ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={addingBook} // Disable the button while adding a book
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
            disabled={fetchingBooks} // Disable while fetching books
          />
          <input
            type="text"
            name="author"
            placeholder="Search by Author"
            value={searchParams.author}
            onChange={handleSearchChange}
            className="input-style"
            disabled={fetchingBooks} // Disable while fetching books
          />
          <input
            type="text"
            name="isbn"
            placeholder="Search by ISBN"
            value={searchParams.isbn}
            onChange={handleSearchChange}
            className="input-style"
            disabled={fetchingBooks} // Disable while fetching books
          />
          <button
            onClick={fetchBooks}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
              fetchingBooks ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={fetchingBooks} // Disable the button while fetching books
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
            <li className="text-gray-500">Loading...</li> // Show loading while fetching books
          ) : books.length > 0 ? (
            books.map((book) => (
              <li key={book.id} className="border-b last:border-none pb-4">
                <p className="text-xl font-semibold text-black">{book.title}</p> {/* Book title in black */}
                <p className="text-gray-600">by {book.author.name}</p>
                <p className="text-gray-500">ISBN: {book.isbn}</p>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No books found.</li> // Show when no books are returned
          )}
        </ul>
      </div>
    </div>
  );
}
