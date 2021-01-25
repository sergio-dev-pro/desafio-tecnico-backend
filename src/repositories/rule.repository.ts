import fs from 'fs';

import {IRuleDaily, ISpecificDay, IRuleWekly, RuleTypeEnum} from './rule.interface';

type callBackFS =  (err : NodeJS.ErrnoException | null, data : string) => void;

async function createRule(data : IRuleDaily | ISpecificDay | IRuleWekly, type : RuleTypeEnum) : void{
   try {
    const createSpecificDay = (err : NodeJS.ErrnoException | null, data : string) => {
       if(err)
       throw err

       const data
    }
    let action :  callBackFS | null = null

    if(type === RuleTypeEnum.SPECIFIC_DAY)
    action = createSpecificDay
    if(type === RuleTypeEnum.DAILY)
    action = createSpecificDay
    if(type === RuleTypeEnum.WEKLY)
    action = createSpecificDay
    
    if(action)
    await executeActionRule(action, data)

    } catch (error) {
        console.log(error);
    }
}

async function executeActionRule(action : callBackFS){

    fs.readFile('rules-data.json', 'utf8', action)
}
