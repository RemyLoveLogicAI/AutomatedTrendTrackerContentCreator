const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class VideoService {
  constructor() {
    this.outputDir = process.env.VIDEO_OUTPUT_DIR || './generated/videos';
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating video output directory:', error);
    }
  }

  // Create video from images and audio
  async createVideoFromAssets({ images, audio, duration = 10, fps = 24 }) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        this.outputDir,
        `video_${Date.now()}.mp4`
      );

      const command = ffmpeg();

      // Add images
      images.forEach((imagePath) => {
        command.input(imagePath);
      });

      // Add audio if provided
      if (audio) {
        command.input(audio);
      }

      command
        .complexFilter([
          // Create video from images
          `concat=n=${images.length}:v=1:a=0[v]`,
          '[v]fps=' + fps + '[video]'
        ])
        .map('[video]')
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-shortest'
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          logger.info('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          logger.debug('Processing:', progress.percent + '% done');
        })
        .on('end', () => {
          logger.info('Video created successfully:', outputPath);
          resolve({
            path: outputPath,
            duration: duration,
            fps: fps
          });
        })
        .on('error', (err) => {
          logger.error('Error creating video:', err);
          reject(err);
        })
        .run();
    });
  }

  // Add text overlay to video
  async addTextOverlay({ videoPath, text, position = 'center', duration = 5 }) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        this.outputDir,
        `video_text_${Date.now()}.mp4`
      );

      ffmpeg(videoPath)
        .videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: text,
              fontsize: 48,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: '(h-text_h)/2',
              enable: `between(t,0,${duration})`
            }
          }
        ])
        .output(outputPath)
        .on('end', () => {
          logger.info('Text overlay added:', outputPath);
          resolve({ path: outputPath });
        })
        .on('error', (err) => {
          logger.error('Error adding text overlay:', err);
          reject(err);
        })
        .run();
    });
  }

  // Merge multiple video clips
  async mergeVideos(videoPaths) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        this.outputDir,
        `merged_${Date.now()}.mp4`
      );

      const command = ffmpeg();

      videoPaths.forEach((videoPath) => {
        command.input(videoPath);
      });

      command
        .on('end', () => {
          logger.info('Videos merged:', outputPath);
          resolve({ path: outputPath });
        })
        .on('error', (err) => {
          logger.error('Error merging videos:', err);
          reject(err);
        })
        .mergeToFile(outputPath);
    });
  }

  // Extract audio from video
  async extractAudio(videoPath) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        this.outputDir,
        `audio_${Date.now()}.mp3`
      );

      ffmpeg(videoPath)
        .output(outputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .on('end', () => {
          logger.info('Audio extracted:', outputPath);
          resolve({ path: outputPath });
        })
        .on('error', (err) => {
          logger.error('Error extracting audio:', err);
          reject(err);
        })
        .run();
    });
  }

  // Resize video
  async resizeVideo(videoPath, width, height) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        this.outputDir,
        `resized_${Date.now()}.mp4`
      );

      ffmpeg(videoPath)
        .size(`${width}x${height}`)
        .output(outputPath)
        .on('end', () => {
          logger.info('Video resized:', outputPath);
          resolve({ path: outputPath, width, height });
        })
        .on('error', (err) => {
          logger.error('Error resizing video:', err);
          reject(err);
        })
        .run();
    });
  }

  // Get video info
  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          logger.error('Error getting video info:', err);
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            size: metadata.format.size,
            format: metadata.format.format_name,
            streams: metadata.streams.map(s => ({
              type: s.codec_type,
              codec: s.codec_name,
              width: s.width,
              height: s.height
            }))
          });
        }
      });
    });
  }
}

module.exports = new VideoService();
