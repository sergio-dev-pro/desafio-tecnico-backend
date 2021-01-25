
export enum RuleTypeEnum {
    DAILY,
    SPECIFIC_DAY,
    WEKLY
}

export enum DayEnum {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

export interface IRuleDaily {
    startHour : number
    endHour : number
}

interface IInterval {startHour: number, endHour: number}

export interface ISpecificDay{
    dateDay : Date
    day : DayEnum
    intervals : Array<IInterval>
}

export interface IRuleWekly{
    days : Array<DayEnum>
    interval : IInterval
}

export interface IRuleData {
    
    daily : IRuleDaily,
    Wekly : IRuleWekly,
    specificDay : Array<ISpecificDay>
}