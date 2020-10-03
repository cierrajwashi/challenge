import {
  GameBoardItemType,
  KeyToGameDirection,
  GameDirectionMap,
  GameDirectionToKeys,
  GameDirection,
  GameDirectionReverseMap,
  pillMax,
} from "../Map";
import Item from "./Item";

class Pacman extends Item implements GameBoardItem {
  type: GameBoardItemType = GameBoardItemType.PACMAN;

  desiredMove: string | false = false;

  score: number = 0;

  constructor(
    piece: GameBoardPiece,
    items: GameBoardItem[][],
    pillTimer: GameBoardItemTimer
  ) {
    super(piece, items, pillTimer);

    // Bind context for callback events
    this.handleKeyPress = this.handleKeyPress.bind(this);

    // Add a listener for keypresses for this object
    window.addEventListener("keypress", this.handleKeyPress, false);
  }

  /**
   * Handle a keypress from the keyboard
   *
   * @method handleKeyPress
   * @param {KeyboardEvent} e Input event
   */
  handleKeyPress(e: KeyboardEvent): void {
    if (KeyToGameDirection[e.key.toUpperCase()]) {
      this.desiredMove = KeyToGameDirection[e.key.toUpperCase()];
    }
  }

  /**
   * Returns the next move from the keyboard input
   *
   * @method getNextMove
   * @return {GameBoardItemMove | boolean} Next move
   */
  getNextMove(): GameBoardItemMove | boolean {
    const { moves } = this.piece;

    let move: GameBoardItemMove | false = false;

    // If there is a keyboard move, use it and clear it
    if (this.desiredMove) {
      if (moves[this.desiredMove]) {
        move = {
          piece: moves[this.desiredMove],
          direction: GameDirectionMap[this.desiredMove],
        };
        this.desiredMove = false;
      }
    }

    const currentDirectionKey = GameDirectionToKeys(this.direction);

    Object.keys(GameDirectionMap).map((key) => {
      if (this.findItem(key, GameBoardItemType.GHOST) === false && moves[key]) {
        move = {
          piece: moves[key],
          direction: GameDirectionMap[key],
        };
      }
    });

    //If a ghost is in a certain direction, don't go in THAT direction
    //If there are no ghosts around then go toward biscuits and/or cherries
    //Pacman should eat the ghosts when powered up from the cherries/"pills"

    const priorities: any = { up: 0, down: 0, left: 0, right: 0 };
    Object.keys(GameDirectionMap).forEach((direction) => {
      if (!moves[direction]) {
        priorities[direction] = -28934834;
        return;
      }

      const oppositeDirection = GameDirectionReverseMap[direction];

      if (currentDirectionKey === oppositeDirection) {
        return;
      }
      const biscuitDistance = this.findItemDistance(
        direction,
        GameBoardItemType.BISCUIT
      );
      const ghostDistance = this.findItemDistance(
        direction,
        GameBoardItemType.GHOST
      );
      if (ghostDistance) {
        if (this.pillTimer.timer === 0) {
          //If pacman has no more cherry juice, go away from the ghost
          priorities[direction] = -1 + ghostDistance * 0.01;
        } else {
          //if pacan has some juice, go toward the ghost
          priorities[direction] = 5 - ghostDistance * 0.01;
        }
      } else if (this.findItem(direction, GameBoardItemType.PILL)) {
        priorities[direction] = 3;
      } else if (biscuitDistance) {
        priorities[direction] = 2 - biscuitDistance * 0.01;
      } else if (this.pillTimer.timer > 0) {
        priorities[direction] = 1;
      }

      priorities[direction] += Math.random() * 0.001;

      //when not powered up the highest priority is to avoid ghosts
      // if there's a ghost {this direction priority = -10}
      // if there's a pill { this direction priority += 2}
      // if there's a biscuit {this direction prioity += 1}
    });

    const bestDirection = Object.keys(priorities).reduce((a, b) =>
      priorities[a] > priorities[b] ? a : b
    );
    move = {
      piece: moves[bestDirection],
      direction: GameDirectionMap[bestDirection],
    };

    // best direction = direction with max priority
    // return best direction object

    // Otherwise, continue in the last direction
    if (!move && this.direction !== GameDirection.NONE) {
      if (moves[currentDirectionKey]) {
        move = {
          piece: moves[currentDirectionKey],
          direction: this.direction,
        };
      }
    }

    return move;
  }

  /**
   * Move Pacman and "eat" the item
   *
   * @method move
   * @param {GameBoardPiece} piece
   * @param {GameDirection} direction
   */
  move(piece: GameBoardPiece, direction: GameDirection): void {
    const item = this.items[piece.y][piece.x];
    if (typeof item !== "undefined") {
      this.score += item.type;
      switch (item.type) {
        case GameBoardItemType.PILL:
          this.pillTimer.timer = pillMax;
          break;
        case GameBoardItemType.GHOST:
          if (typeof item.gotoTimeout !== "undefined") item.gotoTimeout();
          break;
        default:
          break;
      }
    }
    this.setBackgroundItem({ type: GameBoardItemType.EMPTY });
    this.fillBackgroundItem();

    this.setPiece(piece, direction);
    this.items[piece.y][piece.x] = this;
  }
}

export default Pacman;
