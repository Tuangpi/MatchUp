# MatchUp - Futsal Matchmaking Platform

## Overview

MatchUp is a futsal matchmaking platform that helps players find and join futsal matches.

The MVP focuses on a single use case:

A player wants to play futsal but does not have enough people to organize a full game.

Users can create matches, join matches, communicate with teammates, and track attendance.

---

## MVP Features

### Authentication

* Register account
* Login
* User profile

### Match Management

* Create match
* Browse available matches
* Join match
* View match details

### Match Capacity

* Maximum 10 players per match
* Automatically mark match as FULL when 10 players join
* Prevent additional joins after full

### Match Chat

* Group chat per match
* Only joined players can participate

### Attendance

* Host can mark attendance after the match
* Present / Absent tracking

---

## Match Lifecycle

OPEN
→ FULL
→ ONGOING
→ COMPLETED

---

## Primary Goal

Validate that users are willing to:

1. Create futsal matches
2. Join matches created by others
3. Fill a 10-player futsal game

Everything else is secondary.

---

## Future Features (Out of Scope)

* Court booking
* Online payments
* Team management
* Ratings and reviews
* Tournaments
* Skill balancing
* Push notifications
* Mobile app

These features should not be included in MVP v1.
