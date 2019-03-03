import Config from './Config'
import Controls from './Controls'
import ScoreManager from './ScoreManager'
import Logic from './Logic'
export default class Game {
    constructor() {
        this._domContainer = document.getElementById('game-block');
        this._ScoreManager = new ScoreManager()
        PIXI.loader
            .add([Object.values(Config.IMAGES)])
            .load(() => this._start());
    }

    _start() {
        this._initCanvas();
        this._Logic = new Logic()
        this._scene();
        requestAnimationFrame(() => this._loop());

    }

    _initCanvas() {
        this.renderer = new PIXI.CanvasRenderer(this._getCanvasSize().canvas_width, this._getCanvasSize().canvas_height, {
            antialias: false,
            transparent: false,
            resolution: 1
        });
        this.renderer.backgroundColor = 0x140C1C;
        this._domContainer.appendChild(this.renderer.view);
        this._Controls = new Controls(this.renderer)
    }
    // START INIT STAGE
    _initStage() {
        this._container = new PIXI.Container();
        this.resources = PIXI.loader.resources;
        this._initBoard();
        this._initMessages();
        this._initPreview();
    }

    _initBoard() {
        let i,
            j,
            slot,
            backgroundBoard = this.resources[Config.IMAGES.board_block].texture,
            renderBackground;
        this.slotContainer = new PIXI.Container();
        for (i = 0; i < Config.GAME_CONFIG.board_width; i += 1) {
            slot = new PIXI.Container();
            this._interactive(slot, false, undefined);
            for (j = 0; j < Config.GAME_CONFIG.board_height; j += 1) {
                renderBackground = new PIXI.Sprite(backgroundBoard);
                renderBackground.x = Config.GAME_CONFIG.board_size * i;
                renderBackground.y = Config.GAME_CONFIG.board_size * j;
                slot.addChild(renderBackground);
            }
            this.slotContainer.addChild(slot);
        }
        this._container.addChild(this.slotContainer);
        this._container.setChildIndex(this.slotContainer, 0);
        this.chipContainer = new PIXI.Container();
        this._container.addChild(this.chipContainer);
    }


    _initMessages() {
        let texBoard = this.resources[Config.IMAGES.message_board].texture,
            texMessage = this.resources[Config.IMAGES.try_again_blue].texture,
            texBtnReplay = this.resources[Config.IMAGES.btn_replay].texture,
            sprBoard = this._toCenter(texBoard);
        this.sprMessage = this._toCenter(texMessage);
        this.rectBtnReplay = new PIXI.Rectangle(0, 0, texBtnReplay.width, Config.GRAPHICS.btn_height);
        texBtnReplay.frame = this.rectBtnReplay;
        this.sprBtnReplay = this._toCenter(texBtnReplay);
        this.sprBtnReplay.y += Config.GRAPHICS.replay_btn_offset;
        this.messageContainer = new PIXI.Container();
        this.messageContainer.addChild(sprBoard);
        this.messageContainer.addChild(this.sprMessage);
        this.messageContainer.addChild(this.sprBtnReplay);
        this.messageContainer.visible = false;
        this._container.addChild(this.messageContainer);
    }

    _initPreview() {
        let texArrow = this.resources[Config.IMAGES.arrow].texture,
            texShadow = this.resources[Config.IMAGES.chip_blue_shadow].texture;
        this.rectArrow = new PIXI.Rectangle(0, Config.GAME_CONFIG.board_size, Config.GAME_CONFIG.board_size, Config.GAME_CONFIG.board_size);
        texArrow.frame = this.rectArrow;
        this.sprArrow = new PIXI.Sprite(texArrow);
        this.sprShadow = new PIXI.Sprite(texShadow);
        this.sprShadow.y = (Config.GAME_CONFIG.board_height - 1) * Config.GAME_CONFIG.board_size;
        this.arrowContainer = new PIXI.Container();
        this.arrowContainer.addChild(this.sprArrow);
        this.arrowContainer.addChild(this.sprShadow);
        this.arrowContainer.setChildIndex(this.sprShadow, 0);
        this._container.addChild(this.arrowContainer);
    }

    _toCenter(nTex) {
        let spr = new PIXI.Sprite(nTex);
        spr.anchor.set(0.5, 0.5);
        spr.position.set(0.5 * this._getCanvasSize().canvas_width, 0.5 * this._getCanvasSize().canvas_height);
        return spr;
    }

    _getCanvasSize() {
        return {
            canvas_height: Config.GAME_CONFIG.board_height * Config.GAME_CONFIG.board_size,
            canvas_width: Config.GAME_CONFIG.board_width * Config.GAME_CONFIG.board_size
        }
    }

    _interactive(dispObj, isButton, buttonValue) {
        dispObj.interactive = true;
        dispObj.buttonMode = true;
        if (isButton) {
            switch (buttonValue) {
                case "replay":
                    dispObj.on('pointerdown', () => this.onClickReplay());
                    break;
            }
        } else {

            dispObj.on('pointerover', () => this._onHover());
            dispObj.on('pointerdown', () => this._onClick());

        }
    }
    _unInteractive(dispObj) {
        dispObj.interactive = false;
        dispObj.buttonMode = false;
    }
    _onHover() {
        this._Controls._selectedSlot = this._mouseSelection();
        if (this._Controls.AllowInput) {
            this._feedbackSelection();
        }
    }

    _onClick() {
        this._hardInput();
    }

    _hardInput() {
        if (this._Controls.AllowInput) {
            this._Controls.setPlayerInput(false);
            this._checkInputValid(this._Controls._selectedSlot);
        }
    }

    _checkInputValid(SlotIndex) {
        if (this._Logic._isSlotOccupied(SlotIndex)) {
            this._invalidInput();
        } else {
            this._validInput(SlotIndex);
        }
    }
    _invalidInput() {
        this._feedbackTryAgain();
    }

    _validInput(SlotIndex) {
        this._Logic.ArraySlotVacancy[SlotIndex] -= 1;
        let SlotField = this._Logic.ArraySlotVacancy[SlotIndex];
        this._Logic.FieldsVacant -= 1;
        this._Logic.ArrayFieldValues[SlotIndex][SlotField] = this._Logic.PlayerTurn;
        if (!this._Logic._checkWin(SlotIndex, SlotField)) {
            if (!this._Logic._checkTie()) {
                this._nextTurn();
            } else {
                this._tieGame();
            }
        } else {
            this._Logic._winGame();
        }
        this._feedbackInput(SlotIndex, SlotField);
    }

    _mouseSelection() {
        if (this.isMouseInsideCanvas()) {
            return Math.floor(this._Controls.MousePos.x / Config.GAME_CONFIG.board_size);
        }
    }

    isMouseInsideCanvas() {
        if (this._Controls.MousePos.x < this._getCanvasSize().canvas_width && this._Controls.MousePos.x > -1 && this._Controls.MousePos.y < this._getCanvasSize().canvas_height && this._Controls.MousePos.y > -1) {
            return true;
        } else {
            return false;
        }
    }

    //GAME LOOP
    _loop() {
        requestAnimationFrame(() => this._loop());
        this.renderer.render(this._container)
    }

    _feedbackTryAgain() {
        let imgKey,
            showAndHide,
            showCounter = 0;
        switch (this._Logic.PlayerTurn) {
            case 1:
                imgKey = Config.IMAGES.try_again_blue;
                break;
            case 2:
                imgKey = Config.IMAGES.try_again_red;
                break;
        }
        this.sprMessage.texture = this.resources[imgKey].texture;
        this.messageContainer.visible = true;
        this.sprBtnReplay.visible = false;

        showAndHide = setInterval(() => {
            if (showCounter === Config.GRAPHICS.message_time) {
                this.messageContainer.visible = false;
                this._Controls.setPlayerInput(true);
                this._feedbackInputAllowed();
                clearInterval(showAndHide);
            }
            showCounter += 1;
        }, Config.GRAPHICS.frame_rate);
    }

    _feedbackInput(vx, vy) {
        let animInput,
            animLoopCounter = 2,
            animCounterStop = 4;
        animInput = setInterval(() => {
            if (animLoopCounter < animCounterStop) {
                this.rectArrow.y = animLoopCounter * Config.GAME_CONFIG.board_size;
                this.sprArrow.texture.frame = this.rectArrow;
                animLoopCounter += 1;
            } else {
                this._feedbackInputAllowed();
                this._feedbackDrop(vx, vy);
                clearInterval(animInput);
            }
        }, Config.GRAPHICS.frame_rate);
    }


    _feedbackDrop(vx, vy) {
        let imgKey,
            chipColor = this._Logic.ArrayFieldValues[vx][vy],
            rect = new PIXI.Rectangle(0, 0, Config.GAME_CONFIG.board_size, Config.GAME_CONFIG.board_size),
            texChip,
            sprChip,
            firstLoop = true,
            animDrop,
            animLoopCounter = 0;
        switch (chipColor) {
            case 1:
                imgKey = Config.IMAGES.chip_blue_drop;
                break;
            case 2:
                imgKey = Config.IMAGES.chip_red_drop;
                break;
        }
        texChip = this.resources[imgKey].texture;
        sprChip = new PIXI.Sprite(texChip);
        sprChip.texture.frame = rect;
        sprChip.x = Config.GAME_CONFIG.board_size * vx;
        sprChip.y = 0;
        this.chipContainer.addChild(sprChip);

        animDrop = setInterval(() => {
            if (firstLoop) {
                firstLoop = false;
            } else {
                animLoopCounter += 0.5;
            }
            if (animLoopCounter < vy) {
                if (rect.y === Config.GAME_CONFIG.board_size * 2) {
                    rect.y = 0;
                }
                rect.y += Config.GAME_CONFIG.board_size;
            } else {
                rect.x = Config.GAME_CONFIG.board_size;
                rect.y = 0;
                this._feedbackImpact(sprChip, rect, chipColor);
                clearInterval(animDrop);
            }
            sprChip.y = animLoopCounter * Config.GAME_CONFIG.board_size;
            sprChip.texture.frame = rect;
        }, Config.GRAPHICS.frame_rate);
    }

    _feedbackImpact(sprChip, rect, chipColor) {
        let imgKey,
            animImpact,
            animLoopCounter = 0,
            animCounterStop = 3;
        switch (chipColor) {
            case 1:
                imgKey = Config.IMAGES.chip_blue;
                break;
            case 2:
                imgKey = Config.IMAGES.chip_red;
                break;
        }
        rect.x = Config.GAME_CONFIG.board_size;
        rect.y = 0;
        sprChip.texture.frame = rect;

        animImpact = setInterval(() => {
            animLoopCounter += 1;
            if (animLoopCounter < animCounterStop) {
                rect.y = animLoopCounter * Config.GAME_CONFIG.board_size;
                sprChip.texture.frame = rect;
            } else {
                sprChip.texture = this.resources[imgKey].texture;
                rect.x = 0;
                rect.y = 0;
                this._feedbackWin(chipColor);
                clearInterval(animImpact);
            }
        }, Config.GRAPHICS.frame_rate);
    }

    _feedbackWin(chipColor) {
        let imgKey,
            texEffect,
            sprEffect,
            rect = new PIXI.Rectangle(0, 0, Config.GAME_CONFIG.board_size, Config.GAME_CONFIG.board_size),
            animWin,
            delayCounter = 0,
            animLoopCounter = 0,
            animFrameCount = 6,
            animRunCount,
            animCounterStop = animFrameCount * this._Logic.maxChipRow;
        switch (chipColor) {
            case 1:
                imgKey = Config.IMAGES.chip_blue_win;
                break;
            case 2:
                imgKey = Config.IMAGES.chip_red_win;
                break;
        }
        texEffect = this.resources[imgKey].texture;
        sprEffect = new PIXI.Sprite(texEffect);
        sprEffect.texture.frame = rect;
        sprEffect.visible = false;
        if (this._Logic.GameOver) {
            this.chipContainer.addChild(sprEffect);
        }

        animWin = setInterval(() => {
            if (delayCounter < Config.GRAPHICS.impact_delay) {
                delayCounter += 1;
            } else {
                if (this._Logic.GameOver) {
                    if (animLoopCounter < animCounterStop) {
                        rect.y = (animLoopCounter % animFrameCount) * Config.GAME_CONFIG.board_size;
                        sprEffect.texture.frame = rect;
                        animRunCount = Math.floor(animLoopCounter / animFrameCount);
                        if (animLoopCounter % animFrameCount === 0) {
                            sprEffect.x = this._Logic.ArrayWinX[animRunCount] * Config.GAME_CONFIG.board_size;
                            sprEffect.y = this._Logic.ArrayWinY[animRunCount] * Config.GAME_CONFIG.board_size;
                            sprEffect.visible = true;
                        }
                        if (this._Logic.ArrayWinX[animRunCount] === -1) {
                            animLoopCounter += animFrameCount;
                        } else {
                            animLoopCounter += 1;
                        }
                    } else {
                        sprEffect.visible = false;
                        this._feedbackGameOver();
                        clearInterval(animWin);
                    }
                } else {
                    this._Controls.setPlayerInput(true);
                    this._feedbackInputAllowed();
                    clearInterval(animWin);
                }
            }
        }, Config.GRAPHICS.frame_rate);
    }

    _feedbackGameOver() {
        let imgKeyMessage,
            imgKeyRocket,
            texSizeRocket = Config.GAME_CONFIG.board_size * 2,
            rect = new PIXI.Rectangle(0, 0, texSizeRocket, texSizeRocket),
            texRocket,
            sprRocket,
            rocketDest,
            rocketSpeed = 0.5,
            rockets = true,
            traveling = false,
            firstLoop = true,
            animFrameCount = 8,
            animRocket,
            animDelayCounter = 0,
            animLoopCounter = 0;
        switch (this._Logic.PlayerTurn) {
            case 0:
                imgKeyMessage = Config.IMAGES.result_tie;
                rockets = false;
                break;
            case 1:
                imgKeyMessage = Config.IMAGES.result_blue;
                imgKeyRocket = Config.IMAGES.rocket_blue;
                this._ScoreManager._updateScoreBlue()
                break;
            case 2:
                imgKeyMessage = Config.IMAGES.result_red;
                imgKeyRocket = Config.IMAGES.rocket_red;
                this._ScoreManager._updateScoreRed()
                break;
        }
        this.sprMessage.texture = this.resources[imgKeyMessage].texture;
        this._noBoardInteractivity();
        this._interactive(this.sprBtnReplay, true, "replay");
        this.sprBtnReplay.visible = true;
        if (rockets) {
            texRocket = this.resources[imgKeyRocket].texture;
            sprRocket = new PIXI.Sprite(texRocket);
            sprRocket.texture.frame = rect;
            sprRocket.y = Config.GAME_CONFIG.board_height * Config.GAME_CONFIG.board_size;
            this._container.addChild(sprRocket);
        }

        animRocket = setInterval(() => {
            if (animDelayCounter < Config.GRAPHICS.result_delay) {
                animDelayCounter += 1;
            } else {
                if (firstLoop) {
                    this.messageContainer.visible = true;
                    firstLoop = false;
                }
                if (rockets) {
                    if (animLoopCounter % animFrameCount === 0) {
                        rect.x = 0;
                        sprRocket.x = Math.floor(Math.random() * (Config.GAME_CONFIG.board_width - 1)) * Config.GAME_CONFIG.board_size;
                        rocketDest = Math.floor(Math.random() * (Config.GAME_CONFIG.board_height - 1)) + 2;
                        sprRocket.y = Config.GAME_CONFIG.board_height * Config.GAME_CONFIG.board_size;
                    } else if (animLoopCounter % animFrameCount === 1) {
                        traveling = true;
                        rocketDest -= rocketSpeed;
                        sprRocket.y -= rocketSpeed * Config.GAME_CONFIG.board_size;
                        if (rect.y === 0) {
                            rect.y = texSizeRocket;
                        } else {
                            rect.y = 0;
                        }
                        if (rocketDest === 0) {
                            traveling = false;
                        }
                    } else if (animLoopCounter % (animFrameCount * 0.5) === 0) {
                        rect.x = texSizeRocket;
                    }
                    if (!traveling) {
                        rect.y = (animLoopCounter % (animFrameCount * 0.5)) * texSizeRocket;
                        animLoopCounter += 1;
                    }
                    sprRocket.texture.frame = rect;
                }
                if (!this._Logic.GameOver || !rockets) {
                    clearInterval(animRocket);
                }
            }
        }, Config.GRAPHICS.frame_rate);
    }

    _noBoardInteractivity() {
        for (let i = 0; i < Config.GAME_CONFIG.board_width; i += 1) {
            this._unInteractive(this.slotContainer.children[i]);
        }
    }

    _feedbackInputAllowed() {
        if (this._Controls.AllowInput) {
            this._feedbackSelection();
            this.arrowContainer.visible = true;
        } else {
            this.arrowContainer.visible = false;
        }
    }

    _nextTurn() {
        let nextPlayer = this._Logic.PlayerTurn + 1;
        if (nextPlayer > Config.GAME_CONFIG.num_players) {
            nextPlayer = 1;
        }
        this._Logic.PlayerTurn = nextPlayer;
    }

    _scene() {
        this._Controls._fireControls();
        this._Logic._initLogic();
        this._initStage();
    }

    _feedbackSelection() {
        let rectPosX,
            imgKey;
        switch (this._Logic.PlayerTurn) {
            case 1:
                rectPosX = 0;
                imgKey = Config.IMAGES.chip_blue_shadow;
                break;
            case 2:
                rectPosX = Config.GAME_CONFIG.board_size;
                imgKey = Config.IMAGES.chip_red_shadow;
                break;
        }
        this.rectArrow.x = rectPosX;
        if (this._Logic._isSlotOccupied(this._Controls._selectedSlot)) {
            this.rectArrow.y = 0;
        } else {
            this.rectArrow.y = Config.GAME_CONFIG.board_size;
        }
        this.sprArrow.texture.frame = this.rectArrow;
        this.sprShadow.texture = this.resources[imgKey].texture;
        this.arrowContainer.x = this._Controls._selectedSlot * Config.GAME_CONFIG.board_size;
        this.sprShadow.y = (this._Logic.ArraySlotVacancy[this._Controls._selectedSlot] - 1) * Config.GAME_CONFIG.board_size;
    }

    onClickReplay() {
        this._feedbackReplay();
    }

    _feedbackReplay() {
        let delayCounter = 0,
            replayDelay = setInterval(() => {
                if (delayCounter === Config.GRAPHICS.btn_delay) {
                    this._scene();
                    clearInterval(replayDelay);
                }
                delayCounter += 1;
            }, Config.GRAPHICS.frame_rate);
        this.rectBtnReplay.y = Config.GRAPHICS.btn_height * 2;
        this.sprBtnReplay.texture.frame = this.rectBtnReplay;
    }
}