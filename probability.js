const path = require("path");

const exhibition = require(path.join(__dirname, "exibitions.json"));
const groups = require(path.join(__dirname, "groups.json"));

let qualifiers = [];
let secondPlaceQualifiers = [];
let thirdPlaceQualifiers = [];

function calculateProbability(team, count, limit, group, forma, category) {
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
      groupData,
      category
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
  groupData,
  category
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

  r(team, group, winProbability, i, groupData, category);
}

const r = (team, group, winProbability, i, groupData, category) => {
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
  if (group[0].results.length >= 3) {
    sortGroupPhase(group, category);
  }
};

function sortGroupPhase(group, category) {
  // preuzeti rezultati simulacije
  let groupGameResults = group.map((item, i) => item.results);
  // podaci o rezultatima meceva ce se skladistiti u ovom nizu
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

  // ukoliko su sve simulacije zavrsene, niz je spreman da primi informacije o rezultatima
  if (group[3].results.length === 3) {
    console.log("Grupna faza - I kolo:");
    console.log(`Grupa: ${category}:`);
    for (let i = 0; i < 6; i++) {
      // Petlja kroz kondicionale prelazi kroz sve grupne meceve i popunjuje svaki objekat u nizu podacima koji im pripadaju
      if (i < 3) {
        console.log(
          `${group[0].Team} - ${group[i + 1].Team} (${groupGameResults[0][i]}:${
            groupGameResults[i + 1][0]
          })`
        );
        // nizu objektata se svakom objektu dodeljuju ime tima i njihova pozicija na rang listi
        groupPlacements[0][0].Team = group[0].Team;
        groupPlacements[0][0].FIBARanking = group[0].FIBARanking;
        groupPlacements[i + 1][0].Team = group[i + 1].Team;
        groupPlacements[i + 1][0].FIBARanking = group[i + 1].FIBARanking;

        // na osnovu rezultata, timovi za svaki mec dobijaju azurirane podatke u njihov objekat

        if (groupGameResults[0][i] >= groupGameResults[i + 1][0]) {
          if (groupGameResults[0][i] === groupGameResults[i + 1][0])
            groupGameResults[0][0].received += 1;
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

        if (groupGameResults[1][i - 2] >= groupGameResults[i - 1][1]) {
          if (groupGameResults[1][i - 2] === groupGameResults[i - 1][1])
            groupGameResults[1][0].received += 1;
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
        if (groupGameResults[2][2] >= groupGameResults[3][2]) {
          if (groupGameResults[2][2] === groupGameResults[3][2])
            groupGameResults[2][0].received += 1;
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

  if (groupPlacements[3][0].won + groupPlacements[3][0].lost === 3) {
    const x = groupPlacements.sort((a, b) => {
      // razvrstavamo timove primarno po poenima
      if (b[0].points !== a[0].points) return b[0].points - a[0].points;

      // ukoliko timovi poseduju isto broj poena, onda razvrstavamo prema razlici
      if (b[0].difference !== a[0].difference)
        return b[0].difference - a[0].difference;

      // u slucaju da timovi koje uporedjujemo poseduju isto broj poena i istu razliku datih i primljenih koseva, onda ih rangiramo prema postignutim poenima.
      return b[0].scored - a[0].scored;
    });
    console.log(" ");
    console.log(
      ` Grupa ${category} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika):`
    );
    for (let i = 0; i <= 3; i++) {
      console.log(
        `${i + 1}. ${x[i][0].Team}   ${x[i][0].won} / ${x[i][0].lost} / ${
          x[i][0].points
        } / ${x[i][0].scored} / ${x[i][0].received} / ${x[i][0].difference}`
      );
    }
    console.log(" ");

    // prvorangirane svrstavamo u ovu promenljivu
    qualifiers = [...qualifiers, x[0]];
    // drugorangirane u ovo
    secondPlaceQualifiers = [...secondPlaceQualifiers, x[1]];
    // trecerangirane u ovu
    thirdPlaceQualifiers = [...thirdPlaceQualifiers, x[2]];

    // ukoliko su prvih 9 timova uneti, onda ih rangiramo medjusobno ovaj put kako bi dobili tacan prikaz najboljeg i najgoreg tima
    if (qualifiers.length >= 3 && thirdPlaceQualifiers.length >= 3) {
      // pravimo odvojene promenljive koje ce skladistiti po 3 tima, od 3 najbolja do 3 najgore rangirana
      let confirmedQualified = [];
      let secondPlaceQualified = [];
      let thirdPlaceQualified = [];
      // pozivamo funkciju kojoj plasiramo kvalifikovane koje onda dodatno sortiramo tako da zaista dobijemo najboljeg > najgoreg u svakoj ovih promenljivih
      confirmedQualified = rankTeams(qualifiers);
      secondPlaceQualified = rankTeams(secondPlaceQualifiers);
      thirdPlaceQualified = rankTeams(thirdPlaceQualifiers);
      // funckija izvrsava sortiranje timova
      function rankTeams(qualifiers) {
        return qualifiers.sort((a, b) => {
          // razvrstavamo timove primarno po poenima
          if (b[0].points !== a[0].points) {
            return b[0].points - a[0].points;
          }
          // ukoliko timovi poseduju isto broj poena, onda razvrstavamo prema razlici
          if (b[0].difference !== a[0].difference)
            return b[0].difference - a[0].difference;

          // u slucaju da timovi koje uporedjujemo poseduju isto broj poena i istu razliku datih i primljenih koseva, onda ih rangiramo prema postignutim poenima.
          return b[0].scored - a[0].scored;
        });
      }
      // treceplasirani tim, ili deveti tim se nece plasirati dalje
      qualifiers = [
        ...confirmedQualified,
        ...secondPlaceQualified,
        thirdPlaceQualified[0],
        thirdPlaceQualified[1],
      ];
      // pozivamo funkciju koja ce podeliti plasirane u cetvrtfinale
      handleQualifiers(qualifiers);
    }
  }
}
function handleQualifiers(qualifier) {
  // console.log(qualifier);
  const originalGroup = [
    ["Kanada", "Australija", "Grčka", "Španija"],
    ["Nemačka", "Francuska", "Brazil", "Japan"],
    ["Sjedinjene Države", "Srbija", "Južni Sudan", "Puerto Riko"],
  ];
  // grupe delimo u parove gde se sortiraju od najbolje rangiranog do najslabije rangiranog
  let groupD = [qualifier[0][0], qualifier[1][0]];
  let groupE = [qualifier[2][0], qualifier[3][0]];
  let groupF = [qualifier[4][0], qualifier[5][0]];
  let groupG = [qualifier[6][0], qualifier[7][0]];

  // promenljive ce primiti timove koji ce se suociti u cetvrtfinalu
  let eliminationPhaseMatchOne = [];
  let eliminationPhaseMatchTwo = [];
  let eliminationPhaseMatchThree = [];
  let eliminationPhaseMatchFour = [];

  // petlja proverava da li su potencionalni protivnici vec igrali u grupi i shodno tome ih rangiraju tako da se ne sretnu u cetvrtfinalu.
  for (let i = 0; i <= 2; i++) {
    if (
      originalGroup[i].includes(qualifier[0][0].Team) &&
      originalGroup[i].includes(qualifier[7][0].Team)
    ) {
      eliminationPhaseMatchOne = [qualifier[0][0], qualifier[6][0]];
      eliminationPhaseMatchTwo = [qualifier[1][0], qualifier[7][0]];
      break;
    } else if (
      originalGroup[i].includes(qualifier[0][0].Team) &&
      originalGroup[i].includes(qualifier[6][0].Team)
    ) {
      eliminationPhaseMatchOne = [qualifier[0][0], qualifier[7][0]];
      eliminationPhaseMatchTwo = [qualifier[1][0], qualifier[6][0]];
      break;
    } else if (
      originalGroup[i].includes(qualifier[1][0].Team) &&
      originalGroup[i].includes(qualifier[6][0].Team)
    ) {
      eliminationPhaseMatchOne = [qualifier[0][0], qualifier[6][0]];
      eliminationPhaseMatchTwo = [qualifier[1][0], qualifier[7][0]];
      break;
    } else if (
      originalGroup[i].includes(qualifier[1][0].Team) &&
      originalGroup[i].includes(qualifier[7][0].Team)
    ) {
      eliminationPhaseMatchOne = [qualifier[0][0], qualifier[7][0]];
      eliminationPhaseMatchTwo = [qualifier[1][0], qualifier[6][0]];
      break;
    } else {
      const randomize = Math.random * 100 + 1 > 50 ? 6 : 7;
      eliminationPhaseMatchOne = [qualifier[0][0], qualifier[randomize][0]];
      eliminationPhaseMatchTwo = [
        qualifier[1][0],
        qualifier[randomize % 2 === 0 ? 7 : 6],
      ];
    }
  }

  for (let i = 0; i <= 2; i++) {
    if (
      originalGroup[i].includes(qualifier[2][0].Team) &&
      originalGroup[i].includes(qualifier[3][0].Team)
    ) {
      const randomize = Math.random * 100 + 1 > 50 ? 4 : 5;
      eliminationPhaseMatchThree = [qualifier[2][0], qualifier[randomize][0]];
      eliminationPhaseMatchFour = [
        qualifier[3][0],
        qualifier[randomize % 2 == 0 ? 5 : 4][0],
      ];
      break;
    } else if (
      originalGroup[i].includes(qualifier[2][0].Team) &&
      originalGroup[i].includes(qualifier[4][0].Team)
    ) {
      const randomize = Math.random * 100 + 1 > 50 ? 3 : 5;
      eliminationPhaseMatchThree = [qualifier[2][0], qualifier[randomize][0]];
      eliminationPhaseMatchFour = [
        qualifier[4][0],
        qualifier[randomize > 3 ? 3 : 5][0],
      ];
      break;
    } else {
      const randomize = Math.random * 100 + 1 > 50 ? 3 : 4;
      eliminationPhaseMatchThree = [qualifier[2][0], qualifier[randomize][0]];
      eliminationPhaseMatchFour = [
        qualifier[5][0],
        qualifier[randomize % 2 === 0 ? 3 : 4][0],
      ];
    }
  }
  console.log(" ");
  console.log("Šeširi:");
  console.log("  Šešir D");
  console.log("    " + groupD[0].Team);
  console.log("    " + groupD[1].Team);
  console.log("  Šešir E");
  console.log("    " + groupE[0].Team);
  console.log("    " + groupE[1].Team);
  console.log("  Šešir F");
  console.log("    " + groupF[0].Team);
  console.log("    " + groupF[1].Team);
  console.log("  Šešir G");
  console.log("    " + groupG[0].Team);
  console.log("    " + groupG[1].Team);

  const quarterFinalMatches = [
    eliminationPhaseMatchOne,
    eliminationPhaseMatchTwo,
    eliminationPhaseMatchThree,
    eliminationPhaseMatchFour,
  ];

  quarterFinals(quarterFinalMatches);
}

function quarterFinals(quarterFinalMatches) {
  console.log(" ");
  console.log("Eliminaciona faza:");
  console.log(
    "   " +
      quarterFinalMatches[0][0].Team +
      " - " +
      quarterFinalMatches[0][1].Team
  );
  console.log(
    "   " +
      quarterFinalMatches[1][0].Team +
      " - " +
      quarterFinalMatches[1][1].Team
  );
  console.log(
    "   " +
      quarterFinalMatches[2][0].Team +
      " - " +
      quarterFinalMatches[2][1].Team
  );
  console.log(
    "   " +
      quarterFinalMatches[3][0].Team +
      " - " +
      quarterFinalMatches[3][1].Team
  );

  let semiFinalsGroups = [];
  console.log(" ");
  console.log("Četvrtfinale:");
  for (let i = 0; i <= 3; i++) {
    const rankDifference =
      (quarterFinalMatches[i][0].FIBARanking -
        quarterFinalMatches[i][1].FIBARanking) *
      -1;

    let teamOneScore = Math.ceil(Math.random() * 100 + 1) + 50;
    const teamTwoScore =
      Math.ceil(Math.random() * 100 + 1) + 50 - rankDifference;

    teamOneScore =
      teamOneScore === teamTwoScore ? teamOneScore + 1 : teamOneScore;

    semiFinalsGroups = [
      ...semiFinalsGroups,
      teamOneScore >= teamTwoScore
        ? quarterFinalMatches[i][0]
        : quarterFinalMatches[i][1],
    ];
    console.log(
      quarterFinalMatches[i][0].Team +
        " - " +
        quarterFinalMatches[i][1].Team +
        ` (${teamOneScore} - ${teamTwoScore}) `
    );
  }
  console.log(" ");
  semiFinals(semiFinalsGroups);
}

function semiFinals(semiFinalsGroups) {
  let finalsGroups = [];
  let thirdPlaceGroups = [];

  console.log("Polufinale: ");
  for (let i = 0; i <= 2; i += 2) {
    const rankDifference =
      (semiFinalsGroups[i].FIBARanking - semiFinalsGroups[i + 1].FIBARanking) *
      -1;

    let teamOneScore = Math.ceil(Math.random() * 100 + 1) + 50;
    const teamTwoScore =
      Math.ceil(Math.random() * 100 + 1) + 50 - rankDifference;

    teamOneScore =
      teamOneScore === teamTwoScore ? teamOneScore + 1 : teamOneScore;

    finalsGroups = [
      ...finalsGroups,
      teamOneScore > teamTwoScore
        ? semiFinalsGroups[i]
        : semiFinalsGroups[i + 1],
    ];
    thirdPlaceGroups = [
      ...thirdPlaceGroups,
      teamOneScore > teamTwoScore
        ? semiFinalsGroups[i + 1]
        : semiFinalsGroups[i],
    ];
    console.log(
      semiFinalsGroups[i].Team +
        " - " +
        semiFinalsGroups[i + 1].Team +
        ` (${teamOneScore} - ${teamTwoScore}) `
    );
  }

  thirdPlaceFinal(finalsGroups, thirdPlaceGroups);
}

function thirdPlaceFinal(finalsGroups, thirdPlaceGroup) {
  let winner;

  for (let i = 0; i < 2; i += 2) {
    console.log(" ");
    console.log("Utakmica za treće mesto:");
    const rankDifference =
      (thirdPlaceGroup[i].FIBARanking - thirdPlaceGroup[i + 1].FIBARanking) *
      -1;

    let teamOneScore = Math.ceil(Math.random() * 100 + 1) + 50;
    const teamTwoScore =
      Math.ceil(Math.random() * 100 + 1) + 50 - rankDifference;

    teamOneScore =
      teamOneScore === teamTwoScore ? teamOneScore + 1 : teamOneScore;

    winner =
      teamOneScore > teamTwoScore
        ? thirdPlaceGroup[i].Team
        : thirdPlaceGroup[i + 1].Team;

    console.log(
      thirdPlaceGroup[i].Team +
        " - " +
        thirdPlaceGroup[i + 1].Team +
        ` (${teamOneScore} - ${teamTwoScore}) `
    );
  }

  finals(finalsGroups, winner);
}

function finals(finalsGroups, thirdPlaceWinner) {
  console.log(" ");
  console.log("Finale: ");

  let finalsWinner;

  for (let i = 0; i < 2; i += 2) {
    const rankDifference =
      (finalsGroups[i].FIBARanking - finalsGroups[i + 1].FIBARanking) * -1;

    let teamOneScore = Math.ceil(Math.random() * 100 + 1) + 50;
    const teamTwoScore =
      Math.ceil(Math.random() * 100 + 1) + 50 - rankDifference;

    teamOneScore =
      teamOneScore === teamTwoScore ? teamOneScore + 1 : teamOneScore;

    finalsWinner =
      teamOneScore > teamTwoScore
        ? [finalsGroups[i].Team, finalsGroups[i + 1].Team]
        : [finalsGroups[i + 1].Team, finalsGroups[i].Team];
    console.log(
      finalsGroups[i].Team +
        " - " +
        finalsGroups[i + 1].Team +
        ` (${teamOneScore} - ${teamTwoScore}) `
    );
  }
  finalsWinner = [...finalsWinner, thirdPlaceWinner];
  console.log(" ");
  console.log("Medalje: ");
  finalsWinner.map((item) => console.log("  " + item));
}

module.exports = calculateProbability;
