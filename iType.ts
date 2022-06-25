export enum PacketID
{
    CS_PING = 1001,
    CS_GAME_MOVE,
    CS_GAME_POSITION,
    CS_GAME_TIMER,

    SC_PING = 3001,
    SC_GAME_SPECTATION,
    SC_GAME_MOVE,
    SC_GAME_OUT,
    SC_GAME_HELLO_NEWCLIENT,
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
export interface Position
{
    x : number
    y : number
    z : number
}
export interface Character
{
    index : number
    position : Position
}


//////////////////////////////// C To S //////////////////////////////// 
export interface CS_Game_Timer
{
     ph : Head
}

export interface CS_Game_Move
{
     ph : Head
     position : Position
}
export interface CS_Game_Position
{
     ph : Head
     position : Position
}



//////////////////////////////// S To C //////////////////////////////// 
export interface SC_Ping
{
    ph : Head
}
export interface SC_Game_Timer
{
     ph : Head
     sec : number
}
export interface SC_Game_Spectation
{
    ph : Head
    index : number
    characters : Character[]
}
export interface SC_Game_Move
{
    ph : Head
    character : Character
}
export interface SC_Game_Out
{
    ph : Head
    index : number
}

export interface SC_Game_Hello_NewClient
{
    ph : Head
    character : Character
}
