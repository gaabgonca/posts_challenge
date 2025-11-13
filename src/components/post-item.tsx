import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useThemeColor } from '@/src/hooks/use-theme-color';
import { useCommentsStore } from '@/src/stores/commentsStore';
import { usePostsStore } from '@/src/stores/postsStore';
import { Post } from '@/src/types/post';
import { truncateBody } from '@/src/utils/text';

interface PostItemProps {
  post: Post;
}

export function PostItem({ post }: PostItemProps) {
  const router = useRouter();
  const { prefetchPost } = usePostsStore();
  const { prefetchCommentsForPost } = useCommentsStore();
  const truncatedBody = truncateBody(post.body, 3);
  const borderColor = useThemeColor({}, 'icon');

  const handlePressIn = () => {
    // Prefetch post and comments when user starts pressing
    prefetchPost(post.id);
    prefetchCommentsForPost(post.id);
  };

  const handlePress = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.postItem,
        { borderBottomColor: borderColor + '40' },
        pressed && styles.postItemPressed,
      ]}>
      <ThemedView style={styles.postContent}>
        <ThemedText type="subtitle" style={styles.postTitle}>
          {post.title}
        </ThemedText>
        <ThemedText style={styles.postBody} numberOfLines={3}>
          {truncatedBody}
        </ThemedText>
        <ThemedText style={styles.postMeta}>Post #{post.id}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  postItem: {
    borderBottomWidth: 1,
  },
  postItemPressed: {
    opacity: 0.7,
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    marginBottom: 8,
  },
  postBody: {
    marginBottom: 8,
    lineHeight: 20,
  },
  postMeta: {
    fontSize: 12,
    opacity: 0.6,
  },
});

