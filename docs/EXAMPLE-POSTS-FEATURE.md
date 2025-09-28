# Example: Building Posts Feature

Let's build a simple **Posts** feature step by step to demonstrate the architecture.

## 📋 **Planning Phase**

**Feature**: Blog posts with title, content, author **Complexity**: Simple CRUD, no external APIs
needed

**Decision Matrix:**

- External secrets? ❌ No
- Behavioral settings? ❌ Simple feature
- Feature toggle? ❌ Always on
- Runtime secrets? ❌ No
- Business logic? ✅ Yes (validation, filtering)
- API endpoints? ✅ Yes

**Result**: We need **Schema → Service → Routes**

## 🚀 **Implementation**

### Step 1: Schema (Always First)

```typescript
// worker/schemas/post.ts
import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  status: z.enum(['draft', 'published']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  author: z.string().min(1),
})

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export const PostQuerySchema = z.object({
  author: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
})

export type Post = z.infer<typeof PostSchema>
export type CreatePostRequest = z.infer<typeof CreatePostSchema>
export type UpdatePostRequest = z.infer<typeof UpdatePostSchema>
export type PostQuery = z.infer<typeof PostQuerySchema>
```

### Step 2: Service (Business Logic)

```typescript
// worker/services/post.service.ts
import { BaseService, type PaginatedResult } from './base.service'
import type { Container } from '../container/container'
import type { Post, CreatePostRequest, UpdatePostRequest, PostQuery } from '../schemas/post'
import { NotFoundError, ConflictError } from '../lib/errors'

export class PostService extends BaseService<Post> {
  // In production: use this.db instead of in-memory data
  private posts: Post[] = [
    {
      id: '1',
      title: 'Welcome to our blog',
      content: 'This is our first blog post!',
      author: 'Admin',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Draft post',
      content: 'This is still being worked on...',
      author: 'Writer',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  constructor(container?: Container) {
    super(container)
    // Service gets access to config, feature flags, secrets automatically
  }

  async findAll(query: PostQuery): Promise<PaginatedResult<Post>> {
    let posts = [...this.posts]

    // Apply filters
    if (query.author) {
      posts = posts.filter(post => post.author.toLowerCase().includes(query.author!.toLowerCase()))
    }

    if (query.status) {
      posts = posts.filter(post => post.status === query.status)
    }

    // Apply text search using base method
    posts = this.applyTextSearch(posts, query.search || '', ['title', 'content'])

    // Apply sorting using base method
    posts = this.applySorting(posts, query.sortBy, query.sortOrder)

    // Apply pagination using base method
    return this.applyPagination(posts, {
      page: query.page,
      limit: query.limit,
    })
  }

  async findById(id: string): Promise<Post> {
    const post = this.posts.find(post => post.id === id)
    if (!post) {
      throw new NotFoundError('Post')
    }
    return post
  }

  async create(data: CreatePostRequest): Promise<Post> {
    // Business validation
    const existingPost = this.posts.find(
      post => post.title.toLowerCase() === data.title.toLowerCase()
    )
    if (existingPost) {
      throw new ConflictError('Post with this title already exists')
    }

    const post: Post = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      author: data.author,
      status: 'draft', // New posts start as draft
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.posts.push(post)
    return post
  }

  async update(id: string, data: UpdatePostRequest): Promise<Post> {
    const index = this.posts.findIndex(post => post.id === id)

    if (index === -1) {
      throw new NotFoundError('Post')
    }

    // Business validation
    if (data.title) {
      const existingPost = this.posts.find(
        post => post.id !== id && post.title.toLowerCase() === data.title!.toLowerCase()
      )
      if (existingPost) {
        throw new ConflictError('Post with this title already exists')
      }
    }

    this.posts[index] = {
      ...this.posts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return this.posts[index]
  }

  async delete(id: string): Promise<void> {
    const index = this.posts.findIndex(post => post.id === id)

    if (index === -1) {
      throw new NotFoundError('Post')
    }

    this.posts.splice(index, 1)
  }

  // Custom method - find published posts only
  async findPublished(): Promise<Post[]> {
    return this.posts.filter(post => post.status === 'published')
  }
}
```

### Step 3: Register Service

```typescript
// worker/container/tokens.ts
export const SERVICE_TOKENS = {
  // ... existing
  POST_SERVICE: 'PostService',
} as const
```

```typescript
// worker/container/registry.ts
import { PostService } from '../services/post.service'

export function createContainer(env?: Record<string, unknown>): Container {
  // ... existing code

  // Register post service
  container.register(SERVICE_TOKENS.POST_SERVICE, PostService, {
    singleton: true,
  })

  return container
}

// Add typed helper
export function getPostService(container: Container): PostService {
  return container.resolve<PostService>(SERVICE_TOKENS.POST_SERVICE)
}
```

### Step 4: Routes

```typescript
// worker/routes/features/posts.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { CreatePostSchema, UpdatePostSchema, PostQuerySchema } from '../schemas/post'
import { createSuccessResponse, createPaginatedResponse } from '../lib/response'
import { getPostService } from '../container/registry'
import type { Container } from '../container/container'

export function createPostRoutes(container: Container) {
  return (
    new Hono()
      // Get all posts
      .get('/', zValidator('query', PostQuerySchema), async c => {
        const query = c.req.valid('query')
        const postService = getPostService(container)
        const result = await postService.findAll(query)

        return c.json(createPaginatedResponse(result.data, result.pagination))
      })

      // Get published posts only
      .get('/published', async c => {
        const postService = getPostService(container)
        const posts = await postService.findPublished()

        return c.json(createSuccessResponse(posts))
      })

      // Get single post
      .get('/:id', async c => {
        const id = c.req.param('id')
        const postService = getPostService(container)

        const post = await postService.findById(id)
        return c.json(createSuccessResponse(post))
      })

      // Create post
      .post('/', zValidator('json', CreatePostSchema), async c => {
        const data = c.req.valid('json')
        const postService = getPostService(container)

        const post = await postService.create(data)

        return c.json(createSuccessResponse(post, 'Post created successfully'), 201)
      })

      // Update post
      .put('/:id', zValidator('json', UpdatePostSchema), async c => {
        const id = c.req.param('id')
        const data = c.req.valid('json')
        const postService = getPostService(container)

        const post = await postService.update(id, data)
        return c.json(createSuccessResponse(post, 'Post updated successfully'))
      })

      // Delete post
      .delete('/:id', async c => {
        const id = c.req.param('id')
        const postService = getPostService(container)

        await postService.delete(id)
        return c.json(createSuccessResponse({ message: 'Post deleted successfully' }))
      })
  )
}
```

### Step 5: Register Routes

```typescript
// worker/routes/index.ts
import { createPostRoutes } from './posts'

export function createApiRoutes(container: Container) {
  return (
    new Hono()
      // ... existing routes
      .route('/posts', createPostRoutes(container))
  )
}
```

## ✅ **Done!**

You now have a complete Posts feature with:

- ✅ **Type-safe schemas** with validation
- ✅ **Business logic** in service layer
- ✅ **Clean error handling** with custom errors
- ✅ **Pagination and filtering** using base service
- ✅ **REST API endpoints** with proper responses
- ✅ **Perfect RPC type inference** for frontend

## 🧪 **Testing the API**

```bash
# Get all posts
GET /api/posts

# Get published posts only
GET /api/posts/published

# Search posts by author
GET /api/posts?author=Admin

# Create new post
POST /api/posts
{
  "title": "My New Post",
  "content": "This is the content...",
  "author": "John Doe"
}

# Update post
PUT /api/posts/1
{
  "title": "Updated Title",
  "status": "published"
}

# Delete post
DELETE /api/posts/1
```

## 🎯 **Key Takeaways**

1. **Started simple**: Just schema → service → routes
2. **Used existing patterns**: Extended BaseService, followed factory pattern
3. **Leveraged base functionality**: Pagination, sorting, text search
4. **Proper error handling**: Used custom error classes
5. **Type safety**: Full RPC inference works perfectly

**This is your template for 90% of features!**
