import { createCard, getSubjects } from "./utils.js";

window.addEventListener("load", async () => {
  const gen = getSubjects(["frontend", "backend", "other"]);
  const content = document.getElementById("content");

  const Card = (await import("./card.js")).default;
  Card.handleNext = Card.handleNext.bind(null, gen, content);
  customElements.define("m-card", Card);

  if (content) {
    const { value: first } = await gen.next();
    if (first) {
      const cards = createCard(first);
      content.appendChild(cards);
    }
  }
});
