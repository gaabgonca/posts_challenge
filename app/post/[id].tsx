import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { postsService } from '@/src/services/postsService';
import { useCommentsStore } from '@/src/stores/commentsStore';
import { usePostsStore } from '@/src/stores/postsStore';
import { Post } from '@/src/types/post';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = parseInt(id || '0', 10);
  const { getPostById } = usePostsStore();
  const { getCommentsByPostId, fetchComments, loading: commentsLoading } = useCommentsStore();
  const [post, setPost] = React.useState<Post | undefined>(getPostById(postId));
  const [loading, setLoading] = React.useState(!post);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!post && postId) {
      setLoading(true);
      postsService
        .getPostById(postId)
        .then((fetchedPost) => {
          setPost(fetchedPost);
          setError(null);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load post');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [postId, post]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  const comments = postId ? getCommentsByPostId(postId) : [];

  const renderComment = useCallback(
    ({ item: comment }: { item: typeof comments[0] }) => (
      <ThemedView style={styles.commentCard}>
        <ThemedView style={styles.commentHeader}>
          <ThemedText style={styles.commentName}>{comment.name}</ThemedText>
          <ThemedText style={styles.commentEmail}>{comment.email}</ThemedText>
        </ThemedView>
        <ThemedText style={styles.commentBody}>{comment.body}</ThemedText>
      </ThemedView>
    ),
    [],
  );

  const keyExtractor = useCallback((comment: typeof comments[0]) => comment.id.toString(), []);

  const renderListHeader = useCallback(
    () => {
      if (!post) return null;
      return (
        <>
          <ThemedView style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              {post.title}
            </ThemedText>
            <ThemedText style={styles.meta}>Post #{post.id}</ThemedText>
            <ThemedText style={styles.meta}>User ID: {post.userId}</ThemedText>
            <ThemedText style={styles.body}>{post.body}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.commentsSection}>
            <ThemedText type="subtitle" style={styles.commentsTitle}>
              Comments ({comments.length})
            </ThemedText>
            {commentsLoading && (
              <ThemedView style={styles.commentsLoading}>
                <ActivityIndicator size="small" />
                <ThemedText style={styles.loadingText}>Loading comments...</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </>
      );
    },
    [post, comments.length, commentsLoading],
  );

  const renderListEmpty = useCallback(
    () => (
      <ThemedView style={styles.noComments}>
        <ThemedText style={styles.noCommentsText}>No comments yet</ThemedText>
      </ThemedView>
    ),
    [],
  );

  const contentContainerStyle = useMemo(
    () => (comments.length === 0 ? styles.emptyContainer : undefined),
    [comments.length],
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading post...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !post) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>
          {error || 'Post not found'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={!commentsLoading ? renderListEmpty : null}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          <RefreshControl refreshing={commentsLoading} onRefresh={() => fetchComments(true)} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
  commentsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  commentsTitle: {
    marginBottom: 16,
    marginLeft: 8,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noComments: {
    padding: 20,
    alignItems: 'center',
  },
  noCommentsText: {
    opacity: 0.6,
    fontSize: 14,
  },
  commentCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentEmail: {
    fontSize: 12,
    opacity: 0.7,
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});

