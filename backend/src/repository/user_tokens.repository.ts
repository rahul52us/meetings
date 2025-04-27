import Tokens from '../repository/schemas/tokens.schema'
import mongoose, { Schema, Document } from 'mongoose';

//this defines the data strucutre of the Condition object
type Condition = {
  type: 'verify_email' | 'forgot_password';
  id?: string;
};

//This defines the data structure of the GetToken object
type GetToken = {
  user_id: number;
};

/**
 * Create token for various conditions in mongodb in Tokens collection
 * @param  {string} userId
 * @param  {string} token
 * @param  {'verify_email'|'forgot_password'} type
 */
export async function createToken(userId: string, token: string, type: 'verify_email' | 'forgot_password') {
  try {
    const tokens = await Tokens.collection.insertOne({ token, type, user_id: new mongoose.Types.ObjectId(userId) })
    return tokens
  } catch (err) {
    return err
  }
}

/**
 * Update token in mongodb in Tokens collection
 * @param  {string} id
 * @param  {string} token
 */
export async function updateUserTokenById(id: string, token: string) {
  try {
    const session = await Tokens.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { token } })
    return session
  } catch (err) {
    return err
  }
}

/**
 * find token in mongodb in Tokens collection
 * @param  {string} token -  Token string
 */
export async function findToken(token: string){
  try{
    const session = await Tokens.collection.findOne({ token })
    return session
  }catch(err){
    return err
  }
}

/**
 * change token status in mongodb in Tokens collection
 * @param  {string} id -  Object Id of the token
 * @param  {'verify_email'|'forgot_password'} type - Type of the token
 * @param  {} isActive=true
 */
export async function changeTokenStatus(id: string, type: 'verify_email' | 'forgot_password', isActive = true){
  const condition: Condition = { type };
  if (id) condition.id = id;
  try{
    const session = await Tokens.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { is_active: isActive } })
    return session
  }catch(err){
    return err
  }
}

/**
 * remove user token in mongodb in Tokens collection
 * @param  {string} id -  Object Id of the token
 */
export async function removeUserToken(id: string){
  try{
    const session = await Tokens.collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) })
    return session
  }catch(err){
    return err
  }
}

/**
 * get token in mongodb in Tokens collection
 * @param  {GetToken} {user_id} - Object Id of the user from Accounts collection
 */
export async function getToken({ user_id }: GetToken){
  try{
    const session = await Tokens.collection.find({ user_id: new mongoose.Types.ObjectId(user_id) })
    return session
  }catch(err){
    return err
  }
}