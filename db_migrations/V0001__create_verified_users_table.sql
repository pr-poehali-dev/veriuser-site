-- Create verified_users table for storing verified accounts
CREATE TABLE IF NOT EXISTS verified_users (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    social_networks JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(100) DEFAULT 'active',
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by unique_id
CREATE INDEX idx_verified_users_unique_id ON verified_users(unique_id);

-- Create index for faster lookups by status
CREATE INDEX idx_verified_users_status ON verified_users(status);

-- Create index for faster lookups by category
CREATE INDEX idx_verified_users_category ON verified_users(category);