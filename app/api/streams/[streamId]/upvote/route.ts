import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";

// Schema validation for upvoting a song in a stream
const UpvoteSchema = z.object({
  userId: z.string(),  // ID of the user who upvotes
  songId: z.string(),  // ID of the song being upvoted
});

// POST method to handle upvoting a song in the stream
export async function POST(req: NextRequest, { params }: { params: { streamId: string } }) {
  try {
    // Parse and validate the request body
    const data = UpvoteSchema.parse(await req.json());

    // Check if the upvote already exists (to prevent duplicate upvotes)
    const existingUpvote = await prismaClient.upvote.findUnique({
      where: {
        userId_songId: {
          userId: data.userId,
          songId: data.songId,
        },
      },
    });

    if (existingUpvote) {
      return NextResponse.json({ message: "You have already upvoted this song" }, { status: 400 });
    }

    // If not, create a new upvote
    const upvote = await prismaClient.upvote.create({
      data: {
        userId: data.userId,
        songId: data.songId,
      },
    });

    return NextResponse.json({
      message: "Upvote successful",
      upvote,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to upvote song" }, { status: 500 });
  }
}

// GET method to fetch all upvotes for a stream
export async function GET(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;

  try {
    // Find all upvotes for songs in the specified stream
    const upvotes = await prismaClient.upvote.findMany({
      where: {
        song: {
          streamId: streamId, // Ensure the song belongs to the stream
        },
      },
      include: {
        user: true, // Include user details in the response if needed
        song: true, // Include song details in the response
      },
    });

    return NextResponse.json({ upvotes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch upvotes" }, { status: 500 });
  }
}
