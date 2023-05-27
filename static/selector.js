document.getElementById("resultsSelector").addEventListener("change", (e) => {
  const selectedOption = e.target.value;
  updateResults(selectedOption);
});

function updateResults(selectedOption) {
  document.querySelectorAll("#results > div").forEach((div) => {
    if (div.id === selectedOption) {
      div.classList.remove("opacity-0");
      div.classList.remove("hidden");
      div.classList.add("opacity-100");
      div.classList.add("block");
    } else {
      div.classList.remove("opacity-100");
      div.classList.remove("block");
      div.classList.add("opacity-0");
      div.classList.add("hidden");
    }
  });
}

updateResults("writePerformance");