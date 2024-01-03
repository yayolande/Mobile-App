CREATE TABLE IF NOT EXISTS users (
  id integer primary key autoincrement,
  name text,
  password text,
  status int default 1
);

CREATE TABLE IF NOT EXISTS tournaments (
  id integer primary key autoincrement,
  name text,
  match_frequency int,
  start_date date,
  organizer_id int,
  FOREIGN KEY (organizer_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS teams (
  id integer primary key autoincrement,
  code varchar(10),
  full_name text,
  logo_path text,
  tournament_id int,
  FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
);

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
