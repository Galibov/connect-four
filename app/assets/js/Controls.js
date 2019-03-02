export default class Controls {
    constructor(renderer) {
        this._selectedSlot = 0
        this.renderer = renderer
    }
    _fireControls() {
        this.setPlayerInput(true);
        this._addMouseListener();

    }

    setPlayerInput(playerInput) {
        this.AllowInput = playerInput;
    }
    _addMouseListener() {
        this.MousePos = this.renderer.plugins.interaction.mouse.global;
    }
}