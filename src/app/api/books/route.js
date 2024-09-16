import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '';
    const authorName = searchParams.get('author') || '';
    const isbn = searchParams.get('isbn') || '';
  
    try {
      const books = await prisma.book.findMany({
        where: {
          title: { contains: title, mode: 'insensitive' },
          isbn: { contains: isbn },
          author: {
            name: { contains: authorName, mode: 'insensitive' },
          },
        },
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

  export async function POST(request) {
    const { String: title, isbn, String: authorName} = await request.json();
  
    try {
      // Check if the author exists
      let author = await prisma.author.findUnique({
        where: { name: authorName },
      });
  
      if (!author) {
        // Create a new author
        author = await prisma.author.create({
          data: { name: authorName },
        });
      }
  
      // Create a new book
      const newBook = await prisma.book.create({
        data: {
          title,
          isbn,
          author: {
            connect: { id: author.id },
          },
        },
        include: {
          author: true,
        },
      });
  
      return NextResponse.json(newBook);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
  }