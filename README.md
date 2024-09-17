# MyBooksApp

DEPLOYMENT AT: https://oose-mybooks.vercel.app/
This is a Next.js application that allows users to log in, add books, search for books, and view their personal collection. The app is built with Prisma and MongoDB for data storage.

## Features

- User authentication (login/sign-up).
- Add new books with title, author, and ISBN.
- View and search personal book collections.
- Unique ISBN constraint on books.
- Responsive, dynamic UI

## Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

First, clone the repository to your local machine:

[git clone https://github.com/your-username/mybooksapp.git](https://github.com/jhu-oose-f24/homework-1-nicolasliuu)
cd hw1-task

### 2. Install Dependencies

Once you're in the project directory, run the following command to install the required dependencies:

npm install

### 3. Set Up Environment Variables

This application requires a connection to a MongoDB database. Create a \`.env\` file in the root of your project and add the following environment variable:


DATABASE_URL="your_mongodb_connection_string"


Replace \`your_mongodb_connection_string\` with your actual MongoDB connection string.

If you're using a local MongoDB server, it may look something like this:


DATABASE_URL="mongodb://localhost:27017/mybooksapp"


For a cloud MongoDB (e.g., MongoDB Atlas), it might look like:


DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/mybooksapp?retryWrites=true&w=majority"


### 4. Running the Application

Now you're ready to run the application!

#### Development Mode

To run the app in development mode (with hot reloading):

\`\`\`bash
npm run dev
\`\`\`

Open your browser and go to \`http://localhost:3000\`.

#### Production Mode

To run the app in production mode:

1. Build the application:

   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:

   \`\`\`bash
   npm start
   \`\`\`

Your app will now be running in production mode. You can access it at \`http://localhost:3000\`.

### 5. Explore the Features

Once the application is running:

- Sign in or sign up using the login form.
- Add new books by providing the title, author, and ISBN.
- Search your book collection by title, author, or ISBN.
- View your personal book list with all details.

### 6. Useful Commands

- **\`npm run dev\`** - Starts the development server.
- **\`npm run build\`** - Builds the application for production.
- **\`npm start\`** - Starts the production server.