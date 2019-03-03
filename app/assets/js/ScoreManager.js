export default class ScoreManager {
    constructor() {
        this.saved_scores = localStorage.getItem('scores')
        console.log(this.saved_scores)
        this._initScores()
    }

    _initScores() {
        if (this.saved_scores) {
            this.saved_scores = JSON.parse(this.saved_scores)
            document.getElementById("blue-score").innerHTML = this.saved_scores.blue_score
            document.getElementById("red-score").innerHTML = this.saved_scores.red_score
        }
        else {
            let initScores = {
                'blue_score': 0,
                'red_score': 0
            }
            console.log('initScores', initScores)
            this._setScores(initScores)
            this.saved_scores = JSON.parse(localStorage.getItem('scores'))

        }
    }


    _updateScoreBlue() {
        this.saved_scores.blue_score = this.saved_scores.blue_score + 1
        document.getElementById("blue-score").innerHTML = this.saved_scores.blue_score
        this._setScores(this.saved_scores)
    }

    _updateScoreRed() {
        this.saved_scores.red_score = this.saved_scores.red_score + 1
        document.getElementById("red-score").innerHTML = this.saved_scores.red_score
        this._setScores(this.saved_scores)
    }


    _setScores(setScores) {
        localStorage.setItem('scores', JSON.stringify(setScores))
    }
}