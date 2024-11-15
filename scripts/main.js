const App = {
  domElements: {
    noteComponent: document.querySelector("#note-component"),
    viewComponent: document.querySelector("#view-component"),
    historyComponent: document.querySelector("#history-component"),
    navButtons: document.querySelectorAll("#navigation-menu > div"),
    settingContainer: document.querySelector("#setting-component-wraper"),
    settingButton: document.querySelector("#setting-button"),
  },
  userData: [],
  helperFunctions: {
    createElements: function (info = null) {
      if (info) {
        const element = document.createElement(info.type);
        if (info.classes) {
          element.setAttribute("class", info.classes);
        }
        if (info.attributes) {
          info.attributes.forEach((attr) =>
            element.setAttribute(attr.name, attr.value)
          );
        }
        if (info.content) {
          element.textContent = info.content;
        }

        return element;
      }
    },
    storageSystem: function (data) {
      let isProcessEnd = false;
      if (App.userData.length) {
        // updating exersice and adding new exersices
        App.userData.forEach((routineObj) => {
          if (routineObj.routineName == data.routineName) {
            routineObj.exersices.forEach((exersicesObj) => {
              if (
                exersicesObj.name == data.exersiceName &&
                App.helperFunctions.isToday(exersicesObj.id)
              ) {
                exersicesObj.sets = data.sets;
                isProcessEnd = true;
              }
            });
            // adding new exersice
            if (!isProcessEnd) {
              const obj = {
                id: Date.now(),
                name: data.exersiceName,
                sets: data.sets,
              };
              routineObj.exersices.push(obj);
              isProcessEnd = true;
            }
          }
        });

        // adding new routine with exersice
        if (!isProcessEnd) {
          const obj = {
            routineName: data.routineName,
            exersices: [
              { id: Date.now(), name: data.exersiceName, sets: data.sets },
            ],
          };

          App.userData.push(obj);
        }
      } else {
        // adding routine with exersice first time
        const obj = {
          routineName: data.routineName,
          exersices: [
            { id: Date.now(), name: data.exersiceName, sets: data.sets },
          ],
        };
        App.userData.push(obj);
      }

      localStorage.setItem("workoutDiary", JSON.stringify(App.userData));
    },
    storageSync: function () {
      if (localStorage.getItem("workoutDiary")) {
        App.userData = JSON.parse(localStorage.getItem("workoutDiary"));
      }
    },
    isToday: function (timestamp) {
      const today = new Date();
      const dateToCheck = new Date(timestamp);

      return (
        today.getFullYear() === dateToCheck.getFullYear() &&
        today.getMonth() === dateToCheck.getMonth() &&
        today.getDate() === dateToCheck.getDate()
      );
    },
    saveData: function (data) {
      if (App.userData.length) {
        data.forEach((routineObj) => {
          let isProcessEnd1 = false;
          App.userData.forEach((savedRoutineObj) => {
            if (routineObj.routineName == savedRoutineObj.routineName) {
              routineObj.exersices.forEach((exersiceObj) => {
                let isProcessEnd2 = false;
                savedRoutineObj.exersices.forEach((savedExersiceObj) => {
                  if (
                    savedExersiceObj.name == exersiceObj.name &&
                    savedExersiceObj.id != exersiceObj.id
                  ) {
                    savedRoutineObj.exersices.push(exersiceObj);
                    isProcessEnd2 = true;
                  } else if (
                    savedExersiceObj.name != exersiceObj.name &&
                    savedExersiceObj.id == exersiceObj.id
                  ) {
                    savedRoutineObj.exersices.push(exersiceObj);
                    isProcessEnd2 = true;
                  }
                });

                if (isProcessEnd2) {
                  savedRoutineObj.exersices.push(exersiceObj);
                }
              });
            }
          });
          if (!isProcessEnd1) {
            App.userData.push(routineObj);
          }
        });
      } else {
        App.userData = data;
      }
      localStorage.setItem("workoutDiary", JSON.stringify(App.userData));
      location.reload();
    },
  },
};

function navigationSystem() {
  const componentMap = {
    1: {
      show: [App.domElements.noteComponent],
      hide: [App.domElements.viewComponent, App.domElements.historyComponent],
    },
    2: {
      show: [App.domElements.viewComponent],
      hide: [App.domElements.noteComponent, App.domElements.historyComponent],
    },
    3: {
      show: [App.domElements.historyComponent],
      hide: [App.domElements.noteComponent, App.domElements.viewComponent],
    },
  };

  App.domElements.navButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const buttonIndex = parseInt(event.currentTarget.getAttribute("button"));

      // Update active button style
      App.domElements.navButtons.forEach((btn) =>
        btn.classList.remove("bg-[#1E201E]")
      );
      button.classList.add("bg-[#1E201E]");

      // Show/hide components
      const { show, hide } = componentMap[buttonIndex];
      show.forEach((component) => component.classList.remove("hidden"));
      hide.forEach((component) => component.classList.add("hidden"));
    });
  });
}

function noteSystem() {
  function addSetsSystem() {
    App.domElements.noteComponent
      .querySelector("#add-set-button")
      .addEventListener("click", (event) => {
        const setInput =
          App.domElements.noteComponent.querySelector("#add-set-textInput");
        const setValue = setInput.value;
        const tagCount = App.domElements.noteComponent.querySelectorAll(
          "#set-tag-container > button"
        ).length;
        const tagContainer =
          App.domElements.noteComponent.querySelector("#set-tag-container");
        if (setValue) {
          const tag = App.helperFunctions.createElements({
            type: "button",
            classes:
              "bg-[#697565] px-2 py-1 uppercase font-bold text-base inline-flex items-center justify-center",
            attributes: [{ name: "type", value: "button" }],
          });

          tag.innerHTML = `${
            tagCount + 1
          }. <span class="capitalize font-normal ml-1">${setValue}</span
                 ><span class="ml-2"
                   ><img src="./assets/cross.svg" alt="" class="size-5"
                 /></span>`;

          tag.addEventListener("click", (event) => {
            App.domElements.noteComponent
              .querySelector("#set-tag-container")
              .removeChild(event.currentTarget);
          });

          tagContainer.append(tag);
          setInput.value = "";
        }
      });
  }

  addSetsSystem();

  App.domElements.noteComponent.addEventListener("submit", (event) => {
    event.preventDefault();

    const routineName = event.target.querySelector("#routine-name").value;
    const exersiceName = event.target.querySelector("#exersice-name").value;
    const sets = [];

    Array.from(
      event.target.querySelectorAll("#set-tag-container > button")
    ).forEach((button) => {
      sets.push(button.firstElementChild.textContent);
    });
    App.helperFunctions.storageSystem({ routineName, exersiceName, sets });

    location.reload();
  });
}

function viewSystem() {
  App.userData.forEach((routineObj) => {
    routineObj.exersices.forEach((exersiceObj, index) => {
      if (App.helperFunctions.isToday(exersiceObj.id)) {
        const component = App.helperFunctions.createElements({ type: "div" });
        const h1 = App.helperFunctions.createElements({
          type: "h1",
          classes: "text-xl font-extrabold text-[#ecdfcc]",
          content: routineObj.routineName,
        });
        const exersiceComponent = App.helperFunctions.createElements({
          type: "div",
        });
        const p = App.helperFunctions.createElements({
          type: "p",
          classes:
            "capitalize font-bold text-[#ecdfcc] py-1 flex items-center justify-between mb-2",
          content: `${exersiceObj.name}`,
        });

        const button = App.helperFunctions.createElements({
          type: "button",
          classes: "size-8 p-1 mr-2 active:bg-[#1E201E] rounded",
          attributes: [{ name: "id", value: exersiceObj.id }],
        });
        button.innerHTML =
          '<img src="./assets/cross.svg" alt="" class="w-full">';

        button.addEventListener("click", (event) => {
          const id = event.currentTarget.getAttribute("id");

          App.userData.forEach((routineObj) => {
            routineObj.exersices.forEach((exersiceObj) => {
              if (exersiceObj.id == id) {
                const index = routineObj.exersices.indexOf(exersiceObj);
                if (index > -1) {
                  console.log(exersiceObj, id, index);
                  routineObj.exersices.splice(index, 1);
                  localStorage.setItem(
                    "workoutDiary",
                    JSON.stringify(App.userData)
                  );
                  location.reload();
                }
              }
            });
          });

          console.log(id);
        });

        p.append(button);

        const ul = App.helperFunctions.createElements({
          type: "ul",
          classes: "text-base  text-[#ecdfcc] text-center space-y-1",
        });

        exersiceObj.sets.forEach((set, index) => {
          ul.append(
            App.helperFunctions.createElements({
              type: "li",
              classes: "bg-[#1e201e] rounded-md py-1",
              content: `${index + 1}. ${set}`,
            })
          );
        });

        exersiceComponent.append(p, ul);
        component.append(h1, exersiceComponent);

        App.domElements.viewComponent.append(component);
      }
    });
  });
}

function historySystem() {
  App.userData.forEach((routineObj) => {
    const component = App.helperFunctions.createElements({ type: "div" });
    const h1 = App.helperFunctions.createElements({
      type: "h1",
      classes: "text-xl font-extrabold text-[#ecdfcc]",
      content: routineObj.routineName,
    });
    component.append(h1);

    const exersiceComponentList = routineObj.exersices.map(
      (exersiceObj, index) => {
        const exersiceComponent = App.helperFunctions.createElements({
          type: "div",
          classes: "mb-2",
        });
        const p = App.helperFunctions.createElements({
          type: "p",
          classes: "py-1.5 flex justify-between items-center",
        });
        const date = new Date(exersiceObj.id).toUTCString().slice(0, 16);
        p.innerHTML = `<span class="font-bold capitalize">${index + 1}. ${
          exersiceObj.name
        }</span>
      <span class="text-sm bg-[#1e201e] rounded-md px-2 py-1">${date}</span>`;
        exersiceComponent.append(p);

        const ul = App.helperFunctions.createElements({
          type: "ul",
          classes: "text-base text-[#ecdfcc] text-center space-y-1",
        });

        exersiceObj.sets.forEach((set, index) => {
          ul.append(
            App.helperFunctions.createElements({
              type: "li",
              classes: "bg-[#1e201e] rounded-md py-1",
              content: `${index + 1}. ${set}`,
            })
          );
        });

        exersiceComponent.append(ul);

        return exersiceComponent;
      }
    );

    exersiceComponentList.forEach((exersiceComponent) => {
      component.append(exersiceComponent);
    });

    // console.log(exersiceComponentList)

    App.domElements.historyComponent.append(component);
  });
}

function setting() {
  const toggle = () => {
    App.domElements.settingContainer.classList.toggle("hidden");
  };
  App.domElements.settingButton.addEventListener("click", toggle);
  App.domElements.settingContainer
    .querySelector("#setting-close-button")
    .addEventListener("click", toggle);
  App.domElements.settingContainer
    .querySelector("#setting-component")
    .addEventListener("click", (event) => {
      event.stopPropagation();
    });
  App.domElements.settingContainer.addEventListener("click", toggle);

  function exportData(filename = "workoutDiaryData.json") {
    if (!App.userData) {
      return alert("workout data not found!");
    }
    const jsonStr = JSON.stringify(App.userData, null, 2);
    // console.log(jsonStr);
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    link.click();

    // Clean up the URL object after download
    URL.revokeObjectURL(link.href);
  }

  App.domElements.settingContainer
    .querySelector("#export-button")
    .addEventListener("click", function () {
      exportData();
    });

  function importData() {
    const fileInput = App.helperFunctions.createElements({
      type: "input",
      attributes: [{ name: "type", value: "file" }],
    });

    // Trigger the file input to open the file picker
    fileInput.click();

    // Handle file selection
    fileInput.onchange = () => {
      const file = fileInput.files;
      // Check if a file is selected and if it is a JSON file
      if (file && file[0] && file[0].type === "application/json") {
        const reader = new FileReader();

        reader.onload = function (e) {
          // try {
          //   // Parse the file content as JSON
          //   const jsonData = JSON.parse(e.target.result);
          //   console.log("JSON data:", jsonData);
          //   App.helperFunctions.saveData(jsonData);
          //   // Use jsonData in your code here
          //   // Example: console.log(jsonData.someKey);
          // } catch (error) {
          //   console.error("Error parsing JSON:", error);
          // }
          const jsonData = JSON.parse(e.target.result);
          console.log("JSON data:", jsonData);
          App.helperFunctions.saveData(jsonData);
        };

        // Read the first file as text
        reader.readAsText(file[0]);
      } else {
        console.error("Please select a valid JSON file.");
      }
    };
  }

  App.domElements.settingContainer
    .querySelector("#import-button")
    .addEventListener("click", importData);

  function clearHistory() {
    if (App.userData) {
      const userConfirmation = confirm(
        "will you want to delete data permanently!"
      );
      console.log(userConfirmation);
      if (userConfirmation) {
        App.userData = [];
        localStorage.removeItem("workoutDiary");
      }
      location.reload();
    }
  }

  App.domElements.settingContainer
    .querySelector("#clearHistory-button")
    .addEventListener("click", clearHistory);
}

navigationSystem();
noteSystem();
document.addEventListener("DOMContentLoaded", function () {
  App.helperFunctions.storageSync();
  if (App.userData) {
    viewSystem();
    historySystem();
  }
});
setting();
