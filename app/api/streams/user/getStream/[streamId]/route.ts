import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { streamId: string } }) {
    const {streamId}=params;  
    try {
      // Fetch all streams for the given creatorId
      const streams = await prismaClient.stream.findMany({
        where:{
          id:streamId
        }
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
  
// Adjust based on your project structure

export async function DELETE(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;

  console.log("Attempting to delete stream with ID:", streamId);

  try {
      // Find and delete all upvotes related to songs in the stream
      const songsToDelete = await prismaClient.song.findMany({
          where: { streamId: streamId },
      });

      if (songsToDelete.length > 0) {
          // Delete upvotes for the songs
          await prismaClient.upvote.deleteMany({
              where: {
                  songId: { in: songsToDelete.map(song => song.id) },
              },
          });
      }

      // Delete the songs related to the stream
      await prismaClient.song.deleteMany({
          where: { streamId: streamId },
      });

      // Finally, delete the stream itself
      const deletedStream = await prismaClient.stream.delete({
          where: { id: streamId },
      });

      return NextResponse.json({
          message: "Stream and related songs and upvotes deleted successfully",
          deletedStream,
      });

  } catch (error) {
      console.error("Error deleting stream:", error);
      return NextResponse.json(
          { message: "Failed to delete the stream", error: error },
          { status: 500 }
      );
  }
}
