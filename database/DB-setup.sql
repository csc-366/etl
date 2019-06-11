CREATE TABLE Rookery (
  Rookery VARCHAR(6),
  RookeryName VARCHAR(32),
  PRIMARY KEY (Rookery)
);
INSERT INTO Rookery (Rookery, RookeryName) VALUES ('PB', 'Piedras Blancas'), ('VAFB','Vandenberg Air Force Base');

CREATE TABLE Location (
  Beach   VARCHAR(6),
  BeachName VARCHAR(48),
  Rookery VARCHAR(6),
  PRIMARY KEY (Beach),
  FOREIGN KEY (Rookery) REFERENCES Rookery(Rookery)
);
INSERT INTO Location (Beach, BeachName, Rookery) VALUES
                                                        ('ACU','Arroyo del Corral, Upper','PB'),
                                                        ('ACL','Arroyo del Corral, Lower','PB'),
                                                        ('DCU','Dead Center, Upper','PB'),
                                                        ('DCC','Dead Center, Center','PB'),
                                                        ('DCL','Dead Center, Lower','PB'),
                                                        ('VP3DC','Vista Point 3 to Dead Center','PB'),
                                                        ('VP3U','Vista Point 3, Upper','PB'),
                                                        ('VP3L','Vista Point 3, Lower','PB'),
                                                        ('ALU','Arroyo Laguna, Upper','PB'),
                                                        ('ALLn','Arroyo Laguna, Lower North','PB'),
                                                        ('ALLs','Arroyo Laguna, Lower South','PB'),
                                                        ('ALL','Arroyo Laguna','PB'),
                                                        ('LTU','La Tortuga, Upper','PB'),
                                                        ('LTC','La Tortuga, Center','PB'),
                                                        ('LTL','La Tortuga, Lower','PB'),
                                                        ('VAFB','Vandenberg Air Force Base','VAFB'),
                                                        ('COVE', 'Cove', 'PB'),

                                                        ('LT','LT','PB'),
                                                        ('ALC','ALC','PB'),
                                                        ('AL','AL','PB'),
                                                        ('VP3s','VP3s','PB'),
                                                        ('DC_','DC_','PB'),
                                                        ('VP3','VP3','PB'),
                                                        ('AC','AC','PB'),
                                                        ('MOTL','MOTL','PB'),
                                                        ('MOTU','MOTU','PB')
;

CREATE TABLE NationalLocation (
  NationalLocation VARCHAR(6),
  Location         VARCHAR(6),
  NationalLocationName VARCHAR(24),
  PRIMARY KEY (NationalLocation, Location),
  FOREIGN KEY (Location) REFERENCES Location (Beach)
);

CREATE TABLE Affiliation (
  Affiliation VARCHAR(24),
  Description VARCHAR(48),
  PRIMARY KEY (Affiliation)
);
INSERT INTO Affiliation (Affiliation, Description) VALUES ('None', 'No Affiliation');

CREATE TABLE User (
  Username     VARCHAR(24),
  PasswordHash VARCHAR(64),
  PasswordSalt VARCHAR(12),
  FirstName    VARCHAR(24),
  LastName     VARCHAR(24),
  Email        VARCHAR(48),
  Affiliation  VARCHAR(24) DEFAULT 'None',
  Role         ENUM ('Admin', 'Scientist', 'Citizen Scientist'),
  Status       ENUM ('Active', 'Pending', 'Deactivated'),
  CanAdd       ENUM ('Yes', 'No'),
  CanApprove   ENUM ('Yes', 'No'),
  CanModify    ENUM ('Yes', 'No'),
  CanArchive   ENUM ('Yes', 'No'),
  CanImport    ENUM ('Yes', 'No'),
  CanExport    ENUM ('Yes', 'No'),
  PRIMARY KEY (Username),
  FOREIGN KEY (Affiliation) REFERENCES Affiliation(Affiliation)
);

CREATE TABLE Observer (
  Email       VARCHAR(48),
  FirstName   VARCHAR(24),
  LastName    VARCHAR(24),
  Affiliation VARCHAR(24),
  PRIMARY KEY (Email),
  FOREIGN KEY (Affiliation) REFERENCES Affiliation(Affiliation)
);

CREATE TABLE AgeClass(
  ShortName VARCHAR(4),
  FullName VARCHAR(16),
  Description VARCHAR(256) DEFAULT NULL,
  PRIMARY KEY (ShortName)
);
INSERT INTO AgeClass (ShortName, FullName, Description) VALUES ('P', 'Pup', 'Dependent pup, still with mom; black fur'),
                                                               ('W', 'Weanling', 'Pup, no longer with mom; may have black or silver fur'),
                                                               ('J', 'Juvenile', 'Yearling or juvenile; has left the beach for at least one feeding migration; coat can be yellowish (until after molt); longer than weanlings, smaller than adults'),
                                                               ('SA1', 'SubAdult 1', 'No nose droop, no head shield; similar in size to adult female'),
                                                               ('SA2', 'SubAdult 2', 'Nose droops but not to ground; no chest shield'),
                                                               ('SA3', 'SubAdult 3', 'Light scarring; when lying down, nose touches the ground'),
                                                               ('SA4', 'SubAdult 4', 'Chest shield not above eyes; notch across nose, but less pronounced than in adult males'),
                                                               ('A', 'Adult', 'Female: no nose droop, daintier head structure than males; Male: heavy pink scarring, chest shield level with or above eyes')
;

CREATE TABLE Observation (
  ID             INTEGER AUTO_INCREMENT,
  Date           DATE,
  Location       VARCHAR(6),
  Reviewer       VARCHAR(24),
  SubmittedBy    VARCHAR(24),
  Observer       VARCHAR(48),
  AgeClass       VARCHAR(4),
  MoltPercentage INTEGER,
  Comments       VARCHAR(256),
  PRIMARY KEY (ID),
  FOREIGN KEY (Location) REFERENCES Location (Beach),
  FOREIGN KEY (Reviewer) REFERENCES User (Username),
  FOREIGN KEY (SubmittedBy) REFERENCES User (Username),
  FOREIGN KEY (Observer) REFERENCES Observer (Email),
  FOREIGN KEY (AgeClass) REFERENCES AgeClass(ShortName)
);

CREATE TABLE FieldLeader (
  ObservationId INTEGER,
  Leader VARCHAR(48),
  PRIMARY KEY (ObservationId, Leader),
  FOREIGN KEY (ObservationId) REFERENCES Observation(ID)
);

CREATE TABLE PupCount (
  ObservationId INTEGER,
  Count         INTEGER,
  PRIMARY KEY (ObservationId),
  FOREIGN KEY (ObservationId) REFERENCES Observation (ID)
);

CREATE TABLE PupAge (
  ObservationId INTEGER,
  Age           INTEGER,
  PRIMARY KEY (ObservationId),
  FOREIGN KEY (ObservationId) REFERENCES Observation (ID)
);

CREATE TABLE Measurement (
  ObservationId     INTEGER,
  StandardLength    INTEGER,
  CurvilinearLength INTEGER,
  AxillaryGirth     INTEGER,
  TotalMass         FLOAT,
  MassTare          FLOAT,
  AnimalMass        FLOAT,
  PRIMARY KEY (ObservationId),
  FOREIGN KEY (ObservationId) REFERENCES Observation (ID)
);

CREATE TABLE Seal (
  FirstObservation INT,
  Sex              ENUM ('M', 'F'),
  Name             VARCHAR(64) DEFAULT NULL,
  `Procedure`      VARCHAR(12),
  PRIMARY KEY (FirstObservation),
  FOREIGN KEY (FirstObservation) REFERENCES Observation (ID)
);

CREATE TABLE Season (
  Year        INTEGER,
  Start       DATE,
  End         DATE,
  Description VARCHAR(32),
  PRIMARY KEY (Year)
);
INSERT INTO Season (Year, Start, End, Description) VALUES ('2018', (DATE '2017/10/01'), (DATE '2018/06/01'), '2018 season');
INSERT INTO Season (Year, Start, End, Description) VALUES ('2019', (DATE '2018/10/01'), (DATE '2019/06/01'), '2019 season');
INSERT INTO Season (Year, Start, End, Description) VALUES ('2020', (DATE '2019/10/01'), (DATE '2020/06/01'), '2020 season');


CREATE TABLE Mark (
  ID       INT AUTO_INCREMENT,
  Season   INT,
  Number   VARCHAR(6),
  Position VARCHAR(6),
  PRIMARY KEY (ID),
  FOREIGN KEY (Season) REFERENCES Season(Year)
);

CREATE TABLE MarkDeployment (
  ObservationId INTEGER,
  MarkId        INTEGER,
  SealId        INTEGER,
  PRIMARY KEY (MarkId),
  FOREIGN KEY (ObservationId) REFERENCES Observation (ID),
  FOREIGN KEY (MarkId) REFERENCES Mark (ID),
  FOREIGN KEY (SealId) REFERENCES Seal (FirstObservation)
);

CREATE TABLE MarkObservation (
  ObservationId INTEGER,
  MarkId        INTEGER,
  PRIMARY KEY (ObservationId, MarkId),
  FOREIGN KEY (ObservationId) REFERENCES Observation (ID),
  FOREIGN KEY (MarkId) REFERENCES Mark (ID)
);

CREATE TABLE TagPosition(
  Position VARCHAR(10),
  NationalTagPosition VARCHAR(10),
  Description VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (Position)
);
INSERT INTO TagPosition (Position, NationalTagPosition) VALUES ('R1-so','R-ou-So'),
                                                               ('R2-so','R-iu-So'),
                                                               ('R3-so','R-il-So'),
                                                               ('R4-so','R-ol-So'),
                                                               ('L1-so','L-ou-So'),
                                                               ('L2-so','L-iu-So'),
                                                               ('L3-so','L-il-So'),
                                                               ('L4-so','L-ol-So'),
                                                               ('R1-si','R-ou-Si'),
                                                               ('R2-si','R-iu-Si'),
                                                               ('R3-si','R-il-Si'),
                                                               ('R4-si','R-ol-Si'),
                                                               ('L1-si','L-ou-Si'),
                                                               ('L2-si','L-iu-Si'),
                                                               ('L3-si','L-il-Si'),
                                                               ('L4-si','L-ol-Si')
;

CREATE TABLE TagColor(
  Color CHAR,
  ColorName VARCHAR(10),
  PRIMARY KEY (Color)
);
INSERT INTO TagColor (Color, ColorName) VALUES ('W','White'),
                                               ('B','Blue'),
                                               ('G','Green'),
                                               ('P','Pink'),
                                               ('V','Violet'),
                                               ('R','Red'),
                                               ('Y','Yellow'),
                                               ('O','Orange')
;

CREATE TABLE Tag(
  Number VARCHAR(6),
  Color VARCHAR(10),
  Position VARCHAR(10),
  PRIMARY KEY (Number),
  FOREIGN KEY (Color) REFERENCES TagColor(Color),
  FOREIGN KEY (Position) REFERENCES TagPosition(Position)
);

CREATE TABLE TagDeployment(
  ObservationId INTEGER,
  TagNumber VARCHAR(6),
  SealId    INTEGER,
  PRIMARY KEY (TagNumber),
  FOREIGN KEY (ObservationId) REFERENCES Observation(ID),
  FOREIGN KEY (TagNumber) REFERENCES Tag(Number),
  FOREIGN KEY (SealId) REFERENCES Seal (FirstObservation)
);

CREATE TABLE TagObservation(
  ObservationId INTEGER,
  TagNumber VARCHAR(6),
  PRIMARY KEY (ObservationId, TagNumber),
  FOREIGN KEY (ObservationId) REFERENCES Observation(ID),
  FOREIGN KEY (TagNumber) REFERENCES Tag(Number)
);

CREATE TABLE PendingObservations (
  ObservationId INTEGER AUTO_INCREMENT,
  FieldLeaders VARCHAR(24),
  Year INT,
  Date DATE,
  Location VARCHAR(8),
  Sex CHAR,
  Age VARCHAR(4),
  PupCount INT,
  NewMark1 BOOL,
  Mark1 VARCHAR(8),
  Mark1Position VARCHAR(4),
  NewMark2 BOOL,
  Mark2 VARCHAR(8),
  Mark2Position VARCHAR(4),
  NewTag1 BOOL,
  Tag1Number VARCHAR(8),
  Tag1Position VARCHAR(10),
  NewTag2 BOOL,
  Tag2Number VARCHAR(8),
  Tag2Position VARCHAR(10),
  MoltPercentage INT,
  Season INT,
  StandardLength INT,
  CurvilinearLength INT,
  AxillaryGirth INT,
  Mass DOUBLE,
  Tare DOUBLE,
  AnimalMass DOUBLE,
  LastSeenAsPup DATE,
  FirstSeenAsWeanling DATE,
  `Range` INT,
  Comments VARCHAR(256),
  EnteredInAno INT,
  PRIMARY KEY (ObservationId)
);

CREATE TABLE SealObservation (
  ObservationId INTEGER,
  SealId INTEGER,
  FOREIGN KEY (ObservationId) REFERENCES Observation(ID),
  FOREIGN KEY (SealId) REFERENCES Seal(FirstObservation)
);

SELECT DISTINCT(t.ObservationId) FROM TagDeployment t WHERE t.ObservationId NOT IN (SELECT FirstObservation FROM Seal);
SELECT * FROM Seal;

