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


//////
export interface CS_Searching_Enemy
{
    ph : Head
}
export interface CS_Searching_Cancel
{
    ph : Head
}