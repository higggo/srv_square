
import Game, {matrix} from "./Game";
//
export enum PacketID
{
    CS_PING = 1001,
    CS_LOBBY_SEARCHING_ENEMY,
    CS_LOBBY_SEARCHING_RESULT,
    CS_LOBBY_SEARCHING_CANCEL,
    CS_GAME_ENTRY,
    CS_GAME_READY,
    CS_GAME_START,
    CS_GAME_COMPUTE,
    CS_GAME_TURN,
    CS_GAME_SELECT,
    CS_GAME_RESULT,
    CS_GAME_NEW_MATCH,
    CS_GAME_OUT,
    CS_GAME_TIMER,

    SC_PING = 3001,
    SC_LOBBY_SEARCHING_ENEMY,
    SC_LOBBY_SEARCHING_RESULT,
    SC_LOBBY_SEARCHING_CANCEL,
    SC_GAME_ENTRY,
    SC_GAME_READY,
    SC_GAME_START,
    SC_GAME_COMPUTE,
    SC_GAME_TURN,
    SC_GAME_SELECT,
    SC_GAME_RESULT,
    SC_GAME_NEW_MATCH,
    SC_GAME_OUT,
    SC_GAME_TIMER
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
export interface SC_Lobby_Searching_Enemy
{
    ph : Head
}
export interface SC_Lobby_Searching_Result
{
    ph : Head
    result : number
}

export interface SC_Lobby_Searching_Cancel
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

export interface SC_Game_NewMatch
{
    ph : Head
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
export interface CS_Lobby_Searching_Enemy
{
    ph : Head
}
export interface CS_Lobby_Searching_Cancel
{
    ph : Head
}
export interface CS_Game_Ready
{
     ph : Head
     ready : boolean
}
export interface CS_Game_NewMatch
{
    ph : Head
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