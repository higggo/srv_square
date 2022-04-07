export default class Queue<T>
{
    protected data: Array<T> = [];
  
    push(item: T) {
      this.data.push(item);
    }
    
    pop() : T | undefined{
      return this.data.shift();
    }

    length() : number
    {
        return this.data.length;
    }

    get() : T | undefined
    {
        try{
            return this.data[0];
        }
        catch{
            console.log("Queue get Error !")
            return undefined;
        }
        
    }
}

//export = Queue;