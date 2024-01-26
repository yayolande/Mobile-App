import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const tournamentStandingsData = [
  { team: 'Team A', wins: 3, losses: 1, draws: 2 },
  { team: 'Team B', wins: 2, losses: 2, draws: 1 },
  { team: 'Team C', wins: 4, losses: 0, draws: 1 },
  // Add more teams as needed
];

const TournamentStandingView = () => {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    setStandings(tournamentStandingsData);
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 1 && styles.rowEven]}>
      <Text style={styles.team}>{item.team}</Text>
      <Text style={styles.result}>{`${item.wins}-${item.losses}-${item.draws}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tournament Standings</Text>
      <FlatList
        data={standings}
        renderItem={renderItem}
        keyExtractor={(item) => item.team}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  rowEven: {
    backgroundColor: '#f2f2f3',
  },
  team: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 18,
  },
});

export default TournamentStandingView;

