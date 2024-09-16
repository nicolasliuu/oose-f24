import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

export async function POST(req) {
  try {
    const { username, password } = await req.json(); // Parse JSON body

    // Check if user exists in the database
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing
      user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,  // Store hashed password
        },
      });
      return new Response(JSON.stringify({ message: 'Account created and login successful', user }), {
        status: 201,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password); // Compare hash
    if (!passwordMatches) {
      return new Response(JSON.stringify({ error: 'Invalid username or password' }), {
        status: 401,
      });
    }

    return new Response(JSON.stringify({ message: 'Login successful', user }), {
      status: 200,
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
    });
  }
}
