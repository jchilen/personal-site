const toggleButton = document.querySelector("#theme-toggle");
console.log(toggleButton);

toggleButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
});