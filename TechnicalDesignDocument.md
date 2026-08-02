# Technical Design Document

# Tic Tac Toe Full Stack Application

**Author:** Atul Singh Jamwal

**Technology Stack:** ASP.NET Core Web API + Angular

**Version:** 1.0

---

# 1. Overview

## Purpose

This document describes the technical architecture, design decisions, and implementation details for the Tic Tac Toe application developed as part of the ABB Full Stack Technical Assessment.

The objective of the application is to provide a browser-based Tic Tac Toe game where the backend owns all game rules and state while the Angular frontend acts as the presentation layer.

---

# 2. Objectives

The solution aims to:

* Build a responsive Angular frontend.
* Implement a RESTful ASP.NET Core backend.
* Keep the backend as the single source of truth.
* Support Two Player mode.
* Support Computer mode.
* Maintain game history.
* Support Undo functionality.
* Maintain a session scoreboard.
* Provide a clean and maintainable architecture.

---

# 3. High Level Architecture

```
+-----------------------+
|    Angular Frontend   |
|-----------------------|
| Components            |
| Pages                 |
| Services              |
| Models                |
+----------+------------+
           |
           | HTTP REST
           |
+----------v------------+
| ASP.NET Core Web API  |
|-----------------------|
| Controllers           |
| Services              |
| Game Engine           |
| Scoreboard Service    |
| Validation            |
+----------+------------+
           |
           |
     In-Memory Storage
```

The frontend communicates exclusively through REST APIs.

The backend is responsible for:

* Game state
* Move validation
* Computer AI
* Win detection
* Draw detection
* Undo logic
* Scoreboard

---

# 4. System Components

## Frontend

### Game Page

Responsible for:

* Initializing the game
* Displaying board
* Displaying game status
* Calling backend APIs

---

### Board Component

Responsible for:

* Rendering the 3×3 board
* Handling user interaction
* Passing selected cell information to the service

---

### Cell Component

Responsible for:

* Displaying X or O
* Handling click events
* Displaying winning cell highlight

---

### Status Component

Displays

* Current player
* Winner
* Draw
* Selected game mode

---

### Game Service

Responsible for

* Calling backend APIs
* Maintaining current game state
* Exposing Observables to the UI

---

# 5. Backend Components

## Game Controller

Exposes REST endpoints for

* New Game
* Make Move
* Undo
* Reset Game
* Retrieve Game State

---

## Scoreboard Controller

Responsible for

* Retrieving scoreboard
* Resetting scoreboard

---

## Game Service

Contains business logic for

* Move validation
* Turn switching
* Win detection
* Draw detection
* Reset
* Undo

---

## Computer AI

The AI evaluates moves using the following priority:

1. Winning move
2. Block opponent
3. Center
4. Corner
5. First available position

The algorithm intentionally remains simple as specified in the assignment.

---

# 6. Data Flow

## Creating a New Game

```
User
 |
 | Start Game
 |
Angular
 |
POST /api/games
 |
Backend
 |
Create Game State
 |
Return Game
 |
Angular renders board
```

---

## Making a Move

```
User Click

↓

Angular

↓

POST /games/{id}/moves

↓

Backend Validation

↓

Update Board

↓

Check Winner

↓

Update Scoreboard

↓

Return Latest Game State

↓

Angular Refreshes UI
```

---

## Undo Flow

```
Undo Button

↓

Angular

↓

POST /undo

↓

Backend Restores Previous State

↓

Return Updated Game

↓

UI Refresh
```

---

# 7. Game State Model

Each game maintains:

* Game Id
* Board
* Current Player
* Game Status
* Winner
* Winning Combination
* Move History
* Game Mode

---

# 8. Scoreboard Model

The scoreboard maintains:

```
X Wins

O Wins

Draws
```

The scoreboard exists independently of any single game and persists for the lifetime of the application.

---

# 9. API Design

## Game Endpoints

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| POST   | /api/games            | Create Game      |
| GET    | /api/games/{id}       | Get Current Game |
| POST   | /api/games/{id}/moves | Submit Move      |
| POST   | /api/games/{id}/undo  | Undo             |
| POST   | /api/games/{id}/reset | Reset Game       |

---

## Scoreboard Endpoints

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | /api/scoreboard       | Get Scoreboard   |
| POST   | /api/scoreboard/reset | Reset Scoreboard |

---

# 10. Design Decisions

## Backend Owns Game State

The backend validates every move before updating the game state.

Advantages:

* Single source of truth
* Prevents client-side manipulation
* Easier testing
* Easier future multiplayer support

---

## REST API

REST was selected because:

* Matches assignment requirements.
* Simple frontend integration.
* Stateless communication.

---

## In-Memory Storage

Chosen because:

* Required persistence was session-level only.
* No external database dependency.
* Easy to replace with SQLite or SQL Server later.

---

## Standalone Angular Components

Angular Standalone Components reduce module complexity while improving maintainability and scalability.

---

# 11. Validation Rules

Backend validates:

* Game exists.
* Correct player's turn.
* Cell is within board.
* Cell is empty.
* Game is not already completed.

Invalid requests are rejected before modifying state.

---

# 12. Testing Strategy

## Backend

Unit tests verify:

* Valid move
* Invalid move
* Turn switching
* Win detection
* Draw detection
* Undo
* Scoreboard updates
* Computer AI
* Reset

---

## Frontend

Component and service tests verify:

* Board rendering
* Cell interactions
* API integration
* UI updates
* Status display

---

# 13. Performance Considerations

The application has very low computational complexity.

Operations such as:

* Win detection
* Draw detection
* Undo

operate in constant time due to the fixed 3×3 board size.

Memory usage is minimal since only the active session is stored.

---

# 14. Security Considerations

Although authentication is outside the assignment scope, the backend validates all game operations.

Business rules are never trusted to the client.

This architecture allows authentication and authorization to be introduced later without changing the frontend.

---

# 15. Assumptions

* Single active game session.
* Session-level scoreboard.
* Backend restarts clear application state.
* Human player is always X in Computer mode.

---

# 16. Limitations

* In-memory persistence only.
* Basic AI strategy.
* No multiplayer networking.
* No authentication.
* No persistent storage.

---

# 17. Future Enhancements

Potential improvements include:

* SQLite/SQL Server persistence.
* Minimax-based AI.
* SignalR multiplayer.
* Docker deployment.
* Swagger/OpenAPI documentation.
* Azure deployment.
* CI/CD pipeline.
* Application logging.
* Game replay functionality.

---

# 18. Conclusion

The solution follows a layered architecture with a clear separation between presentation and business logic.

The backend owns all game rules and state transitions, while the Angular frontend focuses on rendering the latest state returned by the REST API.

The design prioritizes maintainability, testability, and adherence to the requirements defined in the assessment while leaving room for future enhancements.
