export class ObjectsUtil {

  static ClearFalsies(obj: any, keepZeros: boolean = false) : any {

    Object.keys(obj).forEach((key)=>{

      // If the object is an array, skip the non-numeric keys (ex: 'length')
      if(Array.isArray(obj) && isNaN(+key))
        return;

      // Delete falsy values (keep zeros according to argument)
      if(!obj[key] && (obj[key] !== 0 || !keepZeros))
        delete obj[key];

      // Recursive on inner objects
      else if(typeof obj[key] == 'object') {

        ObjectsUtil.ClearFalsies(obj[key], keepZeros);

        // If the inner object is empty after the clearing, delete it
        if(!Object.keys(obj[key]).length)
          delete obj[key];

      }

    });

    // Return the object
    return obj;

  }


  // Clear the objects falsy values and check whether they have same values
  static SameValues(obj1: any, obj2: any, keepZeros = false) : boolean {
    return JSON.stringify(ObjectsUtil.ClearFalsies(obj1, keepZeros)) == JSON.stringify(ObjectsUtil.ClearFalsies(obj2, keepZeros));
  }

}
