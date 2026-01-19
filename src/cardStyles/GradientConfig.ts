/**
 * Gradient configuration
 */
export interface GradientConfig {
  type: 'linear' | 'radial';
  angle?: number; // for linear gradients (in degrees)
  colors: string[]; // array of color stops
}
