document.getElementById("resultsSelector").addEventListener("change", (e) => {
  const selectedOption = e.target.value;
  updateResults(selectedOption);
});

function updateResults(selectedOption) {
  document.querySelectorAll("#results > div").forEach((div) => {
    if (div.id === selectedOption) {
      //show
      div.classList.add("block");
      div.classList.remove("hidden");
    } else {
      //hide
      div.classList.remove("block");
      div.classList.add("hidden");
    }
  });
}

updateResults("writePerformance");
