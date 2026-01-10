import '@material/web/textfield/filled-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/slider/slider.js';
import type { CardStyleConfig, CardBackStyle, CardFrontStyle } from '../game/CardStyles';
import { BackgroundType, CARD_STYLE_PRESETS, DEFAULT_CARD_STYLE } from '../game/CardStyles';
import { Card, Suit, Rank } from '../game';
import { CardComponent } from './CardComponent';

/**
 * Card style customization component
 * Provides UI for customizing card front, back, and symbol styles
 */
export class CardStyleCustomizer {
  private container: HTMLElement;
  private currentStyle: CardStyleConfig;
  private previewFrontCard: CardComponent;
  private previewBackCard: CardComponent;
  private onSaveCallback?: (style: CardStyleConfig) => void;
  private onCancelCallback?: () => void;

  constructor() {
    this.currentStyle = structuredClone(DEFAULT_CARD_STYLE);
    this.container = this.createUI();
    
    // Create preview cards
    this.previewFrontCard = new CardComponent(new Card(Suit.HEARTS, Rank.ACE), false);
    this.previewBackCard = new CardComponent(new Card(Suit.HEARTS, Rank.ACE), true);
  }

  /**
   * Sets the current card style for editing
   */
  setStyle(style: CardStyleConfig): void {
    this.currentStyle = structuredClone(style);
    this.updatePreview();
    this.updateFormValues();
  }

  /**
   * Gets the current card style configuration
   */
  getStyle(): CardStyleConfig {
    return this.currentStyle;
  }

  /**
   * Sets the save callback
   */
  onSave(callback: (style: CardStyleConfig) => void): void {
    this.onSaveCallback = callback;
  }

  /**
   * Sets the cancel callback
   */
  onCancel(callback: () => void): void {
    this.onCancelCallback = callback;
  }

  /**
   * Creates the UI for the customizer
   */
  private createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'card-style-customizer';
    container.innerHTML = `
      <div class="customizer-content">
        <!-- Preset Selection -->
        <div class="customizer-section">
          <h3>Presets</h3>
          <div class="preset-buttons" id="preset-buttons"></div>
        </div>

        <!-- Live Preview -->
        <div class="customizer-section">
          <h3>Live Preview</h3>
          <div class="preview-container">
            <div class="preview-card-container">
              <label>Front</label>
              <div id="preview-front"></div>
            </div>
            <div class="preview-card-container">
              <label>Back</label>
              <div id="preview-back"></div>
            </div>
          </div>
        </div>

        <!-- Front Style Controls -->
        <div class="customizer-section">
          <h3>Front Face Style</h3>
          <div class="control-group">
            <label>Background Color</label>
            <input type="color" id="front-bg-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>Border Color</label>
            <input type="color" id="front-border-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>Border Width (px)</label>
            <input type="number" id="front-border-width" min="0" max="10" step="1" />
          </div>
          <div class="control-group">
            <label>Border Radius (px)</label>
            <input type="number" id="front-border-radius" min="0" max="20" step="1" />
          </div>
        </div>

        <!-- Symbol Style Controls -->
        <div class="customizer-section">
          <h3>Symbol Styles</h3>
          <div class="control-group">
            <label>♥ Hearts Color</label>
            <input type="color" id="heart-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>♦ Diamonds Color</label>
            <input type="color" id="diamond-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>♣ Clubs Color</label>
            <input type="color" id="club-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>♠ Spades Color</label>
            <input type="color" id="spade-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>Symbol Size (rem)</label>
            <input type="number" id="symbol-size" min="1" max="5" step="0.1" />
          </div>
        </div>

        <!-- Back Style Controls -->
        <div class="customizer-section">
          <h3>Back Face Style</h3>
          <div class="control-group">
            <label>Background Type</label>
            <select id="back-bg-type">
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Custom Image</option>
            </select>
          </div>
          <div class="control-group" id="back-solid-controls">
            <label>Background Color</label>
            <input type="color" id="back-bg-color" class="color-input" />
          </div>
          <div class="control-group" id="back-gradient-controls" style="display: none;">
            <label>Gradient Type</label>
            <select id="gradient-type">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            <label>Gradient Angle (deg)</label>
            <input type="number" id="gradient-angle" min="0" max="360" step="15" value="135" />
            <label>Gradient Color 1</label>
            <input type="color" id="gradient-color-1" class="color-input" />
            <label>Gradient Color 2</label>
            <input type="color" id="gradient-color-2" class="color-input" />
            <label>Gradient Color 3 (optional)</label>
            <input type="color" id="gradient-color-3" class="color-input" />
          </div>
          <div class="control-group" id="back-image-controls" style="display: none;">
            <label>Image URL</label>
            <input type="text" id="back-image-url" placeholder="https://example.com/image.jpg" />
            <p class="hint">Or upload a file:</p>
            <input type="file" id="back-image-file" accept="image/*" />
          </div>
          <div class="control-group">
            <label>Border Color</label>
            <input type="color" id="back-border-color" class="color-input" />
          </div>
          <div class="control-group">
            <label>Border Width (px)</label>
            <input type="number" id="back-border-width" min="0" max="10" step="1" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="customizer-actions">
          <md-outlined-button id="cancel-btn">Cancel</md-outlined-button>
          <md-filled-button id="save-btn">Save & Apply</md-filled-button>
        </div>
      </div>
    `;

    // Set up event listeners
    this.setupEventListeners(container);
    this.setupPresetButtons(container);

    return container;
  }

  /**
   * Sets up preset buttons
   */
  private setupPresetButtons(container: HTMLElement): void {
    const presetButtonsContainer = container.querySelector('#preset-buttons');
    if (!presetButtonsContainer) return;

    Object.values(CARD_STYLE_PRESETS).forEach(preset => {
      const button = document.createElement('md-outlined-button');
      button.textContent = preset.displayName;
      button.addEventListener('click', () => {
        this.setStyle(preset);
      });
      presetButtonsContainer.appendChild(button);
    });
  }

  /**
   * Sets up event listeners for all controls
   */
  private setupEventListeners(container: HTMLElement): void {
    // Front style controls
    this.addInputListener(container, 'front-bg-color', (value) => {
      this.currentStyle.front.backgroundColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'front-border-color', (value) => {
      this.currentStyle.front.borderColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'front-border-width', (value) => {
      this.currentStyle.front.borderWidth = parseFloat(value);
      this.updatePreview();
    });

    this.addInputListener(container, 'front-border-radius', (value) => {
      this.currentStyle.front.borderRadius = parseFloat(value);
      this.updatePreview();
    });

    // Symbol style controls
    this.addInputListener(container, 'heart-color', (value) => {
      this.currentStyle.front.symbolStyle.heartColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'diamond-color', (value) => {
      this.currentStyle.front.symbolStyle.diamondColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'club-color', (value) => {
      this.currentStyle.front.symbolStyle.clubColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'spade-color', (value) => {
      this.currentStyle.front.symbolStyle.spadeColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'symbol-size', (value) => {
      const size = parseFloat(value);
      this.currentStyle.front.centerFontSize = size;
      this.currentStyle.front.symbolStyle.fontSize = size;
      this.updatePreview();
    });

    // Back style type selector
    const backTypeSelect = container.querySelector('#back-bg-type') as HTMLSelectElement;
    if (backTypeSelect) {
      backTypeSelect.addEventListener('change', () => {
        this.currentStyle.back.backgroundType = backTypeSelect.value as BackgroundType;
        this.updateBackgroundControls(container);
        this.updatePreview();
      });
    }

    // Back solid color
    this.addInputListener(container, 'back-bg-color', (value) => {
      this.currentStyle.back.backgroundColor = value;
      this.updatePreview();
    });

    // Back gradient controls
    this.addInputListener(container, 'gradient-type', (value) => {
      if (!this.currentStyle.back.gradient) {
        this.currentStyle.back.gradient = { type: 'linear', colors: [] };
      }
      this.currentStyle.back.gradient.type = value as 'linear' | 'radial';
      this.updatePreview();
    });

    this.addInputListener(container, 'gradient-angle', (value) => {
      if (!this.currentStyle.back.gradient) {
        this.currentStyle.back.gradient = { type: 'linear', colors: [] };
      }
      this.currentStyle.back.gradient.angle = parseFloat(value);
      this.updatePreview();
    });

    this.addInputListener(container, 'gradient-color-1', (value) => {
      if (!this.currentStyle.back.gradient) {
        this.currentStyle.back.gradient = { type: 'linear', colors: ['', '', ''] };
      }
      this.currentStyle.back.gradient.colors[0] = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'gradient-color-2', (value) => {
      if (!this.currentStyle.back.gradient) {
        this.currentStyle.back.gradient = { type: 'linear', colors: ['', '', ''] };
      }
      this.currentStyle.back.gradient.colors[1] = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'gradient-color-3', (value) => {
      if (!this.currentStyle.back.gradient) {
        this.currentStyle.back.gradient = { type: 'linear', colors: ['', '', ''] };
      }
      this.currentStyle.back.gradient.colors[2] = value;
      this.updatePreview();
    });

    // Back image controls
    this.addInputListener(container, 'back-image-url', (value) => {
      this.currentStyle.back.imageUrl = value;
      this.updatePreview();
    });

    const imageFileInput = container.querySelector('#back-image-file') as HTMLInputElement;
    if (imageFileInput) {
      imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.currentStyle.back.imageUrl = e.target?.result as string;
            this.updatePreview();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Back border controls
    this.addInputListener(container, 'back-border-color', (value) => {
      this.currentStyle.back.borderColor = value;
      this.updatePreview();
    });

    this.addInputListener(container, 'back-border-width', (value) => {
      this.currentStyle.back.borderWidth = parseFloat(value);
      this.updatePreview();
    });

    // Action buttons
    const saveBtn = container.querySelector('#save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (this.onSaveCallback) {
          this.onSaveCallback(this.currentStyle);
        }
      });
    }

    const cancelBtn = container.querySelector('#cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (this.onCancelCallback) {
          this.onCancelCallback();
        }
      });
    }
  }

  /**
   * Helper to add input listener
   */
  private addInputListener(container: HTMLElement, id: string, callback: (value: string) => void): void {
    const input = container.querySelector(`#${id}`) as HTMLInputElement;
    if (input) {
      input.addEventListener('input', () => callback(input.value));
      input.addEventListener('change', () => callback(input.value));
    }
  }

  /**
   * Updates which background controls are visible
   */
  private updateBackgroundControls(container: HTMLElement): void {
    const solidControls = container.querySelector('#back-solid-controls') as HTMLElement;
    const gradientControls = container.querySelector('#back-gradient-controls') as HTMLElement;
    const imageControls = container.querySelector('#back-image-controls') as HTMLElement;

    if (solidControls) solidControls.style.display = 'none';
    if (gradientControls) gradientControls.style.display = 'none';
    if (imageControls) imageControls.style.display = 'none';

    switch (this.currentStyle.back.backgroundType) {
      case BackgroundType.SOLID:
        if (solidControls) solidControls.style.display = 'block';
        break;
      case BackgroundType.GRADIENT:
        if (gradientControls) gradientControls.style.display = 'block';
        break;
      case BackgroundType.IMAGE:
        if (imageControls) imageControls.style.display = 'block';
        break;
    }
  }

  /**
   * Updates form values from current style
   */
  private updateFormValues(): void {
    const container = this.container;

    // Front style
    this.setInputValue(container, 'front-bg-color', this.currentStyle.front.backgroundColor);
    this.setInputValue(container, 'front-border-color', this.currentStyle.front.borderColor);
    this.setInputValue(container, 'front-border-width', this.currentStyle.front.borderWidth.toString());
    this.setInputValue(container, 'front-border-radius', this.currentStyle.front.borderRadius.toString());

    // Symbol style
    this.setInputValue(container, 'heart-color', this.currentStyle.front.symbolStyle.heartColor);
    this.setInputValue(container, 'diamond-color', this.currentStyle.front.symbolStyle.diamondColor);
    this.setInputValue(container, 'club-color', this.currentStyle.front.symbolStyle.clubColor);
    this.setInputValue(container, 'spade-color', this.currentStyle.front.symbolStyle.spadeColor);
    this.setInputValue(container, 'symbol-size', this.currentStyle.front.centerFontSize.toString());

    // Back style
    this.setInputValue(container, 'back-bg-type', this.currentStyle.back.backgroundType);
    this.updateBackgroundControls(container);

    if (this.currentStyle.back.backgroundColor) {
      this.setInputValue(container, 'back-bg-color', this.currentStyle.back.backgroundColor);
    }

    if (this.currentStyle.back.gradient) {
      this.setInputValue(container, 'gradient-type', this.currentStyle.back.gradient.type);
      this.setInputValue(container, 'gradient-angle', (this.currentStyle.back.gradient.angle || 135).toString());
      if (this.currentStyle.back.gradient.colors[0]) {
        this.setInputValue(container, 'gradient-color-1', this.currentStyle.back.gradient.colors[0]);
      }
      if (this.currentStyle.back.gradient.colors[1]) {
        this.setInputValue(container, 'gradient-color-2', this.currentStyle.back.gradient.colors[1]);
      }
      if (this.currentStyle.back.gradient.colors[2]) {
        this.setInputValue(container, 'gradient-color-3', this.currentStyle.back.gradient.colors[2]);
      }
    }

    if (this.currentStyle.back.imageUrl) {
      this.setInputValue(container, 'back-image-url', this.currentStyle.back.imageUrl);
    }

    this.setInputValue(container, 'back-border-color', this.currentStyle.back.borderColor || this.currentStyle.front.borderColor);
    this.setInputValue(container, 'back-border-width', (this.currentStyle.back.borderWidth || this.currentStyle.front.borderWidth).toString());
  }

  /**
   * Helper to set input value
   */
  private setInputValue(container: HTMLElement, id: string, value: string): void {
    const input = container.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
    if (input) {
      input.value = value;
    }
  }

  /**
   * Updates the live preview
   */
  private updatePreview(): void {
    // Apply styles temporarily to preview cards
    this.applyStylesToElement(this.previewFrontCard.getElement(), false);
    this.applyStylesToElement(this.previewBackCard.getElement(), true);
  }

  /**
   * Applies current styles to an element
   */
  private applyStylesToElement(element: HTMLElement, isBack: boolean): void {
    if (isBack) {
      // Back styles
      element.style.borderColor = this.currentStyle.back.borderColor || this.currentStyle.front.borderColor;
      element.style.borderWidth = `${this.currentStyle.back.borderWidth || this.currentStyle.front.borderWidth}px`;
      element.style.borderRadius = `${this.currentStyle.back.borderRadius || this.currentStyle.front.borderRadius}px`;

      if (this.currentStyle.back.backgroundType === BackgroundType.SOLID && this.currentStyle.back.backgroundColor) {
        element.style.background = this.currentStyle.back.backgroundColor;
      } else if (this.currentStyle.back.backgroundType === BackgroundType.GRADIENT && this.currentStyle.back.gradient) {
        const gradient = this.currentStyle.back.gradient;
        const gradientStr = gradient.type === 'linear'
          ? `linear-gradient(${gradient.angle || 135}deg, ${gradient.colors.filter(c => c).join(', ')})`
          : `radial-gradient(circle, ${gradient.colors.filter(c => c).join(', ')})`;
        element.style.background = gradientStr;
      } else if (this.currentStyle.back.backgroundType === BackgroundType.IMAGE && this.currentStyle.back.imageUrl) {
        element.style.background = `url(${this.currentStyle.back.imageUrl}) center/cover`;
      }
    } else {
      // Front styles
      element.style.backgroundColor = this.currentStyle.front.backgroundColor;
      element.style.borderColor = this.currentStyle.front.borderColor;
      element.style.borderWidth = `${this.currentStyle.front.borderWidth}px`;
      element.style.borderRadius = `${this.currentStyle.front.borderRadius}px`;

      // Apply symbol colors
      const suit = element.getAttribute('data-suit');
      if (suit === 'hearts') {
        element.style.color = this.currentStyle.front.symbolStyle.heartColor;
      } else if (suit === 'diamonds') {
        element.style.color = this.currentStyle.front.symbolStyle.diamondColor;
      } else if (suit === 'clubs') {
        element.style.color = this.currentStyle.front.symbolStyle.clubColor;
      } else if (suit === 'spades') {
        element.style.color = this.currentStyle.front.symbolStyle.spadeColor;
      }

      // Apply font sizes
      const rankElements = element.querySelectorAll('.card-rank');
      rankElements.forEach(el => {
        (el as HTMLElement).style.fontSize = `${this.currentStyle.front.cornerFontSize}rem`;
      });

      const suitElement = element.querySelector('.card-suit') as HTMLElement;
      if (suitElement) {
        suitElement.style.fontSize = `${this.currentStyle.front.centerFontSize}rem`;
      }
    }
  }

  /**
   * Returns the DOM element
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Initializes the preview after the element is added to DOM
   */
  initialize(): void {
    const previewFront = this.container.querySelector('#preview-front');
    const previewBack = this.container.querySelector('#preview-back');

    if (previewFront) {
      previewFront.appendChild(this.previewFrontCard.getElement());
    }

    if (previewBack) {
      previewBack.appendChild(this.previewBackCard.getElement());
    }

    this.updateFormValues();
    this.updatePreview();
  }
}
