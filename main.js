(async function () {
  /** @param {Array<string>} data */
  function createCard(data) {
    const card = document.createElement("m-card");
    for (const item of data) {
      const el = document.createElement("li");
      el.textContent = item;
      card.appendChild(el);
    }
    return card;
  }

  /** @param {string} name */
  async function getSubject(name) {
    try {
      const response = await fetch(`${name}.json`);
      if (response.ok) {
        const obj = await response.json();
        return obj;
      } else {
        throw new Error(response.statusText);
      }
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  /** @param {string[]} arr */
  function* getSubjects(arr) {
    for (const item of arr) {
      yield getSubject(item);
    }
  }

  class Card extends HTMLElement {
    constructor() {
      super();
      /** @type {HTMLTemplateElement} */
      const { content } = document.querySelector("template#card");
      this.shadow = this.attachShadow({ mode: "open" });
      this.shadow.appendChild(content.cloneNode(true));
      /** @type {?IntersectionObserver}*/
      this.observe = null;
      this.show = false;
    }

    /** @param {IntersectionObserverEntry[]} entries
     *  @param  {IntersectionObserver} observe
     */
    handleIntersect(entries, observe) {
      entries.forEach(({ intersectionRatio: ratio, isIntersecting: inter }) => {
        // console.log(ratio, inter);
        if (inter && !this.show) {
          this.show = true;
          this.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 4000,
          });
        }
        if (ratio >= 3 / 4) {
          observe.disconnect();
          const { value: next, done } = gen.next();
          if (!done) {
            next.then((value) => {
              content.appendChild(createCard(value));
            });
          }
        }
      });
    }

    /** @param {number} numSteps */
    static buildThresholdList(numSteps = 0) {
      const thresholds = [];
      for (let i = 1; i <= numSteps; i++) {
        const ratio = i / numSteps;
        thresholds.push(ratio);
      }
      thresholds.unshift(0);
      return thresholds;
    }

    connectedCallback() {
      this.observe = new IntersectionObserver(this.handleIntersect.bind(this), {
        root: null,
        rootMargin: "0px",
        threshold: Card.buildThresholdList(4),
      });
      this.observe.observe(this);
    }
  }

  customElements.define("m-card", Card);

  const gen = getSubjects(["frontend", "backend", "other"]);

  const content = document.getElementById("content");
  const first = await gen.next().value;
  const cards = createCard(first);
  content.appendChild(cards);
})();
