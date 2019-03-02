import Config from './Config'
export default class Logic {
    constructor() {
        this.ArrayFieldValues = [];
        this.ArraySlotVacancy = [];
        this.ArrayWinX = [];
        this.ArrayWinY = [];
        this.maxChipRow = (2 * Config.GAME_CONFIG.win_condition) - 1;
        this.PlayerTurn;
        this.FieldsVacant;
    }

    _initLogic() {
        this._fillArrayFieldValues();
        this._fillArraySlotVacancy();
        this._fillArrayWin();
        this.PlayerTurn = 1;
        this.FieldsVacant = Config.GAME_CONFIG.board_height * Config.GAME_CONFIG.board_height
        this.GameOver = false;
    }

    _fillArrayFieldValues() {
        let i,
            j;
        for (i = 0; i < Config.GAME_CONFIG.board_width; i += 1) {
            this.ArrayFieldValues[i] = [];
            for (j = 0; j < Config.GAME_CONFIG.board_height; j += 1) {
                this.ArrayFieldValues[i][j] = 0;
            }
        }
    }

    _fillArraySlotVacancy() {
        let i;
        for (i = 0; i < Config.GAME_CONFIG.board_width; i += 1) {
            this.ArraySlotVacancy[i] = Config.GAME_CONFIG.board_height;
        }
    }


    _fillArrayWin() {
        let i;
        for (i = 0; i < this.maxChipRow; i += 1) {
            this.ArrayWinX[i] = -1;
            this.ArrayWinY[i] = -1;
        }
    }

    _winGame() {
        this.GameOver = true;
    }

    _checkTie() {
        if (this.FieldsVacant < 1) {
            return true;
        } else {
            return false;
        }
    }

    _checkWin(vx, vy) {
        let winCondFulfilled = false,
            maxLength = Config.GAME_CONFIG.win_condition,
            direction,
            dx,
            dy,
            i,
            counter,
            positiveCount,
            negativeCount,
            checkX,
            checkY,
            arrayStart = maxLength - 1;
        this.ArrayWinX[arrayStart] = vx;
        this.ArrayWinY[arrayStart] = vy;

        for (direction = 0; direction < Config.GAME_CONFIG.win_condition; direction += 1) {
            counter = 1;
            positiveCount = true;
            negativeCount = true;

            switch (direction) {
                case 0:             //Horizontal
                    dx = 1;
                    dy = 0;
                    break;
                case 1:             //Positive diagonal
                    dx = 1;
                    dy = 1;
                    break;
                case 2:             //Negative diagonal
                    dx = 1;
                    dy = -1;
                    break;
                case 3:             //Vertical
                    dx = 0;
                    dy = 1;
                    break;
            }

            for (i = 1; i < maxLength; i += 1) {
                if (positiveCount) {
                    checkX = vx + i * dx;
                    checkY = vy + i * dy;
                    if (this._isIndexValid(checkX, 'x') && this._isIndexValid(checkY, 'y') && this.ArrayFieldValues[checkX][checkY] === this.PlayerTurn) {
                        counter += 1;
                        this.ArrayWinX[arrayStart + i] = checkX;
                        this.ArrayWinY[arrayStart + i] = checkY;
                    } else {
                        positiveCount = false;
                    }
                }
                if (negativeCount) {
                    checkX = vx - i * dx;
                    checkY = vy - i * dy;
                    if (this._isIndexValid(checkX, 'x') && this._isIndexValid(checkY, 'y') && this.ArrayFieldValues[checkX][checkY] === this.PlayerTurn) {
                        counter += 1;
                        this.ArrayWinX[arrayStart - i] = checkX;
                        this.ArrayWinY[arrayStart - i] = checkY;
                    } else {
                        negativeCount = false;
                    }
                }
            }

            if (counter >= maxLength) {
                winCondFulfilled = true;
                break;
            }
        }
        if (!winCondFulfilled) {
            this._fillArrayWin();
        }
        return winCondFulfilled;
    }


    _isIndexValid(Index, Axis) {
        let comp,
            isValid;
        switch (Axis) {
            case 'x':
                comp = Config.GAME_CONFIG.board_width;
                break;
            case 'y':
                comp = Config.GAME_CONFIG.board_height;
                break;
        }
        isValid = (Index > -1 && Index < comp) ? true : false;
        return isValid;
    }

    _isSlotOccupied(SlotIndex) {
        if (this.ArraySlotVacancy[SlotIndex] < 1) {
            return true;
        } else {
            return false;
        }
    }
}