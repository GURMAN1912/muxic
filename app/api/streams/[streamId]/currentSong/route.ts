import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

export async function GET(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;

  try {
    // Fetch the stream with the currentSongId
    const stream = await prismaClient.stream.findUnique({
      where: { id: streamId },
      select: { currentSongId: true },
    });

    // Check if the stream exists and has a currentSongId
    if (!stream || !stream.currentSongId) {
      return NextResponse.json({ message: "No current song found" });
    }

    // Fetch the song details based on currentSongId
    const currentSong = await prismaClient.song.findUnique({
      where: { id: stream.currentSongId },
    });

    // Check if the current song exists
    if (!currentSong) {
      return NextResponse.json({ message: "Current song not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Current song fetched successfully",
      currentSong,
    });

  } catch (error) {
    console.error("Error fetching current song:", error);
    return NextResponse.json(
      { message: "Failed to fetch the current song", error }, // Return only the error message
      { status: 500 }
    );
  }
}
