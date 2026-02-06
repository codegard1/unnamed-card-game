import { SymbolStyle } from ".";

/**
 * Card front face configuration
 */

export interface CardFrontStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  cornerFontSize: number;
  centerFontSize: number;
  symbolStyle: SymbolStyle;
}
