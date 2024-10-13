import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "../../../../lib/db";
import { z } from "zod";

// Schema validation for creating a stream
const CreateStreamSchema = z.object({
  title: z.string(),
});

// POST method to create a new stream
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const {userId} = params;
  try {
    // Parse the request body using zod for validation
    const data = CreateStreamSchema.parse(await req.json());

    // Create a new stream
    const stream = await prismaClient.stream.create({
      data: {
        creatorId: userId,
        title: data.title,
      },
    });

    return NextResponse.json({
      message: "Stream created successfully",
      stream,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create stream" },
      { status: 500 }
    );
  }
}

// GET method to fetch all streams by a creator
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  try {
    

    if (!userId) {
      return NextResponse.json(
        { message: "creatorId is required " },
        { status: 400 }
      );
    }

    // Validate creatorId using zod

    // Fetch all streams for the given creatorId
    const streams = await prismaClient.stream.findMany({
      where: {
        creatorId: userId,
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
