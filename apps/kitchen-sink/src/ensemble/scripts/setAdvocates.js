/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
(function setDummyAdvocates() {
  ensemble.storage.set("totalPatientsDropdown", "yearToDate");
  ensemble.storage.set("totalPatientsChartData", {
    yearToDate: {
      awarded: 1000,
      enrolled: 200,
      notStarted: 83,
      total: 1283,
    },
    thisMonth: {
      awarded: 90,
      enrolled: 110,
      notStarted: 12,
      total: 212,
    },
    lastMonth: {
      awarded: 60,
      enrolled: 80,
      notStarted: 19,
      total: 159,
    },
    today: {
      awarded: 12,
      enrolled: 23,
      notStarted: 8,
      total: 43,
    },
  });

  const data = [
    {
      image: "https://imgur.com/A3te9iU.png",
      name: "Petter Gibbons",
      email: "peter@atlas.health",
      averageTasks: 41,
      percentage: "+2",
      awarded: "$15,225",
      potential: "$30,000",
      phoneLog: "01:02",
      tasksCompleted: 24,
      tasksStarted: 17,
      tasksOverdue: 5,
      totalTasks: 46,
      isOnline: true,
    },
    {
      image: "https://imgur.com/qc5iBzx.png",
      name: "Daniel Smith",
      email: "daniel@atlas.health",
      averageTasks: 35,
      percentage: "-11",
      awarded: "$23,550",
      potential: "$26,300",
      phoneLog: "03:40",
      tasksCompleted: 10,
      tasksStarted: 25,
      tasksOverdue: 13,
      totalTasks: 48,
      isOnline: false,
      lastLogon: "1/19/24",
    },
  ];
  ensemble.storage.set("dummyAdvocates", data);
})();
