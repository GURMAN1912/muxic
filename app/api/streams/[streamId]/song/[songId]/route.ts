import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

// DELETE: Remove a song from the stream's queue
export async function DELETE(req: NextRequest, { params }: { params: { streamId: string, songId: string } }) {
  const { streamId, songId } = params;

  try {
    // First, delete all upvotes related to the song
    await prismaClient.upvote.deleteMany({
      where: {
        songId: songId,  // Ensure that all upvotes related to this song are deleted first
      },
    });

    // Then, delete the song from the database where both songId and streamId match
    const deletedSong = await prismaClient.song.delete({
      where: {
        id: songId,
      },
    });

    // Respond with success and the deleted song data
    return NextResponse.json({
      message: "Song and related upvotes deleted successfully",
      deletedSong,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete the song", error },
      { status: 500 }
    );
  }
}
// PUT: Update the current song for a stream
export async function PUT(req: NextRequest, { params }: { params: { streamId: string,songId:string } }) {
  const { streamId } = params;
  const { songId } = params

  try {
    // Update the stream's currentSongId
    const updatedStream = await prismaClient.stream.update({
      where: { id: streamId },
      data: { currentSongId: songId },
    });

    return NextResponse.json({
      message: "Current song updated successfully",
      updatedStream,
    });
  } catch (error) {
    console.error("Error updating current song:", error);
    return NextResponse.json(
      { message: "Failed to update the current song", error },
      { status: 500 }
    );
  }
}
