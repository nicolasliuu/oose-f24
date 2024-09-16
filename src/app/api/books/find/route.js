import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');  // The userId comes as a string
  const title = searchParams.get('title') || '';
  const authorName = searchParams.get('author') || '';
  const isbn = searchParams.get('isbn') || '';

  // Convert userId to ObjectId
  if (!userId || userId === "null") {
    return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
  }

  try {
    // Convert userId string to ObjectId
    const objectIdUserId = userId && { equals: userId };

    // Query UserBook with filters
    const books = await prisma.userBook.findMany({
      where: {
        userId: objectIdUserId,
        book: {
          title: { contains: title, mode: 'insensitive' },
          isbn: { contains: isbn, mode: 'insensitive' },
          author: {
            name: { contains: authorName, mode: 'insensitive' },
          },
        },
      },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
    });

    // Map and return the books
    const userBooks = books.map((userBook) => userBook.book);
    return NextResponse.json(userBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
