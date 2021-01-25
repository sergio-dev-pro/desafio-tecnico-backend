export enum RuleTypeEnum {
    DAILY = 'DAILY',
    SPECIFIC_DAY = 'SPECIFIC_DAY',
    WEKLY = 'WEKLY'
}

export enum DayEnum {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY'
}

// extends IBaseRule

export interface IRuleDaily {
    // startHour : number
    // endHour : number
    interval : IInterval
}

export interface IInterval {startHour: string, endHour: string}

export interface IRuleSpecificDay {
    id : string,
    dateDay : string
    dateDayInMileseconds : number
    day : DayEnum
    intervals : Array<IInterval>
}

export interface IRuleWekly {
    days : Array<DayEnum>
    interval : IInterval
}

export interface IRuleData {
    
    daily : IRuleDaily,
    wekly : IRuleWekly,
    specificDay : Array<IRuleSpecificDay>
}


// DTO interfaces ***
export interface IIntervalDTO {startHour: string, endHour: string}

export interface IBaseRuleDTO {
  type: RuleTypeEnum
}

export interface IRuleSpecificDayDTO extends IBaseRuleDTO{
    dateDay : string
    intervals : Array<IIntervalDTO>
}

export interface IRuleWeklyDTO extends IBaseRuleDTO{
    days : Array<DayEnum>
    interval : IIntervalDTO
}

export interface IRuleDailyDTO extends IBaseRuleDTO{
   interval : IIntervalDTO
}
