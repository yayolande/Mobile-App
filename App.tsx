// Mobile Tournament App
//
import React, { useState, useContext, createContext, useEffect } from 'react';
import { NavigationContainer, NavigationProp, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OPSQLiteConnection, open } from '@op-engineering/op-sqlite';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity } from 'react-native';

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
    currentTournament: {},
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
          {
            //FIXME: REAL NAME IS 'TournamentManagement' not 'Home'
          }
          <Stack.Screen name="Test HomeScreen" component={HomeScreen} />
          <Stack.Screen
            name="up-coming-matches"
            component={UpcomingMatches}
            options={{ title: 'Up Coming Mathces' }}
          />
          <Stack.Screen
            name="create-tournament"
            component={CreateTournamentScreen}
            // eslint-disable-next-line prettier/prettier
            options={{ title: 'Create Tournament' }}
          />
          <Stack.Screen
            name="team-management"
            component={TeamManagementScreen}
            options={{ title: 'Team Management' }}
          />
          <Stack.Screen
            name="create-team"
            component={CreateTeamScreen}
            options={{ title: 'Team Creation' }}
          />
          <Stack.Screen
            name="schedule-match"
            component={ScheduleMatchScreen}
            options={{ title: 'Schedule a Match' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GlobalStateManagement.Provider>
  );
}

// eslint-disable-next-line prettier/prettier
function HomeScreen({ navigation }: any): React.JSX.Element {
  let store: GlobalStore = useContext(GlobalStateManagement);
  let screenFocus = useIsFocused();
  let [tournamentState, setTournamentState] = useState([] as any[]);

  useEffect(() => {
    console.log('Homescreen store.user = ');
    console.log(store.user);
  }, [store.user]);

  useEffect(() => {
    console.log('Gain focus of Homescreen');
    let { rows } = DB.execute('SELECT * FROM tournaments WHERE organizer_id = ? ', [
      store.user.id,
    ]);

    let userTournament: any[] = [];
    userTournament = rows?._array || [];
    setTournamentState(userTournament);
  }, [screenFocus, store.user.id]);

  return (
    <View>
      {tournamentState.map(item => {
        return (
          // TODO: Wrap this list with <ScrollView>
          <View key={item.id}>
            <TouchableOpacity
              onPress={_ => {
                console.log(`Chose tournament: ${item.name}`);
                store.currentTournament.id = item.id;
                store.currentTournament.name = item.name;
                navigation.navigate('team-management');
              }}>
              <Text>
                {item.id} ::: {item.name}
              </Text>
              <TouchableOpacity
                onPress={_ => {
                  console.log('Delete actoin');
                }}
              >
                <Text>=Delete=</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        );
      })}
      <Text>HomeScreen</Text>
      <Button
        title="Create Tourney"
        onPress={() => {
          console.log('Pressed __Create Tourney__ button');
          console.log('Hi');
          navigation.navigate('create-tournament');
          console.log(navigation);
        }}
      />
      <Button title='test' onPress={_ => console.log(`store.name = ${store.name}`)} />
    </View>
  );
}

function CreateTournamentScreen({ navigation }): React.JSX.Element {
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
          let result_insertion = DB.execute(
            'INSERT INTO tournaments (name, organizer_id) values (?, ?)',
            [tournamentName, store.user.id],
          );
          console.log('Insertion Result :');
          console.log(result_insertion);

          let { rows } = DB.execute('SELECT * FROM tournaments');
          rows?._array.forEach(row => console.log(row));
          console.log(`store previous value = ${store.name}`);
          console.log(`store current value = ${store.name}`);

          store.currentTournament = { id: result_insertion.insertId, name: tournamentName };

          let results = DB.execute('select rowid from tournaments');
          results.rows?._array.forEach(element => {
            console.log('rowid ??');
            console.log(element);
          });
          console.log('current active tournament');
          console.log(store);
          console.log(typeof navigation);

          navigation.goBack();
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

function TeamManagementScreen({ navigation }): React.JSX.Element {
  let [teams, setTeams] = useState([] as any[])
  let store = useContext(GlobalStateManagement);
  let screenFocus = useIsFocused();

  useEffect(() => {
    console.log('Team management focus gamed');
    let { rows } = DB.execute('SELECT * FROM teams WHERE tournament_id = ?', [
      store.currentTournament.id,
    ]);

    setTeams(rows?._array || []);
  }, [screenFocus, store.currentTournament.id]);

  return (
    <View>
      <Text>Tournamement: {store.currentTournament.name} --- (id: {store.currentTournament.id})</Text>
      <Button
        title="Create Team"
        onPress={_ => {
          navigation.navigate('create-team');
        }}
      />
      <Button
        title="Create match schedule"
        onPress={_ => {
          navigation.navigate('schedule-match');
        }}
      />
      <View>
        {teams.map(team => {
          return (
            <View key={team.id}>
              <Text>{team.id} ::: {team.code}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CreateTeamScreen({ navigation }): React.JSX.Element {
  let store = useContext(GlobalStateManagement);
  let team = {} as any;

  return (
    <View>
      <TextInput
        placeholder="Enter the Team code"
        onChangeText={text => (team.code = text)}
      />
      <TextInput
        placeholder="Enter team fullname"
        onChangeText={text => (team.fullName = text)}
      />
      <Button
        title="Create Team"
        onPress={_ => {
          console.log('Creating Team ... not implemented !');
          DB.execute(
            'INSERT INTO teams (code, full_name, tournament_id) values (?, ?, ?)',
            [team.code, team.fullName, store.currentTournament.id],
          );
          navigation.goBack();
        }}
      />
    </View>
  );
}

function ScheduleMatchScreen({ navigation }): React.JSX.Element {
  return (
    <View>
      <Text>Select team 1 & 2; chose the date & time</Text>
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
