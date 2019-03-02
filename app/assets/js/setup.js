
//fav
import favicon from '../img/favicon.ico'
// images
import board_block from '../img/board_block.png'
import arrow from '../img/arrow.png'
import result_red from '../img/result_red.png'
import result_blue from '../img/result_blue.png'
import result_tie from '../img/result_tie.png'
import chip_red from '../img/chip_red.png'
import chip_blue from '../img/chip_blue.png'
import chip_red_drop from '../img/chip_red_drop.png'
import chip_blue_drop from '../img/chip_blue_drop.png'
import chip_red_win from '../img/chip_red_win.png'
import chip_blue_win from '../img/chip_blue_win.png'
import chip_red_shadow from '../img/chip_red_shadow.png'
import chip_blue_shadow from '../img/chip_blue_shadow.png'
import message_board from '../img/message_board.png'
import try_again_red from '../img/try_again_red.png'
import try_again_blue from '../img/try_again_blue.png'
import rocket_red from '../img/rocket_red.png'
import rocket_blue from '../img/rocket_blue.png'
import btn_replay from '../img/btn_replay.png'
// sounds
import victory from '../sounds/victory.mp3'


export default {
    CONTAINER: '#game-block',
    IMAGES: {
        favicon,
        board_block,
        arrow,
        result_red,
        result_blue,
        result_tie,
        chip_red,
        chip_blue,
        chip_red_drop,
        chip_blue_drop,
        chip_red_win,
        chip_blue_win,
        chip_red_shadow,
        chip_blue_shadow,
        message_board,
        try_again_red,
        try_again_blue,
        rocket_red,
        rocket_blue,
        btn_replay
    },
    SOUNDS: {
        victory
    },
    GAME_CONFIG: {
        num_players: 2,
        board_width: 7,
        board_height: 6,
        win_condition: 4,
        board_size: 64,
        background_color: 0x140C1C
    },
    GRAPHICS: {
        frame_rate: 60,
        replay_btn_offset: 54,
        btn_height: 52,
        btn_delay: 3,
        message_time: 7,
        impact_delay: 5,
        result_delay: 15
    },
}