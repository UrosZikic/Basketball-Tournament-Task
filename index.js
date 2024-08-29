// index.js
const path = require("path");

const groups = require(path.join(__dirname, "groups.json"));
const exhibition = require(path.join(__dirname, "exibitions.json"));
const calculateProbability = require("./probability");

const groupPhase = function (group) {
  const [team1, team2, team3, team4] = [...group];
  const groups = [team1, team2, team3, team4];
  let forma = 75;
  let count = 0;
  const probabilityInterval = setInterval(() => {
    if (count <= 3) {
      calculateProbability(groups[count], (count += 1), 3, group, forma);
    } else {
      // console.log(groups);
      clearInterval(probabilityInterval);
    }
  }, 500);
};

groupPhase(groups.A);
// groupPhase(groups.B);
// groupPhase(groups.C);
