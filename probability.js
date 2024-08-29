const path = require("path");

const exhibition = require(path.join(__dirname, "exibitions.json"));
const groups = require(path.join(__dirname, "groups.json"));

function calculateProbability(team, count, limit, group, forma) {
  team.winProb = team.winProb ? team.winProb : [];
  team.results = team.results ? team.results : [];

  let groupAData = [];
  let groupBData = [];
  let groupCData = [];

  const groupData = [groupAData, groupBData, groupCData];

  for (let i = count; i <= limit; i++) {
    group[i].results = group[i].results ? group[i].results : [];

    let winProbability = 0;
    if (team.FIBARanking - group[i].FIBARanking < 0) {
      // team1 je bolje ranginan i ima vecu sansu da pobedi
      winProbability += 10 * (group[i].FIBARanking - team.FIBARanking);
    } else {
      // team1 je slabije ranginan i ima manju sansu da pobedi
      winProbability -= 10 * (team.FIBARanking - group[i].FIBARanking);
    }
    // egzibicije - pobeda u egzibiciji daje 5 poena totalnoj verovatnoci da ce tim pobediti, alternativno se 5 poena oduzima
    const targetTeam = team.ISOCode;
    calculateShape(
      targetTeam,
      group,
      i,
      forma,
      winProbability,
      team,
      groupData
    );
  }
}

function calculateShape(
  targetTeam,
  group,
  i,
  forma,
  winProbability,
  team,
  groupData
) {
  // provera da li je ciljni tim igrao protiv tima iz grupe na domacem terenu
  exhibition[targetTeam].forEach((item) => {
    if (item.Opponent === group[i].ISOCode) {
      let exhibitionResult = item.Result.split("-");
      if (exhibitionResult[0] - exhibitionResult[1] > 0) forma += 5;
      else forma -= 5;
    }
  });
  // provera da li je ciljni tim igrao protiv tima iz grupe na njihovom terenu
  exhibition[group[i].ISOCode].forEach((item) => {
    if (item.Opponent === targetTeam) {
      let exhibitionResult = item.Result.split("-");
      if (exhibitionResult[0] - exhibitionResult[1] > 0) forma -= 5;
      else forma += 5;
    }
  });

  if (forma > 75) winProbability += 15;
  else if (forma < 75) winProbability -= 15;

  team.winProb = [...team.winProb, winProbability];

  r(team, group, winProbability, i, groupData);
}

const r = (team, group, winProbability, i, groupData) => {
  const targetTeam = team.ISOCode;
  const enemyTeam = group[i].ISOCode;

  if (winProbability > 0) {
    // ako ciljni tim ima bolju sansu da pobedi, onda se simulacija rezultata vrsi tako sto ciljni tim dobije sansu da osvoji maksimalno 100 poena, a drugi tim moze da osvoji procentualno
    // manje, ako ciljni tim ima 245poena verovatnoce da ce pobediti, poeni se svode na procente deljenjem sa 10, tako da ce ukupni, potencionalni broj osvojenih poena biti 100 - 24.5
    team.results =
      team.results.length === 0
        ? [Math.ceil(Math.random() * (100 + winProbability / 10) + 30)]
        : [
            ...team.results,
            Math.ceil(Math.random() * (100 + winProbability / 10) + 30),
          ];
    group[i].results =
      group[i].results.length === 0
        ? [Math.ceil(Math.random() * (100 - winProbability / 10) + 20)]
        : [
            ...group[i].results,
            Math.ceil(Math.random() * (100 - winProbability / 10) + 20),
          ];
  } else {
    team.results =
      team.results.length === 0
        ? [Math.ceil(Math.random() * (100 - winProbability / 10) + 20)]
        : [
            ...team.results,
            Math.ceil(Math.random() * (100 - winProbability / 10) + 20),
          ];
    group[i].results =
      group[i].results.length === 0
        ? [Math.ceil(Math.random() * (100 + winProbability / 10) + 30)]
        : [
            ...group[i].results,
            Math.ceil(Math.random() * (100 + winProbability / 10) + 30),
          ];
  }
  if (group[0].results.length >= 3 && group[0].ISOCode == "CAN") {
    sortGroupPhase(group);
  }
};

function sortGroupPhase(group) {
  let groupGameResults = group.map((item, i) => item.results);

  let groupPlacements = [
    [
      {
        won: 0,
        lost: 0,
        points: 0,
        scored: 0,
        received: 0,
        difference: 0,
      },
    ],
    [
      {
        won: 0,
        lost: 0,
        points: 0,
        scored: 0,
        received: 0,
        difference: 0,
      },
    ],
    [
      {
        won: 0,
        lost: 0,
        points: 0,
        scored: 0,
        received: 0,
        difference: 0,
      },
    ],
    [
      {
        won: 0,
        lost: 0,
        points: 0,
        scored: 0,
        received: 0,
        difference: 0,
      },
    ],
  ];
  // console.log(groupPlacements[1][0].won, 1);

  if (group[3].results.length === 3) {
    console.log("Grupna faza - I kolo:");
    console.log("Grupa: A:");
    for (let i = 0; i < 6; i++) {
      if (i < 3) {
        console.log(
          `${group[0].Team} - ${group[i + 1].Team} (${groupGameResults[0][i]}:${
            groupGameResults[i + 1][0]
          })`
        );
        if (groupGameResults[0][i] > groupGameResults[i + 1][0]) {
          groupPlacements[0][0].won += 1;
          groupPlacements[0][0].points += 2;
          groupPlacements[i + 1][0].lost += 1;
        } else {
          groupPlacements[0][0].lost += 1;
          groupPlacements[i + 1][0].won += 1;
          groupPlacements[i + 1][0].points += 2;
        }
        groupPlacements[0][0].scored += groupGameResults[0][i];
        groupPlacements[0][0].received += groupGameResults[i + 1][0];
        groupPlacements[0][0].difference =
          groupPlacements[0][0].scored - groupPlacements[0][0].received;
        //
        groupPlacements[i + 1][0].scored += groupGameResults[i + 1][0];
        groupPlacements[i + 1][0].received += groupGameResults[0][i];
        groupPlacements[i + 1][0].difference =
          groupPlacements[i + 1][0].scored - groupPlacements[i + 1][0].received;
      } else if (i < 5) {
        console.log(
          `${group[1].Team} - ${group[i - 1].Team} (${
            groupGameResults[1][i - 2]
          }:${groupGameResults[i - 1][1]})`
        );

        if (groupGameResults[1][i - 2] > groupGameResults[i - 1][1]) {
          groupPlacements[1][0].won += 1;
          groupPlacements[1][0].points += 2;
          groupPlacements[i - 1][0].lost += 1;
        } else {
          groupPlacements[1][0].lost += 1;
          groupPlacements[i - 1][0].won += 1;
          groupPlacements[i - 1][0].points += 2;
        }
        groupPlacements[1][0].scored += groupGameResults[1][i - 2];
        groupPlacements[1][0].received += groupGameResults[i - 1][1];
        groupPlacements[1][0].difference =
          groupPlacements[1][0].scored - groupPlacements[1][0].received;
        //
        groupPlacements[i - 1][0].scored += groupGameResults[i - 1][1];
        groupPlacements[i - 1][0].received += groupGameResults[1][i - 2];
        groupPlacements[i - 1][0].difference =
          groupPlacements[i - 1][0].scored - groupPlacements[i - 1][0].received;
      } else {
        console.log(
          `${group[2].Team} - ${group[3].Team} (${groupGameResults[2][2]}:${groupGameResults[3][2]})`
        );
        if (groupGameResults[2][2] > groupGameResults[3][2]) {
          groupPlacements[2][0].won += 1;
          groupPlacements[2][0].points += 2;
          groupPlacements[3][0].lost += 1;
        } else {
          groupPlacements[2][0].lost += 1;
          groupPlacements[3][0].won += 1;
          groupPlacements[3][0].points += 2;
        }
        groupPlacements[2][0].scored += groupGameResults[2][2];
        groupPlacements[2][0].received += groupGameResults[3][2];
        groupPlacements[2][0].difference =
          groupPlacements[2][0].scored - groupPlacements[2][0].received;
        //
        groupPlacements[3][0].scored += groupGameResults[3][2];
        groupPlacements[3][0].received += groupGameResults[2][2];
        groupGameResults[3][0].difference =
          groupPlacements[3][0].scored - groupPlacements[3][0].received;
      }
    }
  }

  if (groupPlacements[3][0].won + groupPlacements[3][0].lost === 3)
    console.log(groupPlacements);
}

module.exports = calculateProbability;
