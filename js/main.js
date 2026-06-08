document.addEventListener("DOMContentLoaded", () => {

    console.log("Govhela Defense Solutions Loaded");

    const cards = document.querySelectorAll(".pillar");

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-5px)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0)";
        });
    });

});