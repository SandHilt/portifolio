import { createCard } from "./utils.js";

export default class Card extends HTMLElement {
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

  /**
   * @param {AsyncGenerator<Array<string>, void, unknown>} gen
   * @param {HTMLElement} content
   * @returns {void}
   */
  static async handleNext(gen, content) {
    const { value, done } = await gen.next();
    console.log({ value, done });
    if (!done && value) {
      const card = createCard(value);
      content.appendChild(card);
    }
  }

  /** @param {Array<IntersectionObserverEntry>} entries
   *  @param  {IntersectionObserver} observe
   *  @returns {void}
   */
  handleIntersect(entries, observe) {
    for (const { intersectionRatio: ratio, isIntersecting: inter } of entries) {
      if (inter && !this.show) {
        if (ratio >= 1 / 4) {
          this.show = true;
          this.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 1000,
            fill: "forwards",
          });
        } else {
          if (!this.style.opacity) {
            this.style.opacity = 0;
          }
        }
      }
      if (ratio >= 3 / 4) {
        observe.disconnect();
        Card.handleNext();
      }
    }
  }

  /** @param {number} numSteps
   *  @returns {Array<number>}
   */
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
