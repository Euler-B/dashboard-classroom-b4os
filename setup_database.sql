-- Supabase Database Setup for GitHub Classroom Grades
-- Run this SQL in your Supabase SQL Editor
-- Database: b4os-alumni-results
-- Password: alumni-b4os

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    github_username TEXT PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    points_available INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    github_username TEXT REFERENCES students(github_username) ON DELETE CASCADE,
    assignment_name TEXT REFERENCES assignments(name) ON DELETE CASCADE,
    points_awarded INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(github_username, assignment_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_username ON grades(github_username);
CREATE INDEX IF NOT EXISTS idx_grades_assignment ON grades(assignment_name);
CREATE INDEX IF NOT EXISTS idx_assignments_name ON assignments(name);

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your needs)
-- These policies allow all operations for authenticated users
-- You may want to restrict this based on your requirements

CREATE POLICY "Allow all operations on students" ON students
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on assignments" ON assignments
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on grades" ON grades
    FOR ALL USING (true);

-- Create a view for consolidated grades (optional)
CREATE OR REPLACE VIEW consolidated_grades AS
SELECT 
    s.github_username,
    a.name as assignment_name,
    g.points_awarded,
    a.points_available,
    ROUND((g.points_awarded::NUMERIC / NULLIF(a.points_available, 0)) * 100, 2) as percentage,
    g.updated_at as grade_updated_at
FROM students s
JOIN grades g ON s.github_username = g.github_username
JOIN assignments a ON g.assignment_name = a.name
ORDER BY s.github_username, a.name;

-- Create a function to get student summary (optional)
CREATE OR REPLACE FUNCTION get_student_summary(p_username TEXT)
RETURNS TABLE (
    github_username TEXT,
    total_assignments INTEGER,
    total_points_awarded BIGINT,
    total_points_available BIGINT,
    average_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.github_username,
        COUNT(g.id)::INTEGER as total_assignments,
        COALESCE(SUM(g.points_awarded), 0) as total_points_awarded,
        COALESCE(SUM(a.points_available), 0) as total_points_available,
        ROUND(
            CASE 
                WHEN SUM(a.points_available) > 0 
                THEN (SUM(g.points_awarded)::NUMERIC / SUM(a.points_available)) * 100 
                ELSE 0 
            END, 2
        ) as average_percentage
    FROM students s
    LEFT JOIN grades g ON s.github_username = g.github_username
    LEFT JOIN assignments a ON g.assignment_name = a.name
    WHERE s.github_username = p_username
    GROUP BY s.github_username;
END;
$$ LANGUAGE plpgsql;