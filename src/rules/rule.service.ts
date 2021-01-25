import moment from "moment";
import { uuid } from "uuidv4";

import {
    IRuleSpecificDayDTO,
    IRuleSpecificDay,
    DayEnum,
    IInterval,
    IRuleWeklyDTO,
    IRuleWekly,
    IRuleDailyDTO,
    IRuleDaily,
  } from "./rule.interface";

export function getModelRepositorySpecificDay(
    rule: IRuleSpecificDayDTO
  ): IRuleSpecificDay {
    const formatDay: string = moment(rule.dateDay, "YYYY-MM-DD", true)
      .format("dddd")
      .toUpperCase();
    const day: DayEnum = (formatDay as unknown) as DayEnum;
  
  
    const ruleRepositoy: IRuleSpecificDay = {
      dateDay: rule.dateDay,
      day,
      intervals: rule.intervals,
      dateDayInMileseconds: Date.parse(rule.dateDay),
      id : uuid()
    };
  
    return ruleRepositoy;
  }
  

  export function getModelRepositoryWekly(
    rule: IRuleWeklyDTO
  ): IRuleWekly {

  
    const ruleRepositoy: IRuleWekly = {
      days : rule.days,
      interval: rule.interval,
    };

    return ruleRepositoy;
  }

  export function getModelRepositoryDaily(
    rule: IRuleDailyDTO
  ): IRuleDaily {
  
    const ruleRepositoy: IRuleDaily = {
      interval : rule.interval,
    };

    return ruleRepositoy;
  }
  
  export function validateHhMm(value : string) {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value);

    return isValid
  }