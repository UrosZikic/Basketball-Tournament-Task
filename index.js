// index.js
const path = require("path");

const groups = require(path.join(__dirname, "groups.json"));
const exhibition = require(path.join(__dirname, "exibitions.json"));

const groupPhase = function (group) {
  const [team1, team2, team3, team4] = [...group];
  const groups = [team1, team2, team3, team4];
  let forma = 75;
  let count = 0;

  const probabilityInterval = setInterval(
    () => count < 3 && calculateProbability(groups[count], (count += 1), 3),
    500
  );

  function calculateProbability(team, count, limit) {
    console.log(team);
    for (let i = count; i <= limit; i++) {
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
      console.log(
        "probability for " +
          team.Team +
          " to win against " +
          group[i].Team +
          " is " +
          winProbability +
          "%" +
          " forma je na " +
          forma
      );
    }

    console.log("_________________________________");
  }
};
groupPhase(groups.C);
