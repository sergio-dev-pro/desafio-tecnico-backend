import fs from "fs";
import { Request, Response, NextFunction, response } from "express";
import moment from "moment";

import {
  IRuleSpecificDayDTO,
  RuleTypeEnum,
  IIntervalDTO,
  IRuleWeklyDTO,
  IRuleSpecificDay,
  DayEnum,
  IRuleDailyDTO,
  IRuleDaily,
  IInterval,
  IRuleData,
  IRuleWekly,
} from "../rule.interface";

import {getModelRepositorySpecificDay, getModelRepositoryWekly, getModelRepositoryDaily, validateHhMm} from '../rule.service'

// import {reverseString, validDate} from '../../helpers/helpers';

type callBackFS = (err: NodeJS.ErrnoException | null, data: string) => void;

export async function createRulesValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    switch (req.body.rule.type){
        case RuleTypeEnum.SPECIFIC_DAY : 
        await createRuleSpecificDayValidation(req, res, next)
        break;
        case RuleTypeEnum.WEKLY :
        await createRuleWeklyValidation(req, res, next)
        break
        case RuleTypeEnum.DAILY :
        await createRuleDailyValidation(req, res, next)
        break
        default:
        return res.status(400).json({ message: "Tipo da regra inválido." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Erro interno"})
  }
}

async function createRuleSpecificDayValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rule: IRuleSpecificDayDTO = req.body.rule;
    const ruleSpecificDay: IRuleSpecificDayDTO = rule;

    const dateIsValid = moment(ruleSpecificDay.dateDay, "DD-MM-YYYY", true);
    if (!dateIsValid.isValid())
      return res
        .status(400)
        .json({ message: "Data da regra inválida." })
        .send();

    const intervalIsValid: boolean = validIntervals(ruleSpecificDay.intervals);
    if (!intervalIsValid)
      return res
        .status(400)
        .json({
          message:
          "Inicio do intervalo deve ser menor do que o fim do intervalo.",
        })
        .send();

    let readFileCallback: callBackFS = (err : NodeJS.ErrnoException | null, file : string) => {
      if (err) throw err;

      const ruleData: IRuleData = JSON.parse(file);
      const ruleSpecificDay: IRuleSpecificDay = getModelRepositorySpecificDay(
        rule
      );

      let conflictingTime: boolean;

      if (ruleData.specificDay.length > 0) {
        for (const specificDay of ruleData.specificDay) {
          if (
            specificDay.day === ruleSpecificDay.day &&
            dateIsValid.isSame(moment(specificDay.dateDay, "DD-MM-YYYY", true))
            // specificDay.dateDayInMileseconds ===
            //   ruleSpecificDay.dateDayInMileseconds
          ) {
            return res
              .status(400)
              .json({
                message:
                  "Não é possivel criar duas regras para o mesmo dia especifico.",
              });
          }
        }
      }

      if (Object.keys(ruleData.daily).length > 0) {
        for (const interval of ruleSpecificDay.intervals) {
          conflictingTime = conflictBetweenSchedules(
            interval,
            ruleData.daily.interval
          );
          if (conflictingTime)
            return res
              .status(400)
              .json({
                message:
                  "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
              });
        }
      }
      if (Object.keys(ruleData.wekly).length > 0) {
        for (const day of ruleData.wekly.days) {
          if (day === ruleSpecificDay.day) {
            for (const interval of ruleSpecificDay.intervals) {
              conflictingTime = conflictBetweenSchedules(
                interval,
                ruleData.wekly.interval
              );
              if (conflictingTime)
                return res
                  .status(400)
                  .json({
                    message:
                      "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
                  });
            }
            break;
          }
        }
      }

      next();
    };

    fs.readFile("rules-data.json", "utf8", readFileCallback);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Erro interno"})
  }
}

async function createRuleWeklyValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rule: IRuleWeklyDTO = req.body.rule;
    const ruleWekly : IRuleWeklyDTO = rule;

    const intervalIsValid: boolean = validIntervals([ruleWekly.interval]);
    if (!intervalIsValid)
      return res
        .status(400)
        .json({
          message:
            "Inicio do intervalo deve ser menor do que o fim do intervalo.",
        })
        .send();

    let readFileCallback: callBackFS = (err : NodeJS.ErrnoException | null, file : string) => {
      if (err) throw err;

      const ruleData: IRuleData = JSON.parse(file);
      const ruleDaily: IRuleDaily = getModelRepositoryDaily(
        rule
      );

      let conflictingTime: boolean;

        if (Object.keys(ruleData.daily).length > 0) {
          conflictingTime = conflictBetweenSchedules(
            ruleWekly.interval,
            ruleData.daily.interval
          );
          if (conflictingTime)
            return res
              .status(400)
              .json({
                message:
                  "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
              });
        }
      

      
      if(Object.keys(ruleData.wekly).length > 0){
        return res
              .status(400)
              .json({
                message:
                "Não é possivel criar duas regras semanalmente.",
              });
      }
        

      if (ruleData.specificDay.length > 0) {
        for (const day of ruleWekly.days) {
            for(const specificDay of ruleData.specificDay){
                if(day === specificDay.day){
                    for(const specificDayInterval of specificDay.intervals){
                        conflictingTime = conflictBetweenSchedules(ruleWekly.interval, specificDayInterval)
                        if(conflictingTime)
                        return res
                        .status(400)
                        .json({
                          message:
                          "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
                        });
                    }
                }
            }
        }
      }

      next();
    }

    fs.readFile("rules-data.json", "utf8", readFileCallback);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Erro interno"})
  }
}

async function createRuleDailyValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rule: IRuleDailyDTO = req.body.rule;
    const ruleDaily : IRuleDailyDTO = rule;

    const intervalIsValid: boolean = validIntervals([ruleDaily.interval]);
    if (!intervalIsValid)
      return res
        .status(400)
        .json({
          message:
            "Inicio do intervalo deve ser menor do que o fim do intervalo.",
        })
        .send();

    let readFileCallback: callBackFS = (err : NodeJS.ErrnoException | null, file : string) => {
      if (err) throw err;

      const ruleData: IRuleData = JSON.parse(file);
      const ruleDaily: IRuleDaily = getModelRepositoryDaily(
        rule
      );

      let conflictingTime: boolean;

        if (Object.keys(ruleData.daily).length > 0) {
            return res
              .status(400)
              .json({
                message:
                "Não é possivel criar duas regras diariamente.",
              });
        }
      

      
      if(Object.keys(ruleData.wekly).length > 0){
        conflictingTime = conflictBetweenSchedules(ruleDaily.interval, ruleData.wekly.interval)
        if(conflictingTime)
        return res
        .status(400)
        .json({
          message:
          "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
        });
      }
        

      if (ruleData.specificDay.length > 0) {
        ruleData.specificDay.forEach((specificDay) => {
          for(const intervalSpecificDay of specificDay.intervals){
          conflictingTime = conflictBetweenSchedules(ruleDaily.interval, intervalSpecificDay)
          if(conflictingTime)
          return res
          .status(400)
          .json({
            message:
            "Horario inválido, nova regra não pode conflitar com horario já determinado por regra já existente.",
          });
          }
        })
      }

      next();
    }

    fs.readFile("rules-data.json", "utf8", readFileCallback);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Erro interno"})
  }
}

function conflictBetweenSchedules(
  schedulesX: IInterval,
  schedulesY: IInterval
): boolean {
    
  const startHourX : number =  parseInt(schedulesX.startHour.replace(":", ""));
  const endHourX : number =  parseInt(schedulesX.endHour.replace(":", ""));
  const startHourY : number =  parseInt(schedulesY.startHour.replace(":", ""));
  const endHourY : number =  parseInt(schedulesY.endHour.replace(":", ""));

  const startOfTimeXIsBetweenSchedulesY =
    startHourX > startHourY &&
    startHourX < endHourY;
  const endOfTimeXIsBetweenSchedulesY =
    endHourX > startHourY &&
    endHourX < endHourY;
  const schedulesXIsBetweenSchedulesY: boolean =
    startHourX < startHourY &&
    endHourX > endHourY;

  if (
    startOfTimeXIsBetweenSchedulesY ||
    endOfTimeXIsBetweenSchedulesY ||
    schedulesXIsBetweenSchedulesY
  )
    return true;

  return false;
}


function validIntervals(intervals: Array<IIntervalDTO>): boolean {
  for (const interval of intervals) {

    const endHourIsvalid : boolean= validateHhMm(interval.endHour)
    const startHourIsvalid : boolean = validateHhMm(interval.startHour)
    
    if(!(endHourIsvalid && startHourIsvalid))
    return false
    
    const formatStartHour: number = parseInt(interval.startHour.replace(":", ""));
    const formatEndHour: number = parseInt(interval.endHour.replace(":", ""));
    if (formatStartHour > formatEndHour) return false;
  }

  return true;
}
