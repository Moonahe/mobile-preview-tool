import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [counter, setCounter] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📱 Mobile Preview Demo</Text>
          <Text style={styles.subtitle}>
            Showcasing Automated Change Detection & Preview Pipeline
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ How mobile-preview works</Text>
          <View style={styles.featureItem}>
            <Text style={styles.badgeJs}>JavaScript / Assets</Text>
            <Text style={styles.featureText}>
              Modifying JS/TS files, components, or UI styles triggers a fast Over-The-Air (OTA) EAS Update without full rebuilds.
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.badgeNative}>Native / Config</Text>
            <Text style={styles.featureText}>
              Adding native dependencies, updating <Text style={styles.code}>app.json</Text>, or modifying native code triggers a full native build (Gradle APK or EAS Build).
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Interactive Demo Component Changed</Text>
          <Text style={styles.bodyText}>
            Try editing this file (<Text style={styles.code}>demo/App.js</Text>) and running <Text style={styles.code}>npx mobile-preview detect</Text>!
          </Text>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>Counter: {counter}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCounter(counter + 1)}
            >
              <Text style={styles.buttonText}>Increment Counter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛠 Useful CLI Commands</Text>
          <Text style={styles.cmdText}>• <Text style={styles.code}>npx mobile-preview detect</Text> - Detect changes</Text>
          <Text style={styles.cmdText}>• <Text style={styles.code}>npx mobile-preview doctor</Text> - Check environment</Text>
          <Text style={styles.cmdText}>• <Text style={styles.code}>npx mobile-preview publish</Text> - Publish update or build</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  featureItem: {
    marginBottom: 12,
  },
  badgeJs: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  badgeNative: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
  },
  code: {
    backgroundColor: '#f1f5f9',
    fontWeight: '600',
    color: '#0f172a',
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  cmdText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
});
