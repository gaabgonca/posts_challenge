import { CACHE_POLICY } from '@/src/constants/cache';
import { commentsService } from '@/src/services/commentsService';
import { Comment } from '@/src/types/comment';
import { retryWithBackoff } from '@/src/utils/retry';
import { create } from 'zustand';

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  lastCommentsFetchTime: number | null;
  commentsByPostFetchTimes: Map<number, number>;
  fetchComments: (forceRefresh?: boolean) => Promise<void>;
  getCommentsByPostId: (postId: number) => Comment[];
  prefetchCommentsForPost: (postId: number, forceRefresh?: boolean) => Promise<void>;
  clearComments: () => void;
  isCommentsCacheValid: () => boolean;
  isCommentsByPostCacheValid: (postId: number) => boolean;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,
  lastCommentsFetchTime: null,
  commentsByPostFetchTimes: new Map<number, number>(),

  isCommentsCacheValid: () => {
    const { lastCommentsFetchTime } = get();
    if (lastCommentsFetchTime === null) {
      return false;
    }
    const now = Date.now();
    return now - lastCommentsFetchTime < CACHE_POLICY.COMMENTS_TTL;
  },

  isCommentsByPostCacheValid: (postId: number) => {
    const { commentsByPostFetchTimes } = get();
    const fetchTime = commentsByPostFetchTimes.get(postId);
    if (fetchTime === undefined) {
      return false;
    }
    const now = Date.now();
    return now - fetchTime < CACHE_POLICY.COMMENTS_BY_POST_TTL;
  },

  fetchComments: async (forceRefresh = false) => {
    const { comments, isCommentsCacheValid } = get();

    // Check cache validity unless force refresh is requested
    if (!forceRefresh && isCommentsCacheValid() && comments.length > 0) {
      // Cache is valid, no need to fetch
      return;
    }

    // If stale-while-revalidate is enabled and we have cached data, fetch in background
    const shouldShowLoading = forceRefresh || !CACHE_POLICY.STALE_WHILE_REVALIDATE || comments.length === 0;

    if (shouldShowLoading) {
      set({ loading: true, error: null });
    }

    try {
      const fetchedComments = await retryWithBackoff(() => commentsService.getComments(), {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      });
      set({
        comments: fetchedComments,
        loading: false,
        error: null,
        lastCommentsFetchTime: Date.now(),
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comments',
      });
      console.error('Failed to fetch comments', error);
    }
  },

  getCommentsByPostId: (postId: number) => {
    const { comments } = get();
    return comments.filter((comment) => comment.postId === postId);
  },

  prefetchCommentsForPost: async (postId: number, forceRefresh = false) => {
    const { comments, isCommentsByPostCacheValid } = get();

    // Check if comments exist and cache is valid
    const existingComments = comments.filter((comment) => comment.postId === postId);
    if (existingComments.length > 0 && !forceRefresh && isCommentsByPostCacheValid(postId)) {
      // Comments exist and cache is valid, no need to fetch
      return;
    }

    try {
      const postComments = await retryWithBackoff(
        () => commentsService.getCommentsByPostId(postId),
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffFactor: 2,
        },
      );

      const { comments: currentComments, commentsByPostFetchTimes } = get();
      const updatedFetchTimes = new Map(commentsByPostFetchTimes);
      updatedFetchTimes.set(postId, Date.now());

      // Add or update comments in store
      const newComments = postComments.filter(
        (comment) => !currentComments.some((c) => c.id === comment.id),
      );
      if (newComments.length > 0) {
        set({
          comments: [...currentComments, ...newComments],
          commentsByPostFetchTimes: updatedFetchTimes,
        });
      } else {
        // Update fetch time even if no new comments (cache was refreshed)
        set({ commentsByPostFetchTimes: updatedFetchTimes });
      }
    } catch (error) {
      // Silently fail prefetch - don't update error state
      console.error('Failed to prefetch comments', error);
    }
  },

  clearComments: () => {
    set({
      comments: [],
      error: null,
      lastCommentsFetchTime: null,
      commentsByPostFetchTimes: new Map<number, number>(),
    });
  },
}));

