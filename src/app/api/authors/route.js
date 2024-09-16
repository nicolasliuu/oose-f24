import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: {
        books: true,
      },
    });
    return NextResponse.json(authors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}