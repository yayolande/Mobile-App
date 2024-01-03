// Mobile Tournament App
//
import React, { useState, useContext, createContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OPSQLiteConnection, open } from '@op-engineering/op-sqlite';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

const Stack = createNativeStackNavigator();
const GlobalStateManagement = createContext({} as GlobalStore);
let DB: OPSQLiteConnection;

interface GlobalStore {
  user: any;
  currentTournament: any;
}

function AppNavigator(): React.JSX.Element {
  const db = open({ name: 'test.db' });
  DB = db;

  // let store = { name: 'steveen', age: 30 };
  let store: GlobalStore = {
    user: { name: 'steveen', age: 34 },
    currentTournament: null,
  };

  databaseMigration(db);

  // db.execute('DROP TABLE IF EXISTS test;');
  // db.execute('create table if not exists test (id int, name text)');
  // db.execute("INSERT INTO test (name) values ('Malkova'), ('Aston');");
  // db.execute("insert into users (name, password) values ('grad', 'grad')");
  let { rows } = db.execute('select * from users;');
  rows?._array.forEach(row => {
    console.log(row);
    store.user = row;
  });

  // let { rows } = db.execute('SELECT * FROM test;');
  // rows?._array.forEach(row => {
  //   console.log(row);
  // });

  return (
    <GlobalStateManagement.Provider value={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Test HomeScreen" component={HomeScreen} />
          <Stack.Screen
            name="up-coming-matches"
            component={UpcomingMatches}
            options={{ title: 'Up Coming Mathces' }}
          />
          <Stack.Screen
            name="create-tournament"
            component={CreateTournamentScreen}
            options={{ title: 'Create Tournament' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GlobalStateManagement.Provider>
  );
}

function HomeScreen({ navigation }): React.JSX.Element {
  let store: GlobalStore = useContext(GlobalStateManagement);

  useEffect(() => {
    console.log('Homescreen store.user = ');
    console.log(store.user);
  }, [store.user]);

  return (
    <View>
      <Text>HomeScreen</Text>
      <Button
        title="Create Tourney"
        onPress={() => {
          console.log('Pressed __Create Tourney__ button');
          console.log('Hi');
          navigation.navigate('create-tournament');
        }}
      />
      <Button title='test' onPress={_ => console.log(`store.name = ${store.name}`)} />
    </View>
  );
}

function CreateTournamentScreen(): React.JSX.Element {
  const [tournamentName, setTournamentName] = useState('');
  let store: any = useContext(GlobalStateManagement);

  return (
    <View>
      <Text>Create Tournament</Text>
      <TextInput
        style={styles.inputCreateTournament}
        placeholder="Tournament Name"
        onChangeText={text => setTournamentName(text)}
      />
      <Button
        title="Create Tournament"
        onPress={_ => {
          console.log(
            '... creating tournament (inserting to DB). Name = ',
            tournamentName,
          );
          // DB.execute('INSERT INTO tournaments (name) values (?)', [
          // tournamentName,
          // ]);

          let { rows } = DB.execute('SELECT * FROM tournaments');
          rows?._array.forEach(row => console.log(row));
          console.log(`store previous value = ${store.name}`);
          store.name = tournamentName;
          console.log(`store current value = ${store.name}`);
        }}
      />
    </View>
  );
}

function UpcomingMatches(): React.JSX.Element {
  let matches = [
    {
      teamAwayCode: 'MCI',
      teamHomeCode: 'CHE',
      teamAwayLogo: 'H',
      teamHomeLogo: 'C',
      matchDate: 'Jan 2, 2023',
      matchTime: '17:00',
    },
    {
      teamAwayCode: 'ARS',
      teamHomeCode: 'FUL',
      teamAwayLogo: 'A',
      teamHomeLogo: 'F',
      matchDate: 'Jan 2, 2023',
      matchTime: '15:00',
    },
    {
      teamAwayCode: 'LIV',
      teamHomeCode: 'SPU',
      teamAwayLogo: 'L',
      teamHomeLogo: 'S',
      matchDate: 'Jan 2, 2023',
      matchTime: '20:00',
    },
  ];

  // TODO: Add 'date' to the Card UI (singular match)
  return (
    <View style={styles.screenContainer}>
      {matches.map(item => (
        <View style={styles.upcommingMatchesContainer}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamCode}>{item.teamHomeCode}</Text>
            <View style={styles.teamLogo} />
          </View>
          <Text style={styles.teamContainer}>{item.matchTime}</Text>
          <View style={styles.teamContainer}>
            <View style={[styles.teamLogo, { backgroundColor: 'blue' }]} />
            <Text style={styles.teamCode}>{item.teamAwayCode}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function databaseMigration(db: OPSQLiteConnection): void {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id integer primary key autoincrement,
      name text,
      password text,
      status int default 1
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id integer primary key autoincrement,
      name text,
      organizer_id int,
      FOREIGN KEY (organizer_id) REFERENCES users (id)
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id integer primary key autoincrement,
      code varchar(10),
      full_name text,
      logo_path text,
      tournament_id int,
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS matches (
      id integer primary key autoincrement,
      team_home_id int,
      team_away_id int,
      score_team_home int check (score_team_home >= 0),
      score_team_away int check (score_team_away >= 0),
      scheduled_datetime datetime,
      FOREIGN KEY (team_home_id) REFERENCES teams (id),
      FOREIGN KEY (team_away_id) REFERENCES teams (id)
    );
  `);
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingHorizontal: 30,
    // alignItems: 'center',
  },
  upcommingMatchesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    // flex: 1,
  },
  teamCode: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginLeft: 12,
    marginRight: 12,
    backgroundColor: 'red',
  },
  inputCreateTournament: {
    borderColor: '#000',
    borderWidth: 1,
  },
});

let App: any;
// let App = UpcomingMatches;
App = AppNavigator;

export default App;
