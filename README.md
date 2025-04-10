# Bowling Score Tracker

## Overview

The **Bowling Score Tracker** is a web application designed to help multiple players track their bowling scores across 10 frames. It adheres to standard bowling rules, including strikes, spares, and special 10th frame logic (e.g., third roll for strikes or spares). Players can start a new game, input their rolls, view a live scoreboard, and see the final results with winners highlighted.

### Features
- **Multi-Player Support:** Supports 2 to 5 players per game.
- **Bowling Rules:** Handles strikes, spares, and open frames, with special logic for the 10th frame.
- **Live Scoreboard:** Displays current scores for each player, updated after each frame.
- **Winner Display:** Highlights all players with the highest score as winners at the end of the game.
- **Input Validation:** Ensures valid roll inputs and prevents invalid submissions.
- **User-Friendly UI:** Built with React and styled with Tailwind CSS for a clean, responsive interface.
- **Environment Configuration:** Uses environment variables for easy configuration in different environments (development, production).

### Sequence Diagram

```mermaid

sequenceDiagram
    actor User
    participant FE as Frontend
    participant BE as Backend
    participant IMS as In-Memory Storage

    %% Start a New Game
    note right of User: At least 2 players (up to 5) must enter their names to start the game
    User->>FE: Enters player names and clicks "Start Game"
    note right of FE: Frontend collects player names (2-5 players) and sends them to the backend to start a new game
    FE->>BE: POST /api/game/start | {players: [{playerId, name}, ...]}
    note right of BE: Backend validates the request (2-5 players) and creates a new game with a unique gameId
    BE->>IMS: Create new game | {gameId, players}
    note right of IMS: In-Memory Storage saves the game state with the gameId and player data
    IMS-->>BE: Game created
    BE-->>FE: {gameId, players}
    note right of FE: Frontend receives the gameId and players, updates its state (useGameStore), and navigates to the /game page
    FE->>FE: Update state (gameId, players) | Navigate to /game

    %% Play 10 Frames
    loop 10 frames
        User->>FE: Selects rolls and clicks "Submit Scores"
        note right of FE: Frontend collects rolls for each player in the current frame and sends them to the backend
        FE->>BE: POST /api/game/:gameId/frame/:frameNumber/scores | {rolls: [{playerId, rolls}, ...]}
        note right of BE: Backend validates the rolls, updates the game state by adding the rolls to the players' frames
        BE->>IMS: Update game state | Add rolls to players' frames
        note right of IMS: In-Memory Storage updates the game state with the new rolls for the current frame
        IMS-->>BE: Game state updated
        BE-->>FE: {success: true}
        note right of FE: Frontend receives the success response, indicating the scores were saved

        %% Fetch Scoreboard After Each Frame
        note right of FE: Frontend fetches the updated scoreboard to display the current scores
        FE->>BE: GET /api/game/:gameId/scoreboard
        note right of BE: Backend retrieves the game state to calculate the current scoreboard
        BE->>IMS: Retrieve game state
        IMS-->>BE: Game state
        BE->>BE: Calculate scoreboard
        note right of BE: Backend calculates the cumulative scores for each player based on the game state
        BE-->>FE: {scoreboard: [...]}
        note right of FE: Frontend receives the scoreboard and updates the UI to show the current scores
        FE->>FE: Update UI with scoreboard
    end

    %% Navigate to Results
    note right of FE: After the 10th frame, Frontend navigates to the /results page to show the final results
    FE->>FE: Navigate to /results
    note right of FE: Frontend fetches the final scoreboard to display the game results
    FE->>BE: GET /api/game/:gameId/scoreboard
    note right of BE: Backend retrieves the game state to calculate the final scoreboard
    BE->>IMS: Retrieve game state
    IMS-->>BE: Game state
    BE->>BE: Calculate final scoreboard
    note right of BE: Backend calculates the final scores, including any bonuses for strikes/spares in the 10th frame
    BE-->>FE: {scoreboard: [...]}
    note right of FE: Frontend receives the final scoreboard and displays the results, including winners
    FE->>FE: Display final results

```

## Tech Stack
- **Monorepo Tool:** Turbo, Yarn
- **Frontend:** React, TypeScript, Rsbuild, Tailwind CSS, Shadcn UI, Zustand (state management)
- **Backend:** Node.js, Express, TypeScript, In-Memory Storage
- **Containerization:** Docker
- **CI:** Github Actions
- **Deployment:** Docker, Nginx, AWS EKS(PENDING), AWS S3(PENDING), AWS Cloudfront(PENDING)

## Prerequisites
Before setting up the project, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **yarn**
- **Git**

## Setup Instructions
### 1. Clone the Repository
```bash
git clone https://github.com/your-username/bowling-score-tracker.git
cd bowling-score-tracker
```

### 2. Backend Setup

```env
# generate backend/.env
FRONTEND_URL=http://localhost:3000
PORT=8080
```

### 3. Frontend Setup
```env
# generate frontend/.env
API_URL=http://localhost:8080
```

### Install dependencies
```sh
yarn install
```

### Start Up (For development)
```sh
yarn turbo dev
```

### Start up with Docker

This repo is configured to be built with Docker, and Docker compose. To build all apps in this repo:

```sh
# Spin up with docker containers
sh scripts/docker-up.sh

```

Open http://localhost:3000.

To shutdown all running containers:

```sh
# Stop all running containers
sh scripts/docker-down.sh
```

# Deployment Strategy(High-Level)
## Option 1 CI/CD (DevSecOps), S3, CloudFront, and Related Technologies
![alt text](./screenshots/image-1.png)
### Flow
1. Code is committed to the Git Repository.

2. The CI/CD Pipeline builds the application, runs tests, and performs security scans (Static Application Security Testing - SAST, Software Composition Analysis - SCA).

3. Artifacts are deployed to Amazon S3.

4. Amazon CloudFront distributes the content to End Users.

5. For dynamic content, requests go through API Gateway to AWS Lambda.

6. Amazon CloudWatch monitors performance and health.

7. AWS WAF and IAM enforce security.

### Key Benefits

**Scalability:**
- S3 automatically scales storage capacity.
- CloudFront caches content at edge locations to handle traffic spikes.

**Reliability:**
- S3 provides 99.999999999% durability.
- CloudFront’s global network ensures high availability.

**Security:**
- AWS WAF protects against web threats.
- IAM roles enforce least-privilege access.
- Encryption secures data at rest (S3) and in transit (CloudFront).

## Option 2 CI/CD (DevSecOps), EKS, Nginx LoadBalancer, Akamai CDN

![alt text](./screenshots/image.png)

### Flow

1. Git Repository: Source code storage.
2. CI/CD Pipeline (DevSecOps): Automates build, test, and deployment with security scans.
3. Amazon ECR: Stores container images.
4. Amazon EKS: Managed Kubernetes for running containers.
5. Nginx Ingress Controller: Manages internal traffic, works as a sidecar in pod along with frontend static files.
6. Akamai CDN: Global CDN with advanced security features.
7. Monitoring: Prometheus and Grafana for observability.
8. Security: Kubernetes RBAC, network policies, Akamai WAF.

### Key Benefits

**Scalability:**
- EKS autoscales pods and nodes based on demand.
- Akamai’s global network handles traffic efficiently.

**Reliability:**
- EKS’s managed control plane ensures uptime.
- Akamai’s redundancy minimizes downtime.

**Security:**
- Kubernetes RBAC and network policies secure the cluster.
- Akamai provides DDoS protection and WAF capabilities.

## Comparison and Recommendations
- Option 1 (S3 + CloudFront):
  - Best for static or serverless applications.
  - Simpler to manage, cost-effective, and quick to deploy.
- Option 2 (EKS + Akamai):
  - Ideal for dynamic, containerized workloads.
  - Offers greater control and flexibility but with increased complexity.

# Records 
## Build spin up with docker with success
```
 sh scripts/docker-up.sh
```
![alt text](./screenshots/image-5.png)

#### Container is running
![alt text](./screenshots/image-3.png)

#### Demo (Happy Case)

https://github.com/user-attachments/assets/83cab59e-fd3d-43de-84ba-569b9aa6e220

# TODO

- [ ] Integrating Persistent Database (NoSQL)
- [ ] Update Code Coverage > 80, cover all important scenarios 
- [ ] Implement DevSecOps pipelines(CI and CD) that make the system scalable, reliable and secure

# Note and Warning

**I leverage the development speed by using AI tool. 
I am aware that I cannot depend on it, but recklessly validate its suggestion by critical thinking and analysis and my own experience.**    
