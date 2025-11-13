import { Post } from '@/src/types/post';
import { log } from '@/src/utils/log';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const postsService = {
  /**
   * Fetches all posts from the API
   * @returns Promise<Post[]> Array of posts
   */
  async getPosts(): Promise<Post[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      
      if (!response.ok) {
        const error = new Error(`Failed to fetch posts: ${response.statusText}`);
        log(error, {
          method: 'getPosts',
          url: `${API_BASE_URL}/posts`,
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }
      
      const posts: Post[] = await response.json();
      return posts;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      log(error, {
        method: 'getPosts',
        url: `${API_BASE_URL}/posts`,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      throw error;
    }
  },

  /**
   * Fetches a single post by ID
   * @param id Post ID
   * @returns Promise<Post> Single post
   */
  async getPostById(id: number): Promise<Post> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`);
      
      if (!response.ok) {
        const error = new Error(`Failed to fetch post: ${response.statusText}`);
        log(error, {
          method: 'getPostById',
          url: `${API_BASE_URL}/posts/${id}`,
          postId: id,
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }
      
      const post: Post = await response.json();
      return post;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      log(error, {
        method: 'getPostById',
        url: `${API_BASE_URL}/posts/${id}`,
        postId: id,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      });
      throw error;
    }
  },
};

