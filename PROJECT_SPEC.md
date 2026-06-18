# MatchUp MVP Specification

## Product

A futsal matchmaking platform for Myanmar.

The platform helps players organize 5v5 futsal games by allowing users to create and join matches.

---

## User Roles

### User

Can:

* Register
* Login
* Create match
* Join match
* Chat in joined matches

### Host

The user who creates a match.

Additional permissions:

* Manage attendance
* Update match status

---

## Core Entities

### User

Fields:

* id
* name
* email
* password_hash
* created_at

### Match

Fields:

* id
* host_id
* title
* location
* match_date
* status
* max_players
* created_at

Status:

* OPEN
* FULL
* ONGOING
* COMPLETED

### MatchPlayer

Fields:

* id
* match_id
* user_id
* attendance_status
* joined_at

Attendance Status:

* JOINED
* PRESENT
* ABSENT

### Message

Fields:

* id
* match_id
* user_id
* content
* created_at

---

## Business Rules

### Match Creation

* Match creator becomes host
* Default max_players = 10

### Joining Match

* User cannot join twice
* Match cannot exceed 10 players
* Joining must be transaction-safe

### Match Full

When player count reaches 10:

* status becomes FULL
* no further joins allowed

### Chat

* Only joined players can access chat
* Messages belong to a specific match

### Attendance

* Host can mark attendance
* Attendance can only be updated after match start time

---

## Non-Functional Requirements

* Responsive web application
* JWT authentication
* PostgreSQL database
* REST API
* Real-time chat via WebSocket
* Clean architecture
* Input validation
* Proper authorization checks

---

## Recommended Tech Stack

Frontend:

* React
* TypeScript
* TailwindCSS

Backend:

* Node.js
* Express
* TypeScript
* Prisma ORM

Database:

* PostgreSQL

Realtime:

* Socket.IO

Authentication:

* JWT

---

## MVP Success Criteria

A complete flow should work:

1. User registers
2. User creates a match
3. Nine additional users join
4. Match becomes FULL
5. Players chat before the game
6. Host records attendance
7. Match is completed
