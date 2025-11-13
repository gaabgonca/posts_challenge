/**
 * Cache policy configuration for API data
 */
export const CACHE_POLICY = {
  /**
   * Time in milliseconds before cached posts are considered stale
   * Default: 5 minutes
   */
  POSTS_TTL: 5 * 60 * 1000, // 5 minutes

  /**
   * Time in milliseconds before cached individual post is considered stale
   * Default: 10 minutes (individual posts change less frequently)
   */
  POST_TTL: 10 * 60 * 1000, // 10 minutes

  /**
   * Time in milliseconds before cached comments are considered stale
   * Default: 5 minutes
   */
  COMMENTS_TTL: 5 * 60 * 1000, // 5 minutes

  /**
   * Time in milliseconds before cached comments for a specific post are considered stale
   * Default: 10 minutes (comments for a post change less frequently)
   */
  COMMENTS_BY_POST_TTL: 10 * 60 * 1000, // 10 minutes

  /**
   * Whether to use stale-while-revalidate strategy
   * If true, return stale data immediately while fetching fresh data in background
   */
  STALE_WHILE_REVALIDATE: true,
} as const;

