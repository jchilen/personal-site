const toggleButton = document.querySelector("#theme-toggle");

if (document.body.classList.contains("dark-mode")) {
    toggleButton.textContent = "Light Mode";
}

toggleButton.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark-mode");

    if (isDark) {
        localStorage.setItem("theme", "dark");
        toggleButton.textContent = "Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        toggleButton.textContent = "Dark Mode";
    }
});