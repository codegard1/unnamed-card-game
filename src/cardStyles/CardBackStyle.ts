import { BackgroundType, GradientConfig } from ".";

/**
 * Card back design configuration
 */
export interface CardBackStyle {
  backgroundType: BackgroundType;
  backgroundColor?: string; // for solid backgrounds
  gradient?: GradientConfig; // for gradient backgrounds
  imageUrl?: string; // for image backgrounds
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}
