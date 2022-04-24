
import Game, {matrix} from "./Game";
//
export enum PacketID
{
    CS_PING = 1033,
    CS_SEARCHING_ENEMY = 1002,
    CS_SEARCHING_RESULT = 1003,
    CS_SEARCHING_CANCEL = 1004,
    CS_GAME_READY = 1005,
    CS_GAME_START = 1006,
    CS_GAME_COMPUTE = 1007,
    CS_GAME_TURN = 1008,
    CS_GAME_SELECT = 1009,
    CS_GAME_RESULT = 1010,
    CS_GAME_OUT = 1011,
    CS_GAME_TIMER = 1012,
    CS_GAME_ENTRY = 1013,

    SC_PING = 3033,
    SC_SEARCHING_ENEMY = 3002,
    SC_SEARCHING_RESULT = 3003,
    SC_SEARCHING_CANCEL = 3004,
    SC_GAME_READY = 3005,
    SC_GAME_START = 3006,
    SC_GAME_COMPUTE = 3007,
    SC_GAME_TURN = 3008,
    SC_GAME_SELECT = 3009,
    SC_GAME_RESULT = 3010,
    SC_GAME_OUT = 3011,
    SC_GAME_TIMER = 3012,
    SC_GAME_ENTRY = 3013,
}
export interface Head
{
    num : number
    size : Number
}
export interface DataForm
{
    ph : Head
    msg : string
}
export interface SC_Ping
{
    ph : Head
}
export interface SC_Searching_Enemy
{
    ph : Head
}
export interface SC_Searching_Result
{
    ph : Head
    result : number
}

export interface SC_Searching_Cancel
{
    ph : Head
}
export interface SC_Game_Ready
{
    ph : Head
    ready : boolean
}
export interface SC_Game_Start
{
    ph : Head
    userIdx : number
    match : number
    round : number
}

export interface SC_Game_Compute
{
    ph : Head
    bar : number
    userIdx : number;
    matrixes : matrix[]
}


export interface SC_Game_Turn
{
    ph : Head
    userIdx : number
}


export interface SC_Game_Select
{
    ph : Head
}


export interface SC_Game_Result
{
    ph : Head
    winner : number
    winner_point : number
    looser_point : number
}


export interface SC_Game_Out
{
    ph : Head
    gameOut : boolean
}

export interface SC_Game_Timer
{
     ph : Head
     sec : number
}
export interface SC_Game_Entry
{
     ph : Head
}

//////
export interface CS_Searching_Enemy
{
    ph : Head
}
export interface CS_Searching_Cancel
{
    ph : Head
}
export interface CS_Game_Ready
{
     ph : Head
     ready : boolean
}
export interface CS_Game_Start
{
     ph : Head
}

export interface CS_Game_Compute
{
     ph : Head
}

export interface CS_Game_Turn
{
     ph : Head
}

export interface CS_Game_Select
{
     ph : Head
     bar : number;
}

export interface CS_Game_Result
{
     ph : Head
}

export interface CS_Game_Out
{
     ph : Head
     gameOut : boolean
}

export interface CS_Game_Timer
{
     ph : Head
}
export interface CS_Game_Entry
{
     ph : Head
}