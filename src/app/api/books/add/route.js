// Import necessary modules
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client once to prevent multiple instances in development
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances of Prisma Client in development
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// POST handler to add a new book
export async function POST(request) {
  try {
    // Parse and validate the request body
    const { title, isbn, authorName } = await request.json();

    // Input Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required and must be a non-empty string.' }, { status: 400 });
    }

    if (!authorName || typeof authorName !== 'string' || authorName.trim() === '') {
      return NextResponse.json({ error: 'Author name is required and must be a non-empty string.' }, { status: 400 });
    }

    // Trim inputs to remove unnecessary whitespace
    const trimmedTitle = title.trim();
    const trimmedAuthorName = authorName.trim();
    const trimmedIsbn = isbn ? isbn.trim() : null;

    let author;

    // Attempt to find the author by name
    if (trimmedAuthorName) {
        // Check if author name is unique
      if (await prisma.author.count({ where: { name: trimmedAuthorName } }) === 1) {
        // If 'name' is unique, use findUnique
        author = await prisma.author.findUnique({
          where: { name: trimmedAuthorName },
        });
      } else {
        // If 'name' is not unique, use findFirst or handle accordingly
        author = await prisma.author.findFirst({
          where: { name: trimmedAuthorName },
        });
      }

      // If author doesn't exist, create a new one
      if (!author) {
        author = await prisma.author.create({
          data: { name: trimmedAuthorName },
        });
      }
    } else {
      // Handle cases where authorName is not provided
      return NextResponse.json({ error: 'Author name is required.' }, { status: 400 });
    }

    // Create the new book
    const newBook = await prisma.book.create({
      data: {
        title: trimmedTitle,
        isbn: trimmedIsbn,
        author: {
          connect: { id: author.id },
        },
      },
      include: {
        author: true, // Include author details in the response
      },
    });

    // Return the newly created book
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint failed
      return NextResponse.json({ error: 'A book with this ISBN already exists.' }, { status: 409 });
    }

    // Generic server error
    return NextResponse.json({ error: 'Failed to create book.' }, { status: 500 });
  }
}
