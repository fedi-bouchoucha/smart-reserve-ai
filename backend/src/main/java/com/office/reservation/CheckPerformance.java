package com.office.reservation;

import java.sql.*;

public class CheckPerformance {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/smart_office_db";
        String user = "postgres";
        String password = "trytoguessit12345";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM performance_snapshots");
            if (rs.next()) {
                System.out.println("Total real snapshots in DB: " + rs.getInt(1));
            }
            
            rs = stmt.executeQuery("SELECT u.username, s.score, s.week_start FROM performance_snapshots s JOIN users u ON s.user_id = u.id LIMIT 10");
            System.out.println("\nSample snapshots:");
            while (rs.next()) {
                System.out.println(rs.getString("username") + " | Score: " + rs.getDouble("score") + " | Week: " + rs.getDate("week_start"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
