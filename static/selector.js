document.getElementById("resultsSelector").addEventListener("change", (e) => {
  const selectedOption = e.target.value;
  document.querySelectorAll("#results > div").forEach((div) => {
    if (div.id === selectedOption) {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
  })
});