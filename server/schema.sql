-- Mertloch Chronicles · Online-Datenbank (Stufe A/B). MariaDB 11, utf8mb4.
-- Einspielen: mysql --default-character-set=utf8mb4 -h <host> -u <user> -p <db> < server/schema.sql
-- (vom Webspace aus über SSH; die Datenbank ist von außen nicht erreichbar.)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS account (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(190) NOT NULL,
  display_name  VARCHAR(40)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16)  NOT NULL DEFAULT 'player',
  created_at    DATETIME     NOT NULL,
  deleted_at    DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_account_email (email),
  UNIQUE KEY uq_account_name (display_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS session (
  token_hash   CHAR(64)     NOT NULL,
  account_id   INT UNSIGNED NOT NULL,
  created_at   DATETIME     NOT NULL,
  expires_at   DATETIME     NOT NULL,
  last_seen_at DATETIME     NOT NULL,
  user_agent   VARCHAR(200) NULL,
  PRIMARY KEY (token_hash),
  KEY ix_session_account (account_id),
  CONSTRAINT fk_session_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS character_save (
  account_id    INT UNSIGNED NOT NULL,
  world_key     VARCHAR(80)  NOT NULL,
  save_json     MEDIUMTEXT   NOT NULL,
  previous_json MEDIUMTEXT   NULL,
  saved_at      BIGINT       NOT NULL,   -- Client-Zeitstempel (ms) des Spielstands
  updated_at    DATETIME     NOT NULL,
  level         SMALLINT     NOT NULL DEFAULT 0,
  class_id      VARCHAR(20)  NOT NULL DEFAULT '',
  spec          VARCHAR(40)  NOT NULL DEFAULT '',
  PRIMARY KEY (account_id, world_key),
  CONSTRAINT fk_save_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS presence (
  account_id INT UNSIGNED NOT NULL,
  world_key  VARCHAR(80)  NOT NULL,
  x          DOUBLE       NOT NULL,
  y          DOUBLE       NOT NULL,
  facing     TINYINT      NOT NULL DEFAULT 1,
  class_id   VARCHAR(20)  NOT NULL,
  level      SMALLINT     NOT NULL DEFAULT 1,
  spec       VARCHAR(40)  NOT NULL DEFAULT '',
  state      VARCHAR(16)  NOT NULL DEFAULT 'idle',
  seen_at    DATETIME     NOT NULL,
  PRIMARY KEY (account_id),
  KEY ix_presence_world (world_key, seen_at),
  CONSTRAINT fk_presence_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leaderboard_entry (
  board      VARCHAR(24)  NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  value      DOUBLE       NOT NULL,
  meta_json  VARCHAR(2000) NULL,
  updated_at DATETIME     NOT NULL,
  PRIMARY KEY (board, account_id),
  KEY ix_board_value (board, value),
  CONSTRAINT fk_board_account FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempt (
  ip           VARCHAR(45) NOT NULL,
  scope        VARCHAR(24) NOT NULL,
  fails        INT         NOT NULL DEFAULT 0,
  first_fail   DATETIME    NOT NULL,
  locked_until DATETIME    NULL,
  PRIMARY KEY (ip, scope)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
