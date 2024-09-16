import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.trim();
  const authorName = searchParams.get('author')?.trim();
  const isbn = searchParams.get('isbn')?.trim();

  // Dynamically build the filters object
  const filters = {};

  if (title) {
    filters.title = { contains: title, mode: 'insensitive' };
  }

  if (isbn) {
    filters.isbn = { contains: isbn };
  }

  if (authorName) {
    filters.author = { name: { contains: authorName, mode: 'insensitive' } };
  }

  try {
    const books = await prisma.book.findMany({
      where: filters,
      include: {
        author: true,
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
