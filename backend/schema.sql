-- Database Creation Script for Smart Office Reservation System
-- Compatible with PostgreSQL

-- 1. Clean up existing tables (Optional - Be careful in production)
DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS chairs;
DROP TABLE IF EXISTS emplacements;
DROP TABLE IF EXISTS meeting_rooms;
DROP TABLE IF EXISTS users;

-- 2. Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'EMPLOYEE', 'MANAGER', 'ADMIN'
    manager_id BIGINT,
    CONSTRAINT fk_user_manager FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- 3. Create Emplacements Table
CREATE TABLE emplacements (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    floor INTEGER
);

-- 4. Create Chairs Table
CREATE TABLE chairs (
    id BIGSERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    emplacement_id BIGINT NOT NULL,
    CONSTRAINT fk_chair_emplacement FOREIGN KEY (emplacement_id) REFERENCES emplacements(id)
);

-- 5. Create Meeting Rooms Table
CREATE TABLE meeting_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INTEGER,
    floor INTEGER
);

-- 6. Create Reservations Table
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chair_id BIGINT,
    meeting_room_id BIGINT,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'CONFIRMED', 'PENDING_CHANGE', 'CANCELLED'
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reservation_chair FOREIGN KEY (chair_id) REFERENCES chairs(id),
    CONSTRAINT fk_reservation_room FOREIGN KEY (meeting_room_id) REFERENCES meeting_rooms(id),
    -- Business Rule: Either chair OR meeting room, not both (enforced by logic, but check constraint helps)
    CONSTRAINT chk_resource CHECK (
        (chair_id IS NOT NULL AND meeting_room_id IS NULL) OR 
        (chair_id IS NULL AND meeting_room_id IS NOT NULL)
    )
);

-- 7. Create Change Requests Table
CREATE TABLE change_requests (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    new_date DATE,
    new_chair_id BIGINT,
    new_meeting_room_id BIGINT,
    status VARCHAR(50) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED'
    manager_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_change_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    CONSTRAINT fk_change_user FOREIGN KEY (requested_by) REFERENCES users(id),
    CONSTRAINT fk_change_new_chair FOREIGN KEY (new_chair_id) REFERENCES chairs(id),
    CONSTRAINT fk_change_new_room FOREIGN KEY (new_meeting_room_id) REFERENCES meeting_rooms(id)
);

-- Indexes for performance
CREATE INDEX idx_reservation_date ON reservations(date);
CREATE INDEX idx_reservation_user ON reservations(user_id);
CREATE INDEX idx_user_manager ON users(manager_id);
