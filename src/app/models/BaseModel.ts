/**
 * A basic entity properties object. Contains a unique ID.
 */
export interface BaseModelProps {
  id?: string;
}


/**
 * A basic class that is being constructed by given properties.
 * This class is abstract, and supposed to be extended by the app classes
 */
export abstract class BaseModel implements BaseModelProps {

  /**
   * Build a front-end entity by getting a properties object, or creating an empty entity.
   * @param _props - An object contains all the data of the entity. Empty data object, if not passed.
   */
  protected constructor(protected _props : BaseModelProps = {}) {}


  /** ID value can be read **/
  get id() : string | undefined {
    return this._props.id;
  }

  /** ID property can be set only once, if does not have ID already (Usually getting the value from a server) **/
  set id(id : string) {
    if(id)
      if(!this.id)
        this._props.id = id;
      else
        console.warn('Cannot set ID since this entity already has ID');
  }


  /**
   * Returns a copy of the properties object (for uploading to a server, duplicating, ect...)
   * @param newId - Set new ID to the returned object. If no value passed, keeps the original ID. Passing null will delete the previous ID
   */
  exportProperties(newId? : string | null) : BaseModelProps {

    const propsCopy : BaseModelProps = JSON.parse(JSON.stringify(this._props));

    if(newId)
      propsCopy.id = newId;

    if(!propsCopy.id)
      delete propsCopy.id;

    return propsCopy;

  }

}


/** Example of use:

export interface PersonProps extends BaseModelProps {
  name?: string;
  DOB?: number;
  childrenIds?: string[];
}


export class Person extends BaseModel implements PersonProps {

  constructor(protected _props : PersonProps = {}) {
    super(_props);
  }

  get name() : string {
    return this._props.name
  }

  set name(newName: string) {
    if(!name)
      this._props.name = name;
  }

  get dob() : Date {
    return new Date(this._props.DOB);
  }

  set dob(date : Date) {
    this._props.DOB = date.getTime();
  }

  get childrenIds() : string[] {
    return this._props.childrenIds ? [...this._props.childrenIds] : [];
  }

  calcAgeInYears() : number {
    return (new Date()).getFullYear() - (new Date(this._props.DOB)).getFullYear();
  }

  addChild(childId : string) {
    this._props.childrenIds.push(childId);
  }

}


 export const myPerson = new Person({
    id: 12345678,
    name: John doe,
    DOB: Date.now(),
 });


 serverService.savePersonOnServer(myPerson.exportProperties());

 **/
