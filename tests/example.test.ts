import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string operations', () => {
    const greeting = 'Hello World'
    expect(greeting).toContain('Hello')
    expect(greeting.length).toBe(11)
  })

  it('should test async operations', async () => {
    const promise = Promise.resolve('test')
    await expect(promise).resolves.toBe('test')
  })
})
