# Technical Report

## Architecture & Implementation Decisions

• **Data Layer**: Zustand state management with a service layer pattern - Zustand stores (`postsStore`, `commentsStore`) manage application state and cache metadata, while service modules (`postsService`, `commentsService`) handle pure API communication, ensuring clear separation of concerns and testability

• **Retry/Backoff Strategy**: Exponential backoff implementation with configurable options (3 retries, 1s initial delay, 2x backoff factor, 10s max delay) applied to all API calls via `retryWithBackoff` utility, providing resilience against transient network failures

• **Cache Strategy**: TTL-based in-memory cache with stale-while-revalidate pattern - posts/comments lists cached for 5 minutes, individual items for 10 minutes, with background refresh when stale data exists, reducing unnecessary API calls while maintaining perceived freshness

• **Performance Optimizations**: FlatList with memoized callbacks (`useCallback` for `renderItem`, `keyExtractor`, `renderEmpty`), `useMemo` for computed styles, and prefetching on `onPressIn` event to load post details and comments before navigation, minimizing perceived latency

• **Component Memoization**: All FlatList render functions and key extractors wrapped in `useCallback` to prevent unnecessary re-renders, and `useMemo` for conditional style calculations, ensuring optimal list rendering performance

• **Prefetching Strategy**: Proactive data loading on user interaction - when user presses a post item, both post details and associated comments are prefetched in parallel before navigation, leveraging user intent to improve perceived performance

• **AI Development Workflow**: Used Cursor's agent to create distinct code entities incrementally (services → screens → optimizations/cache), with 95% code retention due to comprehensive React Native development rules file (`.cursor/rules/react-native.mdc`) that enforced consistent patterns

• **Code Consistency Rules**: Established React Native guidelines covering TypeScript usage, functional components, Zustand for state, FlatList for lists, StyleSheet patterns, error handling, retry logic, and cache policies - these rules ensured AI-generated code aligned with project standards from the start

• **Error Handling**: Centralized error logging via `log()` utility with contextual metadata (method, URL, status codes), combined with graceful error states in UI and silent prefetch failures to prevent user disruption

• **Cache Invalidation**: Per-resource cache tracking using `Map<number, number>` for individual posts and comments-by-post, enabling granular cache validation and selective refresh without invalidating entire datasets

