export interface TranscriptResult {
  text: string;
  title: string;
  videoId: string;
  url: string;
}

export interface IYoutubeService {
  getTranscript(url: string): Promise<TranscriptResult>;
}
