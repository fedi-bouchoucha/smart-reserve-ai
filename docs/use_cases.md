# Use Case Diagrams for AI Features

This document provides visual representations of the use cases for the three core AI engines of the Smart Office Reservation System.

## 1. ✨ AI Smart Suggest
*Intelligent workspace recommendation engine.*

### Mermaid Version
```mermaid
useCaseDiagram
    actor Employee
    actor "System / LLM" as Sys

    Employee --> (Request Desk Recommendation)
    Employee --> (Set Preferences: Floor, Zone, Equipment)
    Employee --> (Book Suggested Desk)
    
    (Request Desk Recommendation) ..> (Analyze User Preferences) : include
    (Request Desk Recommendation) ..> (Check Team Proximity) : include
    (Request Desk Recommendation) ..> (Analyze Historical Behavior) : include
    
    Sys --> (Analyze User Preferences)
    Sys --> (Check Team Proximity)
    Sys --> (Analyze Historical Behavior)
    Sys --> (Optimize Resource Utilization)
```

### PlantUML Version
```plantuml
@startuml
left to right direction
actor "Employee" as emp
actor "System / LLM" as sys

rectangle "AI Smart Suggest" {
  usecase "Request Desk Recommendation" as UC1
  usecase "Set Preferences" as UC2
  usecase "Book Suggested Desk" as UC3
  usecase "Analyze User Preferences" as UC4
  usecase "Check Team Proximity" as UC5
  usecase "Analyze Historical Behavior" as UC6
  usecase "Optimize Resource Utilization" as UC7
}

emp --> UC1
emp --> UC2
emp --> UC3

UC1 ..> UC4 : <<include>>
UC1 ..> UC5 : <<include>>
UC1 ..> UC6 : <<include>>

sys --> UC4
sys --> UC5
sys --> UC6
sys --> UC7
@enduml
```

---

## 2. 🛡️ Cybersecurity Anomaly Detection
*Real-time AI security engine for threat detection.*

### Mermaid Version
```mermaid
useCaseDiagram
    actor Employee
    actor "Security Engine" as Engine
    actor "Admin / SOC" as Admin

    Employee --> (Login & Perform Actions)
    
    (Login & Perform Actions) ..> (Log User Activity) : include
    (Log User Activity) ..> (Analyze for Anomalies) : include
    
    Engine --> (Analyze for Anomalies)
    Engine --> (Calculate Risk Score)
    Engine --> (Execute Automated Mitigation)
    
    (Analyze for Anomalies) <|-- (Detect Location Jump)
    (Analyze for Anomalies) <|-- (Detect Bot Traffic)
    (Analyze for Anomalies) <|-- (Detect Booking Abuse)
    
    (Execute Automated Mitigation) ..> (Request Extra Verification) : extend
    (Execute Automated Mitigation) ..> (Block Malicious Session) : extend
    
    Admin --> (Monitor Security Dashboard)
    Admin --> (Review Anomalous Logs)
    Admin --> (Manual Risk Override)
```

### PlantUML Version
```plantuml
@startuml
left to right direction
actor "Employee" as emp
actor "Security Admin" as admin
actor "Security Engine" as eng

rectangle "Cybersecurity Anomaly Detection" {
  usecase "Login & Perform Actions" as UC1
  usecase "Log User Activity" as UC2
  usecase "Analyze for Anomalies" as UC3
  usecase "Calculate Risk Score" as UC4
  usecase "Execute Automated Mitigation" as UC5
  usecase "Monitor Security Dashboard" as UC11
  usecase "Review Anomalous Logs" as UC12
}

emp --> UC1
UC1 ..> UC2 : <<include>>
UC2 ..> UC3 : <<include>>

eng --> UC3
eng --> UC4
eng --> UC5

admin --> UC11
admin --> UC12
@enduml
```

---

## 3. 📊 Performance AI
*AI-driven employee engagement and analytics.*

### Mermaid Version
```mermaid
useCaseDiagram
    actor Employee
    actor Manager
    actor Admin
    actor "Performance Engine" as Sys

    Employee --> (View Personal Score & Tier)
    Employee --> (Track Own Trajectory)
    
    Manager --> (View Team Performance Report)
    Manager --> (Identify Top Performers)
    Manager --> (Identify Employees Needing Support)
    Manager --> (Read Automated AI Insights)
    
    Admin --> (Monitor Company-wide Performance)
    Admin --> (Trigger Manual Weekly Computation)
    
    Sys --> (Compute Weekly Snapshots)
    Sys --> (Analyze Trends & Outlook)
    Sys --> (Identify Positive/Negative Drivers)
    Sys --> (Generate Natural Language Summary)
    
    (Compute Weekly Snapshots) ..> (Analyze Booking Consistency) : include
    (Compute Weekly Snapshots) ..> (Calculate Planning Score) : include
    (Compute Weekly Snapshots) ..> (Evaluate Cancellation Rate) : include
```

### PlantUML Version
```plantuml
@startuml
left to right direction
actor "Admin" as admin
actor "Performance Engine" as sys

rectangle "Performance AI (Admin Only)" {
  usecase "View Global Performance Overview" as UC1
  usecase "View Specific Employee Report" as UC2
  usecase "Compare Team Results" as UC3
  usecase "Trigger Manual Weekly Computation" as UC4
  usecase "Compute Weekly Snapshots" as UC9
  usecase "Analyze Trends & Drivers" as UC10
  usecase "Generate AI Insights" as UC12
}

admin --> UC1
admin --> UC2
admin --> UC3
admin --> UC4

sys --> UC9
sys --> UC10
sys --> UC12
@enduml
```
