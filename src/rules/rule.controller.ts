import fs from 'fs';
import {Request, Response} from 'express';
  
import {RuleTypeEnum, IRuleSpecificDay, IRuleData, DayEnum, IRuleDaily, IRuleWekly, IInterval} from './rule.interface';
import {getModelRepositorySpecificDay, getModelRepositoryWekly, getModelRepositoryDaily} from './rule.service'
import {reverseString} from '../helpers/helpers'

import moment from "moment";
import { start } from 'repl';

type callBackFS =  (err : NodeJS.ErrnoException | null, data : string) => void;


export async function create(req: Request, res: Response) : Promise<void>{
    try {
        
    const body  = req.body;

    const createSpecificDay = (err : NodeJS.ErrnoException | null, file : string) => {
        if(err) throw err
     
         const ruleData : IRuleData  = JSON.parse(file)
         const ruleSpecificDay : IRuleSpecificDay = getModelRepositorySpecificDay(body.rule);
         ruleData.specificDay.push(ruleSpecificDay)

         fs.writeFile("rules-data.json", JSON.stringify(ruleData), function(err) {
            if(err)
            return console.log(err);

            return res.status(201).json({message : "Regra criada com sucesso.", data : {rule : ruleSpecificDay}})            
         }); 
    }
    const createDaily = (err : NodeJS.ErrnoException | null, file : string) => {
        if(err)
        throw err
     
        const ruleData : IRuleData  = JSON.parse(file)
        ruleData.daily = getModelRepositoryDaily(req.body.rule)

         fs.writeFile("rules-data.json", JSON.stringify(ruleData), function(err) {
             if(err)
             return console.log(err);

             return res.status(201).json({message : "Regra criada com sucesso.", data : {rule : ruleData.daily}})
         }); 
    }
    const createWekly = (err : NodeJS.ErrnoException | null, file : string) => {
        if(err)
        throw err
     
         const ruleData : IRuleData  = JSON.parse(file)
         ruleData.wekly = getModelRepositoryWekly(req.body.rule)
 
         fs.writeFile("rules-data.json", JSON.stringify(ruleData), function(err) {
             if(err)
             return console.log(err);

             return res.status(201).json({message : "Regra criada com sucesso.", data : {rule : ruleData.wekly}})
         }); 
    }

    let callback : callBackFS | null = null

    switch (body.rule.type) {
        case RuleTypeEnum.SPECIFIC_DAY :
        callback = createSpecificDay
        break;
        case RuleTypeEnum.WEKLY :
        callback = createWekly
        break;
        case RuleTypeEnum.DAILY :
        callback = createDaily
    }
     
    if(callback)
    fs.readFile('rules-data.json', 'utf8', callback)
     
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Erro interno"})
    }
}

export async function remove(req: Request, res: Response) : Promise<void> {

    try {
        
        const ruleId : string  = req.params.id;
    
        const removeSpecificDay = (err : NodeJS.ErrnoException | null, file : string) => {
            if(err) throw err
         
             const ruleData : IRuleData  = JSON.parse(file)
            
             const getIndexById  = (id : string) => {
                let index : number = -1
                ruleData.specificDay.forEach((elem, i)=> {
                    if(elem.id == id){
                        index = i
                    }
                })
                return index;
             }
           
             const indexSpecificday =  getIndexById(ruleId)

             if(indexSpecificday == -1)
             return res.status(404).json({message : "Dia especifico não encontrado."})

             ruleData.specificDay.splice(indexSpecificday, 1)
    
             fs.writeFile("rules-data.json", JSON.stringify(ruleData), (err) => {
                if(err)
                return console.log(err);
    
                return res.status(204).send();
            }); 
        }

        const removeDaily = (err : NodeJS.ErrnoException | null, file : string) => {
            if(err)
            throw err
         
            const ruleData : IRuleData  = JSON.parse(file)
            ruleData.daily = {} as IRuleDaily;
    
             fs.writeFile("rules-data.json", JSON.stringify(ruleData), function(err) {
                 if(err)
                 return console.log(err);
    
                 return res.status(204).send()
            }); 
        }

        const removeWekly = (err : NodeJS.ErrnoException | null, file : string) => {
            if(err)
            throw err
         
            const ruleData : IRuleData  = JSON.parse(file)
            ruleData.wekly = {} as IRuleWekly;
    
             fs.writeFile("rules-data.json", JSON.stringify(ruleData), function(err) {
                 if(err)
                 return console.log(err);
    
                 return res.status(204).send();
             }); 
        }
    
        let callback : callBackFS | null = null
    
        switch (ruleId) {
            case RuleTypeEnum.WEKLY :
            callback = removeWekly            
            break;
            case RuleTypeEnum.DAILY :
            callback = removeDaily
            break;
            default :
            callback = removeSpecificDay
        }
         
        if(callback)
        fs.readFile('rules-data.json', 'utf8', callback)
         
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Erro interno"})
        }

}

export async function list(req: Request, res: Response) : Promise<void>{
    try {
        const  callback : callBackFS = (err : NodeJS.ErrnoException | null, file : string) => {
            if(err) throw err

            const ruleData : IRuleData  = JSON.parse(file)
            res.json(ruleData).status(200).send()
        }

        
        fs.readFile('rules-data.json', 'utf8', callback)
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Erro interno"})
    }
}

export async function ListRuleBetweenDates(req: Request, res: Response) : Promise<void>{
    try {

        let fromDate : string = req.query.fromDate as string
        let toDate : string = req.query.toDate as string

        const fromDateMoment = moment(fromDate, "DD-MM-YYYY", true);
        const toDateMoment = moment(toDate, "DD-MM-YYYY", true);    
        
        if (!(fromDateMoment.isValid() || toDateMoment.isValid())){
            res.status(400).json({message: "Data inválida, enviar data em 'DD-MM-YYYY'."})
            return
        }

        const  callback : callBackFS = (err : NodeJS.ErrnoException | null, file : string) => {
            if(err) throw err

            const ruleData : IRuleData  = JSON.parse(file);

            type interval = {startHour: string, endHour: string}
            type ruleModelList = {
                day: string,
                intervals: Array<interval>
            }
            const listRules: Array<ruleModelList> = []

            let currentDate = fromDateMoment;
            let currentDay : DayEnum =  fromDateMoment.format("dddd").toUpperCase() as DayEnum;
            let continueLoop : boolean = true;
            do {
                // const data : ruleModelList = 
                // .isSame() function verify equals.
                if(currentDate.isSame(toDateMoment))
                continueLoop = false

                let data = {
                    day : currentDate.format("DD-MM-YYYY"),
                    intervals : (ruleData ? [ruleData.daily.interval] : [])
                }
                
                if (Object.keys(ruleData.wekly).length > 0) {
                    for (const day of ruleData.wekly.days){
                        if(day === currentDay){
                            data.intervals.push(ruleData.wekly.interval)
                            break;
                        }
                    }
                }

                if (ruleData.specificDay.length > 0) {
                    for(const specificday of ruleData.specificDay){
                        if(currentDate.isSame(specificday.dateDay)){
                            data.intervals.push(...specificday.intervals)                    
                            break;
                        }
                    }
                }

                const orderedIntervals = data.intervals.sort((a , b) => {

                   const startHourA : number = parseInt(a.startHour.replace(":", ""));
                   const startHourB : number = parseInt(b.startHour.replace(":", ""));

                   let sort : number = 1
                   if(startHourA < startHourB)
                   sort = -1;
                
                   return sort
                })

                data.intervals = orderedIntervals;

                listRules.push(data)

                currentDate = currentDate.add(1, 'd')
                currentDay = currentDate.format("dddd").toUpperCase() as DayEnum

            } while (continueLoop);

            res.json({data : {rules : listRules}}).status(200).send()

        }

        
        fs.readFile('rules-data.json', 'utf8', callback)
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Erro interno"})
    }
}
