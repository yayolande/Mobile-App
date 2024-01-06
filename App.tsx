// Mobile Tournament App
//
import React, { useState, useContext, createContext, useEffect } from 'react';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
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
        <Stack.Navigator initialRouteName="team-management">
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

    console.log(rows?._array);

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
              <Text>startdate: {item.start_date}</Text>
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
      <Button
        title="test"
        onPress={_ => console.log(`store.name = ${store.name}`)}
      />
    </View>
  );
}

function CreateTournamentScreen({ navigation }): React.JSX.Element {
  const [tournament, setTournament] = useState({} as any);
  let store: any = useContext(GlobalStateManagement);

  return (
    <View>
      <Text>Create Tournament</Text>
      <TextInput
        style={styles.inputCreateTournament}
        placeholder="Tournament Name"
        onChangeText={text => setTournament({ ...tournament, name: text })}
      />
      <TextInput
        style={styles.inputCreateTournament}
        placeholder="Matches Frequency (Default: 7)"
        onChangeText={text =>
          setTournament({ ...tournament, matchFrequency: text })
        }
      />
      <TextInput
        style={styles.inputCreateTournament}
        placeholder="Start Date (Default: Today)"
        onChangeText={text => setTournament({ ...tournament, startDate: text })}
      />
      <Button
        title="Create Tournament"
        onPress={_ => {
          console.log(
            '... creating tournament (inserting to DB). Name = ',
            tournament.name,
          );

          console.log(`Tourney startDate: ${tournament.startDate}`);
          console.log(tournament);
          // Checking if all input are OK
          // let matchFrequency: int = parseInt(tournament.matchFrequency, 10);
          // let startDate: Date = new Date(tournament.startDate);

          // Insert default value if field empty
          if (
            tournament.matchFrequency === '' ||
            tournament.matchFrequency === undefined ||
            NaN(parseInt(tournament.matchFrequency, 10))
          ) {
            // setTournament(item => (item.matchFrequency = '7'));
            tournament.matchFrequency = '7';
          }
          // TODO: if start
          if (
            tournament.startDate === '' ||
            tournament.startDate === undefined ||
            new Date(tournament.startDate).toString() === 'Invalid Date'
          ) {
            // tournament.startDate = new Date().toDateString();
            let date = new Date().toISOString();
            tournament.startDate = date.split('T')[0];
            // setTournament(item => (item.startDate = date));
          }

          console.log('===============');
          // console.log(`frequency: ${matchFrequency} :::::: startDate: ${startDate}`);
          console.log('===============');
          console.log(tournament);

          // Saving the data to database
          let result_insertion = DB.execute(
            'INSERT INTO tournaments (name, match_frequency, start_date, organizer_id) values (?, ?, ?, ?);',
            [
              tournament.name,
              tournament.matchFrequency,
              tournament.startDate,
              store.user.id,
            ],
          );
          console.log('Insertion Result :');
          console.log(result_insertion);

          store.currentTournament = {
            id: result_insertion.insertId,
            name: tournament.name,
          };

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
  let [teams, setTeams] = useState([] as any[]);
  let store = useContext(GlobalStateManagement);
  let screenFocus = useIsFocused();

  // ================ Only for testing to remove
  store.currentTournament.id = 1;
  store.currentTournament.name = 'Test Momo Tourney';
  // ================ Only for testing to remove END @@@@@@

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
      <Button
        title="Team pairing"
        onPress={_ => {
          console.log(teams);

          let teamsId = teams.map(el => el.id);
          let teamsPairing = MakeTeamsPairing(teamsId);
          console.log('final team pairing');
          console.log(teamsPairing);
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

function MakeTeamsPairing(teamsId: any[]) {
  let maxTeams = teamsId.length;
  let maxRounds = maxTeams - 1;
  let maxRetry = 3;
  let teams = [];
  let isScheduleFilled = false;

  console.log('================== MakeTeamsPairing ==================');
  console.log(teamsId);

  for (let i = 0; i < maxRetry; i++) {
    [teams, isScheduleFilled] = buildSimpleTeamsPairing(maxTeams);

    if (isScheduleFilled) {
      break;
    }
  }

  console.log('------->>>> ', teams);

  if (!isScheduleFilled) {
    console.log('matches scheduler function failed !');

    return [null, isScheduleFilled];
  }

  // Work in Progress
  // TODO: Work in progress here ...
  //
  console.log('====== teamSchedules ======');
  let roundLengthInDays = 7.0;
  let maxMatchesPerRound = teams.length / 2;
  let averageDailyMatches = maxMatchesPerRound / roundLengthInDays;
  // Eliminate error due to low precision rounding
  // (eg. avg = 1/3 = 0.3. However 0.3 = .9, so one match won't be counted because of this)
  averageDailyMatches += .1;

  let matchesByRounds: any[] = Array(maxRounds)
    .fill(null)
    .map(_ => []);
  console.log('matchesByRounds: ', matchesByRounds);
  let teamsCopy = teams.slice();
  let teamHomeId: number;
  let teamAwayId: number;
  let matchesRemainingForTheDay: number;
  let matchDay: number;

  for (let _round = 0; _round < maxRounds; _round++) {
    matchesRemainingForTheDay = averageDailyMatches;
    matchDay = 1;

    for (let _teamId = 0; _teamId < maxTeams; _teamId++) {
      teamHomeId = _teamId;
      teamAwayId = teamsCopy[_teamId][_round];

      if (teamAwayId === -1) {
        console.log(`round = ${_round} :: teamId = ${_teamId} ||| Hitted continue instruction (for loop)`);
        continue;
      }

      teamsCopy[teamHomeId][_round] = -1;
      teamsCopy[teamAwayId][_round] = -1;

      matchesRemainingForTheDay -= 1;
      if (matchesRemainingForTheDay < 0) {
        matchesRemainingForTheDay += averageDailyMatches;
        matchDay++;
      }

      console.log('Pre assignment, matchesbyRound: ', matchesByRounds);

      matchesByRounds[_round].push({
        teamHomeId: teamHomeId,
        teamAwayId: teamAwayId,
        day: matchDay,
      });

      console.log(`[end for loop] round = ${_round} :: teamId = ${_teamId} :: matchesByRounds = `, matchesByRounds);
    }
  }
  console.log(
    'final matchesbyRound (teamsId not converted) ---> ',
    matchesByRounds,
  );
  console.log('averageDailyMatches: ', averageDailyMatches);
  console.log('teams size: ', maxTeams);
  console.log('teamsCopy: ', teamsCopy);
  console.log('====== ======');
  return;
  //
  //
  //
  // End Work

  // Convert from 0-based index to application based index for all teams
  let pairing = {};
  let teamId: number;

  for (let i = 0; i < teams.length; i++) {
    teamId = teamsId[i];
    pairing[teamId] = [];

    for (let j = 0; j < teams[i].length; j++) {
      pairing[teamId].push(teamsId[teams[i][j]]);
    }
  }

  console.log('pairing completed: ', pairing);
  return [pairing, isScheduleFilled];
}

function buildSimpleTeamsPairing(teamsCount: number) {
  if (teamsCount % 2 !== 0) {
    console.log(
      '[Warning]: For the pairing to work, you need an even number of teams. Instead you have :',
      teamsCount,
    );

    return [null, false];
  }
  // teams[i] = matches for team 'i'
  // matches[j] = match for round 'j + 1'
  // teams.length = teamCount

  const NOT_SCHEDULED = -1;
  let maxTeams = teamsCount;
  let maxRounds = maxTeams - 1;
  let teams = Array(maxTeams).fill([]);
  teams = teams.map(_ => Array(maxRounds).fill(NOT_SCHEDULED));

  let teamsId = Array(maxTeams)
    .fill(0)
    .map((_, index) => index);

  console.log('==========================================');
  console.log(teams);

  let currentTeamId = 0;
  let indexCurrentTeamId = 0;
  let opponentTeams = [];

  let shuffledOpponentTeams = [];
  let isScheduleProperlyFill = true;

  for (let i = 0; i < teams.length; i++) {
    console.log('--------||-------');
    currentTeamId = i;
    indexCurrentTeamId = teamsId.indexOf(currentTeamId);

    opponentTeams = teamsId.slice();
    opponentTeams.splice(indexCurrentTeamId, 1);
    shuffledOpponentTeams = randomizeArrayposition(opponentTeams);
    console.log(`availableOpponent for id = ${i}: `, shuffledOpponentTeams);

    // First loop on the row to identify the matches already scheduled and remove them from shuffledOpponentTeams
    for (let j = 0; j < teams[i].length; j++) {
      if (teams[i][j] === NOT_SCHEDULED) {
        continue;
      }

      let idOpponentToRemove = teams[i][j];
      let indexOpponentIdToRemove =
        shuffledOpponentTeams.indexOf(idOpponentToRemove);
      shuffledOpponentTeams.splice(indexOpponentIdToRemove, 1);
    }
    console.log(
      'What left after row removal of existing oppoenet: ',
      shuffledOpponentTeams,
    );
    //
    // Second loop on the columns, of 'teams', to make sure a same team dont appear twice, columns wise
    for (let j = 0; j < teams[i].length; j++) {
      if (teams[i][j] !== NOT_SCHEDULED) {
        continue;
      }

      for (let k = 0; k < shuffledOpponentTeams.length; k++) {
        console.log('shuffleOp loop, id: ', k);
        let opponentId = shuffledOpponentTeams[k];
        let isOpponentFound = false;

        for (let h = 0; h < teams.length; h++) {
          if (teams[h][j] === opponentId) {
            isOpponentFound = true;
            break;
          }
        }

        if (isOpponentFound) {
          continue;
        }

        teams[i][j] = opponentId;
        teams[opponentId][j] = i;

        shuffledOpponentTeams.splice(k, 1);
        break;
      }
    }
    console.log(`end-availableOpponent for id = ${i}: `, shuffledOpponentTeams);
    if (isScheduleProperlyFill && shuffledOpponentTeams.length > 0) {
      isScheduleProperlyFill = false;
    }
  }

  console.log('Final teams matches schedule: ', teams);
  let str = '';
  for (let i = 0; i < teams.length; i++) {
    str = '';
    for (let j = 0; j < teams[i].length; j++) {
      str += ' ' + teams[i][j];
    }
    console.log(str);
  }

  return [teams, isScheduleProperlyFill];
}

function randomizeArrayposition(src: any[]) {
  let arr: any[] = src.slice(); // Create a clone from source array
  let randomizedArray = [];
  let random = 0;

  for (let i = arr.length; i > 0; i--) {
    random = Math.floor(Math.random() * arr.length);
    randomizedArray.push(arr[random]);
    arr.splice(random, 1);
  }

  return randomizedArray;
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
      match_frequency int,
      start_date date,
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
    marginHorizontal: 20,
    marginVertical: 10,
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
