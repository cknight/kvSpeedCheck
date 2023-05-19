document.getElementById("resultsSelector").addEventListener("change", (e) => {
  const selectedOption = e.target.value;
  updateResults(selectedOption);
});

function updateResults(selectedOption) {
  document.querySelectorAll("#results > div").forEach((div) => {
    if (div.id === selectedOption) {
      div.classList.remove("opacity-0");
      div.classList.add("opacity-100");
    } else {
      div.classList.remove("opacity-100");
      div.classList.add("opacity-0");
    }
  });
}

updateResults("writePerformance");