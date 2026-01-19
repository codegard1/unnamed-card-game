/**
 * Interface for game metadata
 * Contains information about a game such as description, rules, version, creator, and documentation
 */
export interface IGameMetadata {
  /** A markdown description of the game */
  description: string;

  /** Markdown string containing the game rules */
  rules: string;

  /** The version of the game (e.g., "1.0.0" or "1.2.3.4") */
  version: string;

  /** The name of the game creator */
  creatorName: string;

  /** The URL to the game rules website or documentation */
  rulesWebsite: string;
}
