const toggleButton = document.querySelector("#theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

toggleButton.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark-mode");

    if (isDark) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});