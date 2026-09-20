import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export interface MobilePreviewBadgeProps {
  commitSha?: string;
  channel?: string;
  updateId?: string;
}

export const MobilePreviewBadge: React.FC<MobilePreviewBadgeProps> = ({
  commitSha = 'preview',
  channel = 'preview',
  updateId,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{
    channel: string;
    updateId: string;
    isEmbedded: boolean;
  }>({
    channel,
    updateId: updateId || 'embedded',
    isEmbedded: true,
  });

  useEffect(() => {
    async function initUpdatesInfo() {
      try {
        const Updates = await import('expo-updates');
        setPreviewMeta({
          channel: Updates.channel || channel,
          updateId: Updates.updateId ? Updates.updateId.slice(0, 8) : updateId || 'embedded',
          isEmbedded: Updates.isEmbeddedLaunch,
        });
      } catch {
        setPreviewMeta({
          channel,
          updateId: updateId || 'dev-build',
          isEmbedded: true,
        });
      }
    }
    initUpdatesInfo();
  }, [channel, updateId]);

  const handleCheckAndReloadUpdate = async () => {
    setLoading(true);
    setStatusMessage('Checking for OTA updates...');
    try {
      const Updates = await import('expo-updates');
      const checkResult = await Updates.checkForUpdateAsync();
      if (checkResult.isAvailable) {
        setStatusMessage('Downloading new bundle...');
        await Updates.fetchUpdateAsync();
        setStatusMessage('Reloading app...');
        await Updates.reloadAsync();
      } else {
        setStatusMessage('App is already up to date!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('development') || msg.includes('Expo Go')) {
        setStatusMessage('OTA refresh supported in production/preview builds');
      } else {
        setStatusMessage(`Update error: ${msg}`);
      }
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.badgeContainer}>
      <View style={styles.infoRow}>
        <Text style={styles.titleText}>📱 MOBILE PREVIEW</Text>
        <Text style={styles.infoText}>Channel: <Text style={styles.boldText}>{previewMeta.channel}</Text></Text>
        <Text style={styles.infoText}>Commit: <Text style={styles.boldText}>{commitSha.slice(0, 7)}</Text></Text>
        <Text style={styles.infoText}>Update: <Text style={styles.boldText}>{previewMeta.updateId}</Text></Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCheckAndReloadUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>🔄 Check & Force Reload Update</Text>
        )}
      </TouchableOpacity>

      {statusMessage ? (
        <Text style={styles.statusText}>{statusMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    marginBottom: 8,
  },
  titleText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 2,
  },
  boldText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    color: '#f59e0b',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
});
