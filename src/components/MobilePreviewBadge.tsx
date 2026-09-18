import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface MobilePreviewBadgeProps {
  commitSha?: string;
  channel?: string;
}

export const MobilePreviewBadge: React.FC<MobilePreviewBadgeProps> = ({
  commitSha = 'preview',
  channel = 'preview',
}) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>PREVIEW [{channel}] {commitSha}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 99999,
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
