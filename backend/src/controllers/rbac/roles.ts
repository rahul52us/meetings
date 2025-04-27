import { newEnforcer } from 'casbin';
import path from 'path';

const modelPath = path.join(__dirname, './rbac_model.conf');
const policyPath = path.join(__dirname, './rbac_policy.csv');

async function createEnforcer() {
  const enforcer= await newEnforcer(modelPath, policyPath);
  return enforcer;
}

const roles = createEnforcer();

export default roles