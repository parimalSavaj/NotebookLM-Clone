import { YoutubeTranscript } from "youtube-transcript";
import { IYoutubeService, TranscriptResult } from "./youtube.external-service.interface.ts";

export class YoutubeExternalService implements IYoutubeService {
  private static instance: YoutubeExternalService | null = null;

  private constructor() {}

  static getInstance(): YoutubeExternalService {
    if (!YoutubeExternalService.instance) {
      YoutubeExternalService.instance = new YoutubeExternalService();
    }
    return YoutubeExternalService.instance;
  }

  async getTranscript(url: string): Promise<TranscriptResult> {
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      throw new Error("Invalid YouTube URL: could not extract video ID");
    }

    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptItems || transcriptItems.length === 0) {
        throw new Error("No transcript available for this video");
      }

      // Combine all transcript segments into a single text
      const fullText = transcriptItems
        .map((item) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!fullText || fullText.length === 0) {
        throw new Error("Transcript is empty for this video");
      }

      return {
        text: fullText,
        title: `YouTube Video (${videoId})`,
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch YouTube transcript: ${String(error)}`);
    }
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Check if the input itself is a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  }
}
