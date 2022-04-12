enum SQUARE_ONE
{
    up = 11,
    down = 31,
    left = 21,
    right = 22
}
enum SQUARE_TWO
{
    up = 12,
    down = 32,
    left = 22,
    right = 23
}
enum SQUARE_THREE
{
    up = 13,
    down = 33,
    left = 23,
    right = 24
}
enum SQUARE_FOUR
{
    up = 31,
    down = 51,
    left = 41,
    right = 42
}
enum SQUARE_FIVE
{
    up = 32,
    down = 52,
    left = 42,
    right = 43
}
enum SQUARE_SIX
{
    up = 33,
    down = 53,
    left = 43,
    right = 44
}
enum SQUARE_SEVEN
{
    up = 51,
    down = 71,
    left = 61,
    right = 62
}
enum SQUARE_EIGHT
{
    up = 52,
    down = 72,
    left = 62,
    right = 63
}
enum SQUARE_NINE
{
    up = 53,
    down = 73,
    left = 63,
    right = 64
}

class Game{
    Bar = new Map<number, boolean>();

    Init()
    {
        this.Bar.set(11, true);
        this.Bar.set(12, true);
        this.Bar.set(13, true);
        
        this.Bar.set(21, true);
        this.Bar.set(22, true);
        this.Bar.set(23, true);
        this.Bar.set(24, true);

        this.Bar.set(31, true);
        this.Bar.set(32, true);
        this.Bar.set(33, true);
        
        this.Bar.set(41, true);
        this.Bar.set(42, true);
        this.Bar.set(43, true);
        this.Bar.set(44, true);

        this.Bar.set(51, true);
        this.Bar.set(52, true);
        this.Bar.set(53, true);

        this.Bar.set(61, true);
        this.Bar.set(62, true);
        this.Bar.set(63, true);
        this.Bar.set(64, true);
        
        this.Bar.set(71, true);
        this.Bar.set(72, true);
        this.Bar.set(73, true);
    }

    CheckSquare(barNum : number) : number[]
    {
        let number : number[] = [];
        let w = 3;
        let h = 3;

        let ten : number = barNum / 10;
        let one : number = barNum % 10;

        if(ten == 1)
        {

        }
        else if(ten == (w * 2) + 1)
        {

        }
        else
        {
            // 십의 자리 수가
            // 2, 4, 6...
            if(ten % 2 == 0)
            {
                let floor = ten / 2;
                if(one == 1)
                {
                    number.push(((floor-1) * 3) + one);
                }
                else if(one == w + 1)
                {
                    number.push(((floor-1) * 3) + w);
                }
                else
                {
                    number.push(((floor-1) * 3) + one-1);
                    number.push(((floor-1) * 3) + one);
                }
            }
            // 십의 자리 수가
            // 1, 3, 5..
            else
            {
                if(one == 1)
                {

                }
                else if(one == (h*2)+1)
                {

                }
                else
                {

                }
            }
        }
        return number;
    }
}