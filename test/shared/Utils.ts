export class UtilsTest {
  /**
   * Generates a random number between 1 wei and 10^18 wei (1 Ether)
   *
   * @returns number between {min} and {max}
   */
  public static getRandomAmount() {
    return this.getRandomBetween(1, 10 ^ 18);
  }

  /**
   * Generates a random number between {min} and {max}
   * @param min The min number to generate
   * @param max The max number to generate
   * @returns number between {min} and {max}
   */
  public static getRandomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
