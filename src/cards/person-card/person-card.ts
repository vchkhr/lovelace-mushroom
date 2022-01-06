import {
    computeStateDisplay,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor
  } from "custom-card-helpers";
  import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
  import { customElement, property, state } from "lit/decorators.js";
  import "../../shared/shape-icon";
  import "../../shared/shape-avatar";
  import { registerCustomCard } from "../../utils/custom-cards";
  import { PERSON_CARD_EDITOR_NAME, PERSON_CARD_NAME } from "./const";
  import "./person-card-editor";
  import { classMap } from "lit/directives/class-map.js";
  
  /*
   * TODO: make configurable icons, icons according to zone, show state indicator
   */
  export interface PersonCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    use_entity_picture?: boolean;
  }
  
  registerCustomCard({
    type: PERSON_CARD_NAME,
    name: "Mushroom Person Card",
    description: "Card for person entity",
  });
  
  @customElement(PERSON_CARD_NAME)
  export class PersonCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
      return document.createElement(
        PERSON_CARD_EDITOR_NAME
      ) as LovelaceCardEditor;
    }
  
    public static async getStubConfig(
      hass: HomeAssistant
    ): Promise<PersonCardConfig> {
      const entities = Object.keys(hass.states);
      const persons = entities.filter(
        (e) => e.substr(0, e.indexOf(".")) === "person"
      );
      return {
        type: `custom:${PERSON_CARD_NAME}`,
        entity: persons[0],
      };
    }
  
    @property({ attribute: false }) public hass!: HomeAssistant;
  
    @state() private _config?: PersonCardConfig;
  
    getCardSize(): number | Promise<number> {
      return 1;
    }
  
    setConfig(config: PersonCardConfig): void {
      this._config = config;
    }
  
    clickHandler(): void {
      this.hass.callService("switch", "toggle", {
        entity_id: this._config?.entity,
      });
    }
  
    protected render(): TemplateResult {
      if (!this._config || !this.hass) {
        return html``;
      }
  
      const entity = this._config.entity;
      const entity_state = this.hass.states[entity];
  
      const name = this._config.name ?? entity_state.attributes.friendly_name;
      let icon = this._config.icon ?? "mdi:face-man";
      let picture:string|null = null;
      if (this._config.use_entity_picture && entity_state.attributes.entity_picture) {
        picture = entity_state.attributes.entity_picture
      }
  
      const state = entity_state.state;
      let state_icon = "mdi:pine-tree";
      let state_color = "var(--state-not_home-color)";
      if (state === "unknown") {
            state_icon = "mdi:map-marker-alert";
            state_color =  "var(--state-unknown-color)";
      } else if (state === "home") {
            state_icon = "mdi:home";
            state_color =  "var(--state-home-color)";
      }
  
      const stateDisplay = computeStateDisplay(
        this.hass.localize,
        entity_state,
        this.hass.locale
      );
  
      return html`<ha-card @click=${this.clickHandler}>
        <div class=${classMap({ container: true})}>
            <div class="image-container">
                ${!picture ? html`<mushroom-shape-icon
                    .icon=${icon}
                ></mushroom-shape-icon>` : html`<mushroom-shape-avatar
                    .picture_url=${picture}
                ></mushroom-shape-avatar>`}
                <div class="state-indicator" style="background-color: ${state_color}">
                    <ha-icon class="state-icon" .icon=${state_icon}/>
                </div>
            </div>
            <div class="info-container">
                <span class="info-name">${name}</span>
                <span class="info-value">${stateDisplay}</span>
            </div>
        </div>
      </ha-card>`;
    }
  
    static get styles(): CSSResultGroup {
      return css`
        :host {
          --rgb-color: 61, 90, 254;
        }
        ha-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          padding: 12px;
        }
        .container {
          display: flex;
          flex-direction: row;
          position: relative;
        }
        .container > *:not(:last-child) {
          margin-right: 12px;
        }
        .image-container {
          position: relative;
        }
        .state-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 10px;
            position: absolute;
            top: -3px;
            right: -3px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--state-unknown-color);
            transition: background 280ms ease-in-out;
        }
        .state-icon {
            --mdc-icon-size: 12px;
            color: var(--text-primary-color);
        }
        .info-container {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .info-name {
          font-weight: bold;
          font-size: 14px;
          color: var(--primary-text-color);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .info-value {
          font-weight: bolder;
          font-size: 12px;
          color: var(--secondary-text-color);
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      `;
    }
  }
  