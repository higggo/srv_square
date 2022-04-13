
import Game, {matrix} from "./Game";
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
}


export interface SC_Game_Out
{
    ph : Head
    gameOut : boolean
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