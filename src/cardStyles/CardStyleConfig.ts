import { CardBackStyle, CardFrontStyle } from ".";

/**
 * Complete card style configuration
 */

export interface CardStyleConfig {
  name: string;
  displayName: string;
  front: CardFrontStyle;
  back: CardBackStyle;
}
