cat > models/User.js << 'EOF'
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.photo = data.photo;
    this.date_creation = data.date_creation;
    this.google_id = data.google_id;
  }

  static async create({ email, username, password }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await pool.query(
        `INSERT INTO users (email, username, password, date_creation) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING id, email, username, photo, date_creation`,
        [email, username, hashedPassword]
      );

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      photo: this.photo,
      date_creation: this.date_creation
    };
  }
}

module.exports = User;
EOF