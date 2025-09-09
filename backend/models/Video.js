const pool = require('../config/db');

class Video {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.filename = data.filename;
    this.original_name = data.original_name;
    this.file_path = data.file_path;
    this.thumbnail_path = data.thumbnail_path;
    this.duration = data.duration;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.views_count = data.views_count;
    this.likes_count = data.likes_count;
    this.dislikes_count = data.dislikes_count;
    this.comments_count = data.comments_count;
    this.is_public = data.is_public;
    this.date_uploaded = data.date_uploaded;
    this.date_updated = data.date_updated;
  }

  static async create(videoData) {
    try {
      const result = await pool.query(
        `INSERT INTO videos (user_id, title, description, filename, original_name, 
         file_path, thumbnail_path, duration, file_size, mime_type, is_public) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [
          videoData.user_id, videoData.title, videoData.description,
          videoData.filename, videoData.original_name, videoData.file_path,
          videoData.thumbnail_path, videoData.duration, videoData.file_size,
          videoData.mime_type, videoData.is_public
        ]
      );
      return new Video(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT v.*, u.username, u.email 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.id = $1`,
        [id]
      );
      return result.rows.length > 0 ? new Video(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM videos 
         WHERE user_id = $1 
         ORDER BY date_uploaded DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows.map(row => new Video(row));
    } catch (error) {
      throw error;
    }
  }

  static async findPublic(limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT v.*, u.username 
         FROM videos v 
         JOIN users u ON v.user_id = u.id 
         WHERE v.is_public = true 
         ORDER BY v.date_uploaded DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows.map(row => new Video(row));
    } catch (error) {
      throw error;
    }
  }

  async incrementViews() {
    try {
      await pool.query(
        'UPDATE videos SET views_count = views_count + 1 WHERE id = $1',
        [this.id]
      );
      this.views_count++;
    } catch (error) {
      throw error;
    }
  }

  async updateLikesCount() {
    try {
      const result = await pool.query(
        `UPDATE videos SET 
         likes_count = (SELECT COUNT(*) FROM video_likes WHERE video_id = $1 AND is_like = true),
         dislikes_count = (SELECT COUNT(*) FROM video_likes WHERE video_id = $1 AND is_like = false)
         WHERE id = $1 RETURNING likes_count, dislikes_count`,
        [this.id]
      );
      this.likes_count = result.rows[0].likes_count;
      this.dislikes_count = result.rows[0].dislikes_count;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      description: this.description,
      filename: this.filename,
      original_name: this.original_name,
      file_path: this.file_path,
      thumbnail_path: this.thumbnail_path,
      duration: this.duration,
      file_size: this.file_size,
      mime_type: this.mime_type,
      views_count: this.views_count,
      likes_count: this.likes_count,
      dislikes_count: this.dislikes_count,
      comments_count: this.comments_count,
      is_public: this.is_public,
      date_uploaded: this.date_uploaded,
      username: this.username
    };
  }
}

module.exports = Video;