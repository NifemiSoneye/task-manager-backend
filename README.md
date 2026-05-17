# TaskFlow — Backend

RESTful API for the TaskFlow kanban task management application. Built with Node.js, Express, and MongoDB.

**Live API:** https://task-manager-backend-o7j9.onrender.com
**Frontend Repo:** https://github.com/NifemiSoneye/task-manager-frontend

---

## Features

- JWT authentication with refresh token rotation and multi-session support (max 2 sessions)
- Refresh token reuse detection — invalidates all sessions on suspected token theft
- Rate limiting on auth routes (5 requests per minute per IP)
- Cascade delete — deleting a board deletes all its tasks
- Server-side pagination and search for boards
- Task ordering with `order` field
- Request logging with custom logger middleware
- Input sanitisation and CORS protection

---

## Tech Stack

- **Node.js** with **Express**
- **TypeScript** (CommonJS)
- **MongoDB** with **Mongoose**
- **JWT** (jsonwebtoken) for access and refresh tokens
- **bcrypt** for password hashing
- **express-rate-limit** for rate limiting
- **cookie-parser** for httpOnly cookie handling

---

## API Routes

### Auth — `/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive access + refresh token |
| GET | `/auth/refresh` | Refresh access token using httpOnly cookie |
| POST | `/auth/logout` | Logout and clear refresh token |

### Boards — `/boards` (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards` | Get all boards (paginated, searchable, filterable by favourite) |
| POST | `/boards` | Create a new board |
| GET | `/boards/:id` | Get a single board |
| PATCH | `/boards/:id` | Update a board |
| DELETE | `/boards/:id` | Delete a board (cascades to tasks) |

### Tasks — `/tasks` (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards/:boardId/tasks` | Get all tasks for a board |
| POST | `/boards/:boardId/tasks` | Create a task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

### Analytics — `/analytics` (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Get total boards, tasks done, in progress, to do |

---

## Data Models

### User
```typescript
{
  username: String,
  email: String (unique),
  password: String (bcrypt hashed),
  refreshToken: [String]
}
```

### Board
```typescript
{
  title: String,
  user: ObjectId (ref: User),
  favourite: Boolean (default: false),
  timestamps: true
}
```

### Task
```typescript
{
  title: String,
  description: String,
  priority: enum ['low', 'medium', 'high'] (default: 'medium'),
  dueDate: Date,
  status: enum ['todo', 'inprogress', 'done'] (default: 'todo'),
  order: Number,
  board: ObjectId (ref: Board),
  timestamps: true
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (standard URI — SRV DNS not required)

### Installation

```bash
git clone https://github.com/NifemiSoneye/task-manager-backend
cd task-manager-backend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
MONGODB_URI=mongodb://your-mongodb-uri
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
NODE_ENV=development
PORT=3500
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

---

## Key Implementation Details

**Refresh Token Rotation** — Every token refresh issues a new refresh token and invalidates the old one. Up to 2 concurrent sessions supported per user. If a refresh token is reused (already rotated), all sessions are immediately invalidated to prevent token theft.

**Cascade Delete** — When a board is deleted, all associated tasks are deleted first via `Task.deleteMany({ board: id })` before the board document is removed.

**Pagination + Search** — `getAllBoards` accepts `page`, `limit`, `search`, and `favourite` query params. Search uses a case-insensitive MongoDB `$regex` filter. Pagination metadata (`totalPages`, `currentPage`, `totalBoards`) is returned alongside the data.

**Rate Limiting** — Auth routes (login and register) are limited to 5 requests per minute per IP using `express-rate-limit`. Violations are logged to `errLog.log`.

---

## Deployment

Deployed on **Render** as a Web Service.

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment:** Set all `.env` variables in Render's dashboard
