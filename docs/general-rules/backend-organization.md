# Backend Organization & Coding Patterns

## Overview

This document defines the backend architecture using **Bun** runtime, **WebSockets** for real-time communication, and **MySQL** for data persistence.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| HTTP Server | Bun.serve |
| WebSockets | Bun native WebSocket |
| Database | MySQL 8+ |
| Query Builder | Kysely (type-safe) |
| Validation | Zod |
| Auth | JWT (jose library) |

---

## Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: ROUTES / HANDLERS                                 │
│  ──────────────────────────                                 │
│  • HTTP route definitions                                   │
│  • WebSocket message handlers                               │
│  • Request validation (Zod)                                 │
│  • Response formatting                                      │
│  • Calls Services only                                      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: SERVICES                                          │
│  ─────────────────────                                      │
│  • Business logic                                           │
│  • Orchestrates repositories                                │
│  • Transaction management                                   │
│  • Calls Repositories only                                  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: REPOSITORIES                                      │
│  ─────────────────────────                                  │
│  • Database queries (Kysely)                                │
│  • One repository per entity                                │
│  • No business logic                                        │
│  • Returns typed data                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
backend/
├── src/
│   ├── index.ts                 # Entry point (Bun.serve)
│   ├── config/
│   │   ├── database.ts          # MySQL connection
│   │   ├── env.ts               # Environment variables
│   │   └── cors.ts              # CORS configuration
│   │
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── auth.routes.ts       # /api/auth/*
│   │   ├── users.routes.ts      # /api/users/*
│   │   ├── orders.routes.ts     # /api/orders/*
│   │   └── ...
│   │
│   ├── handlers/
│   │   ├── http/                # HTTP request handlers
│   │   │   ├── auth.handler.ts
│   │   │   ├── users.handler.ts
│   │   │   └── orders.handler.ts
│   │   └── ws/                  # WebSocket message handlers
│   │       ├── connection.handler.ts
│   │       ├── orders.ws.handler.ts
│   │       └── notifications.ws.handler.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── orders.service.ts
│   │   └── notifications.service.ts
│   │
│   ├── repositories/
│   │   ├── users.repository.ts
│   │   ├── orders.repository.ts
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── logging.middleware.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── users.validator.ts
│   │   └── orders.validator.ts
│   │
│   ├── websocket/
│   │   ├── server.ts            # WebSocket server setup
│   │   ├── clients.ts           # Client connection manager
│   │   ├── rooms.ts             # Room/channel management
│   │   └── broadcast.ts         # Broadcasting utilities
│   │
│   ├── database/
│   │   ├── connection.ts        # MySQL pool
│   │   ├── kysely.ts            # Kysely instance
│   │   ├── migrations/          # Database migrations
│   │   │   ├── 001_users.ts
│   │   │   ├── 002_orders.ts
│   │   │   └── ...
│   │   └── seeds/               # Development seeds
│   │       └── ...
│   │
│   ├── types/
│   │   ├── database.types.ts    # Generated DB types
│   │   ├── api.types.ts         # Request/Response types
│   │   ├── ws.types.ts          # WebSocket message types
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── response.ts          # Response helpers
│   │   ├── errors.ts            # Custom error classes
│   │   ├── logger.ts            # Logging utility
│   │   ├── jwt.ts               # JWT helpers
│   │   └── hash.ts              # Password hashing
│   │
│   └── constants/
│       ├── http.ts              # HTTP status codes
│       └── ws.ts                # WebSocket event names
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── bunfig.toml                  # Bun configuration
├── package.json
└── tsconfig.json
```

---

## Entry Point (Bun.serve)

```typescript
// src/index.ts

import { env } from './config/env';
import { router } from './routes';
import { wsServer } from './websocket/server';
import { corsHeaders } from './config/cors';
import { logger } from './utils/logger';

const server = Bun.serve({
  port: env.PORT,

  // HTTP request handling
  async fetch(req, server) {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Upgrade WebSocket connections
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { connectedAt: Date.now() },
      });
      if (upgraded) return undefined;
      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    // Route HTTP requests
    return router.handle(req);
  },

  // WebSocket handling
  websocket: wsServer,

  error(error) {
    logger.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  },
});

logger.info(`Server running at http://localhost:${server.port}`);
```

---

## Layer 1: Routes & Handlers

### Route Definition

```typescript
// src/routes/orders.routes.ts

import { Hono } from 'hono'; // or custom router
import { OrdersHandler } from '../handlers/http/orders.handler';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createOrderSchema, updateOrderSchema } from '../validators/orders.validator';

export const ordersRoutes = new Hono()
  .use('/*', authMiddleware)
  .get('/', OrdersHandler.list)
  .get('/:id', OrdersHandler.getById)
  .post('/', validateBody(createOrderSchema), OrdersHandler.create)
  .patch('/:id', validateBody(updateOrderSchema), OrdersHandler.update)
  .delete('/:id', OrdersHandler.delete);
```

### HTTP Handler

```typescript
// src/handlers/http/orders.handler.ts

import type { Context } from 'hono';
import { OrdersService } from '../../services/orders.service';
import { success, created, notFound } from '../../utils/response';
import type { CreateOrderBody, UpdateOrderBody } from '../../types/api.types';

export class OrdersHandler {
  // ✅ Handlers only: validate, call service, format response

  static async list(c: Context) {
    const userId = c.get('userId');
    const orders = await OrdersService.getByUserId(userId);
    return success(c, orders);
  }

  static async getById(c: Context) {
    const id = c.req.param('id');
    const order = await OrdersService.getById(id);

    if (!order) {
      return notFound(c, 'Order not found');
    }

    return success(c, order);
  }

  static async create(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json<CreateOrderBody>();

    const order = await OrdersService.create(userId, body);

    return created(c, order);
  }

  static async update(c: Context) {
    const id = c.req.param('id');
    const body = await c.req.json<UpdateOrderBody>();

    const order = await OrdersService.update(id, body);

    return success(c, order);
  }

  static async delete(c: Context) {
    const id = c.req.param('id');
    await OrdersService.delete(id);
    return success(c, { deleted: true });
  }
}
```

### Handler Rules

| Rule | Description |
|------|-------------|
| No business logic | Only call services |
| Validate input | Use Zod schemas via middleware |
| Format responses | Use response helpers |
| Extract auth data | Get user from middleware context |
| Handle errors | Let error middleware catch exceptions |

---

## Layer 2: Services

```typescript
// src/services/orders.service.ts

import { OrdersRepository } from '../repositories/orders.repository';
import { NotificationsService } from './notifications.service';
import { db } from '../database/kysely';
import { AppError } from '../utils/errors';
import type { CreateOrderBody, UpdateOrderBody, Order } from '../types';

export class OrdersService {
  // ✅ All business logic here

  static async getByUserId(userId: string): Promise<Order[]> {
    return OrdersRepository.findByUserId(userId);
  }

  static async getById(id: string): Promise<Order | null> {
    return OrdersRepository.findById(id);
  }

  static async create(userId: string, data: CreateOrderBody): Promise<Order> {
    // Business logic: calculate totals, validate inventory, etc.
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Use transaction for multi-table operations
    const order = await db.transaction().execute(async (trx) => {
      const order = await OrdersRepository.create(trx, {
        userId,
        items: data.items,
        total,
        status: 'pending',
      });

      // Deduct inventory
      for (const item of data.items) {
        await InventoryRepository.decrement(trx, item.productId, item.quantity);
      }

      return order;
    });

    // Side effects after transaction
    await NotificationsService.sendOrderConfirmation(userId, order);

    return order;
  }

  static async update(id: string, data: UpdateOrderBody): Promise<Order> {
    const existing = await OrdersRepository.findById(id);

    if (!existing) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    // Business rules
    if (existing.status === 'completed') {
      throw new AppError('ORDER_COMPLETED', 'Cannot modify completed order', 400);
    }

    return OrdersRepository.update(id, data);
  }

  static async delete(id: string): Promise<void> {
    const existing = await OrdersRepository.findById(id);

    if (!existing) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (existing.status !== 'pending') {
      throw new AppError('ORDER_IN_PROGRESS', 'Cannot delete non-pending order', 400);
    }

    await OrdersRepository.softDelete(id);
  }
}
```

### Service Rules

| Rule | Description |
|------|-------------|
| All business logic | Validation, calculations, orchestration |
| Call repositories only | Never write SQL directly |
| Use transactions | For multi-table operations |
| Throw typed errors | Use AppError with codes |
| Side effects here | Notifications, events, cache invalidation |

---

## Layer 3: Repositories

```typescript
// src/repositories/orders.repository.ts

import { db } from '../database/kysely';
import type { DB, Order, NewOrder, OrderUpdate } from '../types/database.types';
import type { Transaction } from 'kysely';

export class OrdersRepository {
  // ✅ Only database operations, no business logic

  static async findById(id: string): Promise<Order | null> {
    return db
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .executeTakeFirst() ?? null;
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    return db
      .selectFrom('orders')
      .selectAll()
      .where('user_id', '=', userId)
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute();
  }

  static async create(
    trx: Transaction<DB> | typeof db,
    data: NewOrder
  ): Promise<Order> {
    const result = await trx
      .insertInto('orders')
      .values({
        id: crypto.randomUUID(),
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirstOrThrow();

    return this.findById(result.insertId as string) as Promise<Order>;
  }

  static async update(id: string, data: OrderUpdate): Promise<Order> {
    await db
      .updateTable('orders')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    return this.findById(id) as Promise<Order>;
  }

  static async softDelete(id: string): Promise<void> {
    await db
      .updateTable('orders')
      .set({ deleted_at: new Date() })
      .where('id', '=', id)
      .execute();
  }
}
```

### Repository Rules

| Rule | Description |
|------|-------------|
| One per entity | `UsersRepository`, `OrdersRepository`, etc. |
| No business logic | Only CRUD operations |
| Accept transaction | Support transactional operations |
| Return typed data | Use generated DB types |
| Soft delete default | Use `deleted_at` column |

---

## WebSocket Architecture

### Connection Manager

```typescript
// src/websocket/clients.ts

import type { ServerWebSocket } from 'bun';
import type { WSData } from '../types/ws.types';

class ClientManager {
  private clients = new Map<string, ServerWebSocket<WSData>>();
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  add(socketId: string, ws: ServerWebSocket<WSData>, userId?: string) {
    this.clients.set(socketId, ws);

    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socketId);
    }
  }

  remove(socketId: string, userId?: string) {
    this.clients.delete(socketId);

    if (userId) {
      this.userSockets.get(userId)?.delete(socketId);
    }
  }

  getByUserId(userId: string): ServerWebSocket<WSData>[] {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return [];

    return Array.from(socketIds)
      .map(id => this.clients.get(id))
      .filter(Boolean) as ServerWebSocket<WSData>[];
  }

  broadcast(message: string, exclude?: string) {
    for (const [id, ws] of this.clients) {
      if (id !== exclude) {
        ws.send(message);
      }
    }
  }
}

export const clientManager = new ClientManager();
```

### Room Management

```typescript
// src/websocket/rooms.ts

import type { ServerWebSocket } from 'bun';
import type { WSData } from '../types/ws.types';

class RoomManager {
  private rooms = new Map<string, Set<string>>(); // roomId -> socketIds

  join(roomId: string, socketId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socketId);
  }

  leave(roomId: string, socketId: string) {
    this.rooms.get(roomId)?.delete(socketId);
  }

  leaveAll(socketId: string) {
    for (const [roomId, members] of this.rooms) {
      members.delete(socketId);
    }
  }

  getMembers(roomId: string): Set<string> {
    return this.rooms.get(roomId) ?? new Set();
  }

  broadcastToRoom(roomId: string, message: string, exclude?: string) {
    const members = this.rooms.get(roomId);
    if (!members) return;

    for (const socketId of members) {
      if (socketId !== exclude) {
        clientManager.get(socketId)?.send(message);
      }
    }
  }
}

export const roomManager = new RoomManager();
```

### WebSocket Server

```typescript
// src/websocket/server.ts

import type { ServerWebSocket } from 'bun';
import { clientManager } from './clients';
import { roomManager } from './rooms';
import { handleWSMessage } from '../handlers/ws/connection.handler';
import { verifyWSToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import type { WSData, WSMessage } from '../types/ws.types';

export const wsServer = {
  open(ws: ServerWebSocket<WSData>) {
    const socketId = crypto.randomUUID();
    ws.data.socketId = socketId;

    clientManager.add(socketId, ws);
    logger.info(`WebSocket connected: ${socketId}`);

    // Send connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connected',
      payload: { socketId },
    }));
  },

  async message(ws: ServerWebSocket<WSData>, message: string | Buffer) {
    try {
      const msg: WSMessage = JSON.parse(message.toString());

      // Handle authentication
      if (msg.type === 'auth') {
        const userId = await verifyWSToken(msg.payload.token);
        if (userId) {
          ws.data.userId = userId;
          ws.data.authenticated = true;
          clientManager.add(ws.data.socketId, ws, userId);
          ws.send(JSON.stringify({ type: 'auth:success' }));
        } else {
          ws.send(JSON.stringify({ type: 'auth:failed' }));
        }
        return;
      }

      // Require authentication for other messages
      if (!ws.data.authenticated) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        }));
        return;
      }

      // Route message to handler
      await handleWSMessage(ws, msg);
    } catch (error) {
      logger.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { code: 'INVALID_MESSAGE', message: 'Invalid message format' },
      }));
    }
  },

  close(ws: ServerWebSocket<WSData>) {
    const { socketId, userId } = ws.data;

    clientManager.remove(socketId, userId);
    roomManager.leaveAll(socketId);

    logger.info(`WebSocket disconnected: ${socketId}`);
  },
};
```

### WebSocket Message Handler

```typescript
// src/handlers/ws/connection.handler.ts

import type { ServerWebSocket } from 'bun';
import { roomManager } from '../../websocket/rooms';
import { OrdersWSHandler } from './orders.ws.handler';
import type { WSData, WSMessage } from '../../types/ws.types';

const handlers: Record<string, (ws: ServerWebSocket<WSData>, payload: any) => Promise<void>> = {
  // Room management
  'room:join': async (ws, payload) => {
    roomManager.join(payload.roomId, ws.data.socketId);
    ws.send(JSON.stringify({ type: 'room:joined', payload: { roomId: payload.roomId } }));
  },

  'room:leave': async (ws, payload) => {
    roomManager.leave(payload.roomId, ws.data.socketId);
    ws.send(JSON.stringify({ type: 'room:left', payload: { roomId: payload.roomId } }));
  },

  // Orders
  'order:subscribe': OrdersWSHandler.subscribe,
  'order:update': OrdersWSHandler.update,

  // Add more handlers...
};

export async function handleWSMessage(ws: ServerWebSocket<WSData>, msg: WSMessage) {
  const handler = handlers[msg.type];

  if (!handler) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { code: 'UNKNOWN_MESSAGE', message: `Unknown message type: ${msg.type}` },
    }));
    return;
  }

  await handler(ws, msg.payload);
}
```

### WebSocket Message Types

```typescript
// src/types/ws.types.ts

export interface WSData {
  socketId: string;
  userId?: string;
  authenticated: boolean;
  connectedAt: number;
}

export interface WSMessage<T = unknown> {
  type: string;
  payload: T;
  id?: string; // For request-response correlation
}

// ─── Client → Server Messages ───────────────────────────────
export interface AuthMessage {
  type: 'auth';
  payload: { token: string };
}

export interface RoomJoinMessage {
  type: 'room:join';
  payload: { roomId: string };
}

export interface OrderSubscribeMessage {
  type: 'order:subscribe';
  payload: { orderId: string };
}

// ─── Server → Client Messages ───────────────────────────────
export interface OrderUpdateEvent {
  type: 'order:updated';
  payload: {
    orderId: string;
    status: string;
    updatedAt: string;
  };
}

export interface NotificationEvent {
  type: 'notification';
  payload: {
    id: string;
    title: string;
    message: string;
    createdAt: string;
  };
}
```

---

## MySQL Database

### Connection Pool

```typescript
// src/database/connection.ts

import mysql from 'mysql2/promise';
import { env } from '../config/env';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection failed:', err);
    process.exit(1);
  });
```

### Kysely Setup

```typescript
// src/database/kysely.ts

import { Kysely, MysqlDialect } from 'kysely';
import { pool } from './connection';
import type { DB } from '../types/database.types';

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool }),
});
```

### Database Types (Generated)

```typescript
// src/types/database.types.ts

import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface DB {
  users: UsersTable;
  orders: OrdersTable;
  order_items: OrderItemsTable;
  // ... more tables
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'user';
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export interface OrdersTable {
  id: Generated<string>;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  deleted_at: Date | null;
}

export type Order = Selectable<OrdersTable>;
export type NewOrder = Insertable<OrdersTable>;
export type OrderUpdate = Updateable<OrdersTable>;
```

---

## Validation (Zod)

```typescript
// src/validators/orders.validator.ts

import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'Order must have at least one item'),
  notes: z.string().max(500).optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateOrderBody = z.infer<typeof updateOrderSchema>;
```

### Validation Middleware

```typescript
// src/middleware/validate.middleware.ts

import type { Context, Next } from 'hono';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (c: Context, next: Next) => {
    const body = await c.req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid request body',
        400,
        result.error.flatten().fieldErrors
      );
    }

    c.set('validatedBody', result.data);
    await next();
  };
}
```

---

## Error Handling

### Custom Error Class

```typescript
// src/utils/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Predefined errors
export const Errors = {
  UNAUTHORIZED: new AppError('UNAUTHORIZED', 'Authentication required', 401),
  FORBIDDEN: new AppError('FORBIDDEN', 'Access denied', 403),
  NOT_FOUND: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`, 404),
  VALIDATION: (details: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', 'Validation failed', 400, details),
};
```

### Error Middleware

```typescript
// src/middleware/error.middleware.ts

import type { Context } from 'hono';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function errorMiddleware(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    }, err.statusCode);
  }

  // Unexpected errors
  logger.error('Unhandled error:', err);

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }, 500);
}
```

---

## Response Helpers

```typescript
// src/utils/response.ts

import type { Context } from 'hono';

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function success<T>(c: Context, data: T, meta?: SuccessResponse<T>['meta']) {
  return c.json({ success: true, data, meta } as SuccessResponse<T>, 200);
}

export function created<T>(c: Context, data: T) {
  return c.json({ success: true, data } as SuccessResponse<T>, 201);
}

export function noContent(c: Context) {
  return new Response(null, { status: 204 });
}

export function notFound(c: Context, message: string) {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message },
  } as ErrorResponse, 404);
}

export function paginated<T>(
  c: Context,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return c.json({
    success: true,
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 200);
}
```

---

## Authentication

### JWT Utilities

```typescript
// src/utils/jwt.ts

import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function signToken(payload: { userId: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function verifyWSToken(token: string): Promise<string | null> {
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}
```

### Auth Middleware

```typescript
// src/middleware/auth.middleware.ts

import type { Context, Next } from 'hono';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing or invalid authorization header', 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
  }

  c.set('userId', payload.userId);
  c.set('userRole', payload.role);

  await next();
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get('userRole');

    if (!roles.includes(userRole)) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
    }

    await next();
  };
}
```

---

## Environment Configuration

```typescript
// src/config/env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  // Auth
  JWT_SECRET: z.string().min(32),

  // Optional
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
```

---

## Quick Reference

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Routes | kebab-case.routes.ts | `orders.routes.ts` |
| Handlers | kebab-case.handler.ts | `orders.handler.ts` |
| Services | kebab-case.service.ts | `orders.service.ts` |
| Repositories | kebab-case.repository.ts | `orders.repository.ts` |
| Validators | kebab-case.validator.ts | `orders.validator.ts` |
| Types | kebab-case.types.ts | `api.types.ts` |

### Layer Responsibilities

| Layer | Contains | Calls |
|-------|----------|-------|
| Handler | Validation, response formatting | Services |
| Service | Business logic, transactions | Repositories |
| Repository | SQL queries (Kysely) | Database |

### WebSocket Event Naming

```
category:action

room:join
room:leave
order:subscribe
order:updated
notification:new
```

---

## Checklist

Before committing, verify:

- [ ] Handlers have no business logic
- [ ] Services handle all business rules
- [ ] Repositories have no business logic
- [ ] All inputs validated with Zod
- [ ] All errors use AppError class
- [ ] Transactions used for multi-table operations
- [ ] WebSocket messages are typed
- [ ] JWT verified on protected routes
- [ ] No SQL strings (use Kysely)
- [ ] Soft delete for important entities
- [ ] Responses use helper functions
