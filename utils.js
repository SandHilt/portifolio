/** @param {Array<string>} data
 *  @returns {HTMLElement}
 */
export function createCard(data) {
  const card = document.createElement("m-card");
  for (const item of data) {
    const el = document.createElement("li");
    el.textContent = item;
    card.appendChild(el);
  }
  return card;
}

/** @param {string} name
 *  @returns {Promise<Array<string>>}
 *  @async
 */
async function getSubject(name) {
  try {
    const response = await fetch(`${name}.json`);
    if (response.ok) {
      const subject = await response.json();
      return subject;
    } else {
      throw new Error(response.statusText);
    }
  } catch (err) {
    console.log(err);
    return [];
  }
}

/**
 * @param {Array<string>} arr
 * @returns {AsyncGenerator<Array<string>, void, unknown>}
 */
export async function* getSubjects(arr) {
  try {
    for await (const item of arr.map(getSubject)) {
      yield item;
    }
  } catch (err) {
    console.log(err);
  }
}
