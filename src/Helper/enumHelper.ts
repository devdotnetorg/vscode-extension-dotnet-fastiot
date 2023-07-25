import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IoTHelper} from './IoTHelper';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import Existence = IoT.Enums.Existence;

export class enumHelper {

        //AccountAssignment

        static GetNameAccountAssignmentByType(value:AccountAssignment):string| undefined {
                //get name
                let result = Object.keys(AccountAssignment)[Object.values(AccountAssignment).indexOf(value)];
                return result;
        }

        static GetAccountAssignmentByName(value:string):AccountAssignment {
                //get type
                const result = Object.values(AccountAssignment)[Object.keys(AccountAssignment).indexOf(value)];
                return <AccountAssignment>result;
        }

        //Existence

        static GetNameExistenceByType(value:Existence):string| undefined {
                //get name
                let result = Object.keys(Existence)[Object.values(Existence).indexOf(value)];
                return result;
        }

        static GetExistenceByName(value:string):Existence {
                //get type
                const result = Object.values(Existence)[Object.keys(Existence).indexOf(value)];
                return <Existence>result;
        }
}