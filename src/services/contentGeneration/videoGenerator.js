const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../logger');

/**
 * Video generation service using FFmpeg
 */
const videoGenerator = {
  /**
   * Generate video from images and audio
   */
  async generate({ images, audio, duration = 60, transitions = true }) {
    try {
      // Check if feature is enabled
      if (process.env.ENABLE_VIDEO_GENERATION !== 'true') {
        logger.warn('Video generation is disabled');
        return this.getMockVideo();
      }

      logger.info('Generating video from images and audio');

      const outputDir = path.join(__dirname, '../../../generated/videos');
      await fs.mkdir(outputDir, { recursive: true });

      const outputFilename = `video_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);

      // If no images provided, create a simple video
      if (!images || images.length === 0) {
        return await this.createTextVideo(audio, duration, outputPath);
      }

      // Create video from images
      return await this.createImageSlideshow(images, audio, duration, outputPath, transitions);
    } catch (error) {
      logger.error('Error generating video:', error);
      return this.getMockVideo();
    }
  },

  /**
   * Create slideshow video from images
   */
  async createImageSlideshow(images, audio, duration, outputPath, transitions) {
    return new Promise((resolve, reject) => {
      try {
        const imageDuration = duration / images.length;
        
        let command = ffmpeg();

        // Add images
        images.forEach(image => {
          command = command.input(image.filepath || image.url);
        });

        // Add audio if provided
        if (audio && audio.filepath) {
          command = command.input(audio.filepath);
        }

        // Configure output
        command
          .outputOptions([
            '-c:v libx264',
            '-pix_fmt yuv420p',
            '-r 30',
            `-t ${duration}`
          ])
          .output(outputPath)
          .on('end', () => {
            logger.info(`Video generated successfully: ${outputPath}`);
            resolve({
              url: `/generated/videos/${path.basename(outputPath)}`,
              filepath: outputPath,
              duration,
              format: 'mp4',
              images: images.length,
              hasAudio: !!audio
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Create text-based video
   */
  async createTextVideo(audio, duration, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        let command = ffmpeg();

        // Create blank video
        command
          .input('color=c=black:s=1920x1080:r=30')
          .inputFormat('lavfi')
          .inputOptions([`-t ${duration}`]);

        // Add audio if provided
        if (audio && audio.filepath) {
          command = command.input(audio.filepath);
        }

        command
          .outputOptions([
            '-c:v libx264',
            '-pix_fmt yuv420p',
            '-shortest'
          ])
          .output(outputPath)
          .on('end', () => {
            logger.info(`Text video generated successfully: ${outputPath}`);
            resolve({
              url: `/generated/videos/${path.basename(outputPath)}`,
              filepath: outputPath,
              duration,
              format: 'mp4',
              type: 'text',
              hasAudio: !!audio
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Add audio to video
   */
  async addAudioToVideo(videoPath, audioPath) {
    try {
      const outputDir = path.join(__dirname, '../../../generated/videos');
      const outputFilename = `merged_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);

      return new Promise((resolve, reject) => {
        ffmpeg()
          .input(videoPath)
          .input(audioPath)
          .outputOptions([
            '-c:v copy',
            '-c:a aac',
            '-map 0:v:0',
            '-map 1:a:0',
            '-shortest'
          ])
          .output(outputPath)
          .on('end', () => {
            logger.info(`Audio added to video successfully: ${outputPath}`);
            resolve({
              url: `/generated/videos/${path.basename(outputPath)}`,
              filepath: outputPath,
              format: 'mp4'
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error adding audio to video:', error);
      throw error;
    }
  },

  /**
   * Trim video
   */
  async trimVideo(videoPath, startTime, duration) {
    try {
      const outputDir = path.join(__dirname, '../../../generated/videos');
      const outputFilename = `trimmed_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, outputFilename);

      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .setStartTime(startTime)
          .setDuration(duration)
          .output(outputPath)
          .on('end', () => {
            logger.info(`Video trimmed successfully: ${outputPath}`);
            resolve({
              url: `/generated/videos/${path.basename(outputPath)}`,
              filepath: outputPath,
              duration,
              format: 'mp4'
            });
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      logger.error('Error trimming video:', error);
      throw error;
    }
  },

  /**
   * Mock video for fallback
   */
  getMockVideo() {
    return {
      url: '/generated/videos/mock_video.mp4',
      filepath: '/tmp/mock_video.mp4',
      duration: 60,
      format: 'mp4',
      mock: true
    };
  }
};

module.exports = videoGenerator;
