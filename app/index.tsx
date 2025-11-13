import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { PostItem } from '@/src/components/post-item';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { usePostsStore } from '@/src/stores/postsStore';
import { Post } from '@/src/types/post';

export default function FeedScreen() {
  const { posts, loading, error, fetchPosts } = usePostsStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => <PostItem post={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ThemedText>Loading posts...</ThemedText>
        </ThemedView>
      );
    }
    if (error) {
      return (
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
        </ThemedView>
      );
    }
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>No posts available</ThemedText>
      </ThemedView>
    );
  }, [loading, error]);

  const contentContainerStyle = useMemo(
    () => (posts.length === 0 ? styles.emptyContainer : undefined),
    [posts.length],
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchPosts(true)} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff0000',
  },
});

