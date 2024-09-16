import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { title, isbn, authorName, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find or create the author
    let author = await prisma.author.findFirst({
      where: { name: authorName },
    });

    if (!author) {
      author = await prisma.author.create({
        data: { name: authorName },
      });
    }

    // Check if the book with this ISBN already exists
    let book = await prisma.book.findFirst({
      where: {
        isbn: isbn,
      },
    });

    // Create book if it doesn't exist, make sure isbn is unique

    if (!book) {
      book = await prisma.book.create({
        data: {
          title: title,
          isbn: isbn,
          author: { connect: { id: author.id } },
        },
        include: {
          author: true, // Ensure the author data is returned
        },
      });
    } else {
      // If book already exists, throw an error
      return NextResponse.json({ error: 'A book with this ISBN already exists.' }, { status: 409 });
    }

    // Check if the user has already saved this book
    const userBookExists = await prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
    });

    if (userBookExists) {
      return NextResponse.json({ error: 'You have already saved this book.' }, { status: 409 });
    }

    // Create the user-book relationship
    await prisma.userBook.create({
      data: {
        userId,
        bookId: book.id,
      },
    });

    return NextResponse.json(book); // Return the book with full details (including author)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 });
  }
}
