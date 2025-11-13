import { Comment } from '@/src/types/comment';
import { log } from '@/src/utils/log';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const commentsService = {
  /**
   * Fetches all comments from the API
   * @returns Promise<Comment[]> Array of comments
   */
  async getComments(): Promise<Comment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`);
      
      if (!response.ok) {
        const error = new Error(`Failed to fetch comments: ${response.statusText}`);
        log(error, {
          method: 'getComments',
          url: `${API_BASE_URL}/comments`,
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }
      
      const comments: Comment[] = await response.json();
      return comments;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      log(error, {
        method: 'getComments',
        url: `${API_BASE_URL}/comments`,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      throw error;
    }
  },

  /**
   * Fetches comments for a specific post by post ID
   * @param postId Post ID
   * @returns Promise<Comment[]> Array of comments for the post
   */
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/comments?postId=${postId}`);
      
      if (!response.ok) {
        const error = new Error(`Failed to fetch comments: ${response.statusText}`);
        log(error, {
          method: 'getCommentsByPostId',
          url: `${API_BASE_URL}/comments?postId=${postId}`,
          postId: postId,
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }
      
      const comments: Comment[] = await response.json();
      return comments;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      log(error, {
        method: 'getCommentsByPostId',
        url: `${API_BASE_URL}/comments?postId=${postId}`,
        postId: postId,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      throw error;
    }
  },
};

