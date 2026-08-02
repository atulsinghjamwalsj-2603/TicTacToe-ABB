# Tic Tac Toe – Full Stack Coding Assignment

## Project Overview

This project is a full-stack implementation of the classic **Tic Tac Toe** game built as part of the ABB technical assessment.

The solution consists of:

* **Angular** frontend
* **ASP.NET Core Web API** backend
* RESTful communication between frontend and backend
* Backend-managed game state
* Session-level scoreboard
* Move history
* Undo functionality
* Two Player and Computer game modes
* Comprehensive unit tests

The backend is the single source of truth for the game state, while the Angular application is responsible for rendering the UI and interacting with the backend through REST APIs.

---

# Tech Stack

## Frontend

* Angular
* TypeScript
* RxJS
* Angular Standalone Components
* Angular HttpClient
* Vitest
* Angular Testing Utilities

## Backend

* ASP.NET Core Web API
* C#
* REST API
* In-Memory Storage
* xUnit
* FluentAssertions

---

# Features Implemented

## Core Game

✔ 3 × 3 Tic Tac Toe board

✔ Two Player Mode

✔ Play Against Computer

✔ Current player indicator

✔ Valid move validation

✔ Invalid move protection

✔ Win detection

* Rows
* Columns
* Diagonals

✔ Draw detection

✔ Winning cell highlighting

---

## Move History

Displays:

* Move Number
* Player
* Board Position

Move history updates after every valid move.

---

## Undo

Supports undo behaviour according to game mode.

### Two Player Mode

Removes only the latest move.

### Computer Mode

Removes both:

* Computer move
* Previous player move

This restores the previous game state correctly.

---

## Scoreboard

Session-level scoreboard tracks:

* X Wins
* O Wins
* Draws

Separate **Reset Scoreboard** functionality is implemented.

---

## Reset Game

Reset Game:

* Clears board
* Clears move history
* Clears winner state
* Restores Player X turn
* Keeps scoreboard unchanged

---

## Computer AI

Computer follows the required priority:

1. Winning move
2. Block opponent winning move
3. Take center
4. Take corner
5. Take first available cell

---

# Architecture

The project follows a layered architecture.

Frontend

* Components
* Pages
* Services
* Models

Backend

* Controllers
* Services
* Domain Models
* Game Engine
* Scoreboard Service

The backend owns:

* Board state
* Move validation
* Win detection
* Draw detection
* Scoreboard
* Undo logic

The frontend renders the state returned by the API.

---

# API Summary

The application exposes REST endpoints similar to:

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | /api/games            | Create a new game |
| GET    | /api/games/{id}       | Get current game  |
| POST   | /api/games/{id}/moves | Submit move       |
| POST   | /api/games/{id}/undo  | Undo last move    |
| POST   | /api/games/{id}/reset | Reset game        |
| GET    | /api/scoreboard       | Get scoreboard    |
| POST   | /api/scoreboard/reset | Reset scoreboard  |

---

# Running the Backend

Navigate to the backend project.

```bash
dotnet restore
dotnet build
dotnet run
```

The API starts on the configured local URL.

---

# Running the Frontend

Navigate to the Angular application. in game.ts make sure the API url is correct(private readonly apiUrl = 'http://localhost:5273/api';)

```bash
npm install

ng serve
```

Open

```
http://localhost:4200
```

---

# Running Tests

## Backend

```bash
dotnet test
```

## Frontend

```bash
ng test
```

---

# Testing Coverage

The solution includes tests covering the core game behaviour.

Examples include:

* Valid move
* Invalid move
* Turn switching
* Row win
* Column win
* Diagonal win
* Draw
* Reset game
* Undo
* Scoreboard
* Computer AI
* Component rendering
* Service behaviour

---

# Design Decisions

### Backend as Source of Truth

All game rules are implemented in the backend.

The frontend never calculates winners or validates moves independently.

---

### Stateless REST Communication

Each UI action results in a REST API request.

The frontend refreshes its state using the backend response.

---

### Standalone Angular Components

Angular standalone components were used to reduce module complexity and improve maintainability.

---

### In-Memory Storage

The assessment requirements allow in-memory storage.

This keeps the implementation lightweight while allowing easy replacement with a persistent database.

---

# Assumptions

* Only one active game session is required.
* The scoreboard is maintained for the lifetime of the application.
* Backend state is reset when the application restarts.
* Human player is always **X** in Computer Mode.

---

# Undo Behaviour

This implementation follows:

**Option A — Disable Undo After Game Completion**

Once a game has been won or drawn, Undo is disabled to ensure the scoreboard remains consistent.

---

# Known Limitations

* In-memory storage only
* No authentication or authorization
* No multiplayer over network
* No persistent scoreboard after application restart
* Basic computer AI (as required by the assignment)

---

# Future Improvements

Possible future enhancements include:

* SQLite or SQL Server persistence
* SignalR real-time multiplayer
* Online matchmaking
* AI using Minimax algorithm
* Game replay functionality
* Docker support
* CI/CD pipeline
* OpenAPI / Swagger documentation
* Application logging
* Responsive mobile optimization

---

# AI Usage

AI tools were used to assist with:

* Requirement interpretation
* Code scaffolding
* Unit test generation
* Refactoring suggestions
* Documentation improvements

All generated code was manually reviewed, modified, tested, and integrated. Final implementation decisions, debugging, architecture, and validation were completed manually.

---

# Repository Structure

```
/
├── Backend
├── tic-tac-toe-ui
├── README.md
```

---

# Assignment Compliance

This solution satisfies the required functionality described in the assessment, including:

* Game creation
* Two Player Mode
* Computer Mode
* Move validation
* Win detection
* Draw detection
* Move history
* Undo
* Scoreboard
* Reset Game
* Reset Scoreboard
* REST API communication
* Unit testing

---

Thank you for reviewing this submission.
