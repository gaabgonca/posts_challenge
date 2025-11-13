import { CACHE_POLICY } from '@/src/constants/cache';
import { postsService } from '@/src/services/postsService';
import { Post } from '@/src/types/post';
import { retryWithBackoff } from '@/src/utils/retry';
import { create } from 'zustand';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  lastPostsFetchTime: number | null;
  postFetchTimes: Map<number, number>;
  fetchPosts: (forceRefresh?: boolean) => Promise<void>;
  getPostById: (id: number) => Post | undefined;
  prefetchPost: (id: number, forceRefresh?: boolean) => Promise<void>;
  clearPosts: () => void;
  isPostsCacheValid: () => boolean;
  isPostCacheValid: (id: number) => boolean;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  lastPostsFetchTime: null,
  postFetchTimes: new Map<number, number>(),

  isPostsCacheValid: () => {
    const { lastPostsFetchTime } = get();
    if (lastPostsFetchTime === null) {
      return false;
    }
    const now = Date.now();
    return now - lastPostsFetchTime < CACHE_POLICY.POSTS_TTL;
  },

  isPostCacheValid: (id: number) => {
    const { postFetchTimes } = get();
    const fetchTime = postFetchTimes.get(id);
    if (fetchTime === undefined) {
      return false;
    }
    const now = Date.now();
    return now - fetchTime < CACHE_POLICY.POST_TTL;
  },

  fetchPosts: async (forceRefresh = false) => {
    const { posts, isPostsCacheValid } = get();

    // Check cache validity unless force refresh is requested
    if (!forceRefresh && isPostsCacheValid() && posts.length > 0) {
      // Cache is valid, no need to fetch
      return;
    }

    // If stale-while-revalidate is enabled and we have cached data, fetch in background
    const shouldShowLoading = forceRefresh || !CACHE_POLICY.STALE_WHILE_REVALIDATE || posts.length === 0;

    if (shouldShowLoading) {
      set({ loading: true, error: null });
    }

    try {
      const fetchedPosts = await retryWithBackoff(() => postsService.getPosts(), {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      });
      set({
        posts: fetchedPosts,
        loading: false,
        error: null,
        lastPostsFetchTime: Date.now(),
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
      });
      console.error('Failed to fetch posts', error);
    }
  },

  getPostById: (id: number) => {
    const { posts } = get();
    return posts.find((post) => post.id === id);
  },

  prefetchPost: async (id: number, forceRefresh = false) => {
    const { posts, isPostCacheValid } = get();

    // Check if post exists and cache is valid
    const existingPost = posts.find((post) => post.id === id);
    if (existingPost && !forceRefresh && isPostCacheValid(id)) {
      // Post exists and cache is valid, no need to fetch
      return;
    }

    try {
      const post = await retryWithBackoff(() => postsService.getPostById(id), {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      });

      const { posts: currentPosts, postFetchTimes } = get();
      const updatedFetchTimes = new Map(postFetchTimes);
      updatedFetchTimes.set(id, Date.now());

      // Add or update post in store
      const postIndex = currentPosts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        set({ posts: [...currentPosts, post], postFetchTimes: updatedFetchTimes });
      } else {
        // Update existing post
        const updatedPosts = [...currentPosts];
        updatedPosts[postIndex] = post;
        set({ posts: updatedPosts, postFetchTimes: updatedFetchTimes });
      }
    } catch (error) {
      // Silently fail prefetch - don't update error state
      console.error('Failed to prefetch post', error);
    }
  },

  clearPosts: () => {
    set({
      posts: [],
      error: null,
      lastPostsFetchTime: null,
      postFetchTimes: new Map<number, number>(),
    });
  },
}));

